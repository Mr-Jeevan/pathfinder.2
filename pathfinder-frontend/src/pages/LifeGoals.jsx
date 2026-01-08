import React, { useState, useEffect } from 'react';
import client from '../api/client'; // Use your configured axios instance
import { useNavigate } from 'react-router-dom';

const LifeGoals = () => {
  // Ensure state is initialized as an empty array
  const [lifeGoals, setLifeGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    description: '', 
    horizonYears: 5, 
    priority: 'medium', 
    category: 'career' 
  });

  const fetchLifeGoals = async () => {
    try {
      setLoading(true);
      const res = await client.get('/life-goals');
      // Use optional chaining to safely access data
      setLifeGoals(res.data?.lifeGoals || []); 
    } catch (err) {
      console.error("Error fetching life goals:", err);
      setLifeGoals([]); // Reset to empty array on failure to prevent crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchLifeGoals(); 
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await client.post('/life-goals', newGoal);
      setIsModalOpen(false);
      // Reset form state
      setNewGoal({ title: '', description: '', horizonYears: 5, priority: 'medium', category: 'career' });
      fetchLifeGoals();
    } catch (err) {
      alert("Failed to create life goal. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this life ambition?")) {
      try {
        await client.delete(`/life-goals/${id}`);
        fetchLifeGoals();
      } catch (err) {
        alert("Failed to delete goal.");
      }
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black">Long-Term Ambitions</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest">Phase 1: Life Architecture</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          + Add Life Goal
        </button>
      </div>

      {/* Main Grid with Defensive Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 animate-pulse text-slate-500 uppercase tracking-widest">
            Syncing ambitions...
          </div>
        ) : lifeGoals?.length > 0 ? (
          lifeGoals.map((goal) => (
            <div 
              key={goal._id} 
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-blue-500/50 transition-all shadow-xl"
            >
              <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded mb-4 inline-block">
                {goal.category}
              </span>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                {goal.title}
              </h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                {goal.description}
              </p>
              <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                <span>{goal.horizonYears} Year Horizon</span>
                <span className={`px-2 py-1 rounded uppercase font-bold ${
                  goal.priority === 'high' ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'
                }`}>
                  {goal.priority}
                </span>
              </div>
              <button 
                onClick={() => handleDelete(goal._id)} 
                className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500 text-lg">No life ambitions set yet.</p>
            <p className="text-slate-600 text-sm">Click "+ Add Life Goal" to define your long-term path.</p>
          </div>
        )}
      </div>

      {/* Modal for Creating New Goals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleCreate} 
            className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full space-y-4 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-2">New Life Goal</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Ambition Title</label>
              <input 
                type="text" 
                placeholder="e.g., Become a Senior Software Engineer" 
                required 
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500" 
                onChange={e => setNewGoal({...newGoal, title: e.target.value})} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Context / Vision</label>
              <textarea 
                placeholder="Describe your 10-year vision..." 
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg h-24 outline-none focus:border-blue-500" 
                onChange={e => setNewGoal({...newGoal, description: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500" 
                  onChange={e => setNewGoal({...newGoal, category: e.target.value})}
                >
                  <option value="career">Career</option>
                  <option value="learning">Learning</option>
                  <option value="finance">Finance</option>
                  <option value="health">Health</option>
                  <option value="personal-growth">Personal Growth</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Horizon (Yrs)</label>
                <input 
                  type="number" 
                  defaultValue={5}
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500" 
                  onChange={e => setNewGoal({...newGoal, horizonYears: e.target.value})} 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <button type="submit" className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors">
                Launch Life Goal
              </button>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="w-full text-slate-500 text-sm hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LifeGoals;