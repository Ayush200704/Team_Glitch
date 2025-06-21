from fastapi import APIRouter
from app.core.recommendations import engine

router = APIRouter()

@router.post("/run-engine/{user_id}", tags=["Recommendations"])
async def run_recommendation_engine(user_id: str):
    """
    Runs the recommendation engine for a specific user.
    
    This endpoint triggers the recommendation process and returns
    a list of recommended items.
    """
    # In a production system, you might run this as a background task
    recommendations = engine.get_recommendations(user_id)
    return recommendations 