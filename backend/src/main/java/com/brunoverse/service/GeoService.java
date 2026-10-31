package com.brunoverse.service;

import org.springframework.stereotype.Service;

/** Distance helpers for GPS-based "nearby" queries. */
@Service
public class GeoService {
    private static final double EARTH_RADIUS_KM = 6371.0;

    /** Great-circle distance between two coordinates (Haversine formula). */
    public double km(Double lat1, Double lng1, Double lat2, Double lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return Double.MAX_VALUE;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double h = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.pow(Math.sin(dLng / 2), 2);
        return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
    }

    /** Rough city travel time at ~20 km/h. */
    public int etaMinutes(double km) {
        return Math.max(3, (int) Math.round(km / 20.0 * 60) + 2);
    }
}
