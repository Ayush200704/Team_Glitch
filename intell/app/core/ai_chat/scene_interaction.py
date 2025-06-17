import os
import json
from typing import List, Dict, Any

import openai

# Optional: OpenAI/Groq function-calling schema for future use
# functions = [
#   {
#     "name": "generate_scene_interaction",
#     "description": "Generate structured trivia and engagement content for a movie scene.",
#     "parameters": {
#       "type": "object",
#       "properties": {
#         "trivia_question": { "type": "string" },
#         "trivia_choices": {
#           "type": "array",
#           "items": { "type": "string" },
#           "minItems": 4,
#           "maxItems": 4
#         },
#         "fun_fact": { "type": "string" },
#         "poll_question": { "type": "string" }
#       },
#       "required": ["trivia_question", "trivia_choices", "fun_fact", "poll_question"]
#     }
#   }
# ]

def group_subtitles_by_scene(subtitles: List[Dict[str, Any]], scenes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Groups subtitle text into their respective scenes based on time overlap."""
    print(f"[INFO] Grouping {len(subtitles)} subtitles into {len(scenes)} scenes...")
    scene_chunks = []

    for scene in scenes:
        scene_subs = [sub for sub in subtitles if sub['end'] > scene['start'] and sub['start'] < scene['end']]
        merged_text = " ".join([sub['text'] for sub in scene_subs])
        print(f"[DEBUG] Scene {scene['scene_number']} has {len(scene_subs)} subtitles, merged length: {len(merged_text)}")

        scene_chunks.append({
            'scene': scene['scene_number'],
            'start': scene['start'],
            'end': scene['end'],
            'subtitle_text': merged_text,
            'subtitles': scene_subs
        })

    print(f"[INFO] Completed grouping. Total chunks prepared: {len(scene_chunks)}")
    return scene_chunks

def call_groq_for_interaction(subtitle_text: str, scene_number: int, start: float, end: float) -> Dict[str, Any]:
    """
    Calls OpenAI or Groq API with function-calling for structured JSON scene interaction.
    """
    system_prompt = (
        "You are an expert in generating interactive media content from videos. "
        "Your task is to generate valid JSON with structured interaction elements for each scene. "
        "Only use the provided function."
    )
    user_prompt = (
        f"Scene Number: {scene_number}\n"
        f"Start Time: {start} seconds\n"
        f"End Time: {end} seconds\n"
        f"Subtitle Text: {subtitle_text}"
    )

    function_schema = [
        {
            "name": "generate_scene_interaction",
            "description": "Generate structured trivia and engagement content for a movie scene.",
            "parameters": {
                "type": "object",
                "properties": {
                    "trivia_question": { "type": "string" },
                    "trivia_choices": {
                        "type": "array",
                        "items": { "type": "string" },
                        "minItems": 4,
                        "maxItems": 4
                    },
                    "fun_fact": { "type": "string" },
                    "poll_question": { "type": "string" }
                },
                "required": ["trivia_question", "trivia_choices", "fun_fact", "poll_question"]
            }
        }
    ]

    # Prefer OpenAI if api_key is set, else fallback to Groq
    openai_api_key = os.getenv("OPENAI_API_KEY")
    groq_api_key = os.getenv("GROQ_API_KEY") or "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"
    groq_api_url = os.getenv("GROQ_API_URL") or "https://api.groq.com/openai/v1/chat/completions"

    try:
        if openai_api_key:
            openai.api_key = openai_api_key
            response = openai.ChatCompletion.create(
                model="gpt-4-1106-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                functions=function_schema,
                function_call={"name": "generate_scene_interaction"},
                temperature=0.3,
                max_tokens=500
            )
            arguments = response['choices'][0]['message']['function_call']['arguments']
            return json.loads(arguments)
        else:
            import requests
            headers = {
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "llama3-70b-8192",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "functions": function_schema,
                "function_call": {"name": "generate_scene_interaction"},
                "max_tokens": 500,
                "temperature": 0.3
            }
            response = requests.post(groq_api_url, headers=headers, json=data)
            response.raise_for_status()
            arguments = response.json()["choices"][0]["message"]["function_call"]["arguments"]
            return json.loads(arguments)
    except Exception as e:
        print(f"[ERROR] API call failed for scene {scene_number}: {e}")
        return {
            "trivia_question": "",
            "trivia_choices": [],
            "fun_fact": f"API Error: {str(e)}",
            "poll_question": ""
        }

def generate_scene_interaction(scene_chunk: Dict[str, Any]) -> Dict[str, Any]:
    subtitle_text = scene_chunk['subtitle_text']
    scene_number = scene_chunk['scene']
    start = scene_chunk['start']
    end = scene_chunk['end']

    if not subtitle_text.strip():
        print(f"[WARN] Scene {scene_number} has no dialogue. Skipping.")
        return None
    if len(subtitle_text.split()) < 5:
        print(f"[WARN] Scene {scene_number} is too short ({len(subtitle_text.split())} words). Skipping.")
        return None

    ai_result = call_groq_for_interaction(subtitle_text, scene_number, start, end)
    return {
        "scene": scene_number,
        "start": start,
        "end": end,
        "subtitle_text": subtitle_text,
        "trivia_question": ai_result.get("trivia_question", ""),
        "trivia_choices": ai_result.get("trivia_choices", []),
        "fun_fact": ai_result.get("fun_fact", ""),
        "poll_question": ai_result.get("poll_question", "")
    }

def process_subtitles(subtitles: List[Dict[str, Any]], scenes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    print("[INFO] Starting subtitle to scene interaction generation process...")
    chunks = group_subtitles_by_scene(subtitles, scenes)

    output = []
    for idx, chunk in enumerate(chunks, 1):
        print(f"[INFO] Processing scene {chunk['scene']} ({idx}/{len(chunks)})")
        try:
            result = generate_scene_interaction(chunk)
            if result:
                output.append(result)
                print(f"[SUCCESS] Generated interaction for scene {chunk['scene']}")
            else:
                print(f"[SKIPPED] Scene {chunk['scene']} yielded no interaction.")
        except Exception as e:
            print(f"[ERROR] Failed processing scene {chunk['scene']}: {e}")
    print(f"[INFO] Finished processing all scenes. Generated {len(output)} interactions.")
    return output
