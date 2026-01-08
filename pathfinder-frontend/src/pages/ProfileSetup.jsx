import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const ProfileSetup = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // UNIVERSAL State Structure
  const [formData, setFormData] = useState({
    // Identity
    ageRange: '18-25',
    educationLevel: 'high-school',
    currentRole: '',
    
    // The Dream
    targetCareer: '',       // e.g. "Neurosurgeon", "Chef", "Full Stack Dev"
    experienceLevel: 'beginner',

    // DNA (Unbiased Preferences)
    workStyle: [],          // e.g. ["Team", "Indoors"]
    personalityType: '',    // e.g. "Analytical", "Creative"
    
    // Deep Analysis
    interests: '',        
    strengths: '',        
    weaknesses: '',       
    values: [],           
    
    // Logistics
    constraints: { timePerDay: 2, budgetPerMonth: 0, locationPreference: 'any' }
  });

  // UNBIASED LISTS (Applicable to Doctors, Artists, Engineers, etc.)
  const workStylesList = [
    { id: 'team', label: 'Team Collaboration 👥' },
    { id: 'solo', label: 'Independent Work 👤' },
    { id: 'field', label: 'On the Field/Active 🏃' },
    { id: 'desk', label: 'Desk/Office Based 💻' },
    { id: 'logic', label: 'Logic & Systems ⚙️' },
    { id: 'art', label: 'Visual & Creative 🎨' },
    { id: 'people', label: 'Helping People 🤝' },
    { id: 'data', label: 'Analyzing Data 📊' }
  ];

  const valuesList = ['Stability', 'High Income', 'Creativity', 'Social Impact', 'Work-Life Balance', 'Prestige', 'Autonomy'];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // --- 1. DATA SAVING LOGIC ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        // Convert Strings back to Arrays for Backend
        interests: typeof formData.interests === 'string' ? formData.interests.split(',').map(s => s.trim()).filter(Boolean) : formData.interests,
        strengths: typeof formData.strengths === 'string' ? formData.strengths.split(',').map(s => s.trim()).filter(Boolean) : formData.strengths,
        weaknesses: typeof formData.weaknesses === 'string' ? formData.weaknesses.split(',').map(s => s.trim()).filter(Boolean) : formData.weaknesses,
      };

      await client.post('/profile', payload);
      navigate('/dashboard');
    } catch (err) {
      console.error("Profile Setup Error:", err);
      alert("Error saving profile.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. ARRAY TOGGLE LOGIC ---
  const toggleArrayItem = (collection, item) => {
    setFormData(prev => {
      const currentList = prev[collection] || [];
      return {
        ...prev,
        [collection]: currentList.includes(item)
          ? currentList.filter(i => i !== item)
          : [...currentList, item]
      };
    });
  };

  // --- 3. DATA LOADING LOGIC ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await client.get('/profile');
        if (res.data.profile) {
          const p = res.data.profile;
          setFormData(prev => ({
            ...prev,
            ...p,
            interests: Array.isArray(p.interests) ? p.interests.join(', ') : p.interests || '',
            strengths: Array.isArray(p.strengths) ? p.strengths.join(', ') : p.strengths || '',
            weaknesses: Array.isArray(p.weaknesses) ? p.weaknesses.join(', ') : p.weaknesses || '',
            // Ensure arrays exist
            values: Array.isArray(p.values) ? p.values : [],
            workStyle: Array.isArray(p.workStyle) ? p.workStyle : [],
            constraints: p.constraints || prev.constraints
          }));
        }
      } catch (err) {
        console.log("Starting fresh profile.");
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>

        <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Let's Build Your Path
        </h1>
        <p className="text-slate-500 mb-8 text-sm">Step {step} of 5: {
          step === 1 ? "The Basics" : 
          step === 2 ? "The Dream" : 
          step === 3 ? "Your Work DNA" : 
          step === 4 ? "Skills Analysis" : "Logistics"
        }</p>

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in-up">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Role</label>
              <input 
                type="text" 
                placeholder="e.g. High School Student, Nurse, Accountant, Unemployed" 
                className="w-full bg-slate-800 border-slate-700 rounded-xl p-4 mt-2 focus:border-blue-500 outline-none transition-all" 
                value={formData.currentRole}
                onChange={e => setFormData({ ...formData, currentRole: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Age Range</label>
                <select 
                  className="w-full bg-slate-800 border-slate-700 rounded-xl p-4 mt-2 outline-none" 
                  value={formData.ageRange} 
                  onChange={e => setFormData({ ...formData, ageRange: e.target.value })}
                >
                  <option>18-25</option><option>26-35</option><option>36-45</option><option>46+</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Education</label>
                <select 
                  className="w-full bg-slate-800 border-slate-700 rounded-xl p-4 mt-2 outline-none" 
                  value={formData.educationLevel} 
                  onChange={e => setFormData({ ...formData, educationLevel: e.target.value })}
                >
                  <option value="high-school">High School</option>
                  <option value="bachelor">Bachelor's</option>
                  <option value="master">Master's</option>
                  <option value="phd">PhD / Doctorate</option>
                  <option value="diploma">Vocational / Diploma</option>
                  <option value="self-taught">Self-Taught</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: THE DREAM (Universal) */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in-up">
             <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">What is your Target Career?</label>
              <p className="text-xs text-slate-400 mb-2">Be specific. e.g. "Cardiologist", "Freelance Illustrator", "Senior DevOps Engineer"</p>
              <input 
                type="text" 
                placeholder="Your dream job title..." 
                className="w-full bg-slate-800 border-slate-700 rounded-xl p-4 focus:border-emerald-500 outline-none transition-all" 
                value={formData.targetCareer}
                onChange={e => setFormData({ ...formData, targetCareer: e.target.value })} 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Experience Level in this field</label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {['Beginner', 'Intermediate', 'Expert'].map(level => (
                  <button 
                    key={level}
                    onClick={() => setFormData({...formData, experienceLevel: level.toLowerCase()})}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.experienceLevel === level.toLowerCase()
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: WORK DNA (The Unbiased Filter) */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="mb-4">
              <h3 className="font-bold text-lg text-white">How do you prefer to work?</h3>
              <p className="text-sm text-slate-400">Select all that apply to your ideal environment.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {workStylesList.map(style => (
                <button 
                  key={style.id} 
                  onClick={() => toggleArrayItem('workStyle', style.id)} 
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.workStyle.includes(style.id) 
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="font-bold block text-sm">{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: DEEP ANALYSIS */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in-up">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Top 3 Strengths</label>
              <textarea 
                placeholder="e.g. Logical thinking, Empathy, Physical endurance, Visual design..." 
                className="w-full bg-slate-800 border-slate-700 rounded-xl p-4 h-24 mt-2 text-sm focus:border-blue-500 outline-none resize-none" 
                value={formData.strengths}
                onChange={e => setFormData({ ...formData, strengths: e.target.value })} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Top 3 Weaknesses</label>
              <textarea 
                placeholder="e.g. Public speaking, Procrastination, Advanced math..." 
                className="w-full bg-slate-800 border-slate-700 rounded-xl p-4 h-24 mt-2 text-sm focus:border-rose-500 outline-none resize-none" 
                value={formData.weaknesses}
                onChange={e => setFormData({ ...formData, weaknesses: e.target.value })} 
              />
            </div>
          </div>
        )}

        {/* STEP 5: VALUES & LOGISTICS */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">What drives you?</label>
              <div className="flex flex-wrap gap-2">
                {valuesList.map(v => (
                  <button 
                    key={v} 
                    onClick={() => toggleArrayItem('values', v)} 
                    className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                      formData.values.includes(v) 
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/50' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time Commitment</label>
                <div className="relative mt-2">
                  <input 
                    type="number" 
                    className="w-full bg-slate-800 border-slate-700 rounded-xl p-4 pl-4" 
                    value={formData.constraints.timePerDay}
                    onChange={e => setFormData({ 
                      ...formData, 
                      constraints: { ...formData.constraints, timePerDay: e.target.value } 
                    })} 
                  />
                  <span className="absolute right-4 top-4 text-slate-500 text-sm">Hrs/Day</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</label>
                <select 
                  className="w-full bg-slate-800 border-slate-700 rounded-xl p-4 mt-2 outline-none" 
                  value={formData.constraints.locationPreference}
                  onChange={e => setFormData({ 
                    ...formData, 
                    constraints: { ...formData.constraints, locationPreference: e.target.value } 
                  })}
                >
                  <option value="any">Any / Open</option>
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-Site Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
          {step > 1 ? (
            <button onClick={handleBack} className="px-6 py-3 text-slate-400 hover:text-white font-medium transition">Back</button>
          ) : <div></div>}
          
          {step < 5 ? (
            <button 
              onClick={handleNext} 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 transition transform active:scale-95"
            >
              Next Step &rarr;
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition transform active:scale-95 flex items-center gap-2"
            >
              {loading ? "Saving..." : "Generate My Path 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;