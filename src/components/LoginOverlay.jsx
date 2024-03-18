import {Html} from "@react-three/drei"
import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from "jwt-decode";
import useLoginStore from '../store/logInStore';
import api from '../api/axios'
import axios from 'axios';
import Cookies from "js-cookie";

function LoginOverlay() {
  const isLoggedIn = useLoginStore((state)=>state.isLoggedIn);
  const showLogin = useLoginStore((state)=>state.showLogin);
  const loginWithGoogle = useLoginStore((state)=>state.loginWithGoogle)

  // 구글 로그인 로드 성공시 호출할 함수
  // 사용자 정보가 담긴 token을 credential에 담아 발급해줌
  const handleGoogleLogIn=async(googleData)=>{
    try {
      const token = googleData.credential;
      // console.log("googleData",googleData);
      // console.log("googleData.credential",token);
      // console.log("loginInfo",jwtDecode(token));
      // console.log(api.defaults.baseURL);
      await loginWithGoogle(token);

    } catch (error) {
      console.error("Login Error", error); // error 전체를 로깅
    }
  };



  return (
    <>
      {/*로그인 버튼*/}
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