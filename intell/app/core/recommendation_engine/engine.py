import json
import pandas as pd
from datetime import datetime
from dateutil import parser, tz
import os

def get_slot_movie_recommendations():
    # === File Paths ===
    base_path = r"D:\glitch\Team_Glitch\intell\app\core\recommendation_engine"
    json_path = os.path.join(base_path, "mood_movie_recommendations (2).json")
    csv_path = os.path.join(base_path, "U0000_ranked_with_moods.csv")
    user_data_path = os.path.join(base_path, "user_data.json")
    movies_path = r"D:\glitch\Team_Glitch\intell\app\ingestion\movie_dataset\movies_large.csv"

    # === Step 1: Load mood & calendar data ===
    with open(user_data_path, 'r', encoding='utf-8') as f:
        user_data = json.load(f)

    user_moods = {
        user_data["environment_mood"].lower(),
        user_data["smartwatch_mood"].lower(),
        user_data["voice_mood"].lower()
    }

    # === Step 2: Load mood-ranked CSV ===
    ranked_df = pd.read_csv(csv_path)
    ranked_df['mood_list'] = ranked_df['mood'].apply(lambda x: [m.strip().lower() for m in x.split(',')])
    matching_movie_ids = ranked_df[ranked_df['mood_list'].apply(lambda moods: any(m in user_moods for m in moods))]['movie_id'].tolist()

    # === Step 3: Load mood-based recommendations (dict format with movie_id as key) ===
    with open(json_path, 'r', encoding='utf-8') as f:
        mood_recommendations = json.load(f)

    movie_title_map = {k: v['name'] for k, v in mood_recommendations.items()}

    # === Step 4: Load movie metadata and merge ranking ===
    movie_meta = pd.read_csv(movies_path)
    movie_meta = movie_meta[movie_meta['movie_id'].isin(matching_movie_ids)]
    ranked_subset = ranked_df[['movie_id', 'ranking_score']]
    movie_meta = movie_meta.merge(ranked_subset, on='movie_id', how='left')
    movie_meta['title'] = movie_meta['movie_id'].map(movie_title_map)

    # === Step 5: Process future calendar slots ===
    now = datetime.now(tz=tz.tzlocal())
    future_slots = []

    for slot in user_data["calendar_free_slots"]:
        start = parser.isoparse(slot['start'])
        end = parser.isoparse(slot['end'])
        if end > now:
            hours, mins = map(int, slot['duration'].replace('h', '').replace('m', '').split())
            duration_min = hours * 60 + mins
            future_slots.append((start, end, duration_min))

    future_slots.sort()

    # === Step 6: Generate output JSON ===
    final_output = []
    global_movie_id = 1

    for idx, (start, end, free_minutes) in enumerate(future_slots, 1):
        fitting_movies = movie_meta[movie_meta['duration_minutes'] <= free_minutes].copy()
        fitting_movies = fitting_movies.sort_values(by="ranking_score", ascending=False)

        fitting_movie_list = []
        for _, row in fitting_movies.iterrows():
            title = row['title']
            if pd.isna(title):
                continue
            fitting_movie_list.append({
                "id": global_movie_id,
                "movie_id": row['movie_id'],
                "title": title,
                "duration_minutes": int(row['duration_minutes']),
                "ranking_score": round(row['ranking_score'], 2)
            })
            global_movie_id += 1

        final_output.append({
            "slot_id": idx,
            "start_time": start.isoformat(),
            "end_time": end.isoformat(),
            "free_minutes": free_minutes,
            "movie_count": len(fitting_movie_list),
            "fitting_movies": fitting_movie_list
        })

    return final_output
