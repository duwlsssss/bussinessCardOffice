import {create} from 'zustand';
import axios from 'axios';

const useLoginStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  showLogin: false, // 구글 로그인 버튼 표시 여부
  setShowLogin: (showLogin) => set(() => ({ showLogin })),
  isLoggedIn: false,
  login: async (token) => {
    try {
      const response = await axios.post("/auth/google", { token });
      if (response.status === 200) {
        set({ user: response.data, isLoggedIn: true});
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      set({ isLoggedIn: false, showLogin: true });
    }
  },
  logout: () => set({ user: null, isLoggedIn: false })
}));

export default useLoginStore;

