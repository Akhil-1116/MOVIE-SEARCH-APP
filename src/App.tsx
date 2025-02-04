import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Star, StarOff, Film, X, Heart, Clock, Award } from 'lucide-react';
import type { MovieSearchResult, MovieDetails } from './types/movie';

function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<MovieSearchResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('movieFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const API_KEY = '2dcf51a3'; 

  useEffect(() => {
    localStorage.setItem('movieFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const searchMovies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSelectedMovie(null);
    
    try {
      const response = await axios.get(
        `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`
      );
      
      if (response.data.Response === 'True') {
        setMovies(response.data.Search);
      } else {
        setError(response.data.Error);
        setMovies([]);
      }
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieDetails = async (imdbID: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`
      );
      setSelectedMovie(response.data);
    } catch (err) {
      setError('Failed to fetch movie details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (imdbID: string) => {
    setFavorites(prev => 
      prev.includes(imdbID)
        ? prev.filter(id => id !== imdbID)
        : [...prev, imdbID]
    );
  };

  const fetchFavoriteMovies = async () => {
    setLoading(true);
    setError('');
    const favoriteMovies: MovieSearchResult[] = [];
    
    try {
      for (const id of favorites) {
        const response = await axios.get(
          `https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`
        );
        if (response.data.Response === 'True') {
          favoriteMovies.push(response.data);
        }
      }
      setMovies(favoriteMovies);
    } catch (err) {
      setError('Failed to fetch favorite movies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showFavorites) {
      fetchFavoriteMovies();
    }
  }, [showFavorites]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
            <Film className="h-8 w-8 text-red-500" />
            Movie Explorer
          </h1>
          <p className="text-gray-400">Search for your favorite movies and save them</p>
        </header>

        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={searchMovies} className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for movies..."
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500"
                disabled={loading}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showFavorites 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Heart className="h-5 w-5" />
              {showFavorites ? 'Show All' : 'Favorites'}
            </button>
          </form>

          {loading && (
            <div className="text-center text-gray-400">Loading...</div>
          )}

          {error && (
            <div className="text-center text-red-500 mb-4">{error}</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.imdbID}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-[2/3] bg-gray-900">
                {movie.Poster !== 'N/A' ? (
                  <img
                    src={movie.Poster}
                    alt={movie.Title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Film className="h-16 w-16 text-gray-600" />
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(movie.imdbID)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-900/80 hover:bg-gray-800 transition-colors"
                >
                  {favorites.includes(movie.imdbID) ? (
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{movie.Title}</h3>
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{movie.Year}</span>
                </div>
                <button
                  onClick={() => fetchMovieDetails(movie.imdbID)}
                  className="w-full py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedMovie && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedMovie.Title}</h2>
                  <button
                    onClick={() => setSelectedMovie(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden">
                    {selectedMovie.Poster !== 'N/A' ? (
                      <img
                        src={selectedMovie.Poster}
                        alt={selectedMovie.Title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-16 w-16 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-500">{selectedMovie.imdbRating}</span>
                      <span className="text-gray-400">IMDb rating</span>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 mb-1">Released</h3>
                      <p>{selectedMovie.Released}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 mb-1">Runtime</h3>
                      <p>{selectedMovie.Runtime}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 mb-1">Genre</h3>
                      <p>{selectedMovie.Genre}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 mb-1">Director</h3>
                      <p>{selectedMovie.Director}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 mb-1">Cast</h3>
                      <p>{selectedMovie.Actors}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 mb-1">Plot</h3>
                      <p className="text-gray-300">{selectedMovie.Plot}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;