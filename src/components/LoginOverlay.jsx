import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from "jwt-decode";
import useLoginStore from '../store/logInStore';
import Cookies from "js-cookie";
import api from '../api/axios'

function LoginOverlay() {
  const showLogin = useLoginStore((state)=>state.showLogin);
  // const login = useLoginStore((state) => state.login);
  const loginWithGoogle = useLoginStore((state)=>state.loginWithGoogle)

  // 구글 로그인 로드 성공시 호출할 함수
  // 사용자 정보가 담긴 token을 credential에 담아 발급해줌
  const handleGoogleLogIn=async(googleData)=>{
    try {
      const token = googleData.credential;
      console.log("googleData",googleData);
      console.log("googleData.credential",token);
      console.log("loginInfo",jwtDecode(token));
      console.log(api.defaults.baseURL);
      const response = await api.post('/auth/google', { token });
      // 상태 코드 확인 전에 response 존재 여부를 검사합니다.
      if (response && response.status === 200) {
        console.log("응답response", response);
        console.log("응답response.data", response.user.data);
      } else {
        // response가 undefined일 수 있으므로 존재하지 않을 때의 처리가 필요합니다.
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error("Login Error", error); // error 전체를 로깅
    }
  };


  return (
    <>
      {showLogin && (
      <div className='login-overlay'>
        <GoogleLogin
          onSuccess={handleGoogleLogIn}
          onError={() => console.error("Login Failed..")}
          useOneTap
          theme='outline'
          size='medium'
          text="signin with"
          shape='rectangular'
          locale
        />
      </div>
      )}
    </>
  )
};

export default LoginOverlay;