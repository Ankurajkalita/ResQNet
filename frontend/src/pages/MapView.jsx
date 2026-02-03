import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getReports } from '../api';

// Fix for default Leaflet icons in Webpack/Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReports().then(data => {
            setReports(data);
            setLoading(false);
        });
    }, []);

    // Find the latest report with valid coordinates to center the map
    const latestReport = reports.find(r => r.latitude && r.longitude);
    const center = latestReport
        ? [latestReport.latitude, latestReport.longitude]
        : [34.05, -118.25]; // Fallback to default if no reports

    // Component to auto-recenter map when reports change
    const RecenterMap = ({ lat, lng }) => {
        const map = useMap();
        useEffect(() => {
            map.flyTo([lat, lng], 5);
        }, [lat, lng, map]);
        return null;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-64px)] w-full bg-slate-900">
            <div className="text-white text-xl font-bold animate-pulse">Loading Live Intelligence Map...</div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-64px)] w-full">
            <MapContainer center={center} zoom={5} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {latestReport && <RecenterMap lat={latestReport.latitude} lng={latestReport.longitude} />}

                {reports.map((report) => (
                    (report.latitude && report.longitude) && (
                        <Marker key={report.id} position={[report.latitude, report.longitude]}>
                            <Popup>
                                <div className="min-w-[200px]">
                                    <h3 className="font-bold text-sm text-slate-800">{report.location_name || "Unknown Location"}</h3>
                                    <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded w-fit text-white ${report.severity === 'Critical' ? 'bg-red-500' :
                                        report.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}>
                                        {report.severity} Severity
                                    </div>
                                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${report.image_path}`} className="mt-2 rounded h-24 w-full object-cover border border-slate-200" />
                                    <p className="text-xs mt-2 text-slate-500">
                                        <span className="font-semibold">Detected:</span> {report.damage_types.join(", ").replace(/_/g, " ")}
                                    </p>
                                    <a href={`/mission/${report.id}`} className="block mt-2 text-center text-xs bg-violet-600 text-white py-1 rounded hover:bg-violet-700 transition-colors">
                                        View Mission Details
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
