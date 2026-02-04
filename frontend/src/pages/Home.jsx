import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { uploadImage } from '../api';

const Home = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [source, setSource] = useState('citizen');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState(null);
    const [locating, setLocating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Initiating Analysis...");

    React.useEffect(() => {
        let interval;
        if (loading) {
            const messages = [
                "Server waking up (Render Free Tier can take ~1mins)...",
                "Scanning Spectral Imagery...",
                "Running Damage Assessment...",
                "Running Tactical Heuristics...",
                "Optimizing For Low Bandwidth Intelligence...",
                "Finalizing Intelligence Report..."
            ];

            // Start with technical initialization and warning
            setLoadingMessage("Server waking up (Render Free Tier can take ~1mins)...");

            let i = 1; // Start from second message in cycle
            interval = setInterval(() => {
                setLoadingMessage(messages[i]);
                i = (i + 1) % messages.length;
            }, 4000); // Slightly slower rotation for readability

            return () => {
                if (interval) clearInterval(interval);
            };
        }
    }, [loading]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ latitude, longitude });
                setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`); // Auto-fill text for visibility
                setLocating(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Unable to retrieve your location. Please enter it manually.");
                setLocating(false);
            }
        );
    };

    const resizeImage = (file, maxWidth = 1024, maxHeight = 1024) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    }, 'image/jpeg', 0.85); // 85% quality is a good balance
                };
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);

        // Resize image before upload to speed up transmission
        setLoadingMessage("Optimizing Image for Transmission...");
        const optimizedFile = await resizeImage(file);

        const formData = new FormData();
        formData.append('file', optimizedFile);
        formData.append('source', source);
        formData.append('location', location || 'Unknown Location');

        // GEOCODING LOGIC
        let finalLat = (34.05 + Math.random() * 0.1);
        let finalLong = (-118.25 + Math.random() * 0.1);

        if (coords) {
            // Priority 1: Use GPS if available
            finalLat = coords.latitude;
            finalLong = coords.longitude;
        } else if (location) {
            // Priority 2: Geocode the text location
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`);
                const data = await response.json();
                if (data && data.length > 0) {
                    finalLat = parseFloat(data[0].lat);
                    finalLong = parseFloat(data[0].lon);
                }
            } catch (err) {
                console.warn("Geocoding failed, using fallback coords", err);
            }
        }

        formData.append('latitude', finalLat.toString());
        formData.append('longitude', finalLong.toString());

        try {
            await uploadImage(formData);
            navigate('/dashboard');
        } catch (error) {
            console.error("Upload failed", error);
            const msg = error.response?.data?.detail || error.message;
            alert(`Upload failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-transparent relative overflow-hidden flex flex-col justify-center py-12">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 pointer-events-none mix-blend-screen"></div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
                        AI Powered Response System
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
                        Real Time AI for <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white filter drop-shadow-lg">Disaster Damage Detection</span>
                    </h1>
                    <p className="mt-6 text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md shadow-black">
                        Instantly analyze satellite or user submitted imagery to detect critical infrastructure damage and prioritize rescue efforts.
                    </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative ring-1 ring-white/5">
                    {/* Decorative shimmer */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-70"></div>

                    <div className="p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Image Upload Area */}
                            <div className="group relative">
                                <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 relative overflow-hidden
                                    ${preview ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 hover:border-violet-500/50 hover:bg-slate-800/50 cursor-pointer'}
                                `}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />

                                    {preview ? (
                                        <div className="relative h-72 w-full group-hover:scale-[1.01] transition-transform duration-500">
                                            <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-xl shadow-lg shadow-black/50" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm z-10">
                                                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white font-medium flex items-center hover:bg-white/20 transition-colors shadow-lg">
                                                    <UploadCloud className="h-4 w-4 mr-2" /> Change Image
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-6">
                                            <div className="bg-slate-800/80 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl border border-slate-700 shadow-violet-900/20">
                                                <UploadCloud className="h-10 w-10 text-violet-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white tracking-tight">Upload Situational Imagery</h3>
                                            <p className="mt-3 text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">Drag and drop or click to select satellite, drone, or ground-level photos.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-violet-200 ml-1 uppercase tracking-wider text-[11px] opacity-80">Data Source</label>
                                    <div className="relative">
                                        <select
                                            value={source}
                                            onChange={(e) => setSource(e.target.value)}
                                            className="w-full pl-4 pr-10 py-4 bg-slate-950/80 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all appearance-none font-bold text-white shadow-inner"
                                        >
                                            <option value="citizen">Citizen Reporter</option>
                                            <option value="drone">Drone Surveillance</option>
                                            <option value="satellite">Satellite Imagery</option>
                                            <option value="cctv">CCTV Feed</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-violet-400">
                                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-violet-200 ml-1 uppercase tracking-wider text-[11px] opacity-80">Location Details</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="e.g. Downtown Sector 4"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full pl-4 pr-32 py-4 bg-slate-950/80 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all font-bold text-white placeholder-slate-500 shadow-inner"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={locating}
                                            className="absolute right-2 top-2 bottom-2 bg-slate-800 hover:bg-slate-700 text-violet-400 text-xs font-bold px-3 rounded-lg border border-slate-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : "📍 My Location"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!file || loading}
                                className={`w-full group relative flex items-center justify-center px-8 py-5 rounded-xl text-white font-black text-lg tracking-wide transition-all duration-300 overflow-hidden shadow-2xl
                                    ${!file || loading ? 'bg-slate-800 cursor-not-allowed text-slate-500 border border-slate-700' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-violet-500/40 hover:-translate-y-1 border border-violet-500/50'}
                                `}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <div className="relative flex items-center">
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                            {loadingMessage}
                                        </>
                                    ) : (
                                        <>
                                            Iniate AI Analysis <CheckCircle className="ml-2 h-5 w-5 opacity-90" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
