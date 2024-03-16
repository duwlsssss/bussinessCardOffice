import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from "jwt-decode";
import useLoginStore from '../store/logInStore';
// import axios from 'axios';

function LoginOverlay() {
  const showLogin = useLoginStore((state)=>state.showLogin);
  // const login = useLoginStore((state) => state.login);
  const loginWithGoogle = useLoginStore((state)=>state.loginWithGoogle)

  //구글 로그인 로드 성공시 호출할 함수
  const handleGoogleLogIn=async(googleData)=>{
    try {
    // const token = googleData.credential;
    //   const response = await axios.post("/auth/google", { token });
    //   if (response.status === 200) {
    //     login(response.data); // 스토어의 login 액션 호출
    //   } else {
    //     throw new Error('Login failed');
    //   }
    console.log("Google login data:", googleData);
    await loginWithGoogle(googleData.credential);
    console.log("loginInfo",jwtDecode(googleData.credential));

    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <>
      {showLogin && (
       <div className="login-overlay">
          <GoogleLogin
            onSuccess={handleGoogleLogIn}
            onError={() => {
              console.error("Login Failed..");
            }}
            useOneTap
          />
        </div>
      )}
    </>
  )
}

export default LoginOverlay;