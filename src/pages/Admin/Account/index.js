import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Account.css";

const BASE_URL = "https://68ef4da1b06cc802829cd64a.mockapi.io";

export default function AccountManager() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/account`);
        setUsers(response.data);
      } catch (error) {
        console.error("Lỗi khi tải người dùng:", error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải danh sách người dùng',
          confirmButtonText: 'OK'
        });
      }
    };
    fetchUsers();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Tên người dùng là bắt buộc";
    } else if (form.username.length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    } else if (users.find(u => u.email === form.email && u.id !== form.id)) {
      newErrors.email = "Email đã tồn tại";
    }

    if (!isEditing && !form.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (!isEditing && form.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng kiểm tra lại các trường thông tin',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/account`, form);
      setUsers([...users, response.data]);
      resetForm();
      setShowModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã thêm người dùng mới',
        confirmButtonText: 'OK',
        timer: 2000
      });
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      let errorMessage = 'Không thể thêm người dùng';
      
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại. Vui lòng kiểm tra đường dẫn.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEdit = (user) => {
    setForm({...user, password: ""}); 
    setIsEditing(true);
    setShowModal(true);
    setErrors({});
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng kiểm tra lại các trường thông tin',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
    
      const updateData = { ...form };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await axios.put(`${BASE_URL}/account/${form.id}`, updateData);
      setUsers(users.map((u) => (u.id === form.id ? response.data : u)));
      resetForm();
      setShowModal(false);
      setIsEditing(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã cập nhật thông tin người dùng',
        confirmButtonText: 'OK',
        timer: 2000
      });
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      let errorMessage = 'Không thể cập nhật người dùng';
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy người dùng hoặc endpoint không tồn tại';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Lỗi cập nhật!',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (id) => {
    const userToDelete = users.find(u => u.id === id);
    
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      html: `Bạn muốn xóa người dùng <strong>"${userToDelete.username}"</strong>?<br/>Hành động này không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      focusCancel: true
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/account/${id}`);
        setUsers(users.filter((u) => u.id !== id));
        
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Người dùng đã được xóa thành công',
          confirmButtonText: 'OK',
          timer: 2000
        });
      } catch (error) {
        console.error(error);
        let errorMessage = 'Không thể xóa người dùng';
        
        if (error.response?.status === 404) {
          errorMessage = 'Không tìm thấy người dùng để xóa';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const resetForm = () =>
    setForm({ id: null, username: "", email: "", password: "", role: "user" });

  const closeModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(false);
    setErrors({});
  };

  return (
    <section className="account-manager">
      <h1>Quản lý tài khoản</h1>

      <div className="top-info">
        <button className="btn-add" onClick={() => setShowModal(true)}>
          Thêm người dùng
        </button>
        <p className="user-count">
          Tổng số người dùng: <span>{users.length}</span>
        </p>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="account-modal">
            <h3>{isEditing ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}</h3>

            <div className="form-add-edit">
              <div className="form-group">
                <label htmlFor="username">Tên người dùng *</label>
                <input
                  id="username"
                  name="username"
                  placeholder="Nhập tên người dùng"
                  value={form.username}
                  onChange={handleChange}
                  className={errors.username ? "error" : ""}
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  placeholder="Nhập email"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Mật khẩu {!isEditing && "*"}
                  {isEditing && <small> (Để trống nếu không đổi)</small>}
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder={isEditing ? "Nhập mật khẩu mới (không bắt buộc)" : "Nhập mật khẩu"}
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="role">Vai trò</label>
                <select 
                  id="role"
                  name="role" 
                  value={form.role} 
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-actions">
                {isEditing ? (
                  <button className="btn-edit" onClick={handleUpdate}>
                    Cập nhật
                  </button>
                ) : (
                  <button className="btn-add" onClick={handleAdd}>
                    Thêm
                  </button>
                )}
                <button className="btn-cancel" onClick={closeModal}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="no-data">
          <p>Chưa có người dùng nào.</p>
        </div>
      ) : (
        <table className="account-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role}`}>
                    {u.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEdit(u)}>
                      Sửa
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(u.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}