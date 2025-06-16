import datetime
import os.path
import json
import logging

from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse, JSONResponse
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()

# OAuth 2.0 scopes for Google Calendar API
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# Path to your client secrets file (for Web application client ID)
CLIENT_SECRETS_FILE = 'D:/glitch/Team_Glitch/intell/app/config/credentials.json' # Ensure this is correct

# Directory for token storage (for demonstration purposes, in a real app use a DB)
TOKEN_STORAGE_DIR = 'D:/glitch/Team_Glitch/intell/app/core/calendar/' 
TOKEN_FILE = os.path.join(TOKEN_STORAGE_DIR, 'token.json')

# Ensure token storage directory exists
os.makedirs(TOKEN_STORAGE_DIR, exist_ok=True)

# Temporary storage for OAuth state (for simplicity, use a more robust solution in production)
oauth_state_storage = {}

async def get_google_credentials(request: Request):
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(GoogleAuthRequest())
            # Update token.json if refreshed
            with open(TOKEN_FILE, 'w') as token:
                token.write(creds.to_json())
        else:
            # If no valid token, redirect to authorization
            raise HTTPException(status_code=status.HTTP_307_TEMPORARY_REDIRECT, detail="Redirecting to Google Auth",
                                headers={"Location": request.url_for("authorize")})
    return creds

@app.get('/')
async def read_root():
    return {"message": "Welcome to the FastAPI Google Calendar Integration!",
            "authorize_url": "/authorize"}

@app.get('/authorize')
async def authorize(request: Request):
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, 
        redirect_uri=request.url_for('oauth2callback', _external=True)
    )

    authorization_url, state = flow.authorization_url(
        access_type='offline',  # Request a refresh token
        include_granted_scopes='true'
    )
    
    # Store state for verification in the callback
    # In a real app, use a more secure session management or database
    oauth_state_storage[request.client.host] = state 

    return RedirectResponse(authorization_url)

@app.get('/oauth2callback')
async def oauth2callback(request: Request):
    # Verify state to prevent CSRF attacks
    received_state = request.query_params.get('state')
    expected_state = oauth_state_storage.pop(request.client.host, None)

    if not received_state or received_state != expected_state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state parameter.")

    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, 
        state=received_state, 
        redirect_uri=request.url_for('oauth2callback', _external=True)
    )

    try:
        # Ensure the full URL is passed, including query parameters from Google
        flow.fetch_token(authorization_response=str(request.url))

        creds = flow.credentials
        # Save the credentials (access and refresh token) for future use
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
        
        return RedirectResponse(url="/events")

    except Exception as e:
        logging.error(f"Token exchange failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Token exchange failed: {e}")

@app.get('/events')
async def list_events(creds: Credentials = Depends(get_google_credentials)):
    try:
        service = build('calendar', 'v3', credentials=creds)

        now = datetime.datetime.utcnow().isoformat() + 'Z'
        days_ahead = 3
        end_time = (datetime.datetime.utcnow() + datetime.timedelta(days=days_ahead)).isoformat() + 'Z'
        
        events_result = service.events().list(
            calendarId='primary', timeMin=now, timeMax=end_time,
            singleEvents=True, orderBy='startTime').execute()
        events = events_result.get('items', [])

        formatted_events = []
        if not events:
            return JSONResponse(content={"events": []})

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
        
        return JSONResponse(content={"events": formatted_events})

    except HttpError as error:
        logging.error(f'An error occurred: {error}')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Google Calendar API error: {error}')
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {e}") 