from fastapi import FastAPI
import sys
import os

# To handle the project's structure, we'll ensure the project root is on the Python path.
# This allows imports across directories like 'backend' and 'intell'.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

from Team_Glitch.backend.intell_triggers.engine_trigger import engine_router

# Create the FastAPI app instance
app = FastAPI(
    title="Glitch Intelligent Engine API",
    description="API for running various intelligent engines and triggers.",
    version="1.0.0"
)

# Include the new engine_trigger router
app.include_router(engine_router, prefix="/triggers")

@app.get("/", tags=["Root"])
async def read_root():
    """
    Root endpoint for the API.
    Provides a welcome message and basic information.
    """
    return {
        "message": "Welcome to the Glitch Intelligent Engine API!",
        "documentation": "/docs"
    }

# To run this app, navigate to your workspace root (D:/glitch/) and use the command:
# uvicorn Team_Glitch.intell.app.main:app --reload
