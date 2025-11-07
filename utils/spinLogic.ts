import { Movie } from '../types';

/**
 * Filters a list of movies to find those eligible for the reel spinner.
 * Eligibility rules:
 * 1. The movie must not have been watched together.
 * 2. The movie must have a positive net opinion score (mustWatch > pass).
 * @param movies - The array of all unwatched movies.
 * @returns An array of movies eligible to be included in the spin.
 */
export const filterEligibleMovies = (movies: Movie[]): Movie[] => {
  return movies.filter(movie => {
    // Null-safe access to opinion counts with defaults
    const counts = movie.opinionCounts || { mustWatch: 0, pass: 0, alreadySeen: 0 };
    const mustWatchCount = counts.mustWatch ?? 0;
    const passCount = counts.pass ?? 0;
    
    // Rule: mustWatch votes must be strictly greater than pass votes.
    return mustWatchCount > passCount;
  });
};

/**
 * Selects a winner from a list of eligible movies using a weighted random algorithm.
 * - 'must-watch' opinions contribute 3 points.
 * - 'already-seen' opinions contribute 1 point.
 * @param movies - The array of eligible movies to choose from.
 * @returns The winning Movie object, or null if the input array is empty.
 */
export const selectWinner = (movies: Movie[]): Movie | null => {
  if (movies.length === 0) return null;

  const weightedList = movies.map(movie => {
    const counts = movie.opinionCounts || { mustWatch: 0, alreadySeen: 0, pass: 0 };
    // Weighting: must-watch is 3x more valuable than already-seen
    const weight = (counts.mustWatch ?? 0) * 3 + (counts.alreadySeen ?? 0) * 1;
    return { movie, weight };
  }).filter(item => item.weight > 0); // Only include movies with some positive weight

  if (weightedList.length === 0) {
    // If no movies have positive weight (e.g., all have 0 must-watch/seen),
    // fall back to a non-weighted random selection from the original eligible list.
    return movies[Math.floor(Math.random() * movies.length)];
  }

  const totalWeight = weightedList.reduce((sum, item) => sum + item.weight, 0);
  let randomValue = Math.random() * totalWeight;

  for (const { movie, weight } of weightedList) {
    randomValue -= weight;
    if (randomValue <= 0) {
      return movie;
    }
  }

  // Fallback in the unlikely event of a floating point issue
  return weightedList[weightedList.length - 1].movie;
};
