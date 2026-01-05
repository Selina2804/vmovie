import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth"; 
import "../styles/Auth.css";
import loginbanner from "../assets/banner-login.jpg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", password: "" } });

  // Lắng nghe sự thay đổi của user trong zustand
  useEffect(() => {
    if (auth.user) {
      if (auth.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [auth.user, navigate]);

  const onSubmit = async (data) => {
    try {
      // Đăng nhập và cập nhật người dùng trong zustand
      await auth.login(data.email.trim(), data.password.trim());
    } catch (err) {
      alert(err.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="container">
      <div className="auth-wrapper">
        <div className="auth-image">
          <img src={loginbanner} alt="Login illustration" />
        </div>
        <div className="auth-container">
          <h2>Đăng nhập</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <label>Email</label>
            <input
              {...register("email", { required: "Nhập email" })}
              placeholder="Nhập email"
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}

            <label>Mật khẩu</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Nhập mật khẩu" })}
                placeholder="Nhập mật khẩu"
                style={{ width: "100%", paddingRight: "45px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  padding: "0"
                }}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}

            <p style={{ textAlign: "right", marginTop: "0.5rem", marginBottom: "1rem" }}>
              <Link 
                to="/forgot-password" 
                style={{ color: "#666", fontSize: "0.9rem", textDecoration: "none" }}
              >
                Quên mật khẩu?
              </Link>
            </p>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="another-form">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </p>

          {/*Ghi chú tài khoản admin */}
          <div
            className="admin-note"
            style={{
              marginTop: "1rem",
              fontSize: "0.9rem",
              color: "#ccc",
              textAlign: "left",
            }}
          >
            Tài khoản admin mặc định để truy cập trang quản trị:
            <br />
            Email: <strong>admin@gmail.com</strong> <br />
            Mật khẩu: <strong>admin123</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;