import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from tavily import TavilyClient

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

# Initialize API clients
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def get_gemini_response(prompt):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Primary model failed: {e}")
        # Fallback if 2.5-flash is not available in this environment
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        return response.text

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/profile', methods=['POST'])
def build_profile():
    data = request.json
    bio = data.get('bio', '')
    links = [data.get(k) for k in ['linkedin', 'github', 'twitter', 'website'] if data.get(k)]
    
    prompt = f"""
    Based on the following bio and social links, extract the user's name, role, and up to 3 technical/professional tags.
    Bio: {bio}
    Links: {', '.join(links)}
    
    Return ONLY a JSON object with these keys: "name" (string), "role" (string), "tags" (list of strings).
    Do not use markdown formatting like ```json, just output the raw JSON string.
    """
    
    try:
        result_text = get_gemini_response(prompt)
        # Clean up any potential markdown
        if result_text.startswith("```json"):
            result_text = result_text[7:-3]
        elif result_text.startswith("```"):
            result_text = result_text[3:-3]
            
        extracted = json.loads(result_text.strip())
        profile = {
            "id": 1,
            "name": extracted.get("name", "User"),
            "avatar": extracted.get("name", "U")[0].upper(),
            "color": "#00BFA5",
            "role": extracted.get("role", "Professional"),
            "tags": extracted.get("tags", [])
        }
    except Exception as e:
        print("Profile generation error:", e)
        # Fallback
        profile = {
            "id": 1,
            "name": data.get('linkedin', '').split('/')[-1] or "User",
            "avatar": "U",
            "color": "#00BFA5",
            "role": bio or "Professional",
            "tags": ["AI", "Tech"]
        }
        
    return jsonify({"success": True, "profile": profile})

INDIAN_MOCK_PROFILES = [
    {"id": 2, "name": "Arjun Mehta",  "avatar": "AM", "color": "#2979FF", "match": 95, "role": "ML Engineer @ Razorpay, Bengaluru",     "tags": ["LLMs", "Fintech AI"],         "match_reason": "Building AI infra at Razorpay",         "platforms": ["LinkedIn", "GitHub"]},
    {"id": 3, "name": "Priya Sharma", "avatar": "PS", "color": "#FF6B9D", "match": 88, "role": "Research Engineer @ IISc Bengaluru",    "tags": ["Deep Learning", "NLP"],       "match_reason": "Published at ACL 2024",                 "platforms": ["LinkedIn", "Twitter"]},
    {"id": 4, "name": "Rohan Verma",  "avatar": "RV", "color": "#FF8C42", "match": 82, "role": "SDE-2 @ Swiggy, Hyderabad",            "tags": ["MLOps", "Python"],            "match_reason": "Active open source contributor",        "platforms": ["GitHub"]},
    {"id": 5, "name": "Sneha Iyer",   "avatar": "SI", "color": "#845EF7", "match": 75, "role": "AI Researcher @ TCS Research, Pune",   "tags": ["Computer Vision", "GenAI"],   "match_reason": "Focus on Indian language models",       "platforms": ["LinkedIn", "Twitter"]},
    {"id": 6, "name": "Karan Patel",  "avatar": "KP", "color": "#00BFA5", "match": 68, "role": "Founder @ AI Startup, Ahmedabad",      "tags": ["SaaS", "Automation"],         "match_reason": "Building B2B AI tools for India",       "platforms": ["LinkedIn"]},
]

