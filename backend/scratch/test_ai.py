import requests
import json

api_key = "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"

print("Testing Groq API with key:", api_key[:12])

for model in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama-3.2-3b-preview"]:
    print(f"\n--- Testing model: {model} ---")
    try:
        res = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": "What is CSS in 1 sentence?"}],
                "temperature": 0.3
            },
            timeout=15
        )
        print("Status Code:", res.status_code)
        print("Response:", res.text[:300])
    except Exception as e:
        print("Exception:", e)
