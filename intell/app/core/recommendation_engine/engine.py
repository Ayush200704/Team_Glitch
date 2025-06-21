import json
import csv
import asyncio
from datetime import datetime
from dateutil import parser, tz
import os
import httpx

async def get_slot_movie_recommendations():
    # === File Paths ===
    base_path = r"C:\Personal\HackOn Amazon\intell\app\core\recommendation_engine"
    json_path = os.path.join(base_path, "mood_movie_recommendations (2).json")
    csv_path = os.path.join(base_path, "U0000_ranked_with_moods.csv")
    movies_path = r"C:\Personal\HackOn Amazon\intell\app\ingestion\movie_dataset\movies_large.csv"

    # === Step 1: Load mood & calendar data from API ===
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://127.0.0.1:8000/trigger/final-recommendation")
            response.raise_for_status()  # Raise an exception for bad status codes
            user_data = response.json()
        except httpx.RequestError as e:
            print(f"Error fetching data from API: {e}")
            return {"error": "Failed to fetch user data from API"}

    user_moods = {
        user_data["environment_mood"].lower(),
        user_data["smartwatch_mood"].lower(),
        user_data["voice_mood"].lower()
    }

    # === Step 2: Load mood-ranked CSV ===
    ranked_data = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            mood_list = [m.strip().lower() for m in row['mood'].split(',')]
            if any(m in user_moods for m in mood_list):
                ranked_data.append({
                    'movie_id': row['movie_id'],
                    'ranking_score': float(row['ranking_score']),
                    'mood_list': mood_list
                })
    
    matching_movie_ids = [row['movie_id'] for row in ranked_data]

    # === Step 3: Load mood-based recommendations (dict format with movie_id as key) ===
    with open(json_path, 'r', encoding='utf-8') as f:
        mood_recommendations = json.load(f)

    movie_title_map = {k: v['name'] for k, v in mood_recommendations.items()}

    # === Step 4: Load movie metadata and merge ranking ===
    movie_meta = []
    with open(movies_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['movie_id'] in matching_movie_ids:
                # Find ranking score for this movie
                ranking_score = next((r['ranking_score'] for r in ranked_data if r['movie_id'] == row['movie_id']), 0.0)
                movie_meta.append({
                    'movie_id': row['movie_id'],
                    'title': movie_title_map.get(row['movie_id'], ''),
                    'duration_minutes': int(float(row['duration_minutes'])),
                    'ranking_score': ranking_score
                })

    # Sort by ranking score
    movie_meta.sort(key=lambda x: x['ranking_score'], reverse=True)

    # === Step 5: Process future calendar slots ===
    now = datetime.now(tz=tz.tzlocal())
    future_slots = []

    for slot in user_data["calendar_free_slots"]:
        start = parser.isoparse(slot['start'])
        end = parser.isoparse(slot['end'])
        if end > now:
            duration_str = slot['duration']
            hours = 0
            minutes = 0
            if 'h' in duration_str:
                hours = int(duration_str.split('h')[0])
                if 'm' in duration_str:
                    minutes = int(duration_str.split('h')[1].split('m')[0])
            else:
                minutes = int(duration_str.split('m')[0])
            duration_min = hours * 60 + minutes
            future_slots.append((start, end, duration_min))

    future_slots.sort()

    # === Step 6: Generate output JSON ===
    final_output = []
    global_movie_id = 1

    for idx, (start, end, free_minutes) in enumerate(future_slots, 1):
        # Filter movies that fit in the time slot
        fitting_movies = [movie for movie in movie_meta if movie['duration_minutes'] <= free_minutes]

        fitting_movie_list = []
        for movie in fitting_movies:
            title = movie['title']
            if not title:  # Skip if title is empty
                continue
            fitting_movie_list.append({
                "id": global_movie_id,
                "movie_id": movie['movie_id'],
                "title": title,
                "duration_minutes": movie['duration_minutes'],
                "ranking_score": round(movie['ranking_score'], 2)
            })
            global_movie_id += 1

        final_output.append({
            "environment_mood": user_data["environment_mood"],
            "voice_mood": user_data["voice_mood"],
            "smartwatch_mood": user_data["smartwatch_mood"],
        })

        final_output.append({
            "slot_id": idx,
            "start_time": start.isoformat(),
            "end_time": end.isoformat(),
            "free_minutes": free_minutes,
            "movie_count": len(fitting_movie_list),
            "fitting_movies": fitting_movie_list
        })

    return final_output
