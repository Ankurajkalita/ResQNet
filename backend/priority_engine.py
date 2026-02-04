def calculate_priority(damage_detected: bool, damage_types: list, confidence: float) -> dict:
    priority_score = 0
    severity = "Low"
    
    if not damage_detected:
        return {"severity": "Low", "priority_score": 0}

    # Base score (starting higher for detected damage)
    score = 25 

    # Dynamic Weight Mapping
    weights = {
        # High Priority
        "infrastructure_collapse": 50,
        "collapsed_building": 50,
        "earthquake_damage": 45,
        "active_fire": 40,
        "structure_fire": 40,
        
        # Medium Priority
        "flooded_roads": 30,
        "flash_flood": 30,
        "broken_bridge": 35,
        "cracked_road": 25,
        "infrastructure_damage": 25,
        
        # Low Priority / Others
        "blocked_road": 15,
        "debris": 15,
        "power_line_down": 20
    }

    for dtype in damage_types:
        # Match partial strings for robustness
        found_weight = 10 # Default base
        for key, weight in weights.items():
            if key in dtype or dtype in key:
                found_weight = max(found_weight, weight)
        score += found_weight

    # Escalation based on multiple hazards
    if len(damage_types) > 1:
        score += 10

    # Cap score
    score = min(score, 100)

    # Determine Label
    if score >= 80:
        severity = "Critical"
    elif score >= 50:
        severity = "Medium"
    else:
        severity = "Low"

    return {
        "severity": severity,
        "priority_score": score
    }
