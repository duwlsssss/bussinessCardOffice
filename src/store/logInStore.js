import {create} from 'zustand';
import api from '../api/axios'

const useLoginStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  showLogin: false,
  setShowLogin: (showLogin)=>set(()=>({showLogin})),
  error: null,
  loginWithGoogle: async (token) => {
    try {
       // 백엔드로 구글 로그인 토큰 전송 및 검증 요청
       const response = await api.post("/auth/google", { token });
        // 서버로부터 받은 사용자 정보로 상태 업데이트
        if (response&&response.status === 200) {
          set({ user: response.data, isLoggedIn: true, error: null });
        } else {
        throw new Error('Login failed');
        }
      } catch (error) {
        set({ error: error.message, isLoggedIn: false});
      }
    },
      logout: () => set({ user: null, isLoggedIn: false })
    }));

export default useLoginStore;

