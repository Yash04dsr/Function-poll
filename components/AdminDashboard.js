// components/AdminDashboard.js
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
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
} from '../lib/utils';

export default function AdminDashboard() {
  const [polls, setPolls] = useState([]);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [festivalAverage, setFestivalAverage] = useState(3.0);

  // Real-time listener for polls
  useEffect(() => {
    const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pollsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setPolls(pollsData);
      
      // Calculate festival-wide average
      const avgScore = calculateFestivalAverage(pollsData);
      setFestivalAverage(avgScore);
    });

    return () => unsubscribe();
  }, []);

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
        isActive: false,
        voteCounts: {
          vote1: 0,
          vote2: 0,
          vote3: 0,
          vote4: 0,
          vote5: 0,
        },
        createdAt: serverTimestamp(),
      });
      
      setNewPollQuestion('');
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
        .map(p => updateDoc(doc(db, 'polls', p.id), { isActive: false }));
      
      await Promise.all(deactivatePromises);
      
      // Then activate the selected poll
      await updateDoc(doc(db, 'polls', pollId), { isActive: true });
      alert('Voting started!');
    } catch (error) {
      console.error('Error starting voting:', error);
      alert('Failed to start voting');
    }
  };

  // Stop voting for a poll
  const handleStopVoting = async (pollId) => {
    try {
      await updateDoc(doc(db, 'polls', pollId), { isActive: false });
      alert('Voting stopped!');
    } catch (error) {
      console.error('Error stopping voting:', error);
      alert('Failed to stop voting');
    }
  };

  // Prepare leaderboard data with both metrics
  const leaderboardData = polls.map(poll => {
    const simpleAvg = calculateSimpleAverage(poll.voteCounts || {});
    const bayesianAvg = calculateBayesianAverage(poll.voteCounts || {}, festivalAverage, 10);
    const totalVotes = getTotalVotes(poll.voteCounts || {});

    return {
      id: poll.id,
      question: poll.question,
      totalVotes,
      simpleAverage: simpleAvg,
      bayesianAverage: bayesianAvg,
      isActive: poll.isActive,
      voteCounts: poll.voteCounts,
    };
  });

  // Sort by Bayesian Score (descending)
  const sortedLeaderboard = [...leaderboardData].sort((a, b) => b.bayesianAverage - a.bayesianAverage);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-100">
          🎭 Festival Admin Dashboard
        </h1>

        {/* Create Poll Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Create New Poll</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newPollQuestion}
              onChange={(e) => setNewPollQuestion(e.target.value)}
              placeholder="Enter performance/question name..."
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePoll()}
            />
            <button
              onClick={handleCreatePoll}
              disabled={isCreating}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 border border-gray-600 rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              {isCreating ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </div>

        {/* Leaderboard - Results Panel */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">
            🏆 Results Leaderboard
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-300 font-semibold">Rank</th>
                  <th className="py-3 px-4 text-gray-300 font-semibold">Performance</th>
                  <th className="py-3 px-4 text-gray-300 font-semibold">Total Votes</th>
                  <th className="py-3 px-4 text-gray-300 font-semibold">Raw Average Score</th>
                  <th className="py-3 px-4 text-gray-300 font-semibold">Overall Score</th>
                  <th className="py-3 px-4 text-gray-300 font-semibold">Breakdown</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No polls created yet
                    </td>
                  </tr>
                ) : (
                  sortedLeaderboard.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className={`text-xl font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{item.question}</div>
                        {item.isActive && (
                          <span className="inline-block mt-1 px-2 py-1 bg-green-600 text-xs rounded">
                            LIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{item.totalVotes}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-200 text-lg">
                          {formatScore(item.simpleAverage)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-100 text-lg">
                          {formatScore(item.bayesianAverage)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        5★:{item.voteCounts?.vote5 || 0} | 
                        4★:{item.voteCounts?.vote4 || 0} | 
                        3★:{item.voteCounts?.vote3 || 0} | 
                        2★:{item.voteCounts?.vote2 || 0} | 
                        1★:{item.voteCounts?.vote1 || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Poll Controls */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Poll Controls</h2>
          <div className="space-y-4">
            {polls.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No polls available</p>
            ) : (
              polls.map(poll => (
                <div
                  key={poll.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-700 rounded-lg gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{poll.question}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Total Votes: {getTotalVotes(poll.voteCounts || {})}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {poll.isActive ? (
                      <button
                        onClick={() => handleStopVoting(poll.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                      >
                        Stop Voting
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartVoting(poll.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                      >
                        Start Voting
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
