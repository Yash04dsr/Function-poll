// components/AdminDashboard.js
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  calculateSimpleAverage,
  calculateBayesianAverage,
  calculateFestivalAverage,
  getTotalVotes,
  formatScore,
  calculateJudgeAverage,
  calculateFinalScore,
} from '../lib/utils';
import PollTimer from './PollTimer';

export default function AdminDashboard() {
  const [polls, setPolls] = useState([]);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollType, setNewPollType] = useState('Dance/Drama');
  const [newPollDuration, setNewPollDuration] = useState(60);
  const [isCreating, setIsCreating] = useState(false);
  const [festivalAverage, setFestivalAverage] = useState(3.0);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for polls
  useEffect(() => {
    const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pollsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setPolls(pollsData);
      setIsLoading(false);
      
      // Calculate festival-wide average
      const avgScore = calculateFestivalAverage(pollsData);
      setFestivalAverage(avgScore);
    });

    return () => unsubscribe();
  }, []);

  // Auto-stop expired polls
  useEffect(() => {
    const checkExpiredPolls = async () => {
      const now = Date.now();
      
      for (const poll of polls) {
        if (poll.isActive && poll.startTime && poll.duration) {
          const elapsed = Math.floor((now - poll.startTime) / 1000);
          
          if (elapsed >= poll.duration) {
            try {
              await updateDoc(doc(db, 'polls', poll.id), { 
                isActive: false,
                startTime: null
              });
              console.log(`Auto-stopped poll: ${poll.question}`);
            } catch (error) {
              console.error('Error auto-stopping poll:', error);
            }
          }
        }
      }
    };

    // Check every second
    const interval = setInterval(checkExpiredPolls, 1000);
    
    return () => clearInterval(interval);
  }, [polls]);

  // Create a new poll
  const handleCreatePoll = async () => {
    if (!newPollQuestion.trim()) {
      alert('Please enter a question');
      return;
    }

    setIsCreating(true);
    try {
      await addDoc(collection(db, 'polls'), {
        question: newPollQuestion.trim(),
        type: newPollType,
        duration: newPollDuration,
        isActive: false,
        voteCounts: {
          vote1: 0,
          vote2: 0,
          vote3: 0,
          vote4: 0,
          vote5: 0,
        },
        judgeVotes: {
          dance1: 0,
          dance2: 0,
          music1: 0,
          music2: 0,
        },
        createdAt: serverTimestamp(),
      });
      
      setNewPollQuestion('');
      setNewPollType('Dance/Drama');
      setNewPollDuration(60);
      alert('Poll created successfully!');
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll');
    } finally {
      setIsCreating(false);
    }
  };

  // Start voting for a poll
  const handleStartVoting = async (pollId) => {
    try {
      // First, deactivate all other polls
      const deactivatePromises = polls
        .filter(p => p.isActive && p.id !== pollId)
        .map(p => updateDoc(doc(db, 'polls', p.id), { isActive: false, startTime: null }));
      
      await Promise.all(deactivatePromises);
      
      // Then activate the selected poll with current timestamp
      await updateDoc(doc(db, 'polls', pollId), { 
        isActive: true,
        startTime: Date.now()
      });
      alert('Voting started!');
    } catch (error) {
      console.error('Error starting voting:', error);
      alert('Failed to start voting');
    }
  };

  // Stop voting for a poll
  const handleStopVoting = async (pollId) => {
    try {
      await updateDoc(doc(db, 'polls', pollId), { isActive: false, startTime: null });
      alert('Voting stopped!');
    } catch (error) {
      console.error('Error stopping voting:', error);
      alert('Failed to stop voting');
    }
  };

  // Delete a poll
  const handleDeletePoll = async (pollId, pollName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${pollName}"?\n\nThis action cannot be undone and will remove all votes for this poll.`
    );
    
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'polls', pollId));
      alert('Poll deleted successfully!');
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert('Failed to delete poll');
    }
  };

  // Export results to CSV
  const handleExportCSV = () => {
    const csvRows = [];
    const headers = ['Rank', 'Performance', 'Type', 'Total Votes', 'Raw Avg', 'Audience Score', 'Judge 1', 'Judge 2', 'Judge Avg', 'Final Score', '5★', '4★', '3★', '2★', '1★'];
    csvRows.push(headers.join(','));

    sortedLeaderboard.forEach((item, index) => {
      const judgeVotes = item.judgeVotes || {};
      const judge1 = item.type === 'Dance/Drama' ? (judgeVotes.dance1 || 0) : (judgeVotes.music1 || 0);
      const judge2 = item.type === 'Dance/Drama' ? (judgeVotes.dance2 || 0) : (judgeVotes.music2 || 0);
      
      const row = [
        index + 1,
        `"${item.question}"`,
        item.type || 'N/A',
        item.totalVotes,
        formatScore(item.simpleAverage, 4),
        formatScore(item.bayesianAverage, 4),
        judge1 > 0 ? judge1 : '-',
        judge2 > 0 ? judge2 : '-',
        formatScore(item.judgeAverage, 4),
        formatScore(item.finalScore, 4),
        item.voteCounts?.vote5 || 0,
        item.voteCounts?.vote4 || 0,
        item.voteCounts?.vote3 || 0,
        item.voteCounts?.vote2 || 0,
        item.voteCounts?.vote1 || 0,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `festival-results-${timestamp}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Prepare leaderboard data with all metrics
  const leaderboardData = polls.map(poll => {
    const simpleAvg = calculateSimpleAverage(poll.voteCounts || {});
    const bayesianAvg = calculateBayesianAverage(poll.voteCounts || {}, festivalAverage, 10);
    const totalVotes = getTotalVotes(poll.voteCounts || {});
    const judgeAvg = calculateJudgeAverage(poll.judgeVotes || {});
    const finalScore = calculateFinalScore(bayesianAvg, judgeAvg);

    return {
      id: poll.id,
      question: poll.question,
      type: poll.type || 'N/A',
      totalVotes,
      simpleAverage: simpleAvg,
      bayesianAverage: bayesianAvg,
      judgeAverage: judgeAvg,
      finalScore: finalScore,
      isActive: poll.isActive,
      voteCounts: poll.voteCounts,
      judgeVotes: poll.judgeVotes || {},
    };
  });

  // Sort by Final Score (descending)
  const sortedLeaderboard = [...leaderboardData].sort((a, b) => b.finalScore - a.finalScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-gray-100">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 max-w-7xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center text-white">
          🎭 Festival Admin Dashboard
        </h1>

        {/* Create Poll Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4 text-white">Create New Poll</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={newPollQuestion}
              onChange={(e) => setNewPollQuestion(e.target.value)}
              placeholder="Enter performance name..."
              className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300"
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePoll()}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                value={newPollType}
                onChange={(e) => setNewPollType(e.target.value)}
                className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="Dance/Drama" className="bg-gray-800">🎭 Dance/Drama</option>
                <option value="Music" className="bg-gray-800">🎵 Music</option>
              </select>
              <select
                value={newPollDuration}
                onChange={(e) => setNewPollDuration(Number(e.target.value))}
                className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value={30} className="bg-gray-800">⏱️ 30 seconds</option>
                <option value={60} className="bg-gray-800">⏱️ 60 seconds</option>
                <option value={90} className="bg-gray-800">⏱️ 90 seconds</option>
                <option value={120} className="bg-gray-800">⏱️ 2 minutes</option>
              </select>
              <button
                onClick={handleCreatePoll}
                disabled={isCreating}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-700 disabled:to-gray-700 rounded-lg font-semibold transition-all whitespace-nowrap"
              >
                {isCreating ? 'Creating...' : 'Create Poll'}
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard - Results Panel */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h2 className="text-2xl font-semibold text-white">
              🏆 Results Leaderboard
            </h2>
            <button
              onClick={handleExportCSV}
              disabled={sortedLeaderboard.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              📥 Export CSV
            </button>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center py-12">
                <svg className="animate-spin h-8 w-8 text-purple-300 mb-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-purple-200">Loading results...</p>
              </div>
            ) : sortedLeaderboard.length === 0 ? (
              <p className="text-center text-purple-300 py-8">No polls created yet</p>
            ) : (
              sortedLeaderboard.map((item, index) => {
                // Determine which judges to show based on poll type
                const judge1Id = item.type === 'Dance/Drama' ? 'dance1' : 'music1';
                const judge2Id = item.type === 'Dance/Drama' ? 'dance2' : 'music2';
                const judge1Score = item.judgeVotes[judge1Id] || 0;
                const judge2Score = item.judgeVotes[judge2Id] || 0;
                
                return (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-purple-800/40 to-indigo-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/20">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-3xl font-bold ${
                            index === 0 ? 'text-yellow-400' : 
                            index === 1 ? 'text-gray-300' : 
                            index === 2 ? 'text-orange-400' : 
                            'text-purple-300'
                          }`}>
                            #{index + 1}
                          </span>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{item.question}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                item.type === 'Dance/Drama' 
                                  ? 'bg-pink-500/30 text-pink-200' 
                                  : 'bg-blue-500/30 text-blue-200'
                              }`}>
                                {item.type === 'Dance/Drama' ? '🎭 Dance/Drama' : '🎵 Music'}
                              </span>
                              {item.isActive && (
                                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded font-bold animate-pulse">
                                  LIVE
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Split View: Audience & Judges */}
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      {/* Audience Section */}
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-purple-200 mb-3">
                          👥 AUDIENCE
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-300">Total Votes:</span>
                            <span className="font-bold text-white">{item.totalVotes}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-300">Raw Avg:</span>
                            <span className="font-bold text-white" title={`Exact: ${item.simpleAverage}`}>{formatScore(item.simpleAverage, 4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-300">Overall Score:</span>
                            <span className="font-bold text-xl text-purple-200" title={`Exact: ${item.bayesianAverage}`}>
                              {formatScore(item.bayesianAverage, 4)}
                            </span>
                          </div>
                          <div className="pt-2 mt-2 border-t border-white/20 text-xs text-purple-400">
                            5★:{item.voteCounts?.vote5 || 0} | 
                            4★:{item.voteCounts?.vote4 || 0} | 
                            3★:{item.voteCounts?.vote3 || 0} | 
                            2★:{item.voteCounts?.vote2 || 0} | 
                            1★:{item.voteCounts?.vote1 || 0}
                          </div>
                        </div>
                      </div>

                      {/* Judges Section */}
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-yellow-200 mb-3">
                          ⚖️ JUDGES
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-yellow-300">Judge 1:</span>
                            <span className={`font-bold ${judge1Score > 0 ? 'text-white' : 'text-gray-500'}`}>
                              {judge1Score > 0 ? `${judge1Score}/5 ⭐` : 'Not rated'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-yellow-300">Judge 2:</span>
                            <span className={`font-bold ${judge2Score > 0 ? 'text-white' : 'text-gray-500'}`}>
                              {judge2Score > 0 ? `${judge2Score}/5 ⭐` : 'Not rated'}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 mt-2 border-t border-white/20">
                            <span className="text-yellow-300">Judge Average:</span>
                            <span className="font-bold text-xl text-yellow-200" title={item.judgeAverage > 0 ? `Exact: ${item.judgeAverage}` : ''}>
                              {item.judgeAverage > 0 ? formatScore(item.judgeAverage, 4) : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Final Score */}
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border-2 border-yellow-500/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-yellow-300">
                          🏆 FINAL SCORE
                        </span>
                        <span className="text-4xl font-bold text-white" title={`Exact: ${item.finalScore}`}>
                          {formatScore(item.finalScore, 4)}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-200 mt-2 text-right" title={`Full precision: (${item.bayesianAverage} + ${item.judgeAverage > 0 ? item.judgeAverage : 0}) / 2`}>
                        (Audience {formatScore(item.bayesianAverage, 4)} + Judge {item.judgeAverage > 0 ? formatScore(item.judgeAverage, 4) : '0.0000'}) / 2
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-white/20 flex gap-2">
                      <button
                        onClick={() => handleDeletePoll(item.id, item.question)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Poll Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4 text-white">Poll Controls</h2>
          <div className="space-y-4">
            {polls.length === 0 ? (
              <p className="text-purple-300 text-center py-4">No polls available</p>
            ) : (
              polls.map(poll => (
                <div
                  key={poll.id}
                  className="flex flex-col p-4 bg-white/10 rounded-lg gap-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-white">{poll.question}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          poll.type === 'Dance/Drama' 
                            ? 'bg-pink-500/30 text-pink-200' 
                            : 'bg-blue-500/30 text-blue-200'
                        }`}>
                          {poll.type === 'Dance/Drama' ? '🎭' : '🎵'}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-500/30 text-purple-200">
                          ⏱️ {poll.duration || 60}s
                        </span>
                      </div>
                      <p className="text-sm text-purple-300">
                        Total Votes: {getTotalVotes(poll.voteCounts || {})}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {poll.isActive ? (
                        <button
                          onClick={() => handleStopVoting(poll.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all"
                        >
                          Stop Voting
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartVoting(poll.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all"
                        >
                          Start Voting
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Timer Display */}
                  {poll.isActive && poll.startTime && (
                    <PollTimer 
                      startTime={poll.startTime}
                      duration={poll.duration || 60}
                      onExpire={() => handleStopVoting(poll.id)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
