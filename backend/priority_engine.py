def calculate_priority(damage_detected: bool, damage_types: list, confidence: float) -> dict:
    priority_score = 0
    severity = "Low"
    
    if not damage_detected:
        return {"severity": "Low", "priority_score": 0}

    # Base score
    score = 10 

    # Type weights
    weights = {
        "infrastructure_collapse": 40,
        "fire": 35,
        "flood": 25,
        "blocked_road": 15
    }

    for dtype in damage_types:
        score += weights.get(dtype, 10)

    # Escalation based on multiple hazards
    if len(damage_types) > 1:
        score += 15

    # Cap score
    score = min(score, 100)

    # Determine Label
    if score >= 70:
        severity = "Critical"
    elif score >= 40:
        severity = "Medium"
    else:
        severity = "Low"

    return {
        "severity": severity,
        "priority_score": score
    }
