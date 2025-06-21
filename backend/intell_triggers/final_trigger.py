from fastapi import APIRouter, HTTPException
import asyncio
from datetime import datetime, time, timedelta
from dateutil.tz import gettz
import httpx

final_router = APIRouter()

# --- Configuration ---
BASE_URL = "http://127.0.0.1:8000"
ENVIRONMENT_URL = f"{BASE_URL}/predict-mood"
SMARTWATCH_URL = f"{BASE_URL}/trigger/smartwatch_prediction"
VOICE_URL = f"{BASE_URL}/trigger/voice"
CALENDAR_URL = f"{BASE_URL}/trigger/calendar"

# --- Helper Functions ---
def minutes_to_hm(mins):
    if mins < 0:
        mins = 0
    hours = int(mins / 60)
    minutes = round(mins % 60)
    if minutes == 60:
        hours += 1
        minutes = 0
    return f"{hours}h {minutes}m"

def to_ist_iso_string(dt_obj, end=False):
    """Converts a datetime object to an IST ISO string with precise formatting."""
    ist_tz = gettz('Asia/Kolkata')
    if dt_obj.tzinfo is None:
        dt_obj = dt_obj.replace(tzinfo=gettz('UTC'))
    ist_dt = dt_obj.astimezone(ist_tz)

    # Format with .000 or .999
    if end:
        return ist_dt.replace(microsecond=999000).isoformat(timespec='milliseconds')
    else:
        return ist_dt.replace(microsecond=0).isoformat(timespec='milliseconds')

# --- Main Endpoint ---
@final_router.get("/trigger/final-recommendation", summary="Get a consolidated recommendation object")
async def get_final_recommendation():
    async with httpx.AsyncClient() as client:
        try:
            tasks = [
                client.get(ENVIRONMENT_URL),
                client.get(SMARTWATCH_URL),
                client.get(VOICE_URL),
                client.get(CALENDAR_URL)
            ]
            responses = await asyncio.gather(*tasks, return_exceptions=True)

            results = []
            for res in responses:
                if isinstance(res, Exception):
                    raise HTTPException(status_code=500, detail=f"A network error occurred: {res}")
                if res.status_code != 200:
                    raise HTTPException(status_code=res.status_code, detail=f"Error from an internal service: {res.text}")
                results.append(res.json())

            env_data, sw_data, voice_data, cal_data = results

            # 3. Calculate calendar free time
            free_slots = []
            total_free_minutes = 0
            
            if cal_data and isinstance(cal_data.get('events'), list) and cal_data['events']:
                # Parse and sort events by start time
                events = sorted([
                    {
                        "start": datetime.fromisoformat(e['start'].replace('Z', '+00:00')), 
                        "end": datetime.fromisoformat(e['end'].replace('Z', '+00:00'))
                    }
                    for e in cal_data['events']
                ], key=lambda x: x['start'])

                if events:
                    first_day = events[0]['start'].date()
                    last_day = max(e['end'].date() for e in events)
                    
                    ist_tz = gettz('Asia/Kolkata')
                    utc_tz = gettz('UTC')

                    current_day = first_day
                    while current_day <= last_day:
                        # Define waking hours in IST (7 AM to midnight) and convert to UTC for processing
                        day_start = datetime.combine(current_day, time(7, 0), tzinfo=ist_tz).astimezone(utc_tz)
                        day_end = datetime.combine(current_day, time(23, 59, 59, 999000), tzinfo=ist_tz).astimezone(utc_tz)

                        day_events = [e for e in events if e['start'] < day_end and e['end'] > day_start]
                        last_busy_end = day_start

                        for event in day_events:
                            # Clamp the event times to the current day's waking hours
                            busy_start = max(event['start'], day_start)
                            busy_end = min(event['end'], day_end)
                            
                            # If there's a gap between the last event and this one, it's a free slot
                            if busy_start > last_busy_end:
                                diff_minutes = (busy_start - last_busy_end).total_seconds() / 60
                                if diff_minutes > 1: # Only count gaps longer than a minute
                                    total_free_minutes += diff_minutes
                                    free_slots.append({
                                        "start": to_ist_iso_string(last_busy_end),
                                        "end": to_ist_iso_string(busy_start),
                                        "duration": minutes_to_hm(diff_minutes)
                                    })
                            # The new "last busy" time is the end of the current event
                            last_busy_end = max(last_busy_end, busy_end)

                        # After the last event, check for free time until midnight
                        if last_busy_end < day_end:
                            diff_minutes = (day_end - last_busy_end).total_seconds() / 60
                            if diff_minutes > 1:
                                total_free_minutes += diff_minutes
                                free_slots.append({
                                   "start": to_ist_iso_string(last_busy_end),
                                   "end": to_ist_iso_string(day_end),
                                   "duration": minutes_to_hm(diff_minutes)
                                })
                        
                        current_day += timedelta(days=1)

            # 4. Construct the final JSON
            final_json = {
                "environment_mood": env_data.get("predicted_mood"),
                "smartwatch_mood": sw_data.get("predicted_mood"),
                "voice_mood": voice_data.get("predicted_emotion"),
                "calendar_free_slots": free_slots,
                "calendar_total_free": minutes_to_hm(total_free_minutes)
            }

            return final_json

        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Could not connect to an internal service: {e}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
