// pages/judge/dance2.js
import { useState, useEffect } from 'react';
import JudgeVotingPage from '../../components/JudgeVotingPage';

export default function DanceJudge2() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const JUDGE_PASSWORD = process.env.NEXT_PUBLIC_DANCE_JUDGE2_PASSWORD || 'dance2pass';
  const STORAGE_KEY = 'judge_dance2_auth';

  // Check if already authenticated on mount
  useEffect(() => {
    const authStatus = localStorage.getItem(STORAGE_KEY);
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (password === JUDGE_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              🎭 Dance Judge 2
            </h1>
            <p className="text-purple-200">Please enter your password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <JudgeVotingPage
      judgeId="dance2"
      judgeName="Dance/Drama Judge 2"
      category="Dance/Drama"
      onLogout={handleLogout}
    />
  );
}
