import React, { useState, useRef, useEffect } from "react";
import "./style.css";
import logoAdmin from "../../assets/anime.jpg";
import { useNavigate } from "react-router-dom";
import { PiBellFill } from "react-icons/pi";
import { FaGear } from "react-icons/fa6";
import Dashboard from "./Dashboard";
import MovieManager from "./Movie";
import AccountManager from "./Account";
import { useAuth } from "../../store/useAuth";

/*SIDEBAR */
function Sidebar({ onMenuChange, active }) {
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/");

  return (
    <aside className="admin-sidenav">
      <div className="sidenav-header">
        <img src={logoAdmin} alt="logo" className="sidenav-logo" />
        <h2 className="sidenav-title">
          Movie<span>Admin</span>
        </h2>
      </div>

      <nav className="sidenav-menu">
        <a className={active === "dashboard" ? "active" : ""} onClick={() => onMenuChange("dashboard")}>
          🏠 Dashboard
        </a>
        <a className={active === "movies" ? "active" : ""} onClick={() => onMenuChange("movies")}>
          🎬 Quản lý phim
        </a>
        <a className={active === "accounts" ? "active" : ""} onClick={() => onMenuChange("accounts")}>
          👤 Quản lý tài khoản
        </a>
        <a onClick={handleGoHome} className="home-link">
          🏡 Xem trang chủ
        </a>
      </nav>
    </aside>
  );
}

/*NAVBAR */
function Navbar({ title }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất không?")) {
      localStorage.removeItem("user");
      logout(); 
      navigate("/login");
    }
  };

  return (
    <header className="admin-navbar">
      <div className="navbar-left">
        <h3>{title}</h3>
      </div>

      <div className="navbar-right">
        <input type="text" placeholder="Tìm kiếm..." className="search-input" />
        <button className="icon-btn">
          <PiBellFill />
        </button>
        <button className="icon-btn">
          <FaGear />
        </button>

        <div className="navbar-avatar-wrapper" ref={dropdownRef}>
          <img
            src={logoAdmin}
            alt="user avatar"
            className="navbar-avatar"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="avatar-dropdown">
              <button className="dropdown-item" onClick={() => alert("Chức năng đổi tên sẽ thêm sau!")}>
                Đổi tên
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/*MAIN ADMIN */
export default function AdminLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  let pageTitle = "Dashboard";
  let PageContent = <Dashboard />;

  if (activePage === "movies") {
    pageTitle = "Quản lý phim";
    PageContent = <MovieManager />;
  } else if (activePage === "accounts") {
    pageTitle = "Quản lý tài khoản";
    PageContent = <AccountManager />;
  }

  return (
    <div className="admin-layout">
      <Sidebar onMenuChange={setActivePage} active={activePage} />
      <main className="admin-content">
        <Navbar title={pageTitle} />
        {PageContent}
        <footer className="admin-footer">
          © {new Date().getFullYear()} — Movie Admin Dashboard 
        </footer>
      </main>
    </div>
  );
}
