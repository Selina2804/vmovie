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
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { MovieProvider } from "./context/MovieContext";
import AdminLayout from "./pages/Admin";
import ManageMovies from "./pages/Admin/Movie";
import ManageAccounts from "./pages/Admin/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import History from "./pages/History";
import Profile from "./pages/Profile";
import FavoritePage from "./pages/Favorite";
import Trending from './pages/Trending';
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/gioi-thieu" element={<About />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/lich-su" element={<History />} />      {/* ← THÊM */}
          <Route path="/ho-so" element={<Profile />} />        {/* ← THÊM */}
          <Route path="/yeu-thich" element={<FavoritePage />} />{/* ← THÊM */}
          
          
          <Route path="/xu-huong" element={<Trending />} />
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