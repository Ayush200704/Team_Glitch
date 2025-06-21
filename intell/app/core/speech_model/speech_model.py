import sys
import numpy as np
import librosa
from keras.models import load_model

# Load the trained model
model = load_model("C:/Personal/HackOn Amazon/intell/app/core/speech_model/speech_model.keras")

# Hardcoded emotion labels (in same order as training)
emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'ps', 'sad']

def extract_mfcc_avg(filepath):
    """
    Extracts 40 MFCC features averaged over time from an audio file.
    Returns a NumPy array shaped (1, 40, 1) for model input.
    """
    y, sr = librosa.load(filepath, sr=22050)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    mfcc_avg = np.mean(mfcc, axis=1).astype(np.float32)
    return np.reshape(mfcc_avg, (1, 40, 1))

def predict_emotion(audio_path):
    """
    Predicts emotion from a given WAV file path using the preloaded model.
    Returns the predicted label as a string.
    """
    input_data = extract_mfcc_avg(audio_path)
    pred = model.predict(input_data)
    predicted_index = np.argmax(pred)
    predicted_label = emotion_labels[predicted_index]
    return predicted_label

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python predict.py path/to/audio.wav")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    predict_emotion(audio_path)
