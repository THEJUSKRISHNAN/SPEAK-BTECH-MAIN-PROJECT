import torch
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
import scipy.io.wavfile as wav

def generate_test_audio():
    print("⏳ Loading models...")
    
    # 1. Load the processor and model
    processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
    model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
    vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")

    # 2. Load xvector embeddings (Speaker Voices)
    print("⏳ Loading speaker embeddings...")
    embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation", trust_remote_code=True)

    # 3. Select a specific speaker (Index 7306 is a standard male voice often used for testing)
    speaker_embeddings = torch.tensor(embeddings_dataset[7306]["xvector"]).unsqueeze(0)

    # 4. Prepare the text
    text = "Hello! This is a test to confirm that the text to speech system is working correctly on your backend."
    inputs = processor(text=text, return_tensors="pt")

    # 5. Generate Speech
    print("⏳ Generating audio...")
    speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)

    # 6. Save to file
    output_filename = "test_output.wav"
    sample_rate = 16000 # SpeechT5 defaults to 16kHz
    
    # Convert to numpy and save
    wav.write(output_filename, sample_rate, speech.numpy())
    
    print(f"✅ Success! Audio saved to: {output_filename}")
    print("👉 Go to your folder and play 'test_output.wav' to hear the voice.")

if __name__ == "__main__":
    generate_test_audio()