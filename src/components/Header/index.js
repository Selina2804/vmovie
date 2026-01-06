// src/components/Header/index.js - FIXED VERSION
import React, { useEffect, useState, useRef } from "react";
import "./style.css";
import { FaUser, FaHeart } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import logo from "../../assets/vmovie.png";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../store/useAuth";
import { useFavorites } from "../../store/useFavorites";
import Swal from "sweetalert2";
import axios from "axios";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileCountry, setShowMobileCountry] = useState(false);
  const [allMovies, setAllMovies] = useState([]); // ✅ Đã khởi tạo array
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user, logout, updateUsername } = useAuth();
  const { getFavoriteIds } = useFavorites();

  const countryRef = useRef(null);
  const searchRef = useRef(null);

  // Lấy số lượng phim yêu thích
  const favoriteCount = getFavoriteIds().length;

  // Lấy dữ liệu phim từ MockAPI
  useEffect(() => {
    axios
      .get("https://69538a2aa319a928023bc426.mockapi.io/movies")
      .then((res) => {
        // ✅ Đảm bảo data là array
        setAllMovies(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải dữ liệu phim:", err);
        setAllMovies([]); // ✅ Set array rỗng khi lỗi
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        countryRef.current &&
        !countryRef.current.contains(e.target)
      ) {
        setShowCountryDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSuggestions([]);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim() === "") {
      setSuggestions([]);
    } else {
      // ✅ Kiểm tra allMovies trước khi filter
      if (Array.isArray(allMovies) && allMovies.length > 0) {
        const filtered = allMovies.filter(
          (m) =>
            m.title.toLowerCase().includes(value.toLowerCase()) ||
            m.engTitle.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 6));
      }
    }
  };

  const handleSelectSuggestion = (movie) => {
    setQuery("");
    setSuggestions([]);
    navigate(`/thong-tin/${movie.id}`);
  };

  const handleChangeName = async () => {
    const { value: newName } = await Swal.fire({
      title: "Đổi tên người dùng",
      input: "text",
      inputLabel: "Nhập tên mới của bạn",
      inputValue: user.username,
      showCancelButton: true,
      confirmButtonColor: "#ff5c5c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Lưu",
      cancelButtonText: "Hủy",
      inputValidator: (value) => {
        if (!value) {
          return "Tên không được để trống!";
        }
      },
    });

    if (newName) {
      try {
        await updateUsername(newName);
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: `Tên đã được đổi thành "${newName}"`,
          confirmButtonColor: "#4caf50",
          timer: 2000,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể đổi tên. Vui lòng thử lại!",
          confirmButtonColor: "#ff5c5c",
        });
      }
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc muốn đăng xuất?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff5c5c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          icon: "success",
          title: "Đã đăng xuất!",
          text: "Hẹn gặp lại bạn!",
          confirmButtonColor: "#4caf50",
          timer: 1500,
        });
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    });
  };

  // ✅ FIX: Đảm bảo allMovies luôn là array trước khi map
  const countries = [...new Set((Array.isArray(allMovies) ? allMovies : []).map((m) => m.country))];

  if (loading) {
    return (
      <header className="header">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <span style={{ color: "#fff" }}>Đang tải dữ liệu phim...</span>
      </header>
    );
  }

  return (
    <>
      <header className={`header ${isScrolled ? "scrolled" : ""}`}>
        {/* LEFT */}
        <div className="header-left">
          <div className="logo" onClick={() => navigate("/")}>
            <img src={logo} alt="logo" />
          </div>

          {/* SEARCH BAR */}
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
        </div>

        {/* NAVIGATION */}
        <nav className="nav">
          <a href="/">Trang Chủ</a>
          <a href="/danh-sach">Danh Sách</a>
          
          <Link to="/xu-huong">Trending</Link>

          {/* DROPDOWN QUỐC GIA */}
          <div
            className="dropdown-click"
            ref={countryRef}
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          >
            <span>
              Quốc Gia {showCountryDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
            {showCountryDropdown && (
              <div
                className="dropdown-menu-large"
                style={{
                  marginTop: "5px",
                  background: "rgba(20, 20, 20, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {countries.map((c) => (
                  <div
                    key={c}
                    className="dropdown-item"
                    onClick={() => navigate(`/danh-sach?quocgia=${c}`)}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* USER SECTION */}
        <div className={`header-right ${isMobileMenuOpen ? "hidden" : ""}`}>
          {user ? (
            <div className="user-menu" onClick={() => setShowMenu(!showMenu)}>
              <img src={user.avatar} alt="avatar" className="avatar" />
              <span>{user.username}</span>
              <IoIosArrowDown />
              {showMenu && (
                <div className="dropdown-menu">
                  <button onClick={() => navigate("/ho-so")}>👤 Hồ sơ</button>
                  <button onClick={() => navigate("/yeu-thich")}>
                    ❤️ Yêu thích {favoriteCount > 0 && `(${favoriteCount})`}
                  </button>
                  <button onClick={() => navigate("/lich-su")}>📺 Lịch sử xem</button>
                  {user.role === "admin" && (
                    <button onClick={() => navigate("/admin")}>⚙️ Quản lý</button>
                  )}
                  <button onClick={handleChangeName}>✏️ Đổi tên</button>
                  <button onClick={handleLogout}>🚪 Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => navigate("/login")}>
              <FaUser /> Đăng nhập
            </button>
          )}
        </div>

        {/* ICON MENU MOBILE */}
        <div
          className={`mobile-menu-icon ${isMobileMenuOpen ? "hidden" : ""}`}
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            x
          </button>

          <a href="/">Trang Chủ</a>
          <a href="/danh-sach">Danh Sách</a>
         
          <Link to="/xu-huong" onClick={() => setIsMobileMenuOpen(false)}>Trending</Link>

          {/* YÊU THÍCH MOBILE */}
          {user && (
            <a href="/yeu-thich" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FaHeart style={{ color: "#ff4757" }} /> Yêu thích
              {favoriteCount > 0 && (
                <span style={{
                  background: "#ff4757",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 8px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {favoriteCount}
                </span>
              )}
            </a>
          )}

          <div className="mobile-dropdown">
            <span onClick={() => setShowMobileCountry(!showMobileCountry)}>
              Quốc Gia {showMobileCountry ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
            {showMobileCountry &&
              countries.map((c) => (
                <div
                  key={c}
                  className="dropdown-item"
                  onClick={() => {
                    navigate(`/danh-sach?quocgia=${c}`);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {c}
                </div>
              ))}
          </div>

          <div className="mobile-user-section">
            {user ? (
              <>
                <div className="mobile-user">
                  <img src={user.avatar} alt="avatar" className="avatar" />
                  <span>{user.username}</span>
                </div>

                <button
                  className="profile-btn"
                  onClick={() => {
                    navigate("/ho-so");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  👤 Hồ sơ
                </button>

                <button
                  className="favorite-btn"
                  onClick={() => {
                    navigate("/yeu-thich");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  ❤️ Yêu thích {favoriteCount > 0 && `(${favoriteCount})`}
                </button>

                <button
                  className="history-btn"
                  onClick={() => {
                    navigate("/lich-su");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  📺 Lịch sử xem
                </button>

                {user.role === "admin" && (
                  <button
                    className="admin-btn"
                    onClick={() => {
                      navigate("/admin");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    ⚙️ Quản lý
                  </button>
                )}

                <button
                  className="logout-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  🚪 Đăng xuất
                </button>
              </>
            ) : (
              <button
                className="login-btn mobile-login"
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
              >
                <FaUser /> Đăng nhập
              </button>
            )}
          </div>
        </div>
      )}

      {/* CSS CHO BADGE */}
      <style>{`
        .favorite-link {
          position: relative;
        }
        
        .favorite-badge {
          position: absolute;
          top: -8px;
          right: -10px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: bold;
          min-width: 18px;
          text-align: center;
        }

        .favorite-link:hover .favorite-badge {
          background: #ee5a6f;
        }
      `}</style>
    </>
  );
}

export default Header;