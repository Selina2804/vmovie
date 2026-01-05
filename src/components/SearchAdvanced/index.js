// src/components/SearchAdvanced/index.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const SearchAdvanced = ({ movies, onSearch }) => {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [filters, setFilters] = useState({
    keyword: '',
    genre: 'all',
    year: 'all',
    country: 'all',
    sortBy: 'newest'
  });
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Extract unique values from movies
  const genres = [...new Set(movies.flatMap(m => m.genre.split(',').map(g => g.trim())))];
  const years = [...new Set(movies.map(m => new Date(m.releaseDate || 2024).getFullYear()))].sort((a, b) => b - a);
  const countries = [...new Set(movies.map(m => m.country || 'Việt Nam'))];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    if (filters.keyword.length > 1) {
      const filtered = movies
        .filter(m => 
          m.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          m.engTitle.toLowerCase().includes(filters.keyword.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [filters.keyword, movies]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    let result = [...movies];

    // Filter by keyword
    if (filters.keyword) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        m.engTitle.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        m.description.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    // Filter by genre
    if (filters.genre !== 'all') {
      result = result.filter(m => m.genre.includes(filters.genre));
    }

    // Filter by year
    if (filters.year !== 'all') {
      result = result.filter(m => 
        new Date(m.releaseDate || 2024).getFullYear() === parseInt(filters.year)
      );
    }

    // Filter by country
    if (filters.country !== 'all') {
      result = result.filter(m => m.country === filters.country);
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.releaseDate || 0) - new Date(b.releaseDate || 0));
        break;
      case 'rating':
        result.sort((a, b) => {
          const avgA = a.ratings?.length ? a.ratings.reduce((s, r) => s + r, 0) / a.ratings.length : 0;
          const avgB = b.ratings?.length ? b.ratings.reduce((s, r) => s + r, 0) / b.ratings.length : 0;
          return avgB - avgA;
        });
        break;
      case 'views':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    onSearch(result);
    setShowSuggestions(false);
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      genre: 'all',
      year: 'all',
      country: 'all',
      sortBy: 'newest'
    });
    onSearch(movies);
    setShowSuggestions(false);
  };

  const selectSuggestion = (movie) => {
    setShowSuggestions(false);
    navigate(`/chi-tiet/${movie.id}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  return (
    <div className="search-advanced">
      <div className="search-container">
        {/* Search Box with Autocomplete */}
        <div className="search-box-wrapper" ref={searchRef}>
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm phim, diễn viên, đạo diễn..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => filters.keyword && suggestions.length > 0 && setShowSuggestions(true)}
            />
            {filters.keyword && (
              <button 
                className="clear-search-btn"
                onClick={() => handleFilterChange('keyword', '')}
              >
                ✕
              </button>
            )}
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              <div className="suggestions-header">
                <span className="suggestions-title">Gợi ý tìm kiếm</span>
                <span className="suggestions-count">{suggestions.length} kết quả</span>
              </div>
              {suggestions.map(movie => (
                <div
                  key={movie.id}
                  className="suggestion-item"
                  onClick={() => selectSuggestion(movie)}
                >
                  <div className="suggestion-poster">
                    <img src={movie.image} alt={movie.title} />
                    <div className="suggestion-play-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                  </div>
                  <div className="suggestion-info">
                    <h4 className="suggestion-title">{movie.title}</h4>
                    <p className="suggestion-subtitle">{movie.engTitle}</p>
                    <div className="suggestion-meta">
                      <span className="meta-item">
                        <span className="meta-icon">⭐</span>
                        {movie.ratings?.length 
                          ? (movie.ratings.reduce((s, r) => s + r, 0) / movie.ratings.length).toFixed(1)
                          : 'N/A'}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        {new Date(movie.releaseDate || 2024).getFullYear()}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        {movie.duration}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="suggestions-footer">
                <button className="view-all-btn" onClick={applyFilters}>
                  Xem tất cả kết quả →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="filters-grid">
          <select
            value={filters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="filter-select"
          >
            <option value="all">🎭 Tất cả thể loại</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="filter-select"
          >
            <option value="all">📅 Tất cả năm</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="filter-select"
          >
            <option value="all">🌍 Tất cả quốc gia</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="newest">🆕 Mới nhất</option>
            <option value="oldest">📜 Cũ nhất</option>
            <option value="rating">⭐ Đánh giá cao</option>
            <option value="views">👁️ Lượt xem</option>
            <option value="name">🔤 Tên A-Z</option>
          </select>
        </div>

        <div className="action-buttons">
          <button className="btn-search" onClick={applyFilters}>
            🔍 Tìm kiếm
          </button>
          <button className="btn-reset" onClick={handleReset}>
            🔄 Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAdvanced;