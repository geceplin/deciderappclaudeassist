import { Movie } from '../types';
import { ReelFilterType } from '../components/roulette/ReelFilterTabs';

/**
 * Filters a list of unwatched movies based on the selected reel filter type.
 */
export const filterMoviesForReel = (unwatchedMovies: Movie[], filter: ReelFilterType): Movie[] => {
    switch (filter) {
        case 'must-watch':
            // Default: Only movies with at least one "must-watch" opinion
            return unwatchedMovies.filter(m => (m.opinionCounts?.mustWatch ?? 0) > 0);
        
        case 'all':
            // All unwatched movies, regardless of opinions
            return unwatchedMovies;
            
        case 'must-watch-seen':
            // Movies marked must-watch OR already-seen
            return unwatchedMovies.filter(m => 
                ((m.opinionCounts?.mustWatch ?? 0) > 0) || 
                ((m.opinionCounts?.alreadySeen ?? 0) > 0)
            );
            
        case 'must-watch-pass':
            // Movies marked must-watch OR pass
            return unwatchedMovies.filter(m => 
                ((m.opinionCounts?.mustWatch ?? 0) > 0) || 
                ((m.opinionCounts?.pass ?? 0) > 0)
            );
            
        default:
            return unwatchedMovies;
    }
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
    const weight = (counts.mustWatch ?? 0) * 3 + (counts.alreadySeen ?? 0) * 1;
    return { movie, weight };
  }).filter(item => item.weight > 0);

  if (weightedList.length === 0) {
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

  return weightedList[weightedList.length - 1].movie;
};