import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from "jwt-decode";
import useLoginStore from '../store/logInStore';
import Cookies from "js-cookie";

function LoginOverlay() {
  const showLogin = useLoginStore((state)=>state.showLogin);
  // const login = useLoginStore((state) => state.login);
  const loginWithGoogle = useLoginStore((state)=>state.loginWithGoogle)

  // 구글 로그인 로드 성공시 호출할 함수
  // 사용자 정보가 담긴 token을 credential에 담아 발급해줌
  const handleGoogleLogIn=async(googleData)=>{
    try {
    console.log("Google login data:", googleData);
    await loginWithGoogle(googleData.credential);
    console.log("googleData.credential",googleData.credential);
    console.log("loginInfo",jwtDecode(googleData.credential));

    } catch (error) {
      console.error("Login error:", error);
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