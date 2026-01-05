import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import "../styles/Auth.css";
import loginbanner from "../assets/banner-login.jpg";

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // TODO: Gọi API gửi email reset password
      // await apiService.forgotPassword(data.email);
      
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      alert("Email khôi phục mật khẩu đã được gửi!");
    } catch (err) {
      alert(err.message || "Gửi email thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-wrapper">
        <div className="auth-image">
          <img src={loginbanner} alt="Forgot Password illustration" />
        </div>
        <div className="auth-container">
          <h2>Quên mật khẩu</h2>
          {!emailSent ? (
            <>
              <p style={{ marginBottom: "1.5rem", color: "#666", fontSize: "0.95rem" }}>
                Nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                <label>Email</label>
                <input
                  {...register("email", {
                    required: "Nhập email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email không hợp lệ",
                    },
                  })}
                  placeholder="Nhập email của bạn"
                />
                {errors.email && (
                  <p className="error-text">{errors.email.message}</p>
                )}

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : "Gửi link khôi phục"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div
                style={{
                  fontSize: "3rem",
                  color: "#4CAF50",
                  marginBottom: "1rem",
                }}
              >
                ✓
              </div>
              <p style={{ fontSize: "1.1rem", color: "#333", marginBottom: "0.5rem" }}>
                Email đã được gửi!
              </p>
              <p style={{ color: "#666", fontSize: "0.95rem" }}>
                Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.
              </p>
            </div>
          )}

          <p className="another-form">
            Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;