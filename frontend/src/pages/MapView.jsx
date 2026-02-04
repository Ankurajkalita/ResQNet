import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
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
    const [error, setError] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Attach L to window for CDN plugins like leaflet.heat
    if (typeof window !== 'undefined') {
        window.L = L;
    }

    useEffect(() => {
        // Load leaflet-heat script dynamically
        const script = document.createElement('script');
        script.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
        script.async = true;
        script.onload = () => {
            console.log("Leaflet Heatmap script loaded successfully");
            setScriptLoaded(true);
        };
        script.onerror = () => {
            console.error("Failed to load Leaflet Heatmap script");
            // We don't block the whole map if heat fails, just show markers
            setScriptLoaded(false);
        };
        document.body.appendChild(script);

        getReports()
            .then(data => {
                if (Array.isArray(data)) {
                    setReports(data);
                } else {
                    console.error("Expected array from getReports, got:", data);
                    setReports([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load map reports:", err);
                setError("Failed to connect to tactical servers. Please check your connection.");
                setLoading(false);
            });

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // Find the latest report with valid coordinates to center the map
    const latestReport = Array.isArray(reports) ? reports.find(r => r && r.latitude && r.longitude) : null;
    const center = latestReport
        ? [latestReport.latitude, latestReport.longitude]
        : [34.05, -118.25]; // Fallback to default if no reports

    // Component to auto-recenter map when reports change
    const RecenterMap = ({ lat, lng }) => {
        const map = useMap();
        useEffect(() => {
            if (lat && lng) map.flyTo([lat, lng], 5);
        }, [lat, lng, map]);
        return null;
    };

    // Heatmap Layer Component
    const HeatmapLayer = ({ reports }) => {
        const map = useMap();
        useEffect(() => {
            if (!window.L || !window.L.heatLayer || !Array.isArray(reports)) return;

            // Prepare data: [lat, lng, intensity]
            const heatData = reports
                .filter(r => r && r.latitude && r.longitude)
                .map(r => [
                    r.latitude,
                    r.longitude,
                    ((r.priority_score || 0) / 100)
                ]);

            if (heatData.length === 0) return;

            const heat = window.L.heatLayer(heatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
            }).addTo(map);

            return () => map.removeLayer(heat);
        }, [reports, map]);
        return null;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] w-full bg-slate-900">
            <div className="text-white text-xl font-bold animate-pulse mb-2">Loading Live Intelligence Map...</div>
            <div className="text-slate-500 text-xs font-mono">Connecting to orbital assets...</div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] w-full bg-slate-900 p-8 text-center">
            <div className="text-red-500 text-2xl font-black mb-4 uppercase tracking-tighter italic">Connection Terminated</div>
            <p className="text-slate-400 max-w-md mb-8">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full font-bold hover:bg-red-600/30 transition-all uppercase tracking-widest text-xs"
            >
                Reconnect System
            </button>
        </div>
    );

    return (
        <div className="h-[calc(100vh-64px)] w-full relative bg-slate-950">
            <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tactical Overlay</h4>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-violet-500 shadow-[0_0_8px_violet]"></div>
                        <span className="text-[10px] font-bold text-white">Detection Marker</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-gradient-to-r from-blue-500 via-lime-500 to-red-500 rounded-full"></div>
                    <span className="text-[8px] text-slate-500 font-bold uppercase text-center">Crisis Concentration</span>
                </div>
            </div>

            <MapContainer center={center} zoom={5} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {scriptLoaded && <HeatmapLayer reports={reports} />}

                {latestReport && <RecenterMap lat={latestReport.latitude} lng={latestReport.longitude} />}

                {Array.isArray(reports) && reports.map((report) => (
                    (report && report.latitude && report.longitude) && (
                        <Marker
                            key={report.id}
                            position={[report.latitude, report.longitude]}
                        >
                            <Popup>
                                <div className="min-w-[200px] p-1">
                                    <h3 className="font-bold text-sm text-slate-900">{report.location_name || "Unknown Location"}</h3>
                                    <div className={`text-[10px] font-black mt-1 px-2 py-0.5 rounded w-fit text-white uppercase tracking-wider ${report.severity === 'Critical' ? 'bg-red-500' :
                                        report.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}>
                                        {report.severity || 'Status Unknown'}
                                    </div>
                                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${report.image_path}`} className="mt-2 rounded h-24 w-full object-cover border border-slate-200 shadow-sm" />
                                    <p className="text-xs mt-2 text-slate-600">
                                        <span className="font-bold text-slate-800">Intelligence:</span> {Array.isArray(report.damage_types) ? report.damage_types.join(", ").replace(/_/g, " ") : "Analysis pending"}
                                    </p>
                                    <Link to={`/mission/${report.id}`} className="block mt-3 text-center text-xs font-bold bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20">
                                        View Mission Details
                                    </Link>
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
