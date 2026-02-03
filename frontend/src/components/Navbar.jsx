import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Map as MapIcon, UploadCloud, BarChart3 } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-black/20 backdrop-blur-lg border-b border-white/5 sticky top-0 z-50 shadow-lg transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <div className="h-10 w-10 bg-gradient-to-br from-crisis-accent to-crisis-cyan rounded-xl flex items-center justify-center shadow-lg shadow-crisis-accent/20 group-hover:shadow-crisis-accent/40 transition-all duration-300">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <span className="ml-3 text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">ResQNet</span>
                        </Link>
                        <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                            <NavLink to="/" icon={<UploadCloud className="w-4 h-4 mr-1.5" />} label="Analyze" />
                            <NavLink to="/dashboard" icon={<BarChart3 className="w-4 h-4 mr-1.5" />} label="Dashboard" />
                            <NavLink to="/map" icon={<MapIcon className="w-4 h-4 mr-1.5" />} label="Live Map" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label }) => (
    <Link
        to={to}
        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-crisis-textsec hover:text-crisis-accent hover:border-b-2 hover:border-crisis-accent transition-all duration-200"
    >
        {icon}
        {label}
    </Link>
);

export default Navbar;
