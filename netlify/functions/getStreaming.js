
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { movieId, country = 'US' } = event.queryStringParameters;
  const API_KEY = process.env.TMDB_API_KEY || 'ec80894db7608dc7d6bea55e2a6aa650';

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
    const results = data.results || {};
    
    // Get data for requested country, or fallback to US if strictly needed (though frontend handles fallback logic too)
    let countryData = results[country];

    // If no data for requested country, and country is not US, try US as fallback
    if (!countryData && country !== 'US' && results['US']) {
        countryData = results['US'];
    }

    if (!countryData) {
        return {
            statusCode: 200, // Return 200 with null/empty to indicate no data found gracefully
            body: JSON.stringify(null),
        };
    }

    // Sort providers by priority within each category
    const sortProviders = (providers) => {
        if (!providers) return [];
        return providers.sort((a, b) => a.display_priority - b.display_priority);
    };

    const availability = {
        flatrate: sortProviders(countryData.flatrate),
        rent: sortProviders(countryData.rent),
        buy: sortProviders(countryData.buy),
        link: countryData.link
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // CORS
      },
      body: JSON.stringify(availability),
    };
  } catch (error) {
    console.error('Error fetching providers:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch providers' }),
    };
  }
};
