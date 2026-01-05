// src/store/useFavorites.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const BASE_URL = "https://69538a2aa319a928023bc426.mockapi.io";

function getUser() {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

// ✅ Helper: Convert favoriteMovies sang Array
function normalizeFavorites(favoriteMovies) {
  if (Array.isArray(favoriteMovies)) {
    return favoriteMovies;
  }
  if (typeof favoriteMovies === 'string') {
    try {
      const parsed = JSON.parse(favoriteMovies);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// ✅ Helper: Convert Array sang format lưu trữ
function serializeFavorites(favorites) {
  // Nếu MockAPI chỉ chấp nhận Number, dùng String JSON
  return JSON.stringify(favorites);
}

export function useFavorites() {
  const queryClient = useQueryClient();
  const user = getUser();

  // ✅ Thêm phim vào yêu thích
  const addFavorite = useMutation({
    mutationFn: async (movieId) => {
      if (!user) throw new Error("Bạn cần đăng nhập!");

      const currentFavorites = normalizeFavorites(user.favoriteMovies);
      
      // Tránh duplicate
      if (currentFavorites.includes(movieId)) {
        throw new Error("Phim đã có trong danh sách yêu thích!");
      }

      const updatedFavorites = [...currentFavorites, movieId];

      const { data } = await axios.put(`${BASE_URL}/account/${user.id}`, {
        ...user,
        favoriteMovies: serializeFavorites(updatedFavorites),
      });

      // Normalize data trước khi lưu localStorage
      const normalizedUser = {
        ...data,
        favoriteMovies: normalizeFavorites(data.favoriteMovies)
      };
      
      setUser(normalizedUser);
      return normalizedUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });

  // ❌ Xóa phim khỏi yêu thích
  const removeFavorite = useMutation({
    mutationFn: async (movieId) => {
      if (!user) throw new Error("Bạn cần đăng nhập!");

      const currentFavorites = normalizeFavorites(user.favoriteMovies);
      const updatedFavorites = currentFavorites.filter((id) => id !== movieId);

      const { data } = await axios.put(`${BASE_URL}/account/${user.id}`, {
        ...user,
        favoriteMovies: serializeFavorites(updatedFavorites),
      });

      // Normalize data trước khi lưu localStorage
      const normalizedUser = {
        ...data,
        favoriteMovies: normalizeFavorites(data.favoriteMovies)
      };
      
      setUser(normalizedUser);
      return normalizedUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });

  // 🔍 Kiểm tra phim có trong yêu thích không
  const isFavorite = (movieId) => {
    if (!user) return false;
    const favorites = normalizeFavorites(user.favoriteMovies);
    return favorites.includes(movieId);
  };

  // 📋 Lấy danh sách ID phim yêu thích
  const getFavoriteIds = () => {
    if (!user) return [];
    return normalizeFavorites(user.favoriteMovies);
  };

  return {
    addFavorite: (movieId) => addFavorite.mutateAsync(movieId),
    removeFavorite: (movieId) => removeFavorite.mutateAsync(movieId),
    isFavorite,
    getFavoriteIds,
    isLoading: addFavorite.isPending || removeFavorite.isPending,
  };
}