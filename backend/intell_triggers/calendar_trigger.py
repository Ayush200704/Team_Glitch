from fastapi import FastAPI, HTTPException
import subprocess
import os
import json

from fastapi import APIRouter

calendar_trigger = APIRouter()

@calendar_trigger.get("/trigger/calendar")
def trigger_calendar():
    # Path to your script and output file
    script_path = "intell/app/core/calendar/google_calendar.py"
    output_file = "intell/app/outputs/calendar_events.json"

    # Run the script
    try:
        result = subprocess.run(
            ["python", script_path],
            capture_output=True,
            text=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Script error: {e.stderr}")

    # Read the output file and return its contents
    if not os.path.exists(output_file):
        raise HTTPException(status_code=500, detail="Output file not found.")

    with open(output_file, "r") as f:
        data = json.load(f)
    return data