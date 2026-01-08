import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useNavigate, useLocation } from 'react-router-dom';

// ERROR WAS HERE: You might be missing 'export default'
export default function CreateGoal() {  
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '', 
    linkedLifeGoal: ''
  });

  const [lifeGoals, setLifeGoals] = useState([]);
  
  // 1. Handle Data passed from AI
  useEffect(() => {
    if (location.state) {
      setFormData(prev => ({
        ...prev,
        title: location.state.title || '',
        description: location.state.description || '',
        targetDate: '', 
        linkedLifeGoal: location.state.linkedLifeGoal || ''
      }));
    }
  }, [location.state]);

  // 2. Fetch Life Goals
  useEffect(() => {
    const fetchLifeGoals = async () => {
      try {
        const res = await client.get('/life-goals');
        setLifeGoals(res.data.lifeGoals || []);
      } catch (err) { console.error(err); }
    };
    fetchLifeGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('/goals', formData);
      navigate('/dashboard');
    } catch (err) {
      console.error("Create Goal Error:", err.response?.data);
      alert("Failed: " + (err.response?.data?.message || "Check console"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-2xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-6">Set a New Goal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Linked Life Goal */}
          <div>
            <label className="block text-gray-400 mb-1">Link to Life Ambition</label>
            <select
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white"
              value={formData.linkedLifeGoal}
              onChange={(e) => setFormData({ ...formData, linkedLifeGoal: e.target.value })}
            >
              <option value="">Standalone Goal</option>
              {lifeGoals.map((lg) => (
                <option key={lg._id} value={lg._id}>{lg.category}: {lg.title}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-400 mb-1">Goal Title</label>
            <input
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 h-32"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-gray-400 mb-1">Target Date</label>
            <input
              type="date"
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
              value={formData.targetDate} 
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold">Generate Roadmap</button>
            <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-3 border border-gray-600 rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}