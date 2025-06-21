from fastapi import APIRouter
from intell.app.core.recommendation_engine import engine

engine_router = APIRouter()

@engine_router.get("/recommendations-engine/", tags=["Recommendations"])
async def run_recommendation_engine():
    """
    Runs the recommendation engine for a specific user.
    
    This endpoint triggers the recommendation process and returns
    a list of recommended items.
    """
    # In a production system, you might run this as a background task
    recommendations = await engine.get_slot_movie_recommendations()
    return recommendations
