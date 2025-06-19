import datetime
import os.path
import json
import logging

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow # Use InstalledAppFlow for desktop app
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# Path to your client secrets file (for Desktop app client ID)
CLIENT_SECRETS_FILE = 'D:/glitch/Team_Glitch/intell/app/core/calendar/google_credentials.json' # This file MUST be in the same directory as this script

# Directory for token storage
TOKEN_FILE = 'D:/glitch/Team_Glitch/token.json' # This token file will also be in the same directory as this script

def get_calendar_events_json(days_ahead: int = 9) -> str:
    """Fetches Google Calendar events for the next 'days_ahead' and returns them as a JSON string.
    Handles OAuth 2.0 authentication for desktop applications.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # We are here if token.json is missing or invalid and not refreshable.
            # Instead of redirecting to the auth site, log an error and set creds to None.
            logging.error("No valid credentials found and automatic refresh failed. Please ensure 'token.json' is present and valid.")
            creds = None # Explicitly set creds to None to ensure subsequent API call fails gracefully.
    
    # Save the credentials for the next run, ONLY if they are valid now.
    if creds and creds.valid:
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())

    try:
        service = build('calendar', 'v3', credentials=creds)

        # Call the Calendar API
        now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
        end_time = (datetime.datetime.utcnow() + datetime.timedelta(days=days_ahead)).isoformat() + 'Z'
        
        logging.info(f'Getting the upcoming events from {now} to {end_time}')
        events_result = service.events().list(calendarId='primary', timeMin=now,
                                              timeMax=end_time, singleEvents=True,
                                              orderBy='startTime').execute()
        events = events_result.get('items', [])

        if not events:
            logging.info('No upcoming events found.')
            return json.dumps({"events": []}, indent=4)

        # Format events into a list of dictionaries
        formatted_events = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            formatted_events.append({
                "summary": event.get('summary', 'No Title'),
                "start": start,
                "end": end,
                "location": event.get('location', 'N/A'),
                "description": event.get('description', 'N/A')
            })
        
        return json.dumps({"events": formatted_events}, indent=4)

    except HttpError as error:
        logging.error(f'An error occurred with Google Calendar API: {error}')
        return json.dumps({"error": str(error)}, indent=4)
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        return json.dumps({"error": str(e)}, indent=4)

if __name__ == '__main__':
    json_output = get_calendar_events_json(days_ahead=9)
    
    output_dir = r'D:/glitch/Team_Glitch/intell/app\outputs'
    output_file_path = os.path.join(output_dir, 'calendar_events.json')

    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    with open(output_file_path, 'w') as f:
        f.write(json_output)
    logging.info(f"Calendar events saved to {output_file_path}")
