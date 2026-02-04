import os
import google.generativeai as genai
import PIL.Image
from dotenv import load_dotenv
import json

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

print(f"Testing API Key: {api_key[:10]}...")

try:
    genai.configure(api_key=api_key)
    
    print("Listing available models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)

    # Try 1.5-flash with 'models/' prefix or check if flash-latest works
    model_name = 'models/gemini-1.5-flash' 
    print(f"Trying model: {model_name}")
    model = genai.GenerativeModel(model_name)
    
    # Try a simple text prompt first
    response = model.generate_content("Hello")
    print(f"Text Test Response: {response.text}")

    # Try image analysis if the image exists
    image_path = r"C:/Users/ankur/.gemini/antigravity/brain/341f3355-46b9-4d02-9157-ab9e9310cbf2/uploaded_media_1770184433603.png"
    if os.path.exists(image_path):
        img = PIL.Image.open(image_path)
        prompt = "Analyze this image for disaster damage. Return JSON: {'damage_detected': bool, 'summary': str}"
        response = model.generate_content([prompt, img])
        print(f"Image Test Response: {response.text}")
    else:
        print(f"Image not found at {image_path}")

except Exception as e:
    print(f"ERROR: {e}")
