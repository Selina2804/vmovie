import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://68faff8894ec96066024411b.mockapi.io";


function getUser() {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem("user");
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });
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
        avatar:
          "https://i.pinimg.com/736x/84/ab/e1/84abe170341d6b31c1ee14aa2eb37922.jpg",
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
  };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data } = await axios.put(`${BASE_URL}/account/${id}`, updates);

      setUser(data);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newName }) => {
      const updated = { username: newName };
      const { data } = await axios.put(`${BASE_URL}/account/${id}`, updated);

      setUser(data);
      return data;
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

    updateUser: (id, updates) =>
      updateUser.mutateAsync({ id, updates }),

    updateUsername: (newName) => {
      if (!user) return;
      return updateUsername.mutateAsync({ id: user.id, newName });
    },
  };
}
