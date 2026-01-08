import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-slate-1000/50  backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          PathFinder
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link to="/dashboard" className="text-slate-300 hover:text-white transition">Dashboard</Link>
          <Link to="/life-goals" className="text-slate-300 hover:text-white transition">Life Goals</Link>
          <Link to="/profile-setup" className="text-slate-300 hover:text-white transition">My Profile</Link>
          <Link to="/ask-pathfinder" className="text-gray-300 hover:text-white transition-colors">Ask Pathfinder</Link>
          
          <button 
            onClick={handleLogout}
            className="ml-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;