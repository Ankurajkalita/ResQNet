import random
from ultralytics import YOLO
import cv2
import numpy as np
import os
import google.generativeai as genai
import json
import PIL.Image
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure Google AI
# (Now handled inside analyze_image for better reliability)

class AIEngine:
    def __init__(self):
        try:
            # Keep YOLO as a fast marker detection fallback
            self.model = YOLO("yolov8n.pt") 
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
        
        # Configure Google AI once
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.gemini_model = genai.GenerativeModel('models/gemini-1.5-flash')
        else:
            self.gemini_model = None

    def analyze_image(self, image_path: str):
        """
        Optimized Dual-mode analysis (<30s target): 
        1. Pre-resizes image to reduce upload overhead.
        2. Uses Gemini Flash Vision (Primary).
        3. Fast Fallback to YOLO/CV.
        """
        # 1. OPTIMIZATION: Read and resize once for both modes
        try:
            pil_img = PIL.Image.open(image_path)
            # Ensure RGB for consistency
            if pil_img.mode != 'RGB':
                pil_img = pil_img.convert('RGB')
            
            # Internal resize for processing (1024px is high-res for Gemini, 640px for logic)
            # If the image is already small, thumbnail() won't scale it up.
            pil_img.thumbnail((1024, 1024))
        except Exception as e:
            print(f"DEBUG: Initial image load error: {e}")
            return {"damage_detected": False, "damage_types": [], "confidence": 0, "box_count": 0}

        # Try Gemini First
        if self.gemini_model:
            try:
                # Pass the already resized PIL image to save upload bandwidth
                result = self._analyze_with_gemini(pil_img)
                if result:
                    return result
            except Exception as e:
                print(f"DEBUG: Gemini Vision Error: {e}")
                # Fallback handles the rest
        
        # Fast Fallback to Heuristics using the already loaded image
        return self._analyze_with_heuristics(pil_img)

    def _analyze_with_gemini(self, pil_img):
        """Generative Reasoning with optimized prompt for accuracy."""
        prompt = """
        You are an elite disaster response AI. Analyze this image and provide a tactical assessment.
        
        Identify specific damage such as:
        - collapsed_structure: Buildings or bridges that have collapsed.
        - cracked_road: Fissures or major cracks in pavement.
        - flooded_roads: Water covering roadways.
        - structure_fire: Active fire or smoke from buildings.
        - road_block: Debris, landslides, or fallen trees blocking passage.
        - infrastructure_collapse: Power lines down, cell towers tilted, etc.

        Return ONLY valid JSON:
        {
          "damage_detected": boolean,
          "damage_types": ["type1", "type2"], 
          "severity": "Low"|"Medium"|"Critical",
          "confidence": float (0.0 to 1.0),
          "summary": "Short, professional tactical summary."
        }
        """
        
        try:
            response = self.gemini_model.generate_content([prompt, pil_img])
            if not response.candidates:
                return None
                
            text = response.text.strip()
            # Clean JSON response
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(text)
            
            # Map severity to internal confidence boost if critical
            conf = data.get("confidence", 0.95)
            if data.get("severity") == "Critical":
                conf = max(conf, 0.98)

            return {
                "damage_detected": data.get("damage_detected", False),
                "damage_types": data.get("damage_types", ["earthquake_impact"]),
                "confidence": round(conf, 2),
                "box_count": len(data.get("damage_types", [])),
                "summary": data.get("summary", "Gemini analysis results.")
            }
        except Exception as e:
            print(f"DEBUG: Gemini parsing error: {e}")
            return None

    def _analyze_with_heuristics(self, pil_img):
        damage_types = set()
        confidence_accum = 0.0
        detections_count = 0
        found_objects = {}

        try:
            # Convert PIL to OpenCV format (Numpy)
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            
            # Use a slightly smaller internal size for extreme speed
            h, w = img.shape[:2]
            scale = 320 / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)))
            total_pixels = img.shape[0] * img.shape[1]
            
        except Exception as e:
            print(f"DEBUG: CV conversion error: {e}")
            return {"damage_detected": False, "damage_types": [], "confidence": 0, "box_count": 0}

        if self.model:
            try:
                # OPTIMIZATION: Reduce imgsz to 256 for sub-second CPU inference
                results = self.model(img, imgsz=256, verbose=False)
                for result in results:
                    for box in result.boxes:
                        cls_id = int(box.cls[0])
                        conf = float(box.conf[0])
                        name = self.model.names[cls_id]
                        found_objects[name] = found_objects.get(name, 0) + 1
                        confidence_accum += conf
                        detections_count += 1

                if found_objects.get('boat', 0) > 0: damage_types.add("flooded_roads")
                if found_objects.get('car', 0) > 7: damage_types.add("road_block")
                avg_conf = (confidence_accum / detections_count) if detections_count > 0 else 0.85
            except:
                avg_conf = 0.80
        else:
            avg_conf = 0.80

        # Fast Color/Edge heuristics
        try:
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            mask_fire = cv2.inRange(hsv, np.array([0, 150, 150]), np.array([35, 255, 255]))
            if (cv2.countNonZero(mask_fire) / total_pixels) > 0.01: damage_types.add("structure_fire")
            
            mask_mud = cv2.inRange(hsv, np.array([10, 60, 50]), np.array([35, 200, 200]))
            if (cv2.countNonZero(mask_mud) / total_pixels) > 0.25: damage_types.add("flooded_roads")

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 100, 200)
            if (cv2.countNonZero(edges) / total_pixels) > 0.12: 
                damage_types.add("infrastructure_collapse")
        except:
            pass

        return {
            "damage_detected": len(damage_types) > 0,
            "damage_types": list(damage_types),
            "confidence": round(avg_conf, 2),
            "box_count": detections_count
        }

    def generate_suggestions(self, damage_types: list):
        actions = set()
        resources = set()
        supplies = set()
        
        if not damage_types:
            return {
                "actions": ["Verify sector status", "Routine monitoring"],
                "resources": ["surveillance_drone"],
                "supplies": ["standard_first_aid"]
            }

        rules = {
            "flooded_roads": {
                "actions": ["Deploy inflatable boats", "Establish medical posts"],
                "resources": ["Life Vests", "Inflatable Boats"],
                "supplies": ["Clean Water", "MREs", "Water Purification Tablets"]
            },
            "infrastructure_collapse": {
                "actions": ["Deploy heavy machinery", "Scan for survivors"],
                "resources": ["Excavators", "K-9 Units"],
                "supplies": ["First Aid Kits", "Portable Generators"]
            },
            "structure_fire": {
                "actions": ["Coordinate water drops", "Establish fire breaks"],
                "resources": ["Fire Trucks", "Aerial Tankers"],
                "supplies": ["Oxygen Tanks", "Burn Ointments"]
            },
            "road_block": {
                "actions": ["Reroute traffic", "Clear debris"],
                "resources": ["Bulldozers", "Chainsaws"],
                "supplies": ["Traffic Cones", "Flares"]
            }
        }

        for dtype in damage_types:
            # Flex-match for Gemini's dynamic tags
            matched = False
            for key in rules:
                if key in dtype or dtype in key:
                    actions.update(rules[key]["actions"])
                    resources.update(rules[key]["resources"])
                    supplies.update(rules[key]["supplies"])
                    matched = True
            
            if not matched:
                # Default for unknown dynamic tags
                actions.add(f"Analyze {dtype.replace('_', ' ')} specialist needs")
                resources.add("Tactical Assessment Unit")
        
        return {
            "actions": list(actions),
            "resources": list(resources),
            "supplies": list(supplies)
        }

ai_engine = AIEngine()
