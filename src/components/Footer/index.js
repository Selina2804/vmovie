import React from "react";
import "./style.css";
import logo from "../../assets/vmovie.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={logo} alt="MovieZone Logo" />
        </div>

        <div className="footer-links">
          <Link>Trang chủ</Link>
          <Link>Thể loại</Link>
          <Link to="/gioi-thieu">Giới thiệu</Link>
          <Link to="/lien-he">Liên hệ</Link>
        </div>

        <div className="footer-copy">
          © {new Date().getFullYear()} MovieZone. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;
