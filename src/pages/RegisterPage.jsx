import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";
import "../styles/Auth.css";
import loginbanner from "../assets/banner-login.jpg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const RegisterPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await auth.register(data.email, data.password, data.username);
      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      alert("Đăng ký thất bại");
    }
  };

  return (
    <div className="container">
      <div className="auth-wrapper">
        <div className="auth-image">
          <img src={loginbanner} alt="Login illustration" />
        </div>
        <div className="auth-container">
          <h2>Đăng ký</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <label>Tên người dùng</label>
            <input
              {...register("username", { required: "Nhập tên người dùng" })}
              placeholder="Nhập tên người dùng"
            />
            {errors.username && (
              <p className="error-text">{errors.username.message}</p>
            )}

            <label>Email</label>
            <input
              {...register("email", {
                required: "Nhập email",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ",
                },
              })}
              placeholder="Nhập email"
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}

            <label>Mật khẩu</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Nhập mật khẩu",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
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

            <label>Xác nhận mật khẩu</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", { required: "Nhập lại mật khẩu" })}
                placeholder="Nhập lại mật khẩu"
                style={{ width: "100%", paddingRight: "45px" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword.message}</p>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đăng đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <p className="another-form">
            Đã có tài khoản?{" "}
            <Link to="/login">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;