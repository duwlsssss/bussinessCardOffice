import {create} from 'zustand';
import axios from 'axios';
import api from '../api/axios'

const useLoginStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  showLogin: false, // 구글 로그인 버튼 표시 여부
  setShowLogin: (showLogin) => set(() => ({ showLogin })),
  isLoggedIn: false,
  isLoading: false,
  error: null,
  loginWithGoogle: async (token) => {
    // try {
    //   set({ isLoading: true });
    //   // 실제 API 요청 코드 필요, 밑엔 테스트용으로 넣어둔거임
    //   const response = { status: 200, data: { name: 'Google User', email: 'user@example.com' } }; 
    //   if (response.status === 200) {
    //     set({ user: response.data, isLoading: false }); // 사용자 정보로 response.data 설정
    //   } else {
    //     throw new Error('Login failed');
    //   }
    // } catch (error) {
    //   set({ error: error.message, isLoading: false });}}
    
    try {
       // 백엔드로 구글 로그인 토큰 전송 및 검증 요청
       const response = await api.post("/auth/google", { token });
        // 서버로부터 받은 사용자 정보로 상태 업데이트
        if (response.status === 200) {
          set({ user: response.data, isLoggedIn: true, isLoading: false, error: null });
        } else {
        throw new Error('Login failed');
        }
      } catch (error) {
        set({ error: error.message, isLoading: false, isLoggedIn: false, showLogin: true });
      }
    },
      logout: () => set({ user: null, isLoggedIn: false, showLogin: true })
    }));

export default useLoginStore;

