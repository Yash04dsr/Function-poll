// components/JudgeVotingPage.js
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, updateDoc, doc } from 'firebase/firestore';
import { getTotalVotes } from '../lib/utils';
import PollTimer from './PollTimer';

export default function JudgeVotingPage({ judgeId, judgeName, category }) {
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingPollId, setSubmittingPollId] = useState(null);
  const [expiredPolls, setExpiredPolls] = useState({});

  // Real-time listener for polls
  useEffect(() => {
    const q = query(collection(db, 'polls'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pollsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Filter polls by category and active status
      const relevantPolls = pollsData.filter(poll => 
        poll.type === category && poll.isActive === true
      );
      
      // Reset expired state for new/removed polls
      setExpiredPolls(prev => {
        const newExpired = {};
        relevantPolls.forEach(poll => {
          if (prev[poll.id]) {
            newExpired[poll.id] = prev[poll.id];
          }
        });
        return newExpired;
      });
      
      setPolls(relevantPolls);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [category, judgeName]);

  // Handle judge rating submission
  const handleRate = async (pollId, rating) => {
    // Check if poll is expired
    if (expiredPolls[pollId]) {
      alert('⏱️ Time has expired for this poll');
      return;
    }
    
    setSubmittingPollId(pollId);
    
    try {
      const pollRef = doc(db, 'polls', pollId);
      
      // Update the specific judge's rating
      await updateDoc(pollRef, {
        [`judgeVotes.${judgeId}`]: rating,
      });
      
      alert(`✅ Rating submitted successfully: ${rating}/5`);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingPollId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🎭 Judge Panel
          </h1>
          <p className="text-xl text-purple-200">{judgeName}</p>
          <p className="text-lg text-purple-300">Category: {category}</p>
        </div>

        {/* Active Polls */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-12 w-12 text-purple-300 mb-4" viewBox="0 0 24 24">
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
            <p className="text-purple-200">Loading polls...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="bg-purple-800/50 backdrop-blur-sm rounded-xl p-12 text-center">
            <p className="text-2xl text-purple-200 mb-2">
              No active polls in your category at the moment
            </p>
            <p className="text-purple-300">
              Please wait for the admin to start voting for a {category} performance
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map(poll => {
              const currentRating = poll.judgeVotes?.[judgeId] || 0;
              const totalVotes = getTotalVotes(poll.voteCounts || {});
              
              return (
                <div
                  key={poll.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20"
                >
                  {/* Performance Name */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                        LIVE
                      </span>
                      <span className="text-sm text-purple-200">
                        {totalVotes} audience vote{totalVotes !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                      {poll.question}
                    </h2>
                  </div>

                  {/* Timer Display */}
                  {poll.startTime && (poll.duration || 60) && (
                    <div className="mb-6">
                      <PollTimer 
                        startTime={poll.startTime}
                        duration={poll.duration || 60}
                        onExpire={() => setExpiredPolls(prev => ({ ...prev, [poll.id]: true }))}
                      />
                    </div>
                  )}

                  {/* Expired Message */}
                  {expiredPolls[poll.id] && (
                    <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-400 rounded-xl text-center">
                      <p className="text-red-300 font-bold text-lg">
                        🔒 Rating time has expired for this poll
                      </p>
                    </div>
                  )}

                  {/* Current Rating Display */}
                  {currentRating > 0 && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-400/50 rounded-lg">
                      <p className="text-green-300 font-semibold">
                        ✅ Your current rating: {currentRating}/5
                      </p>
                      <p className="text-green-400 text-sm mt-1">
                        You can change your rating anytime below
                      </p>
                    </div>
                  )}

                  {/* Rating Buttons */}
                  <div className="space-y-4">
                    <p className="text-lg font-semibold text-purple-200">
                      Rate this performance (1-5):
                    </p>
                    <div className="grid grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => handleRate(poll.id, rating)}
                          disabled={submittingPollId === poll.id || expiredPolls[poll.id]}
                          className={`
                            py-6 rounded-xl font-bold text-2xl transition-all transform hover:scale-105
                            ${currentRating === rating
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg ring-4 ring-yellow-300'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                            }
                            ${(submittingPollId === poll.id || expiredPolls[poll.id]) ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <div className="flex flex-col items-center">
                            <span>{rating}</span>
                            <span className="text-xl">⭐</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Judge Ratings Summary */}
                  {poll.judgeVotes && Object.keys(poll.judgeVotes).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <p className="text-sm text-purple-300 mb-2">Judge Ratings:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(poll.judgeVotes).map(([judge, rating]) => {
                          const judgeNames = {
                            dance1: 'Dance Judge 1',
                            dance2: 'Dance Judge 2',
                            music1: 'Music Judge 1',
                            music2: 'Music Judge 2',
                          };
                          return (
                            <div
                              key={judge}
                              className={`px-3 py-1 rounded-full text-sm ${
                                judge === judgeId
                                  ? 'bg-yellow-500 text-white font-bold'
                                  : 'bg-white/20 text-purple-200'
                              }`}
                            >
                              {judgeNames[judge]}: {rating}/5
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold mb-3 text-purple-200">
            📋 Instructions:
          </h3>
          <ul className="space-y-2 text-purple-300">
            <li>• Only {category} performances will appear here</li>
            <li>• Rate each performance from 1 to 5 stars</li>
            <li>• You can change your rating anytime during voting</li>
            <li>• Your rating is saved immediately when you click</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
