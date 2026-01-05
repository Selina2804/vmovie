import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// ✅ FIX: ĐỔI SANG PROJECT ĐÚNG
const BASE_URL = "https://69538a2aa319a928023bc426.mockapi.io";

function getUser() {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
  // ✅ Dispatch event để các component khác cập nhật
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'user',
    newValue: JSON.stringify(user)
  }));
}

function clearUser() {
  localStorage.removeItem("user");
  // ✅ Dispatch event khi xóa
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'user',
    newValue: null
  }));
}

export function useCurrentUser() {
  const queryClient = useQueryClient();

  // ✅ Query luôn lấy user mới nhất từ localStorage
  const query = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
    // ✅ Luôn lấy dữ liệu mới, không cache cũ
    staleTime: 0,
    gcTime: 0,
  });

  // ✅ Lắng nghe thay đổi localStorage để tự động cập nhật
  useEffect(() => {
    const handleStorageChange = () => {
      queryClient.invalidateQueries(["user"]);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [queryClient]);

  return query;
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, username }) => {
      const { data } = await axios.post(`${BASE_URL}/account`, {
        email,
        password,
        username,
        role: "user",
        avatar: "https://i.pravatar.cc/150?img=12",
        favoriteMovies: [], // ✅ Khởi tạo mảng yêu thích rỗng
      });

      setUser(data);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await axios.get(`${BASE_URL}/account`);

      const foundUser = data.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );

      if (!foundUser) throw new Error("Sai email hoặc mật khẩu");

      // ✅ Đảm bảo có favoriteMovies
      if (!foundUser.favoriteMovies) {
        foundUser.favoriteMovies = [];
      }

      setUser(foundUser);
      return foundUser;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    clearUser();
    queryClient.invalidateQueries(["user"]);
    // ✅ Clear toàn bộ cache
    queryClient.clear();
  };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      console.log("🔄 Đang cập nhật user:", id, updates);
      console.log("🌐 API URL:", `${BASE_URL}/account/${id}`);
      
      try {
        // Lấy user hiện tại từ API
        const currentUserResponse = await axios.get(`${BASE_URL}/account/${id}`);
        const currentUser = currentUserResponse.data;
        
        console.log("📦 User hiện tại từ API:", currentUser);

        // Merge dữ liệu cũ với dữ liệu mới
        const updatedData = {
          ...currentUser,
          ...updates,
        };

        console.log("✏️ Dữ liệu sẽ cập nhật:", updatedData);

        // Gọi API PUT để cập nhật
        const { data } = await axios.put(
          `${BASE_URL}/account/${id}`,
          updatedData
        );

        console.log("✅ API trả về sau khi cập nhật:", data);

        // Lưu vào localStorage
        setUser(data);
        
        return data;
      } catch (error) {
        console.error("❌ Lỗi khi cập nhật user:", error);
        console.error("Chi tiết lỗi:", error.response?.data || error.message);
        
        // Nếu API lỗi, cập nhật localStorage trực tiếp (fallback)
        const currentUser = getUser();
        if (currentUser && currentUser.id === id) {
          const updatedUser = { ...currentUser, ...updates };
          setUser(updatedUser);
          console.log("⚠️ Đã fallback sang localStorage:", updatedUser);
          return updatedUser;
        }
        
        throw error;
      }
    },

    onSuccess: (data) => {
      console.log("🎉 Cập nhật thành công! Data mới:", data);
      queryClient.invalidateQueries(["user"]);
    },

    onError: (error) => {
      console.error("💥 onError được gọi:", error);
    },
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newName }) => {
      console.log("🔄 Đang cập nhật username:", id, newName);
      
      try {
        // ✅ Lấy user hiện tại trước
        const currentUserResponse = await axios.get(`${BASE_URL}/account/${id}`);
        const currentUser = currentUserResponse.data;
        
        // ✅ Merge với dữ liệu mới
        const updatedData = {
          ...currentUser,
          username: newName
        };
        
        const { data } = await axios.put(`${BASE_URL}/account/${id}`, updatedData);
        setUser(data);
        console.log("✅ Cập nhật username thành công:", data);
        return data;
      } catch (error) {
        console.error("❌ Lỗi khi cập nhật username:", error);
        
        // Fallback
        const currentUser = getUser();
        if (currentUser && currentUser.id === id) {
          const updatedUser = { ...currentUser, username: newName };
          setUser(updatedUser);
          console.log("⚠️ Đã fallback username sang localStorage:", updatedUser);
          return updatedUser;
        }
        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });
}

export function useAuth() {
  const { data: user } = useCurrentUser();
  const register = useRegister();
  const login = useLogin();
  const logout = useLogout();
  const updateUser = useUpdateUser();
  const updateUsername = useUpdateUsername();

  return {
    user,
    register: (email, pass, name) =>
      register.mutateAsync({ email, password: pass, username: name }),

    login: (email, pass) => login.mutateAsync({ email, password: pass }),

    logout: () => logout(),

    updateUser: (id, updates) => {
      console.log("🎯 useAuth.updateUser được gọi với:", { id, updates });
      return updateUser.mutateAsync({ id, updates });
    },

    updateUsername: (newName) => {
      if (!user) return;
      return updateUsername.mutateAsync({ id: user.id, newName });
    },
  };
}