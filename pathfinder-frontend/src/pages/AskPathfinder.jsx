import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function AskPathfinder() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await client.get('/decisions');
      setDecisions(res.data.decisions || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        question,
        options: optionsText ? optionsText.split(',').map(o => o.trim()).filter(Boolean) : undefined
      };

      const res = await client.post('/decisions/analyze', payload);
      // Prepend new decision to list
      setDecisions([res.data.decision, ...decisions]);
      setQuestion('');
      setOptionsText('');
    } catch (err) {
      alert("AI Analysis failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-100px)]">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl flex flex-col shadow-2xl h-fit sticky top-6">
          <div className="mb-6">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Ask Pathfinder
            </h1>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Your personal decision engine. I analyze your <span className="text-white font-bold">Profile</span>, <span className="text-white font-bold">Life Goals</span>, and <span className="text-white font-bold">Current Constraints</span> to give you strategic advice.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Dilemma</label>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Should I quit my job to study full-time?"
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none mt-2"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Options (Optional)</label>
              <input 
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="e.g., Stay, Quit, Freelance"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm focus:border-blue-500 outline-none mt-2"
              />
              <p className="text-[10px] text-slate-500 mt-1">Separate options with commas</p>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all ${
                submitting 
                  ? 'bg-slate-700 text-slate-400 cursor-wait' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 active:scale-95'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full"></span>
                  Analyzing Context...
                </span>
              ) : 'Analyze Decision'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Conversation History */}
        <div className="lg:col-span-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-emerald-400">⚡</span> Recent Analyses
          </h2>

          {loading ? (
            <div className="text-center py-20 animate-pulse text-slate-500">Loading your history...</div>
          ) : decisions.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500">
              <div className="text-4xl mb-4">🤔</div>
              <p>No decisions analyzed yet.</p>
              <p className="text-xs mt-2">Ask your first question to the left.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {decisions.map((session) => (
                <div key={session._id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl animate-fade-in-up">
                  {/* User Question Header */}
                  <div className="bg-slate-800/50 p-6 border-b border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <span className="bg-slate-700 text-[10px] px-2 py-1 rounded text-slate-300">
                        {session.options?.length > 0 ? `${session.options.length} Options` : 'Open Question'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug">"{session.question}"</h3>
                  </div>

                  {/* AI Response Body */}
                  <div className="p-6 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-blue-500"></div>
                    
                    {session.aiAnalysis ? (
                      <div className="pl-4 space-y-6">
                        
                        {/* Summary & Recommendation */}
                        <div>
                          <p className="text-slate-400 text-sm italic mb-4">"{session.aiAnalysis.summary}"</p>
                          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                            <h4 className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Recommended Path</h4>
                            <p className="text-white font-medium text-lg">{session.aiAnalysis.recommendedOption}</p>
                            <p className="text-slate-300 text-sm mt-2 leading-relaxed">{session.aiAnalysis.reasoning}</p>
                          </div>
                        </div>

                        {/* Action Plan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">Immediate Actions</h4>
                            <ul className="space-y-2">
                              {session.aiAnalysis.shortTermActions?.map((action, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                  <span className="text-emerald-500 mt-1">✓</span> {action}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-rose-400 text-xs font-black uppercase tracking-widest mb-3">Risks to Watch</h4>
                            <ul className="space-y-2">
                              {session.aiAnalysis.risks?.map((risk, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                  <span className="text-rose-500 mt-1">⚠</span> {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-red-400 text-sm">Analysis data unavailable.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}