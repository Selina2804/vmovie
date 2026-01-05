// src/pages/Home/index.js
import React from "react";
import Banner from "../../components/Banner";
import MovieList from "../../components/MovieList";
import ContinueWatching from "../../components/ContinueWatching"; // ⭐ MỚI
import { useAuth } from "../../store/useAuth"; // ⭐ MỚI
import "./style.css";

function Home() {
  const { user } = useAuth(); // ⭐ MỚI - Check user đăng nhập

  return (
    <div className="home-page">
      <Banner />
      
      {/* ⭐ MỚI - Hiển thị Continue Watching nếu user đã đăng nhập */}
      {user && <ContinueWatching limit={10} showTitle={true} />}
      
      <MovieList />
    </div>
  );
}

export default Home;