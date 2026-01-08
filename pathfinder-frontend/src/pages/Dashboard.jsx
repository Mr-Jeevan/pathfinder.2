import React, { useEffect, useState } from 'react';
import client, { deleteGoal } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [lifeGoals, setLifeGoals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Phase 2 States
  const [pathData, setPathData] = useState(null);
  const [pathLoading, setPathLoading] = useState(true);
  const [pathError, setPathError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchPathSuggestions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [goalsRes, lifeGoalsRes, profileRes] = await Promise.allSettled([
        client.get('/goals'),
        client.get('/life-goals'),
        client.get('/profile')
      ]);

      if (goalsRes.status === 'fulfilled') {
        setGoals(goalsRes.value.data.goals || []); 
      }
      
      if (lifeGoalsRes.status === 'fulfilled') {
        setLifeGoals(lifeGoalsRes.value.data.lifeGoals || []);
      }
      
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data.profile);
      }
      
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      setError("Failed to sync your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPathSuggestions = async () => {
    try {
      setPathLoading(true);
      const res = await client.get('/path/recommend');
      setPathData(res.data);
    } catch (err) {
      setPathError("Could not load AI recommendations.");
    } finally {
      setPathLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      await deleteGoal(id);
      setGoals(goals.filter(g => g._id !== id));
    } catch (err) {
      alert("Failed to delete goal.");
    }
  };

  // --- AI Suggestions Widget ---
  const renderPathWidget = () => {
    if (pathLoading) return (
      <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl animate-pulse h-40 mb-12">
        <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
      </div>
    );

    if (pathError) return null;

    if (!pathData?.profileExists || pathData?.lifeGoalsCount === 0) {
      return (
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 p-6 rounded-2xl mb-12">
          <h3 className="text-xl font-bold text-amber-400 mb-2">PathFinder needs more info</h3>
          <p className="text-gray-400 text-sm mb-4">{pathData?.message}</p>
          <div className="flex gap-4">
            {!pathData?.profileExists && (
              <button onClick={() => navigate('/profile-setup')} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold transition-all">Complete Profile</button>
            )}
            {pathData?.lifeGoalsCount === 0 && (
              <button onClick={() => navigate('/life-goals')} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold transition-all">Set Life Goals</button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-800/60 backdrop-blur-xl border border-blue-500/20 p-8 rounded-3xl mb-12 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-white">PathFinder Suggestions</h3>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">Current Focus: {pathData.focusArea}</p>
          </div>
          <span className="bg-blue-500/10 text-blue-400 text-[10px] px-3 py-1 rounded-full border border-blue-500/20 font-black">AI POWERED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {pathData.recommendedGoals.map((rec, idx) => (
            <div key={idx} className="bg-gray-800/50 border border-gray-700 p-5 rounded-2xl hover:border-blue-500/50 transition-all group">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded uppercase">
                {rec.reasonTag.replace(/_/g, ' ')}
              </span>
              <h4 className="font-bold text-white mt-3 mb-2">{rec.title}</h4>
              <p className="text-gray-400 text-xs line-clamp-2 mb-4">{rec.description}</p>
              <button 
                onClick={() => navigate('/create-goal', { 
                  state: { 
                    title: rec.title, 
                    description: rec.description, 
                    linkedLifeGoal: rec.suggestedLinkedLifeGoalId 
                  } 
                })}
                className="text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors"
              >
                + Initialize Goal
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700/50 pt-6">
          <p className="text-gray-400 text-sm italic leading-relaxed">
            <span className="text-blue-400 font-bold not-italic">Mentor Note: </span> 
            "{pathData.rationale}"
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-6xl mx-auto p-6">
        
        {/* Profile Banner */}
        {!loading && (
          <div className="mb-8">
            {!profile ? (
              <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-2xl flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2 rounded-lg text-amber-500">💡</div>
                  <div>
                    <h4 className="text-amber-200 font-bold text-sm">Personalize your AI roadmaps</h4>
                    <p className="text-amber-200/60 text-xs">Complete your profile to get paths aligned with your strengths.</p>
                  </div>
                </div>
                <Link to="/profile-setup" className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl font-bold text-xs transition-all">
                  Setup Profile
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/10 w-fit px-4 py-1.5 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">AI Profile Optimized</span>
              </div>
            )}
          </div>
        )}

        {renderPathWidget()}

        {/* Life Goals Section */}
        {!loading && lifeGoals.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Your Life Ambitions</h3>
              <Link to="/life-goals" className="text-xs text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {lifeGoals.map((lg) => (
                <div key={lg._id} className="min-w-[280px] bg-gray-800/40 border border-gray-700/50 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase">{lg.category}</span>
                  <h4 className="font-bold mt-2 truncate">{lg.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{lg.horizonYears} Year Horizon</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Roadmap List */}
        <div className="flex justify-between items-center mb-8 border-t border-gray-800 pt-8">
          <h2 className="text-3xl font-bold text-white">My Roadmaps</h2>
          <button onClick={() => navigate('/create-goal')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all">
            + New Goal
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse font-mono uppercase tracking-widest text-xs">Syncing with AI Core...</div>
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              // --- DYNAMIC PROGRESS CALCULATION ---
              const completedSteps = goal.steps?.filter(s => s.completed).length || 0;
              const totalSteps = goal.steps?.length || 0;
              const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
              
              return (
                <div
                  key={goal._id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all cursor-pointer group relative flex flex-col justify-between"
                  onClick={() => navigate(`/goal/${goal._id}`)}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                        {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No Date'}
                      </span>
                      <span className={`px-2 py-1 text-[10px] rounded border uppercase font-bold
                          ${progressPercent === 100 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                      >
                        {progressPercent === 100 ? "Complete" : goal.status}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors line-clamp-1">{goal.title}</h3>
                    
                    {/* DYNAMIC PROGRESS BAR */}
                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tighter">
                           <span>{totalSteps} Steps</span>
                           <span className={progressPercent === 100 ? "text-emerald-400" : "text-blue-400"}>
                             {progressPercent}%
                           </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-700 ease-out ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm line-clamp-2 mb-8">{goal.description}</p>
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-blue-400 text-sm font-medium group-hover:underline">View Roadmap →</span>
                    <button
                      onClick={(e) => handleDelete(e, goal._id)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1 rounded-lg transition-all text-xs border border-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-2xl p-20 text-center">
            <p className="text-gray-400 mb-4 text-lg">No tactical goals yet. Click 'New Goal' to start your first roadmap.</p>
          </div>
        )}
      </main>
    </div>
  );
}