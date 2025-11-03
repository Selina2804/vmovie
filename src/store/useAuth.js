import { create } from "zustand";
import axios from "axios";

const BASE_URL = "https://68faff8894ec96066024411b.mockapi.io";

export const useAuth = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null, 

  
  register: async (email, password, username) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/account`, {
        email,
        password,
        username,
        role: "user", 
      });

      localStorage.setItem("user", JSON.stringify(data));

      set({ user: data });

      return data;
    } catch (error) {
      console.error("Đăng ký thất bại: ", error);
      throw new Error("Đăng ký thất bại"); 
    }
  },

  login: async (email, password) => {
    try {

      const { data } = await axios.get(`${BASE_URL}/account`);
      
  
      console.log("Dữ liệu người dùng từ Mock API: ", data);

      const foundUser = data.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      console.log("Người dùng tìm thấy: ", foundUser); 

      if (!foundUser) throw new Error("Sai email hoặc mật khẩu");

      localStorage.setItem("user", JSON.stringify(foundUser));
      set({ user: foundUser });

      return foundUser;
    } catch (error) {
      console.error("Đăng nhập thất bại: ", error);
      throw new Error("Sai email hoặc mật khẩu"); 
    }
  },

  logout: () => {
    localStorage.removeItem("user"); 
    set({ user: null }); 
  },

  updateUser: async (id, updates) => {
    try {
      const { data } = await axios.put(`${BASE_URL}/account/${id}`, updates);
      if (JSON.parse(localStorage.getItem("user"))?.id === id) {
        localStorage.setItem("user", JSON.stringify(data));
        set({ user: data });
      }
      return data;
    } catch (error) {
      console.error("Cập nhật người dùng thất bại: ", error);
      throw new Error("Cập nhật thất bại");
    }
  },

  updateUsername: async (newName) => {
    set((state) => {
      if (!state.user) return {};
      const updated = { ...state.user, username: newName };
      axios.put(`${BASE_URL}/account/${state.user.id}`, updated);
      localStorage.setItem("user", JSON.stringify(updated));
      return { user: updated };
    });
  },
}));
