import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from tavily import TavilyClient

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def get_gemini_response(prompt):
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(prompt)
    return response.text

query = "UX Designer in New York"
try:
    search_result = tavily_client.search(query=query, search_depth="basic", max_results=5)
    results = search_result.get("results", [])
    print("Tavily Results:", json.dumps(results, indent=2))

    prompt = f"""
    I have performed a web search for professionals matching: "{query}".
    Here are the raw search results:
    {json.dumps(results)}

    Extract a list of up to 5 people from these results. For each person, provide:
    - "name": their full name (string)
    - "role": their job title or current role (string)
    - "tags": up to 2 technical tags related to their work (list of strings)
    - "match_reason": a short 3-7 word reason why they match the query (string)
    - "platforms": a list of platforms they appear on, e.g. ["LinkedIn", "GitHub"] (list of strings)
    - "match": an estimated match score out of 100 (integer between 50 and 100)

    Return ONLY a valid JSON array. No markdown, no code fences, no explanation.
    Example: [{{"name": "Alice", "role": "Engineer", "tags": ["AI"], "match_reason": "Builds AI tools", "platforms": ["LinkedIn"], "match": 85}}]
    """
    
    result_text = get_gemini_response(prompt).strip()
    print("Gemini Raw:", repr(result_text))

    if result_text.startswith("```"):
        result_text = result_text.split("```")[1]
        if result_text.startswith("json"):
            result_text = result_text[4:]
    result_text = result_text.strip()
    
    people = json.loads(result_text)
    print("Parsed People:", len(people))

except Exception as e:
    import traceback
    traceback.print_exc()

