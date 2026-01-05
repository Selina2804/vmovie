import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../styles/Auth.css";
import loginbanner from "../assets/banner-login.jpg";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Lấy token từ URL
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!token) {
      alert("Link không hợp lệ hoặc đã hết hạn!");
      return;
    }

    try {
      // TODO: Gọi API reset password
      // await apiService.resetPassword(token, data.password);
      
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      alert("Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (err) {
      alert(err.message || "Đặt lại mật khẩu thất bại");
    }
  };

  return (
    <div className="container">
      <div className="auth-wrapper">
        <div className="auth-image">
          <img src={loginbanner} alt="Reset Password illustration" />
        </div>
        <div className="auth-container">
          <h2>Đặt lại mật khẩu</h2>
          <p style={{ marginBottom: "1.5rem", color: "#666", fontSize: "0.95rem" }}>
            Nhập mật khẩu mới của bạn.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <label>Mật khẩu mới</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Nhập mật khẩu mới",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                placeholder="Nhập mật khẩu mới"
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
                  padding: "0",
                }}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}

            <label>Xác nhận mật khẩu mới</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Nhập lại mật khẩu",
                  validate: (value) =>
                    value === password || "Mật khẩu xác nhận không khớp",
                })}
                placeholder="Nhập lại mật khẩu mới"
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
                  padding: "0",
                }}
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword.message}</p>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;