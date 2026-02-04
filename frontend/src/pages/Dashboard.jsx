import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReports } from '../api';
import { AlertCircle, CheckCircle, MapPin, ShieldAlert, Activity, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const Dashboard = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const data = await getReports();
            setReports(data);
        } catch (error) {
            console.error("Failed to load reports", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading Mission Critical Intelligence...</div>;

    const criticalzones = reports
        .filter(r => r.priority_score > 60)
        .sort((a, b) => b.priority_score - a.priority_score);

    const visibleZones = criticalzones.slice(startIndex, startIndex + 3);

    const handleNext = () => {
        if (startIndex + 3 < criticalzones.length) {
            setStartIndex(startIndex + 3);
        }
    };

    const handlePrev = () => {
        if (startIndex - 3 >= 0) {
            setStartIndex(startIndex - 3);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Priority Engine Header */}
            <div className="mb-6 bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center">
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm mr-4 border border-white/10">
                            <Activity className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white">Response Priority Engine</h2>
                            <p className="text-slate-400 text-sm mt-1">Real-time situational awareness & damage assessment</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-4">
                            <button
                                onClick={handlePrev}
                                disabled={startIndex === 0}
                                className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={startIndex + 3 >= criticalzones.length}
                                className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center animate-pulse">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Live Feed
                        </span>
                    </div>
                </div>

                <div className="relative z-10 min-h-[220px]">
                    {criticalzones.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                            {visibleZones.map((zone, idx) => (
                                <Link key={zone.id} to={`/mission/${zone.id}`} className="group block transition-all duration-300 hover:transform hover:-translate-y-1">
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-red-500/50 hover:bg-slate-800 transition-all h-full group-hover:shadow-2xl group-hover:shadow-red-900/20">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500 font-bold mr-3 border border-red-500/20">
                                                    #{startIndex + idx + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-white group-hover:text-red-400 transition-colors">{zone.location_name || "Unknown Zone"}</h3>
                                                    <div className="flex items-center mt-0.5">
                                                        <div className="h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden mr-2">
                                                            <div className="h-full bg-gradient-to-r from-red-600 to-orange-500" style={{ width: `${zone.priority_score}%` }}></div>
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-medium">{zone.priority_score}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {zone.severity === "Critical" && <ShieldAlert className="text-red-500 h-5 w-5 animate-pulse" />}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {zone.damage_types.slice(0, 3).map(dt => (
                                                    <span key={dt} className="text-[10px] uppercase font-bold text-slate-300 bg-slate-700/50 px-2 py-1 rounded border border-slate-600">
                                                        {dt.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                                                <span>Click for mission details</span>
                                                <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-red-400 transform group-hover:translate-x-1 transition-transform" />
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
                            <Activity className="h-10 w-10 text-slate-600 mx-auto mb-3 opacity-50" />
                            <p className="text-slate-400 italic">No critical zones currently detected. System monitoring...</p>
                        </div>
                    )}
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Activity className="h-6 w-6 mr-2 text-violet-500" />
                Recent Intelligence Reports
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {reports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                ))}
            </div>
        </div>
    );
};

const ReportCard = ({ report }) => {
    const isCritical = report.severity === "Critical";
    const isMedium = report.severity === "Medium";

    const badgeColor = isCritical ? "bg-red-100 text-red-800 border-red-200" :
        isMedium ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
            "bg-green-100 text-green-800 border-green-200";

    return (
        <Link to={`/mission/${report.id}`} className="block h-full group transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-xl">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-slate-700/50 flex flex-col md:flex-row h-full group-hover:border-violet-500/50 transition-colors">
                <div className="md:w-2/5 h-48 md:h-auto bg-slate-800 relative">
                    <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${report.image_path}`}
                        alt="Disaster Scene"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-white/10">
                        {report.image_source}
                    </div>
                </div>

                <div className="p-4 md:w-3/5 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className={clsx("px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider", badgeColor)}>
                                {report.severity}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{new Date(report.timestamp).toLocaleDateString()}</span>
                        </div>

                        <h3 className="font-bold text-slate-100 mb-1 flex items-center text-lg group-hover:text-violet-400 transition-colors">
                            <MapPin className="h-4 w-4 mr-2 text-violet-500" />
                            {report.location_name || "Unknown Location"}
                        </h3>

                        <div className="space-y-4 mt-4">
                            {/* AI Reasoning Summary */}
                            {report.summary && (
                                <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1 flex items-center">
                                        <Activity className="h-3 w-3 mr-1" /> AI Real-time Reasoning
                                    </p>
                                    <p className="text-sm text-slate-200 font-medium italic">"{report.summary}"</p>
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Damage Detected</p>
                                {report.damage_detected ? (
                                    <div className="flex flex-wrap gap-2">
                                        {report.damage_types.map(dt => (
                                            <span key={dt} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 capitalize">
                                                {dt.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="flex items-center text-xs text-emerald-400 font-medium mt-1">
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> No visible damage
                                    </span>
                                )}
                            </div>

                            {isCritical && (
                                <div className="bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 mt-2">
                                    <p className="text-xs text-red-400 font-bold flex items-center">
                                        <ShieldAlert className="h-3.5 w-3.5 mr-2" />
                                        Immediate Response
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                        <div className="text-xs text-slate-500">
                            Confidence: <span className="font-mono text-slate-300">{(report.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-lg font-black text-white group-hover:text-violet-300 transition-colors">
                            <span className="text-[10px] font-bold text-slate-500 mr-2 uppercase tracking-wider">Priority</span>
                            {report.priority_score}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default Dashboard;
