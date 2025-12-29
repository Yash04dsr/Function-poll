// components/VotingPage.js
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, updateDoc, doc, increment } from 'firebase/firestore';
import { getTotalVotes } from '../lib/utils';

export default function VotingPage() {
  const [activePoll, setActivePoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // Real-time listener for active poll
  useEffect(() => {
    const q = query(collection(db, 'polls'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const polls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Find the active poll
      const active = polls.find(poll => poll.isActive === true);
      setActivePoll(active || null);
      setIsLoading(false);
      
      // Check if user has already voted for this poll
      if (active) {
        const voted = localStorage.getItem(`voted_${active.id}`);
        setHasVoted(voted === 'true');
        if (voted === 'true') {
          const rating = localStorage.getItem(`rating_${active.id}`);
          setSelectedRating(rating ? parseInt(rating) : null);
        } else {
          setSelectedRating(null);
        }
      } else {
        setHasVoted(false);
        setSelectedRating(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle vote submission
  const handleVote = async (rating) => {
    if (!activePoll || hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    setSelectedRating(rating);

    try {
      const pollRef = doc(db, 'polls', activePoll.id);
      
      // Update the vote count in Firestore
      await updateDoc(pollRef, {
        [`voteCounts.vote${rating}`]: increment(1),
      });

      // Store in localStorage to prevent double voting
      localStorage.setItem(`voted_${activePoll.id}`, 'true');
      localStorage.setItem(`rating_${activePoll.id}`, rating.toString());
      setHasVoted(true);
      
      // Show confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
      setSelectedRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rating buttons data
  const ratings = [
    { value: 1, emoji: '😞', label: 'Poor', color: 'bg-gray-700 hover:bg-gray-600' },
    { value: 2, emoji: '😐', label: 'Below Average', color: 'bg-gray-700 hover:bg-gray-600' },
    { value: 3, emoji: '🙂', label: 'Average', color: 'bg-gray-700 hover:bg-gray-600' },
    { value: 4, emoji: '😊', label: 'Good', color: 'bg-gray-700 hover:bg-gray-600' },
    { value: 5, emoji: '🤩', label: 'Excellent', color: 'bg-gray-700 hover:bg-gray-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-0">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 mb-2">
            🎭 Festival Voting
          </h1>
          <p className="text-sm sm:text-base text-gray-400">Rate the performances in real-time</p>
        </div>

        {/* Main Content */}
        {isLoading ? (
          // Loading state
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 text-center">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-12 w-12 text-gray-400 mb-4" viewBox="0 0 24 24">
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
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-300">Connecting...</h2>
              <p className="text-gray-500 mt-2">Loading voting system</p>
            </div>
          </div>
        ) : !activePoll ? (
          // No active poll
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">Waiting for Next Performance</h2>
            <p className="text-gray-400 text-lg">
              The voting will begin when the organizer starts the next poll.
            </p>
            <div className="mt-6">
              <div className="animate-pulse flex justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animation-delay-200"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animation-delay-400"></div>
              </div>
            </div>
          </div>
        ) : hasVoted ? (
          // Already voted
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-100">
              Vote Submitted!
            </h2>
            <p className="text-gray-300 text-xl mb-4">
              Performance: <span className="font-bold">{activePoll.question}</span>
            </p>
            <div className="inline-flex items-center justify-center bg-gray-700 rounded-lg px-6 py-4 mb-4">
              <span className="text-5xl mr-3">
                {ratings.find(r => r.value === selectedRating)?.emoji}
              </span>
              <div className="text-left">
                <div className="text-3xl font-bold text-gray-100">{selectedRating} ★</div>
                <div className="text-sm text-gray-400">
                  {ratings.find(r => r.value === selectedRating)?.label}
                </div>
              </div>
            </div>
            <p className="text-gray-400 mt-6">
              Thank you for your feedback! Wait for the next performance.
            </p>
          </div>
        ) : (
          // Active poll - voting interface
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 bg-gray-700 border border-gray-600 text-sm font-semibold rounded-full mb-4">
                🔴 LIVE VOTING
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {activePoll.question}
              </h2>
              <p className="text-gray-400">Tap a rating to submit your vote</p>              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                {getTotalVotes(activePoll.voteCounts || {})} people have voted
              </p>            </div>

            {/* Voting Buttons */}
            <div className="space-y-3">
              {ratings.map(rating => (
                <button
                  key={rating.value}
                  onClick={() => handleVote(rating.value)}
                  disabled={isSubmitting}
                  className={`
                    w-full flex items-center justify-between
                    p-5 md:p-6 rounded-xl
                    ${rating.color}
                    border-2 border-gray-600
                    hover:scale-102 active:scale-98
                    transform transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${selectedRating === rating.value ? 'ring-2 ring-gray-400 border-gray-400' : ''}
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl md:text-5xl">{rating.emoji}</span>
                    <div className="text-left">
                      <div className="text-xl md:text-2xl font-bold">
                        {rating.value} Star{rating.value > 1 ? 's' : ''}
                      </div>
                      <div className="text-sm md:text-base opacity-90">{rating.label}</div>
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold opacity-75">
                    {rating.value}★
                  </div>
                </button>
              ))}
            </div>

            {/* Submitting indicator */}
            {isSubmitting && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-300">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  <span>Submitting your vote...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Your vote is securely recorded</p>
        </div>
      </div>
    </div>
  );
}
