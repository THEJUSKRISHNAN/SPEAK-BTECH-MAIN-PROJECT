import torch
import base64
import io
import soundfile as sf
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
import scipy.io.wavfile as wav
import numpy as np

# --- INITIALIZATION ---
# Load models once (Global scope) to avoid reloading on every request
print("⏳ Loading Microsoft SpeechT5 TTS Model...")
processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts", use_safetensors=True)
vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")

# Load a default speaker voice (xvector) from CMU Arctic dataset
embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation", trust_remote_code=True)
speaker_embeddings = torch.tensor(embeddings_dataset[7306]["xvector"]).unsqueeze(0)

print("✅ SpeechT5 Loaded Successfully")

def get_tts_audio(text):
    try:
        # 1. Prepare inputs
        inputs = processor(text=text, return_tensors="pt")
        
        # 2. Generate audio (tensor form)
        # Note: Ensure 'speaker_embeddings' and 'vocoder' are accessible here
        speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)
        
        # 3. Create a virtual file in memory (RAM), not on disk
        byte_io = io.BytesIO()
        
        # 4. Write the audio data to this virtual file as a WAV
        # SpeechT5 uses 16000Hz sample rate
        wav.write(byte_io, 16000, speech.numpy())
        
        # 5. Rewind the virtual file to the beginning so we can read it
        byte_io.seek(0)
        
        # 6. Convert the file data to Base64 (The format React needs)
        audio_base64 = base64.b64encode(byte_io.read()).decode('utf-8')
        
        return audio_base64

    except Exception as e:
        print(f"❌ Error inside get_tts_audio: {e}")
        return None
# Test Block
if __name__ == "__main__":
    print("Testing TTS...")
    result = get_tts_audio("Hello, this is Microsoft Speech T5 speaking.")
    if result:
        print(f"✅ Generated Audio (Length: {len(result)})")