import React, { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../components/Header/style.css";

const SearchBar = ({ allMovies }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = allMovies.filter(
      (m) =>
        m.title?.toLowerCase().includes(value.toLowerCase()) ||
        m.engTitle?.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 6));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSuggestions([]);
      setQuery("");
    }
  };

  const handleSelectSuggestion = (movie) => {
    setQuery("");
    setSuggestions([]);
    navigate(`/thong-tin/${movie.id}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <form className="search-bar" onSubmit={handleSearch} ref={searchRef}>
      <FiSearch className="search-icon" />
      <input
        type="text"
        placeholder="Tìm kiếm phim..."
        className="search-input"
        value={query}
        onChange={handleChange}
      />

      {query.trim() !== "" && (
        <div className="search-suggestion-box">
          <p className="suggestion-title">Danh sách phim</p>
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map((movie) => (
                <li
                  key={movie.id}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(movie)}
                >
                  <img src={movie.image} alt={movie.title} />
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                    <p>{movie.engTitle}</p>
                    <span>
                      {movie.year} • {movie.duration}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">Không tìm thấy phim phù hợp.</div>
          )}

          <button
            type="button"
            className="see-all-btn"
            onClick={() => {
              navigate(`/danh-sach?search=${encodeURIComponent(query.trim())}`);
              setSuggestions([]);
              setQuery("");
            }}
          >
            Toàn bộ kết quả
          </button>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
