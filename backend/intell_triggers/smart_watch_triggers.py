from fastapi import APIRouter
from intell.app.core.smart_watch.watch_value_generator import generate_sample_row
from intell.app.core.smart_watch.predict_smartwatch import predict_single_sample_mood

router = APIRouter()

@router.get("/trigger/smartwatch_prediction")
def trigger_smartwatch_prediction():
    sample_row = generate_sample_row()
    prediction = predict_single_sample_mood(sample_row)
    return {"sample": sample_row, "predicted_mood": prediction}