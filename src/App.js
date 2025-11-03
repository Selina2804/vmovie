import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AllMovies from "./pages/AllMovie";
import MovieDetail from "./pages/Detail";
import WatchMovie from "./pages/Watch";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { MovieProvider } from "./context/MovieContext";
import AdminLayout from "./pages/Admin";
import ManageMovies from "./pages/Admin/Movie";
import ManageAccounts from "./pages/Admin/Account";
import "./App.css";

function App() {
  const location = useLocation();


  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <MovieProvider>
      {/* Nếu KHÔNG phải admin thì mới hiện header/footer */}
      {!isAdminRoute && <Header />}

      <div className="main-content">
        <Routes>
          {/*Trang người dùng */}
          <Route path="/" element={<Home />} />
          <Route path="/danh-sach" element={<AllMovies />} />
          <Route path="/thong-tin/:id" element={<MovieDetail />} />
          <Route path="/xem-phim/:id" element={<WatchMovie />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/*Trang Admin riêng biệt */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="movies" element={<ManageMovies />} />
            <Route path="accounts" element={<ManageAccounts />} />
          </Route>
        </Routes>
      </div>

      {/* Chỉ hiển thị Footer nếu không phải Admin */}
      {!isAdminRoute && <Footer />}
    </MovieProvider>
  );
}

export default App;
