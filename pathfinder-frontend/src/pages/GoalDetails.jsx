import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client, { deleteGoal } from '../api/client';

export default function GoalDetails() {
  const { id } = useParams();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        setLoading(true);
        // Try specific endpoint first, fallback to list search
        try {
          const res = await client.get(`/goals/${id}`);
          setGoal(res.data.goal);
        } catch (innerErr) {
          const res = await client.get('/goals');
          const foundGoal = res.data.goals.find(g => g._id === id);
          if (foundGoal) setGoal(foundGoal);
          else throw new Error("Goal not found");
        }
      } catch (err) {
        console.error("Error loading goal:", err);
        setError("Failed to load roadmap details.");
      } finally {
        setLoading(false);
      }
    };
    fetchGoal();
  }, [id]);

  // --- NEW: Toggle Completion Status ---
  const toggleStep = async (index) => {
    const newSteps = [...goal.steps];
    // Flip the status
    newSteps[index].completed = !newSteps[index].completed;
    
    // 1. Optimistic Update (Update UI immediately)
    setGoal({ ...goal, steps: newSteps });

    // 2. Save to Backend
    try {
      await client.patch(`/goals/${id}`, { steps: newSteps });
    } catch (err) {
      console.error("Failed to save progress:", err);
      alert("Failed to save progress. Please try again.");
      // Revert if failed
      newSteps[index].completed = !newSteps[index].completed;
      setGoal({ ...goal, steps: newSteps });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this roadmap?")) return;
    try {
      await deleteGoal(id);
      navigate('/dashboard');
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-400 font-mono tracking-widest uppercase animate-pulse">
      Loading Roadmap...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="text-center bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
        <p className="text-red-400 mb-4 font-medium">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-all font-bold">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  // Calculate Progress
  const completedCount = goal?.steps?.filter(s => s.completed).length || 0;
  const totalCount = goal?.steps?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 font-medium">
            <span>←</span> Back to Dashboard
          </button>
          <button onClick={handleDelete} className="text-red-500/50 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-all border border-red-500/20 hover:border-red-500 px-3 py-1 rounded">
            Delete Roadmap
          </button>
        </div>

        {/* TITLE & PROGRESS BAR */}
        <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white">{goal?.title}</h1>
                <div className="text-right hidden md:block">
                    <div className="text-2xl font-mono text-blue-400">{progressPercent}%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Complete</div>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-6">
                <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>

            <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">{goal?.description}</p>
        </div>

        {/* MENTOR STRATEGY */}
        {goal?.mentor_intro && (
          <div className="relative overflow-hidden bg-blue-600/5 border border-blue-500/20 p-8 rounded-3xl mb-16 shadow-2xl backdrop-blur-md">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl italic font-serif text-blue-400">"</div>
            <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">The Mentor's Strategy</h4>
            <p className="text-blue-100/80 leading-relaxed italic text-lg font-serif">
              {goal.mentor_intro}
            </p>
          </div>
        )}

        {/* TIMELINE STEPS */}
        <div className="relative space-y-8 before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-gradient-to-b before:from-blue-500 before:via-gray-800 before:to-transparent">
          {goal?.steps?.map((step, index) => (
            <div key={step._id || index} className={`relative flex items-start group ${step.completed ? 'opacity-60' : 'opacity-100'}`}>
              
              {/* CHECKBOX CIRCLE */}
              <button 
                onClick={() => toggleStep(index)}
                className={`absolute left-0 flex items-center justify-center w-12 h-12 rounded-full border-2 z-10 transition-all duration-300 shadow-xl
                    ${step.completed 
                        ? 'bg-blue-500 border-blue-500 text-white scale-110' 
                        : 'bg-gray-900 border-gray-700 text-transparent hover:border-blue-400'
                    }`}
              >
                {step.completed ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <span className="text-gray-600 font-bold text-sm">{index + 1}</span>
                )}
              </button>

              {/* CONTENT CARD */}
              <div 
                className={`ml-20 w-full rounded-3xl p-8 border transition-all duration-300
                    ${step.completed 
                        ? 'bg-gray-800/20 border-gray-800 grayscale-[50%]' 
                        : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 shadow-xl'
                    }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <h3 className={`text-2xl font-bold transition-colors ${step.completed ? 'text-gray-500 line-through decoration-blue-500/50' : 'text-white'}`}>
                    {step.title}
                  </h3>
                  <span className="shrink-0 px-3 py-1 bg-gray-900 text-gray-400 text-[10px] font-mono border border-gray-700 rounded-lg h-fit uppercase tracking-wider">
                    {step.duration || 'Flexible'}
                  </span>
                </div>

                <p className="text-gray-300 leading-relaxed mb-8 whitespace-pre-line text-sm md:text-base border-l-2 border-gray-700 pl-4">
                  {step.description}
                </p>

                {/* RESOURCES & CONCEPTS (Hide if completed to reduce clutter, or keep visible) */}
                <div className={`grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-700/30 ${step.completed ? 'opacity-50' : ''}`}>
                  <div>
                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Resources</h5>
                    <ul className="space-y-3">
                      {step.resources?.length > 0 ? step.resources.map((res, i) => (
                        <li key={i} className="text-xs text-blue-400 flex items-start gap-2">
                          <span className="mt-1.5 w-1 h-1 bg-blue-500 rounded-full"></span> 
                          <span>{res}</span>
                        </li>
                      )) : <li className="text-xs text-gray-600 italic">No resources</li>}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Concepts</h5>
                    <div className="flex flex-wrap gap-2">
                      {step.key_concepts?.length > 0 ? step.key_concepts.map((concept, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-300 text-[10px] font-bold border border-blue-500/20 rounded uppercase">
                          {concept}
                        </span>
                      )) : <span className="text-xs text-gray-600 italic">General</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FINAL ADVICE */}
        {goal?.final_advice && (
          <div className="mt-24 mb-12 p-12 text-center border-t border-gray-800">
            <h2 className="text-2xl md:text-3xl font-serif italic text-gray-500 leading-relaxed max-w-3xl mx-auto">
              "{goal.final_advice}"
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}