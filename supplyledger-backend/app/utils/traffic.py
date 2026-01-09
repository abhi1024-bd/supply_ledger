def get_traffic_factor(distance_km, duration_min):
    """
    Calculate traffic congestion factor by comparing actual duration 
    with expected travel time.
    
    Args:
        distance_km: Distance in kilometers
        duration_min: Actual route duration in minutes (from map API)
    
    Returns:
        float: Traffic delay factor (0.05 to 0.30)
    """
    # Expected speed for normal conditions
    expected_speed = 60  # km/h
    
    # Calculate expected time at normal speed
    expected_time_min = (distance_km / expected_speed) * 60
    
    # Compare actual duration with expected time
    # Higher duration ratio = more congestion
    ratio = duration_min / expected_time_min if expected_time_min > 0 else 1
    
    if ratio > 1.5:
        # Very congested: > 50% slower than normal
        return 0.30
    elif ratio > 1.2:
        # Moderate congestion: 20-50% slower
        return 0.15
    else:
        # Light traffic: < 20% slower
        return 0.05
