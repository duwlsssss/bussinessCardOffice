import {create} from 'zustand';
import api from '../api/axios'

const useLoginStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  showLogin: false,
  userEmail:null,
  setShowLogin: (showLogin)=>set(()=>({showLogin})),
  justLoggedOut: false, // 로그아웃 상태를 추적
  resetJustLoggedOut: () => set({ justLoggedOut: false }),
  animationRestart: false, // 애니메이션 재시작을 위한 상태
  resetAnimationRestart: () => set({ animationRestart: false }), // 애니메이션 재시작 상태 초기화
  error: null,
  loginWithGoogle: async(data) => {
    try {
       // 백엔드로 구글 로그인 토큰 전송 및 검증 요청
       console.log("token",data);
       console.log("type of token", typeof data);
       //JSON.stringify(data)
       const response = await api.post("/auth/google",{token:data} );
       // { token } 구문은 token이라는 키와 이에 대응하는 값을 가진 객체를 생성
        // 서버로부터 받은 사용자 정보로 상태 업데이트
        if (response&&response.status === 200) {
          // console.log("response",response)
          // console.log("response.data",response.data)
          // ReactDOM.render(<Element3D userEmail={userEmail} />, document.getElementById('root'));
          const userEmail = response.data.user.email;
          set({ user: response.data, isLoggedIn: true, justLoggedOut: true, userEmail:userEmail, error: null });
          console.log("userEmail",userEmail);
          console.log(typeof userEmail);//string
        } else {
        throw new Error('Login failed');
        }
      } catch (error) {
        set({ error: error.message, isLoggedIn: false});
      }
    },
      logout: () => {
        set({ isLoggedIn: false, user: null, userEmail:null, justLoggedOut: true  })},
      logoutPlay: () => {
        set({ isLoggedIn: false, user: null, userEmail:null, animationRestart: true })}, 
    }));
export default useLoginStore;


