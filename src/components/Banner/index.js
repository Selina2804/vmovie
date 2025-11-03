import React, { useState, useEffect } from "react";
import "./style.css";
import { FaPlay, FaHeart } from "react-icons/fa";
import { useMovies } from "../../context/MovieContext";
import { useNavigate } from "react-router-dom";

function Banner() {
  const { allMovies } = useMovies();
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!allMovies.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % allMovies.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [allMovies.length]);

  if (!allMovies.length) return null;

  const movie = allMovies[index];

  return (
    <section
      className="banner fade"
      style={{
        backgroundImage: `url('${movie.banner || movie.image}')`,
      }}
    >
      <div className="overlay"></div>

      <div className="banner-info animate-content">
        <h1 className="banner-title">{movie.title}</h1>
        <p className="banner-subtitle">{movie.engTitle}</p>

        <div className="banner-tags">
          <span>{movie.country}</span>
          <span>{movie.duration}</span>
          <span>{movie.year}</span>
        </div>

        <div className="banner-genres">
          {movie.genre?.split(",").map((g, i) => (
            <span key={i}>{g.trim()}</span>
          ))}
        </div>

        <p className="banner-desc">{movie.description}</p>

        <div className="banner-buttons">
          <button
            className="play-btn"
            onClick={() => navigate(`/xem-phim/${movie.id}`)}
          >
            <FaPlay /> Xem phim
          </button>

          <button className="fav-btn">
            <FaHeart />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Banner;
