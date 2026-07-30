"""
test_gemini.py - Test your Gemini API key and print the exact response/error.
"""
import os
import django
from dotenv import load_dotenv

load_dotenv()
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'askdocs.settings')
django.setup()

import google.generativeai as genai
from django.conf import settings
from documents.models import Document

print("--- 1. Testing Document Status in Database ---")
for doc in Document.objects.all():
    print(f"ID: {doc.id} | Title: {doc.title} | Status: {doc.status}")
    if doc.error_message:
        print(f"   Error: {doc.error_message}")

print("\n--- 2. Testing Gemini API Key ---")
key = settings.GEMINI_API_KEY
print(f"Key in .env: {key}")

try:
    genai.configure(api_key=key)
    res = genai.embed_content(
        model="models/text-embedding-004",
        content="Hello world test",
        task_type="retrieval_document"
    )
    print("✅ SUCCESS! Gemini Embedding API works! Vector length:", len(res['embedding']))
except Exception as e:
    print("❌ ERROR calling Gemini API:")
    print(e)
