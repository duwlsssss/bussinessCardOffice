import {useState} from "react"
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import {jwtDecode} from "jwt-decode";
import useLoginStore from '../store/logInStore';
import useNPCStore from  "../store/npcIntroStore";
import useOverlayStore from "../store/overlayStore";
import api from '../api/axios'
import axios from 'axios';
import Cookies from "js-cookie";
import useCameraStore from "../store/cameraStore";
import useNpcInsideStore from "../store/npcInsideStore";
import usePlayerStore from "../store/playerStore";

function Overlay(){

  const clearFocus = useCameraStore((state)=>state.clearFocus);
  const isLoggedIn = useLoginStore(state => state.isLoggedIn);
  const showLogin = useLoginStore((state)=>state.showLogin);
  const logout = useLoginStore(state => state.logout);
  const logoutPlay = useLoginStore(state => state.logoutPlay);
  const loginWithGoogle = useLoginStore((state)=>state.loginWithGoogle)
  const {start,setStart,setIsOutside,setBeforeStart}=useOverlayStore((state) => ({
    start: state.start,
    setStart: state.setStart,
    setIsOutside: state.setIsOutside,
    setBeforeStart: state.setBeforeStart,
  }));
  const {setNpcPositionIn,setShowSpeechBubbleIn,setForOriginRot}=useNpcInsideStore((state) => ({
    setNpcPositionIn: state.setNpcPositionIn,
    setShowSpeechBubbleIn: state.setShowSpeechBubbleIn,
    setForOriginRot: state.setForOriginRot,
  }));
  const isIntroductionEnd = useNPCStore((state) => state.isIntroductionEnd);
  const {setNpcPosition,setShowSpeechBubble,setIsNpcVisible,setIsIntroductionEnd}=useNPCStore((state) => ({
    setNpcPosition: state.setNpcPosition,
    setShowSpeechBubble: state.setShowSpeechBubble,
    setIsNpcVisible: state.setIsNpcVisible,
    setIsIntroductionEnd: state.setIsIntroductionEnd,
  }));
  const {setPlayerPosition,setIsCharacterVisible,setPlayerToNPC}=usePlayerStore((state) => ({
    setPlayerPosition: state.setPlayerPosition,
    setIsCharacterVisible: state.setIsCharacterVisible,
    setPlayerToNPC: state.setPlayerToNPC,
  }));



  const [showLogOutPopup, setShowLogoutPopup] = useState(false); // 팝업 표시 여부

  const [isSoundOn, setIsSoundOn] = useState(true); // 사운드 상태 관리

  // 구글 로그인 로드 성공시 호출할 함수
  // 사용자 정보가 담긴 token을 credential에 담아 발급해줌
  const handleGoogleLogIn=async(googleData)=>{
    try {
      // console.log("googleData",googleData);
      // console.log("loginInfo",jwtDecode(googleData.credential));
      // console.log(api.defaults.baseURL);
      await loginWithGoogle(googleData.credential);
    } catch (error) {
      console.error("Login Error", error); // error 전체를 로깅
    }
  };

  //로그아웃 처리
  const handleLogout = () => {
    if(isIntroductionEnd){ //플레이 중 로그아웃 버튼 누름
      setIsIntroductionEnd(false); //캐릭터 사라짐 
      clearFocus();
      logoutPlay();
      setBeforeStart();
      setShowSpeechBubbleIn(false);
      setForOriginRot(false);
      setNpcPositionIn(12,6,-5);//안 npc
      setNpcPosition(0,4.5,129);
      setIsNpcVisible(false);
      setShowSpeechBubble(false);
      setIsIntroductionEnd(false);//밖 npc
      setPlayerPosition(0,4.5,130);
      setIsCharacterVisible(false);
      setPlayerToNPC(false);
      setIsOutside();
      console.log('Logged out successfully-play');
    }else{
      logout(); 
      console.log('Logged out successfully-conversation');
    }
    setShowLogoutPopup(false); // 로그아웃 후 팝업 숨김
  };

  // "아니오" 클릭 시 팝업 숨김
  const handleNoClick = () => {
    setShowLogoutPopup(false);
  };

  // 사운드 상태 변경
  const handleSound = () => {
    setIsSoundOn(!isSoundOn);
    console.log(isSoundOn ? "Sound Off" : "Sound On");
  };

  return (
    <>
      {!start&&(
      <div className='start-overlay-container'>
        <h1>김씨네 명함 사무소에 오신 것을 환영합니다</h1>
        <p>시작을 원하시면 아래 버튼을 눌러주세요</p>
        <button className="start-btn" onClick={() => setStart()}>
          START
        </button>
      </div>)}
      {/*로그인 버튼*/}
      {showLogin && (
      <div className='login-overlay'>
        <GoogleLogin
          onSuccess={handleGoogleLogIn}
          onError={() => console.error("Login Failed..")}
          useOneTap
          size="medium"
        />
      </div>
      )}
      {isLoggedIn&&(
      <div className="overlay-btns-container">
        {/* 사운드 on/off 버튼*/}
        <button className="btn" onClick={() => handleSound()}>
          <img src={isSoundOn ? "images/soundOn.png" : "images/soundOff.png"} alt="Sound Toggle" />
        </button>
        {/* 로그아웃 버튼 */}
        <button className="btn btn-logout" onClick={() => setShowLogoutPopup(true)}>
            <img src="images/logout.png" alt="Logout"></img>
          </button>
      </div>
      )}
      {showLogOutPopup && (
          <>
          <div className="popup-overlay"/>
            <div className="logout-save-popup">
              <p> 정말로 로그아웃하시겠습니까 ? </p>
              <div className="buttons-container">
                <button className="yes-save" onClick={handleLogout}>네</button>
                <button className="no-save" onClick={handleNoClick}>아니오</button>
              </div>
          </div>
          </>
      )}
    </>
  )
};

export default Overlay;