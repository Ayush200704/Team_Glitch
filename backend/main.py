from fastapi import FastAPI
from backend.intell_triggers import calendar_trigger
from backend.intell_triggers.smart_watch_triggers import router as smart_watch_router
from backend.intell_triggers.calendar_trigger import calendar_trigger
from backend.intell_triggers.voice_trigger import voice_router
from backend.intell_triggers.environment import environment_router
from backend.intell_triggers.final_trigger import final_router
from backend.intell_triggers.engine_trigger import engine_router

app = FastAPI()

app.include_router(calendar_trigger)
app.include_router(smart_watch_router)
app.include_router(voice_router)
app.include_router(environment_router)
app.include_router(final_router)
app.include_router(engine_router)


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allows all origins. For production, specify your frontend URL(s)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)