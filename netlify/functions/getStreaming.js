
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { movieId } = event.queryStringParameters;
  const API_KEY = process.env.TMDB_API_KEY || 'ec80894db7608dc7d6bea55e2a6aa650'; // Fallback for dev, usually in env vars

  if (!movieId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Movie ID is required' }),
    };
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${API_KEY}`
    );
    const data = await response.json();

    // We specifically want US Flatrate (Subscription) providers
    const usProviders = data.results?.US?.flatrate || [];

    // Sort by display_priority (usually puts major platforms first)
    usProviders.sort((a, b) => a.display_priority - b.display_priority);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // CORS for dev
      },
      body: JSON.stringify(usProviders),
    };
  } catch (error) {
    console.error('Error fetching providers:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch providers' }),
    };
  }
};
