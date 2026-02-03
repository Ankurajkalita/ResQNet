import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReports } from '../api';
import {
    ArrowLeft, MapPin, Calendar, ShieldAlert, Activity,
    Truck, Package, Briefcase, Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const MissionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('logistics');
    const [currentPhase, setCurrentPhase] = useState(0);

    const handleNextPhase = () => {
        if (currentPhase < (report?.suggested_actions?.length || 0) - 1) {
            setCurrentPhase(curr => curr + 1);
        } else {
            setCurrentPhase(0); // Reset stack
        }
    };

    const handlePrevPhase = (e) => {
        e.stopPropagation();
        if (currentPhase > 0) {
            setCurrentPhase(curr => curr - 1);
        }
    };

    useEffect(() => {
        getReports().then(data => {
            const found = data.find(r => r.id === parseInt(id));
            setReport(found);
            setLoading(false);
        });
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
    );
    if (!report) return <div className="p-12 text-center text-red-400 font-bold">Mission Report Not Found</div>;

    const isCritical = report.severity === "Critical";

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <button
                onClick={() => navigate('/dashboard')}
                className="group flex items-center text-slate-400 hover:text-white mb-6 transition-colors font-medium"
            >
                <div className="p-1 rounded-full bg-slate-800 group-hover:bg-violet-600 mr-3 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Visual Intelligence (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Image Card */}
                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5 group">
                        <div className="relative h-64 overflow-hidden">
                            <img
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${report.image_path}`}
                                alt="Disaster Scene"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg backdrop-blur-md ${isCritical ? "bg-red-500/20 text-red-200 border-red-500/50" : "bg-yellow-500/20 text-yellow-200 border-yellow-500/50"
                                }`}>
                                {report.severity}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <h2 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{report.location_name || "Unknown Sector"}</h2>
                                <div className="flex items-center mt-2 text-slate-300 text-xs font-medium bg-black/40 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                                    <MapPin className="h-3 w-3 mr-1 text-violet-400" />
                                    {report.latitude && report.longitude ? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}` : "Coordinates Pending"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compact Map */}
                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-lg h-48 relative group">
                        {report.latitude && report.longitude ? (
                            <MapContainer center={[report.latitude, report.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[report.latitude, report.longitude]} />
                            </MapContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">Targeting System Offline</div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur text-[10px] px-2 py-1 rounded text-slate-400 border border-white/5">
                            Live Satellite Feed
                        </div>
                    </div>
                </div>

                {/* Right Column: Tactical Data (8 cols) */}
                <div className="lg:col-span-8 flex flex-col h-full">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-white tracking-tight">Mission #{report.id}</h1>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wider">Active</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-slate-400">Time: <span className="text-slate-200">{new Date(report.timestamp).toLocaleTimeString()}</span></span>
                                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                <span className="text-slate-400">Date: <span className="text-slate-200">{new Date(report.timestamp).toLocaleDateString()}</span></span>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Priority Index</div>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 filter drop-shadow-lg">
                                {report.priority_score}<span className="text-lg text-slate-600 font-medium">/100</span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Tabs */}
                    <div className="flex-1 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                        {/* Tab Headers */}
                        <div className="flex border-b border-white/5 px-6 pt-6 gap-8">
                            <button
                                onClick={() => setActiveTab('logistics')}
                                className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'logistics' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                Logistics & Supply
                                {activeTab === 'logistics' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>}
                            </button>
                            <button
                                onClick={() => setActiveTab('strategy')}
                                className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'strategy' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                Tactical Response
                                {activeTab === 'strategy' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>}
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">

                            {/* LOGISTICS TAB */}
                            {activeTab === 'logistics' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Equipment Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                            <Truck className="w-4 h-4 mr-2" /> Heavy Equipment
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {report.required_resources && report.required_resources.length > 0 ? (
                                                report.required_resources.map((item, i) => (
                                                    <div key={i} className="group flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-violet-900/20 border border-white/5 hover:border-violet-500/30 rounded-xl transition-all cursor-default">
                                                        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-violet-600/20 group-hover:text-violet-300 transition-colors text-slate-400">
                                                            <Zap className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-slate-200 text-sm">{item}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-slate-500 text-sm italic py-2">No heavy machinery required.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                                    {/* Supplies Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                            <Package className="w-4 h-4 mr-2" /> Critical Supplies
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {report.suggested_supplies && report.suggested_supplies.length > 0 ? (
                                                report.suggested_supplies.map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border border-white/5 rounded-xl">
                                                        <span className="text-slate-300 text-sm font-medium">{item}</span>
                                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-slate-500 text-sm italic">Standard loadout only.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STRATEGY TAB - STACKED CARDS */}
                            {activeTab === 'strategy' && (
                                <div className="h-full flex flex-col items-center justify-start pt-10 relative perspective-1000 min-h-[400px]">
                                    {report.suggested_actions && report.suggested_actions.length > 0 ? (
                                        <div className="relative w-full max-w-md h-64">
                                            {report.suggested_actions.map((action, i) => {
                                                // Calculate stack position logic
                                                const isActive = i === currentPhase;
                                                const isPast = i < currentPhase;
                                                const isFuture = i > currentPhase;
                                                const offsetIndex = i - currentPhase;

                                                // Style for stacked look
                                                let style = {};
                                                if (isActive) {
                                                    style = { zIndex: 10, transform: 'scale(1) translateY(0)', opacity: 1 };
                                                } else if (isPast) {
                                                    style = { zIndex: 0, transform: 'scale(0.9) translateX(-150%) rotate(-10deg)', opacity: 0 };
                                                } else if (isFuture) {
                                                    style = {
                                                        zIndex: 10 - offsetIndex,
                                                        transform: `scale(${1 - (offsetIndex * 0.05)}) translateY(${offsetIndex * 15}px)`,
                                                        opacity: 1 - (offsetIndex * 0.2)
                                                    };
                                                }

                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={handleNextPhase}
                                                        className={`absolute inset-0 bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col justify-center transition-all duration-500 ease-out cursor-pointer hover:border-cyan-500/40 group
                                                            ${isActive ? 'shadow-[0_0_30px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/20' : ''}
                                                        `}
                                                        style={style}
                                                    >
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold shadow-lg 
                                                                ${isActive ? 'bg-cyan-500 text-white shadow-cyan-500/40' : 'bg-slate-700 text-slate-400'}
                                                            `}>
                                                                {i + 1}
                                                            </div>
                                                            <h4 className={`text-lg font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                                                Phase 0{i + 1}
                                                            </h4>
                                                        </div>
                                                        <p className={`text-lg leading-relaxed font-medium transition-colors ${isActive ? 'text-cyan-100' : 'text-slate-500'}`}>
                                                            {action}
                                                        </p>

                                                        {isActive && (
                                                            <div className="flex justify-between items-center absolute bottom-6 left-6 right-6">
                                                                {currentPhase > 0 ? (
                                                                    <div
                                                                        onClick={handlePrevPhase}
                                                                        className="text-xs text-slate-500 hover:text-cyan-300 font-bold uppercase tracking-widest cursor-pointer flex items-center transition-colors z-20"
                                                                    >
                                                                        <span className="mr-2 text-lg">←</span> Previous
                                                                    </div>
                                                                ) : <div></div>}

                                                                <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest animate-pulse flex items-center">
                                                                    Next <div className="ml-2 w-4 h-0.5 bg-cyan-400"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Restart Button if finished */}
                                            {currentPhase === report.suggested_actions.length - 1 && (
                                                <div
                                                    onClick={handleNextPhase}
                                                    className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-slate-500 hover:text-white text-sm cursor-pointer transition-colors flex items-center mt-4"
                                                >
                                                    <Activity className="w-4 h-4 mr-2" /> Reset Protocol
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 italic p-4 text-center">
                                            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                            Awaiting tactical analysis generation...
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MissionDetails;
