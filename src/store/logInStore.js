import {create} from 'zustand';
import axios from 'axios';

const useLoginStore = create((set) => ({
  // user: null,
  // setUser: (user) => set({ user, isLoggedIn: !!user }),
  showLogin: false, // 구글 로그인 버튼 표시 여부
  setShowLogin: (showLogin) => set(() => ({ showLogin })),
  user: null,
  isLoading: false,
  error: null,
  loginWithGoogle: async (token) => {
    try {
      set({ isLoading: true });
      // 실제 API 요청 코드 필요, 밑엔 임의로 넣어둔거임
      const response = { status: 200, data: { name: 'Google User', email: 'user@example.com' } }; 
      if (response.status === 200) {
        set({ user: response.data, isLoading: false }); // 사용자 정보로 response.data 설정
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  // isLoggedIn: false,
  // login: async (token) => {
  //   try {
  //     const response = await axios.post("/auth/google", { token });
  //     if (response.status === 200) {
  //       set({ user: response.data, isLoggedIn: true});
  //     } else {
  //       throw new Error('Login failed');
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     set({ isLoggedIn: false, showLogin: true });
  //   }
  // },
  // logout: () => set({ user: null, isLoggedIn: false })
}));

export default useLoginStore;

