import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://68ef4da1b06cc802829cd64a.mockapi.io/movies";

// Lấy toàn bộ phim
export const useMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        setMovies(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Lỗi tải dữ liệu phim");
        setLoading(false);
      });
  }, []);

  return { movies, loading, error };
};

// Lấy phim theo ID
export const useMovieById = (id) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/${id}`)
      .then((res) => {
        setMovie(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Lỗi tải dữ liệu phim");
        setLoading(false);
      });
  }, [id]);

  return { movie, loading, error };
};
