import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface IncidentMapProps {
    incidents: any[];
    center?: [number, number];
    zoom?: number;
}

export default function IncidentMap({
    incidents,
    center = [-1.2921, 36.8219], // Nairobi default 
    zoom = 12,
}: IncidentMapProps) {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low':
                return '#3b82f6'; // blue
            case 'medium':
                return '#eab308'; // yellow
            case 'high':
                return '#f97316'; // orange
            case 'critical':
                return '#ef4444'; // red
            default:
                return '#6b7280'; // gray
        }
    };

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {incidents.map((incident) => (
                <div key={incident.id}>
                    {/* Affected radius circle */}
                    <Circle
                        center={[incident.location.lat || center[0], incident.location.lon || center[1]]}
                        radius={(incident.affected_radius_km || 1) * 1000}
                        pathOptions={{
                            color: getSeverityColor(incident.severity),
                            fillColor: getSeverityColor(incident.severity),
                            fillOpacity: 0.2,
                        }}
                    />

                    {/* Incident marker */}
                    <Marker
                        position={[incident.location.lat || center[0], incident.location.lon || center[1]]}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg mb-2">
                                    Incident #{incident.id.slice(0, 8)}
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <strong>Severity:</strong>{' '}
                                        <span className={`severity-${incident.severity}`}>
                                            {incident.severity.toUpperCase()}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Reports:</strong> {incident.report_count}
                                    </p>
                                    <p>
                                        <strong>Status:</strong> {incident.status}
                                    </p>
                                    <p>
                                        <strong>Radius:</strong> {incident.affected_radius_km} km
                                    </p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                </div>
            ))}
        </MapContainer>
    );
}