@app.route('/search', methods=['POST'])
def search_people():
    import random
    data = request.json
    query = data.get('query', '')
    experience_level = data.get('experience_level', 'Any')
    colors = ["#2979FF", "#FF6B9D", "#FF8C42", "#845EF7", "#00BFA5"]

    try:
        # 1. Search Tavily for real results
        exp_constraint = ""
        if "Entry Level" in experience_level:
            exp_constraint = ' ("junior" OR "student" OR "intern" OR "new grad") '
        elif "Mid-Level" in experience_level:
            exp_constraint = ' ("experienced" OR "manager") '
        elif "Senior" in experience_level:
            exp_constraint = ' ("senior" OR "director" OR "founder" OR "lead" OR "head") '
            
        random_keywords = ["award", "speaker", "open source", "startup", "featured", "blog", "portfolio", "talk", "project"]
        randomizer = f' "{random.choice(random_keywords)}"'
        
        optimized_query = f"{query} {exp_constraint} {randomizer} (site:linkedin.com/in/ OR site:github.com OR site:twitter.com OR site:x.com OR site:instagram.com)"
        search_result = tavily_client.search(query=optimized_query, search_depth="basic", max_results=7)
        results = search_result.get("results", [])

        if not results:
            print("Tavily returned no results, using mock profiles.")
            return jsonify({"success": True, "profiles": INDIAN_MOCK_PROFILES})

        # 2. Use Gemini to extract people from the results
        prompt = f"""
        I have performed a web search for professionals matching: "{query}".
        Here are the raw search results:
        {json.dumps(results)}

        Extract a list of up to 5 people from these results. For each person, provide:
        - "name": their full name (string)
        - "role": their job title or current role (string)
        - "tags": up to 2 technical tags related to their work (list of strings)
        - "match_reason": a short 3-7 word reason why they match the query (string)
        - "platform_urls": a dictionary mapping the platform name (e.g. "LinkedIn", "Instagram", "GitHub", "X") to their EXACT profile URL found in the search results
        - "email": their email address if explicitly mentioned in the search text, else null
        - "match": an estimated match score out of 100 (integer between 50 and 100)

        Return ONLY a valid JSON array. No markdown, no code fences, no explanation.
        Example: [{"name": "Alice", "role": "Engineer", "tags": ["AI"], "match_reason": "Builds AI tools", "platform_urls": {"LinkedIn": "https://linkedin.com/in/alice", "X": "https://x.com/alice"}, "email": "alice@gmail.com", "match": 85}]
        """

        result_text = get_gemini_response(prompt).strip()

        # Strip any markdown code fences Gemini may add
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result_text = result_text.strip()

        people = json.loads(result_text)

        if not isinstance(people, list) or len(people) == 0:
            raise ValueError("Gemini returned an empty or invalid list")

        profiles = []
        for i, p in enumerate(people[:5]):
            name = p.get("name", "Unknown")
            platform_urls = p.get("platform_urls", {})
            # fallback to platforms array if platform_urls is somehow missing
            platforms = list(platform_urls.keys()) if platform_urls else p.get("platforms", ["LinkedIn"])
            
            profiles.append({
                "id": i + 2,
                "name": name,
                "avatar": (name[0] + (name.split()[-1][0] if len(name.split()) > 1 else "")).upper(),
                "color": colors[i % len(colors)],
                "match": int(p.get("match", 75)),
                "role": p.get("role", "Professional"),
                "tags": p.get("tags", []),
                "match_reason": p.get("match_reason", ""),
                "platforms": platforms,
                "platform_urls": platform_urls,
                "email": p.get("email")
            })

        return jsonify({"success": True, "profiles": profiles})

    except Exception as e:
        print(f"Search error ({type(e).__name__}): {e} — returning Indian mock profiles as fallback.")
        return jsonify({"success": True, "profiles": INDIAN_MOCK_PROFILES})

@app.route('/message', methods=['POST'])
def generate_message():
    data = request.json
    user_profile = data.get('user_profile', {})
    target_profile = data.get('target_profile', {})
    tone = data.get('tone', 'friendly')
    
    prompt = f"""
    Write a short outreach message from {user_profile.get('name', 'me')} to {target_profile.get('name', 'them')}.
    My role: {user_profile.get('role')}
    Their role: {target_profile.get('role')}
    Why they match: {target_profile.get('match_reason')}
    
    The tone of the message should be: {tone}.
    Keep it concise, professional, and natural. Do not include subject lines.
    """
    
    try:
        msg = get_gemini_response(prompt)
    except Exception as e:
        print("Message error:", e)
        msg = "Error generating message."
        
    return jsonify({"success": True, "message": msg.strip()})

@app.route('/research', methods=['POST'])
def deep_research():
    data = request.json
    profile = data.get('profile', {})
    
    query = f"{profile.get('name')} {profile.get('role')} {' '.join(profile.get('tags', []))} background and achievements"
    try:
        search_result = tavily_client.search(query=query, search_depth="basic", max_results=3)
        results = search_result.get("results", [])
        
        prompt = f"""
        Based on these search results about {profile.get('name')}:
        {json.dumps(results)}
        
        Extract:
        1. "background": A 2-sentence summary of their background.
        2. "achievements": A list of up to 3 notable achievements (strings).
        3. "why_connect": A 1-sentence reason why it makes sense to connect with them.
        
        Return ONLY a JSON object with these exactly named keys. No markdown.
        """
        
        result_text = get_gemini_response(prompt)
        if result_text.startswith("```json"):
            result_text = result_text[7:-3]
        elif result_text.startswith("```"):
            result_text = result_text[3:-3]
            
        research = json.loads(result_text.strip())
    except Exception as e:
        print("Research error:", e)
        research = {
            "background": f"Unable to fetch detailed background for {profile.get('name')}.",
            "achievements": [],
            "why_connect": "Shared interests in the field."
        }
        
    return jsonify({"success": True, "research": research})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
