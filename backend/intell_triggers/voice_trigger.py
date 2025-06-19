# from fastapi import APIRouter, UploadFile, File, HTTPException
# from fastapi.responses import JSONResponse
# import os
# import shutil

# from intell.app.core.speech_model.speech_model import predict_emotion

# voice_router = APIRouter()

# UPLOAD_DIR = "intell/app/outputs/uploaded_audio"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# @voice_router.post("/trigger/voice", summary="Upload an audio file and get mood prediction")
# async def trigger_voice(file: UploadFile = File(...)):
#     """
#     Accepts an audio file upload, processes it, and returns the predicted emotion.
#     """
#     file_location = os.path.join(UPLOAD_DIR, file.filename)
#     try:
#         # Save the uploaded file
#         with open(file_location, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#         # Call the emotion prediction function
#         predicted_emotion = predict_emotion(file_location)
#         return JSONResponse(content={"predicted_emotion": predicted_emotion})
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Processing failed: {e}")
#     finally:
#         # Clean up the uploaded file
#         if os.path.exists(file_location):
#             os.remove(file_location)