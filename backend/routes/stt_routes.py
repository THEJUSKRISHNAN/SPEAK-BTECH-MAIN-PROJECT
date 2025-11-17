from flask import Blueprint, request, jsonify
import whisper
import torch
import tempfile
import subprocess
import os

stt_bp = Blueprint("stt_bp", __name__)



# Load Whisper model once
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"--- Whisper running on {DEVICE} ---")
whisper_model = whisper.load_model("base", device=DEVICE)


# speech to text
@stt_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        file = request.files['file']
        if not file:
            return jsonify({'error': 'No file provided'}), 400

        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_webm:
            file.save(temp_webm.name)
            temp_webm_path = temp_webm.name

        temp_wav_path = temp_webm_path.replace(".webm", ".wav")

        cmd = [
            "ffmpeg", "-y", "-i", temp_webm_path,
            "-ar", "16000", "-ac", "1",
            "-loglevel", "error",
            temp_wav_path
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # result = whisper_model.transcribe(temp_wav_path, fp16=torch.cuda.is_available())
        # Transcribe with forced English + stable decoding
        result = whisper_model.transcribe(
            temp_wav_path,
            fp16=torch.cuda.is_available(),
            language="en",
            task="transcribe",
            temperature=0.0,            # forces deterministic output
            no_speech_threshold=0.1,    # reduce false "noise" detection
            compression_ratio_threshold=2.4,
        )
        text = result.get("text", "").strip()

        print(f"Whisper transcription: {text}")

        os.remove(temp_webm_path)
        os.remove(temp_wav_path)

        return jsonify({"text": text}), 200

    except Exception as e:
        print(f"Error during transcription: {e}")
        return jsonify({'error': str(e)}), 500
