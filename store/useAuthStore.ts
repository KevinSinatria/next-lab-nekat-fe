import { authService } from "@/services/auth.service";
import { User } from "@/types/user";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { create } from "zustand";

export type LoginPayload = {
  username: string;
  password: string;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (user: LoginPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (data) => {
    try {
      const res = await authService.login(data);

      localStorage.setItem("authToken", res.data.token);
      set({
        user: { username: res.data.username, role: res.data.role },
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success("Login berhasil!");

      return true;
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(
          err.response?.data.message || "Terjadi kesalahan saat login!"
        );

        if (err.response?.status === 401) {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      }

      console.error(err);
      return false;
    }
  },
  logout: async () => {
    try {
      toast.loading("Melakukan logout...", { id: "logout" });
      localStorage.removeItem("authToken");
      toast.success("Logout berhasil!");
    } catch (err) {
      console.error(err);
      toast.dismiss("logout");
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
      toast.dismiss("logout");
    }
  },
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await authService.getProfile();

      set({ user: res.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },
}));
