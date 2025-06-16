import datetime
import os.path
import json

from flask import Flask, redirect, request, url_for, session, jsonify
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configure Flask app
app = Flask(__name__)
app.secret_key = 'your_super_secret_key'  # IMPORTANT: Change this to a strong, random key in production

# OAuth 2.0 scopes for Google Calendar API
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# Path to your client secrets file (for Web application client ID)
CLIENT_SECRETS_FILE = 'D:/glitch/Team_Glitch/intell/app/config/credentials.json' # Ensure this is correct

# Directory for token storage (for demonstration purposes, in a real app use a DB)
TOKEN_STORAGE_DIR = 'D:/glitch/Team_Glitch/intell/app/core/calendar/' # Same directory as the old token.json
TOKEN_FILE = os.path.join(TOKEN_STORAGE_DIR, 'token.json')

# Ensure token storage directory exists
os.makedirs(TOKEN_STORAGE_DIR, exist_ok=True)

@app.route('/')
def index():
    return "<a href='/authorize'>Authorize Google Calendar</a>"

@app.route('/authorize')
def authorize():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, 
        redirect_uri=url_for('oauth2callback', _external=True)
    )

    authorization_url, state = flow.authorization_url(
        access_type='offline',  # Request a refresh token
        include_granted_scopes='true'
    )

    session['oauth_state'] = state
    return redirect(authorization_url)

@app.route('/oauth2callback')
def oauth2callback():
    state = session.get('oauth_state')
    if not state or state != request.args.get('state'):
        return jsonify({"error": "Invalid state parameter."}), 400

    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, 
        state=state, 
        redirect_uri=url_for('oauth2callback', _external=True)
    )

    try:
        flow.fetch_token(authorization_response=request.url)

        creds = flow.credentials
        # Save the credentials (access and refresh token) for future use
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
        
        session['google_token'] = creds.to_json()
        return redirect(url_for('list_events'))

    except Exception as e:
        return jsonify({"error": f"Token exchange failed: {e}"}), 500

@app.route('/events')
def list_events():
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # Update token.json if refreshed
            with open(TOKEN_FILE, 'w') as token:
                token.write(creds.to_json())
            session['google_token'] = creds.to_json()
        else:
            # If no valid token, redirect to authorization
            return redirect(url_for('authorize'))

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
            return jsonify({"events": []})

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
        
        return jsonify({"events": formatted_events})

    except HttpError as error:
        return jsonify({"error": str(error)}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 