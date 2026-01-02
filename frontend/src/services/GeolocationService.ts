/**
 * Geolocation Service
 * 
 * Provides real-time location detection using multiple strategies:
 * 1. HTML5 Geolocation API (browser GPS) - most accurate
 * 2. IP-based geolocation (ipapi.co) - fallback when GPS unavailable
 * 3. Manual address search with Nominatim geocoding
 */

export interface Location {
    lat: number;
    lon: number;
    address?: string;
    source: 'gps' | 'ip' | 'manual';
    accuracy?: number; // meters
    error?: string;
}

export interface GeocodeResult {
    lat: number;
    lon: number;
    address: string;
}

class GeolocationService {
    /**
     * Get user's location using HTML5 Geolocation API
     * Requests browser permission and returns GPS coordinates
     */
    async getBrowserLocation(): Promise<Location> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        source: 'gps',
                        accuracy: position.coords.accuracy,
                    });
                },
                (error) => {
                    let errorMessage = 'Unable to retrieve your location';

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable. Please try again.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Please try again.';
                            break;
                    }

                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000, // 10 seconds
                    maximumAge: 0, // Don't use cached position
                }
            );
        });
    }

    /**
     * Get approximate location based on IP address
     * Uses ipapi.co free tier (1000 requests/day, no API key required)
     */
    async getIPLocation(): Promise<Location> {
        try {
            const response = await fetch('https://ipapi.co/json/');

            if (!response.ok) {
                throw new Error('IP geolocation service unavailable');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.reason || 'IP location lookup failed');
            }

            return {
                lat: data.latitude,
                lon: data.longitude,
                address: `${data.city}, ${data.region}, ${data.country_name}`,
                source: 'ip',
            };
        } catch (error) {
            throw new Error(
                `IP-based location detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Reverse geocode coordinates to human-readable address
     * Uses Nominatim (OpenStreetMap) - free, no API key required
     */
    async reverseGeocode(lat: number, lon: number): Promise<string> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?` +
                `lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'FloodWatch/1.0', // Required by Nominatim
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Geocoding service unavailable');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error('Address lookup failed');
            }

            // Build human-readable address from components
            const address = data.address;
            const parts = [
                address.city || address.town || address.village,
                address.state || address.region,
                address.country,
            ].filter(Boolean);

            return parts.join(', ');
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`; // Fallback to coordinates
        }
    }

    /**
     * Forward geocode address to coordinates
     * Uses Nominatim (OpenStreetMap) - free, no API key required
     */
    async searchAddress(query: string): Promise<GeocodeResult[]> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
                {
                    headers: {
                        'User-Agent': 'FloodWatch/1.0',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Address search service unavailable');
            }

            const data = await response.json();

            return data.map((result: any) => ({
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                address: result.display_name,
            }));
        } catch (error) {
            throw new Error(
                `Address search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Get user location with automatic fallback strategy
     * 1. Try HTML5 Geolocation
     * 2. If denied/unavailable, fall back to IP-based location
     * 3. Throw error if both fail
     */
    async getLocation(): Promise<Location> {
        try {
            // First, try browser GPS
            const location = await this.getBrowserLocation();

            // Get human-readable address
            try {
                location.address = await this.reverseGeocode(location.lat, location.lon);
            } catch (error) {
                // Address lookup failed, but we have coordinates
                console.warn('Could not get address for location:', error);
            }

            return location;
        } catch (gpsError) {
            // GPS failed, try IP-based location
            console.warn('GPS location failed, trying IP-based:', gpsError);

            try {
                return await this.getIPLocation();
            } catch (ipError) {
                // Both methods failed
                throw new Error(
                    'Unable to detect your location. Please enter your address manually or enable location permissions.'
                );
            }
        }
    }

    /**
     * Validate coordinates are within valid ranges
     */
    validateCoordinates(lat: number, lon: number): boolean {
        return (
            !isNaN(lat) &&
            !isNaN(lon) &&
            lat >= -90 &&
            lat <= 90 &&
            lon >= -180 &&
            lon <= 180
        );
    }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
