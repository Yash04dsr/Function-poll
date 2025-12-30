// components/PollTimer.js
import { useState, useEffect } from 'react';

export default function PollTimer({ startTime, duration, onExpire }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!startTime || !duration) {
      setTimeRemaining(null);
      return;
    }

    // Calculate time remaining
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // seconds elapsed
      const remaining = Math.max(0, duration - elapsed);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0 && !isExpired) {
        setIsExpired(true);
        if (onExpire) {
          onExpire();
        }
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, isExpired, onExpire]);

  if (timeRemaining === null) return null;

  const percentage = (timeRemaining / duration) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  // Determine color based on time remaining
  let colorClass = 'from-green-500 to-emerald-500';
  let bgColorClass = 'bg-green-500/20';
  let textColorClass = 'text-green-300';
  
  if (timeRemaining <= 10) {
    colorClass = 'from-red-500 to-rose-500';
    bgColorClass = 'bg-red-500/20';
    textColorClass = 'text-red-300';
  } else if (timeRemaining <= 20) {
    colorClass = 'from-yellow-500 to-orange-500';
    bgColorClass = 'bg-yellow-500/20';
    textColorClass = 'text-yellow-300';
  }

  return (
    <div className={`${bgColorClass} rounded-xl p-4 border-2 ${timeRemaining <= 10 ? 'border-red-400 animate-pulse' : timeRemaining <= 20 ? 'border-yellow-400' : 'border-green-400'}`}>
      {/* Time Display */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">
          ⏱️ Time Remaining
        </span>
        <span className={`text-3xl font-bold ${textColorClass}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Warning Messages */}
      {timeRemaining <= 10 && timeRemaining > 0 && (
        <p className="text-red-300 text-sm font-semibold mt-2 text-center animate-pulse">
          ⚠️ Voting closes soon!
        </p>
      )}
      
      {timeRemaining === 0 && (
        <p className="text-red-300 text-sm font-bold mt-2 text-center">
          🔒 Voting Closed
        </p>
      )}
    </div>
  );
}
