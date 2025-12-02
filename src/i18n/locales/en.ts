
export default {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    confirm: "Confirm",
    back: "Back",
    close: "Close",
    or: "OR",
    unknownUser: "Unknown User"
  },
  auth: {
    signIn: {
      title: "Sign In",
      subtitle: "Movie night solved.",
      button: "Sign In",
      google: "Continue with Google",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      signUpLink: "Sign Up"
    },
    signUp: {
      title: "Create Account",
      subtitle: "Join the club.",
      button: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      signInLink: "Sign In",
      passwordStrength: {
        weak: "Weak",
        medium: "Medium",
        strong: "Strong"
      }
    },
    fields: {
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      displayName: "Display Name"
    },
    errors: {
      fillAll: "Please fill in all fields.",
      passwordMatch: "Passwords do not match.",
      passwordWeak: "Password is not strong enough.",
      invalidEmail: "Please enter a valid email.",
      userNotFound: "No account found with this email.",
      wrongPassword: "Incorrect password."
    }
  },
  groups: {
    dashboard: {
      title: "My Movie Groups",
      createButton: "Create New Group",
      emptyState: {
        title: "Your Movie Crew Awaits",
        subtitle: "Start your first group to begin solving movie night debates. 🍿"
      }
    },
    card: {
      members: "{{count}} member",
      members_plural: "{{count}} members",
      movies: "{{count}} movie",
      movies_plural: "{{count}} movies",
      lastActive: "Last active: {{time}}"
    },
    create: {
      title: "Create New Group",
      nameLabel: "Group Name",
      placeholder: "e.g., Roommates Movie Night",
      colorLabel: "Group Color",
      submit: "Create Group"
    },
    join: {
      title: "Join a Movie Group",
      subtitle: "Enter the 6-character invite code to join a group.",
      placeholder: "ABC123",
      button: "Join Group",
      invitedTo: "You've been invited to join:",
      backButton: "Back to my groups"
    },
    details: {
      tabs: {
        watchlist: "Watchlist",
        members: "Members"
      },
      spinButton: "Spin Reel",
      historyButton: "History",
      inviteButton: "Invite Friends",
      emptyWatchlist: {
        title: "No Unwatched Movies Found",
        subtitle: "Your watchlist is empty. Add a movie to get started!"
      }
    },
    members: {
      title: "Group Members ({{count}})",
      ownerBadge: "Owner",
      remove: "Remove Member",
      leave: "Leave Group"
    }
  },
  movies: {
    add: {
      button: "Add Movie",
      title: "Add Movies",
      placeholder: "Search any movie...",
      tabs: {
        popular: "🔥 Popular",
        browse: "🔭 Browse",
        search: "🔍 Search Results"
      },
      categories: {
        trending: "🔥 Trending Today",
        topRated: "⭐ Top Rated",
        nowPlaying: "🎬 In Theaters"
      }
    },
    card: {
      addedBy: "Added by {{name}}",
      deleteConfirm: {
        title: "Delete this movie?",
        description: "This will permanently remove \"{{title}}\" from your group's watchlist.",
        button: "Delete Movie"
      }
    },
    opinions: {
      mustWatch: "Must Watch",
      seen: "Seen",
      pass: "Pass"
    },
    preview: {
      addToWatchlist: "+ Add to Watchlist",
      added: "✓ Added",
      watchTrailer: "Watch Trailer 🎬"
    }
  },
  roulette: {
    title: "Reel Spinner",
    spinButton: "Spin the Reel!",
    spinning: "Spinning...",
    emptyTitle: "The Reel is Empty!",
    emptySubtitle: "Add some movies to the group list to get started.",
    filters: {
      mustWatch: "🌟 Must Watch",
      all: "🎬 All Movies",
      mustWatchSeen: "🌟✅ Must + Seen",
      mustWatchPass: "🌟👎 Must + Pass"
    },
    result: {
      title: "WE'RE WATCHING THIS!",
      markWatched: "✓ Mark as Watched",
      spinAgain: "Spin Again",
      back: "Back to Reel"
    }
  },
  history: {
    title: "Watch History",
    subtitle: "{{count}} movie watched together",
    subtitle_plural: "{{count}} movies watched together",
    filter: {
      label: "Filter:",
      all: "All Time",
      month: "Month",
      year: "Year"
    },
    sort: {
      label: "Sort by:",
      recent: "Recent",
      rating: "Rating"
    },
    stats: {
      total: "Movies Watched",
      avgRating: "Avg. Group Rating",
      genre: "Favorite Genre",
      contributor: "Top Contributor"
    },
    card: {
      watchedOn: "Watched on {{date}}",
      yourRating: "Your rating:",
      comments: {
        show: "Show Comments",
        hide: "Hide Comments",
        placeholder: "Add a comment...",
        post: "Post",
        empty: "Be the first to comment!"
      },
      unwatch: {
        button: "Unwatch",
        title: "Unwatch this movie?",
        description: "This will move \"{{title}}\" back to your group's watchlist and clear all ratings.",
        confirm: "Move to Watchlist"
      }
    }
  },
  settings: {
    title: "Account Settings",
    backProfile: "Back to Profile",
    password: {
      title: "Change Password",
      current: "Current Password",
      new: "New Password",
      confirm: "Confirm New Password",
      update: "Update Password",
      googleAccount: "You are signed in with a Google account. Password management is handled by Google."
    },
    language: {
      title: "Language",
      label: "App Language"
    }
  }
};
