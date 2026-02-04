import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Droplet, Fuel, Home, Zap, AlertTriangle, ArrowLeft } from 'lucide-react';

const EmergencyView = () => {
    const { id } = useParams();
    const [location, setLocation] = useState({ lat: 34.05, lng: -118.25 }); // Default fallback
    const [report, setReport] = useState(null);

    useEffect(() => {
        // Fetch specific SOS data
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/reports`)
            .then(res => res.json())
            .then(data => {
                const found = data.find(r => r.id === parseInt(id));
                if (found) {
                    setReport(found);
                    if (found.latitude && found.longitude) {
                        setLocation({ lat: found.latitude, lng: found.longitude });
                    }
                }
            });

        // Fallback to browser location for better demo experience
        if (!location.lat || location.lat === 34.05) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }
    }, [id]);

    const resources = [
        { name: "City Water Tanker", type: "water", distance: "0.4 km", status: "Active", icon: <Droplet className="text-blue-500" /> },
        { name: "Emergency Shelter (Hish School)", type: "shelter", distance: "1.2 km", status: "Open", icon: <Home className="text-emerald-500" /> },
        { name: "Mobile Fuel Station", type: "fuel", distance: "2.1 km", status: "Active", icon: <Fuel className="text-orange-500" /> },
        { name: "Medical Triage Center", type: "medical", distance: "0.8 km", status: "Limited", icon: <AlertTriangle className="text-red-500" /> },
        { name: "Power Uplink Point", type: "power", distance: "1.5 km", status: "Active", icon: <Zap className="text-yellow-500" /> },
    ];

    // Build Google Maps Nearby URL
    const mapUrl = `https://www.google.com/maps/embed/v1/search?key=GOOGLE_MAPS_API_KEY_OR_MOCK&q=water+tanker+shelter+fuel+hospital+near+${location.lat},${location.longitude}&zoom=14`;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <Link to="/" className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Safety Portal
                </Link>

                <div className="bg-red-900/20 border-2 border-red-500/50 rounded-3xl p-6 md:p-8 mb-8 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black animate-pulse">LIVE SOS ACTIVE</div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Help is on the way.</h1>
                    <p className="text-red-200 text-lg md:text-xl font-medium max-w-2xl">
                        Your emergency signal has been broadcasted. Rescue teams are being dispatched to your coordinates.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Nearby Resources List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-xl font-bold flex items-center mb-4 text-slate-300">
                            <MapPin className="h-5 w-5 mr-2 text-red-500" />
                            Nearby Resources
                        </h2>

                        {resources.map((res, i) => (
                            <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-slate-800 p-2.5 rounded-xl mr-3">
                                            {res.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">{res.name}</h3>
                                            <p className="text-xs text-slate-500">{res.distance} away</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${res.status === 'Open' || res.status === 'Active' ? 'text-emerald-400 border-emerald-500/30' : 'text-yellow-400 border-yellow-500/30'
                                        }`}>
                                        {res.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                        <div className="mt-8 p-6 bg-violet-600/20 border border-violet-500/30 rounded-2xl text-center">
                            <Phone className="h-8 w-8 text-violet-400 mx-auto mb-3" />
                            <h3 className="font-bold mb-1">Emergency Hotline</h3>
                            <p className="text-2xl font-black text-white">911 / 112</p>
                            <p className="text-[10px] text-violet-300 mt-2 uppercase font-bold tracking-widest">Always call if in immediate danger</p>
                        </div>
                    </div>

                    {/* Interactive Resource Map */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden h-[500px] shadow-2xl relative">
                            {/* In a real hackathon, you'd use a real Google Maps or Leaflet map here */}
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://www.google.com/maps?q=${location.lat},${location.longitude}&hl=es;z=14&output=embed`}
                                allowFullScreen
                            ></iframe>

                            <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Live Intelligence Layer</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div><span className="text-[10px] font-bold">Water</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div><span className="text-[10px] font-bold">Fuel</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div><span className="text-[10px] font-bold">Shelter</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyView;
