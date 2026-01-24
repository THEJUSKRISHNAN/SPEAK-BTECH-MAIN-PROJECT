from flask import request
from flask_socketio import emit, join_room, leave_room
from extensions import socketio, mongo  
import datetime
from bson.objectid import ObjectId
from routes.tts import get_tts_audio
from routes.sign_detector import detector

online_users = {}
# Prevent repeated TTS for same sign
last_sign_spoken = {}
SIGN_COOLDOWN_SECONDS = 10

def register_socket_events():
    
    @socketio.on('connect')
    def handle_connect():
        print(f"Client connected with socket_id: {request.sid}")

    @socketio.on('user_online')
    def handle_user_online(user_data):
        user_id = user_data.get('user_id')
        if user_id:
            user_data['socket_id'] = request.sid
            online_users[user_id] = user_data
            
            print(f"User {user_id} ({user_data.get('name')}) is online.")
            
            emit('update_online_users', list(online_users.values()), broadcast=True)

    @socketio.on('disconnect')
    def handle_disconnect():
        user_id_to_remove = None
        for user_id, user_data in online_users.items():
            if user_data['socket_id'] == request.sid:
                user_id_to_remove = user_id
                break
        
        if user_id_to_remove:
            del online_users[user_id_to_remove]
            print(f"User {user_id_to_remove} disconnected.")
            
            emit('update_online_users', list(online_users.values()), broadcast=True)

        keys_to_remove = [k for k in last_sign_spoken if k[0] == request.sid]
        for k in keys_to_remove:
            del last_sign_spoken[k]

        print(f"Client disconnected: {request.sid}")
    
    @socketio.on('get_online_users')
    def handle_get_online_users():
        emit('update_online_users', list(online_users.values()), room=request.sid)

    #  WebRTC signaling events
    
    @socketio.on('call-user')
    def handle_call_user(data):
        caller_id = None
        for uid, udata in online_users.items():
            if udata['socket_id'] == request.sid:
                caller_id = uid
                break

        callee_user_id = data.get('to')
        if callee_user_id in online_users:
            callee_socket_id = online_users[callee_user_id].get('socket_id')
            
            caller_user_object = online_users.get(caller_id)
            
            print(f"User {caller_id} is calling User {callee_user_id}")
            
            emit('incoming-call', {
                "from": caller_user_object, 
                "offer": data.get('offer')
            }, room=callee_socket_id)
        else:
            emit('call-failed', {"message": "User is not online."})
        pass


    @socketio.on('answer-call')
    def handle_answer_call(data):
        caller_user_id = data.get('to')
        callee_user_id = None

        for uid, udata in online_users.items():
            if udata['socket_id'] == request.sid:
                callee_user_id = uid
                break
        
        if callee_user_id and caller_user_id:
            try:
                # Save a record of this call to MongoDB
                mongo.cx['speak_db'].calls.insert_one({
                    'caller_id': ObjectId(caller_user_id),
                    'callee_id': ObjectId(callee_user_id),
                    'timestamp': datetime.datetime.utcnow()
                })
                print(f"Call logged between {caller_user_id} and {callee_user_id}")
            except Exception as e:
                print(f"Error logging call to MongoDB: {e}")

        if caller_user_id in online_users:
            caller_socket_id = online_users[caller_user_id].get('socket_id')
            
            print(f"Call answered by {request.sid} to {caller_user_id}")
            
            emit('call-accepted', {
                "answer": data.get('answer')
            }, room=caller_socket_id)


    @socketio.on('ice-candidate')
    def handle_ice_candidate(data):
        target_user_id = data.get('to')
        if target_user_id in online_users:
            target_socket_id = online_users[target_user_id].get('socket_id')
            
            sender_id = None
            for uid, udata in online_users.items():
                if udata['socket_id'] == request.sid:
                    sender_id = uid
                    break

            emit('ice-candidate', {
                "from": sender_id,
                "candidate": data.get('candidate')
            }, room=target_socket_id)

    @socketio.on('call-ended')
    def handle_call_ended(data):
        target_user_id = data.get('to')
        if target_user_id in online_users:
            target_socket_id = online_users[target_user_id].get('socket_id')
            emit('call-ended', {}, room=target_socket_id)

    @socketio.on('reject-call')
    def handle_reject_call(data):
        caller_user_id = data.get('to')
        if caller_user_id in online_users:
            caller_socket_id = online_users[caller_user_id].get('socket_id')
            print(f"Call rejected by {request.sid} to {caller_user_id}")
            emit('call-rejected', {}, room=caller_socket_id)

    @socketio.on('toggle-mic')
    def handle_toggle_mic(data):
        target_user_id = data.get('to')
        if target_user_id in online_users:
            target_socket_id = online_users[target_user_id].get('socket_id')
            
            sender_id = None
            for uid, udata in online_users.items():
                if udata['socket_id'] == request.sid:
                    sender_id = uid
                    break
            
            emit('mic-toggled', {
                "from": sender_id,
                "isMicOn": data.get('isMicOn')
            }, room=target_socket_id)

    @socketio.on('toggle-video')
    def handle_toggle_video(data):
        target_user_id = data.get('to')
        if target_user_id in online_users:
            target_socket_id = online_users[target_user_id].get('socket_id')
            
            sender_id = None
            for uid, udata in online_users.items():
                if udata['socket_id'] == request.sid:
                    sender_id = uid
                    break
            
            emit('video-toggled', {
                "from": sender_id,
                "isVideoOn": data.get('isVideoOn')
            }, room=target_socket_id)

    # STT
    @socketio.on('stt-result')
    def handle_stt_result(data):
        target_user_id = data.get('to')
        if target_user_id in online_users:
            target_socket_id = online_users[target_user_id]['socket_id']
            emit('stt-result', {'text': data.get('text')}, room=target_socket_id)


    # TTS
    @socketio.on('send-text-for-tts')
    def handle_send_text_for_tts(data):
 
        target_user_id = data.get('to')
        text = data.get('text')

        if target_user_id in online_users and text:
            target_socket_id = online_users[target_user_id]['socket_id']
            
            print(f"🔤 Generating TTS for: '{text}' (Target: {target_user_id})")
            
           
            audio_base64 = get_tts_audio(text)
            
            if audio_base64:
                
                emit('play-audio-message', {
                    'audio': audio_base64,
                    'text': text 
                }, room=target_socket_id)
                print(f"✅ TTS Audio sent to socket: {target_socket_id}")
            else:
                print("❌ Failed to generate TTS audio.")

    # sign language deteciton-process frame
    @socketio.on('process-frame')
    def handle_frame_processing(data):
        # 1. Get image and target
        image_data = data.get('image')
        target_user_id = data.get('to')

        if image_data:
            # 2. Run Prediction (AI Model)
            prediction = detector.predict(image_data)
            
            if prediction:
                print(f"🖐 Sign Detected: {prediction}")
                
                # A. Notify the Signer (Deaf User) - Visual Confirmation
                emit('sign-prediction', {'label': prediction}, room=request.sid)

                cache_key = (request.sid, target_user_id)
                now = datetime.datetime.utcnow()
                last_entry = last_sign_spoken.get(cache_key)

                cooldown_expired = False
                if last_entry:
                     time_diff = (now - last_entry["time"]).total_seconds()
                     if time_diff > SIGN_COOLDOWN_SECONDS:
                         cooldown_expired = True

                should_speak = False
                if last_entry is None:
                    should_speak = True
                elif last_entry["label"] != prediction:
                    should_speak = True
                elif cooldown_expired:
                    should_speak = True
                
                # B. Notify the Hearing User - AUDIO (TTS)
                if should_speak:
                    if target_user_id in online_users:
                        target_socket = online_users[target_user_id]['socket_id']
                        
                        # Generate Audio for the predicted sign
                        audio_base64 = get_tts_audio(prediction)
                        
                        if audio_base64:
                            # Send the audio to be played automatically
                            emit('play-audio-message', {
                                'audio': audio_base64,
                                'text': f"(Sign) {prediction}" 
                            }, room=target_socket)

                        # Update cache only if we spoke
                        last_sign_spoken[cache_key] = {
                            "label": prediction,
                            "time": now
                        }
                else:
                    print(f"Sign detected again: {prediction}")