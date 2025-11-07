import React, { useState } from 'react';
import { Movie, UserProfile, Comment } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getPosterUrl } from '../../services/tmdbService';
import { addCommentToMovie, deleteCommentFromMovie } from '../../services/movieService';
import { formatDate } from '../../utils/formatters';
import { timeAgo } from '../../utils/timeAgo';
import { Star, MessageSquare, Trash2, Loader2 } from '../icons/Icons';
import StarRatingDisplay from '../common/StarRatingDisplay';
import Avatar from '../common/Avatar';

interface WatchHistoryCardProps {
  movie: Movie;
  onRate: (rating: number) => void;
  members: Map<string, UserProfile>;
  groupId: string;
  onCommentAdded: (movieId: string, newComment: Comment) => void;
  onCommentDeleted: (movieId: string, commentToDelete: Comment) => void;
}

const StarRatingInput: React.FC<{ value: number; onChange: (newValue: number) => void }> = ({ value, onChange }) => {
  const [hoverValue, setHoverValue] = useState(0);
  return (
    <div className="flex items-center" onMouseLeave={() => setHoverValue(0)}>
      {[1, 2, 3, 4, 5].map(starValue => (
        <button
          key={starValue}
          onClick={() => onChange(starValue)}
          onMouseEnter={() => setHoverValue(starValue)}
          aria-label={`Rate ${starValue} stars`}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              (hoverValue || value) >= starValue ? 'text-gold' : 'text-gray-600'
            }`}
            filled={(hoverValue || value) >= starValue}
          />
        </button>
      ))}
    </div>
  );
};

const WatchHistoryCard: React.FC<WatchHistoryCardProps> = ({ movie, onRate, members, groupId, onCommentAdded, onCommentDeleted }) => {
  const { user } = useAuth();
  const userRating = user ? movie.groupRatings?.[user.uid] || 0 : 0;
  const ratingEntries = Object.entries(movie.groupRatings || {});

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !user) return;
      setIsSubmitting(true);
      try {
          const addedComment = await addCommentToMovie(groupId, movie.id, user.uid, newComment);
          onCommentAdded(movie.id, addedComment);
          setNewComment('');
      } catch (err) {
          alert("Failed to post comment. Please try again.");
          console.error(err);
      } finally {
          setIsSubmitting(false);
      }
  };
  
  const handleDeleteComment = async (comment: Comment) => {
      if (window.confirm("Are you sure you want to delete this comment?")) {
          try {
              await deleteCommentFromMovie(groupId, movie.id, comment);
              onCommentDeleted(movie.id, comment);
          } catch (err) {
              alert("Failed to delete comment. Please try again.");
              console.error(err);
          }
      }
  };
  
  const sortedComments = [...(movie.comments || [])].sort((a,b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));

  return (
    <div className="bg-dark-elevated rounded-xl shadow-lg flex flex-col transition-all duration-300">
      <div className="relative aspect-[2/3]">
        <img src={getPosterUrl(movie.posterPath)} alt={movie.title} className="w-full h-full object-cover rounded-t-xl" />
        <div className="absolute top-2 right-2 bg-cinema-green text-white text-xs font-bold px-2 py-1 rounded">
          ✓ WATCHED
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-white truncate" title={movie.title}>{movie.title}</h3>
        <p className="text-xs text-gray-500">
          Watched on {formatDate(movie.watchedTogetherDate)}
        </p>
        
        <div className="mt-2 flex items-center gap-2">
           {typeof movie.averageGroupRating === 'number' && (
              <>
                <StarRatingDisplay rating={movie.averageGroupRating} size="sm" />
                <span className="text-xs font-bold text-gray-300">{movie.averageGroupRating.toFixed(1)}</span>
              </>
            )}
        </div>
        
        <div className="mt-2 flex items-center h-8">
            <div className="flex -space-x-2 overflow-hidden">
                {ratingEntries.slice(0, 4).map(([userId]) => (
                    <div key={userId} title={`${members.get(userId)?.displayName || '...'}`}>
                         <Avatar name={members.get(userId)?.displayName} size="sm" />
                    </div>
                ))}
            </div>
            {ratingEntries.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold z-10 border-2 border-dark-elevated ml-[-8px]">
                    +{ratingEntries.length - 4}
                </div>
            )}
        </div>

        <div className="mt-auto pt-4 space-y-2">
          <div>
            <p className="text-xs text-gray-400 mb-1">Your rating:</p>
            <StarRatingInput value={userRating} onChange={onRate} />
          </div>
          <button onClick={() => setShowComments(s => !s)} className="w-full flex items-center justify-center gap-2 text-xs py-2 text-gray-400 hover:text-white bg-dark-hover rounded-md transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>{showComments ? 'Hide' : 'Show'} Comments</span>
            <span className="bg-dark px-1.5 py-0.5 rounded-full text-xs">{movie.comments?.length || 0}</span>
          </button>
        </div>
      </div>
      {showComments && (
        <div className="p-4 border-t border-gray-700 bg-dark rounded-b-xl">
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {sortedComments.map(comment => (
              <div key={comment.id} className="flex items-start gap-2 text-sm">
                <Avatar name={members.get(comment.userId)?.displayName} size="sm" />
                <div className="flex-1 bg-dark p-2 rounded-lg">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-white text-xs">{members.get(comment.userId)?.displayName || 'User'}</p>
                    <p className="text-gray-500 text-xs">{timeAgo(comment.timestamp)}</p>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap break-words">{comment.text}</p>
                </div>
                {comment.userId === user?.uid && (
                  <button onClick={() => handleDeleteComment(comment)} className="p-1 text-gray-500 hover:text-cinema-red">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {sortedComments.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Be the first to comment!</p>}
          </div>
          <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
            <input 
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-dark border-2 border-gray-600 rounded-lg text-white text-sm px-3 py-1.5 focus:outline-none focus:border-gold"
            />
            <button type="submit" disabled={isSubmitting || !newComment.trim()} className="px-3 py-1.5 bg-gold text-dark font-bold text-sm rounded-lg disabled:bg-gold-dark disabled:cursor-not-allowed">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default WatchHistoryCard;