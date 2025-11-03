from flask import Blueprint, request, jsonify, current_app
from extensions import mongo
from utils.token_required import token_required
from bson.objectid import ObjectId
import jwt
import datetime
import cloudinary.uploader 

api_bp = Blueprint('api_bp', __name__)

@api_bp.route('/profile/update', methods=['PUT'])
@token_required
def update_profile(current_user):
    try:
        new_name = request.form.get('name')
        new_is_deaf = request.form.get('isDeaf') == 'true' 
        new_image_url = request.form.get('profile_image_url') 
        
        user_id = current_user['user_id']
        
        if 'profile_image_file' in request.files:
            file_to_upload = request.files['profile_image_file']
            
            upload_result = cloudinary.uploader.upload(
                file_to_upload,
                folder=f"speak_project/users/{user_id}", 
                public_id="profile_pic" 
            )
            
            new_image_url = upload_result['secure_url']

        updated_user = mongo.cx['speak_db'].users.find_one_and_update(
            {'_id': ObjectId(user_id)},
            {'$set': {
                'name': new_name,
                'isDeaf': new_is_deaf,
                'profile_image_url': str(new_image_url)
            }},
            return_document=True
        )

        if not updated_user:
            return jsonify({'message': 'User not found'}), 404
        
        new_token = jwt.encode({
            'user_id': str(updated_user['_id']),
            'name': updated_user['name'],
            'email': updated_user['email'],
            'isDeaf': updated_user['isDeaf'],
            'profile_image_url': updated_user.get('profile_image_url'),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({'token': new_token}), 200

    except Exception as e:
        print(e) 
        return jsonify({'message': 'An error occurred', 'error': str(e)}), 500