from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import os
import glob
import random

from intell.app.core.speech_model.speech_model import predict_emotion

voice_router = APIRouter()

VOICE_FILES_DIR = "backend/voice_files"

@voice_router.get("/trigger/voice", summary="Process a random .wav file in voice_files folder and get mood prediction")
async def trigger_voice():
    """
    Processes one random .wav file in the voice_files folder and returns the predicted emotion.
    """
    try:
        wav_files = glob.glob(os.path.join(VOICE_FILES_DIR, '*.wav'))
        if not wav_files:
            return JSONResponse(content={"error": "No .wav files found in voice_files folder."}, status_code=404)
        file_path = random.choice(wav_files)
        try:
            print(file_path)
            predicted_emotion = predict_emotion(file_path)
            return JSONResponse(content={
                "filename": os.path.basename(file_path),
                "predicted_emotion": predicted_emotion
            })
        except Exception as e:
            return JSONResponse(content={
                "filename": os.path.basename(file_path),
                "error": str(e)
            }, status_code=500)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")