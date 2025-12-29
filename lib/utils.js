// lib/utils.js

/**
 * Calculate the Simple Average (Raw Quality Score)
 * Formula: Total Score / Total Votes
 * 
 * @param {Object} voteCounts - Object with keys: vote1, vote2, vote3, vote4, vote5
 * @returns {number} - The simple average rating (0 if no votes)
 */
export function calculateSimpleAverage(voteCounts) {
  const { vote1 = 0, vote2 = 0, vote3 = 0, vote4 = 0, vote5 = 0 } = voteCounts;
  
  // Calculate total score: (5 × Count_5) + (4 × Count_4) + ... + (1 × Count_1)
  const totalScore = (5 * vote5) + (4 * vote4) + (3 * vote3) + (2 * vote2) + (1 * vote1);
  
  // Calculate total votes
  const totalVotes = vote1 + vote2 + vote3 + vote4 + vote5;
  
  // Return average or 0 if no votes
  if (totalVotes === 0) return 0;
  
  return totalScore / totalVotes;
}

/**
 * Calculate the Bayesian Average (True Rank - IMDb Style)
 * Formula: WR = (v/(v+m)) × R + (m/(v+m)) × C
 * 
 * @param {Object} voteCounts - Object with keys: vote1, vote2, vote3, vote4, vote5
 * @param {number} festivalAverage - Mean vote across entire festival (default: 3.0)
 * @param {number} minimumVotes - Minimum votes required (default: 10)
 * @returns {number} - The Bayesian weighted rating
 */
export function calculateBayesianAverage(voteCounts, festivalAverage = 3.0, minimumVotes = 10) {
  const { vote1 = 0, vote2 = 0, vote3 = 0, vote4 = 0, vote5 = 0 } = voteCounts;
  
  // R = Raw Quality (Simple Average)
  const R = calculateSimpleAverage(voteCounts);
  
  // v = Total number of votes for this performance
  const v = vote1 + vote2 + vote3 + vote4 + vote5;
  
  // m = Minimum votes required (hardcoded to 10)
  const m = minimumVotes;
  
  // C = Mean vote across entire festival
  const C = festivalAverage;
  
  // If no votes, return 0
  if (v === 0) return 0;
  
  // WR = (v/(v+m)) × R + (m/(v+m)) × C
  const WR = (v / (v + m)) * R + (m / (v + m)) * C;
  
  return WR;
}

/**
 * Calculate the festival-wide average across all polls
 * 
 * @param {Array} allPolls - Array of poll objects with voteCounts
 * @returns {number} - The average rating across all polls (default: 3.0 if no data)
 */
export function calculateFestivalAverage(allPolls) {
  if (!allPolls || allPolls.length === 0) return 3.0;
  
  let totalScore = 0;
  let totalVotes = 0;
  
  allPolls.forEach(poll => {
    if (poll.voteCounts) {
      const { vote1 = 0, vote2 = 0, vote3 = 0, vote4 = 0, vote5 = 0 } = poll.voteCounts;
      
      totalScore += (5 * vote5) + (4 * vote4) + (3 * vote3) + (2 * vote2) + (1 * vote1);
      totalVotes += vote1 + vote2 + vote3 + vote4 + vote5;
    }
  });
  
  if (totalVotes === 0) return 3.0;
  
  return totalScore / totalVotes;
}

/**
 * Get the total number of votes for a poll
 * 
 * @param {Object} voteCounts - Object with keys: vote1, vote2, vote3, vote4, vote5
 * @returns {number} - Total number of votes
 */
export function getTotalVotes(voteCounts) {
  const { vote1 = 0, vote2 = 0, vote3 = 0, vote4 = 0, vote5 = 0 } = voteCounts;
  return vote1 + vote2 + vote3 + vote4 + vote5;
}

/**
 * Format a number to a fixed number of decimal places
 * 
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted number as string
 */
export function formatScore(num, decimals = 2) {
  return num.toFixed(decimals);
}
