import React,{useEffect,useRef,useState } from "react"
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from 'three'; // THREE 모듈을 임포트
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from "../store/playerStore";
import html2canvas from 'html2canvas';
import useCardImgStore from "../store/cardImgStore";

const PrintCard = () => {
    const { camera } = useThree();
    const { setFocus,clearFocus } = useCameraStore();
    const [receivedData, setReceivedData] = useState(null);
    const [transform, setTransform] = useState(null);
    const [overlayStyle, setOverlayStyle] = useState({}); //overlay 스타일 변화
    const [showQR, setShowQR] = useState(false); // QR 코드 표시 여부
    const [showSavePopup, setShowSavePopup] = useState(false); // 팝업 표시 여부
    const setIsVisible = usePlayerStore(state => state.setIsVisible); //플레이어 가시성 설정
    
    // 자식 창에서 보낸 데이터 수신
    useEffect(() => {
      const receiveMessage = (event) => {
        // React DevTools 메시지 무시
        if (event.data.source === 'react-devtools-bridge' 
        || event.data.source === 'react-devtools-content-script'
        || event.data.source ==='react-devtools-backend-manager'
        ) {
          return;
        }
        // event.data에 전달된 데이터가 있음
        console.log('받은 데이터:', event.data);
        setReceivedData(event.data);
      };

      window.addEventListener('message', receiveMessage);

      return () => {
        window.removeEventListener('message', receiveMessage);
      };
    }, []);
  

    //인쇄 누르고 카메라 설정
    const cameraPosition = { x: -11.6, y: 120, z: 270 };
    const cameraTarget = { x: -11.6, y: 120, z: 200 };
    useEffect(() => {
      if (receivedData) {
        console.log('새로 받은 데이터:', receivedData);
        setFocus({ x: -1.6, y: 106, z: 100 }); //포커스 대상의 좌표(isFocus)
        if (controlsRef.current) {
          gsap.to(camera.position, {
            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z,
            duration: 1,
            ease: "power3.inOut",
          });
          gsap.to(controlsRef.current.target, {
            x: cameraTarget.x,
            y: cameraTarget.y,
            z: cameraTarget.z,
            duration: 1,
            ease: "power3.inOut",
            onUpdate: () => { controlsRef.current.update(); },
            onComplete:()=>{ 
              // 카드로 카메라 이동 1초 후에 팝업 표시
              setTimeout(() => {
                setShowSavePopup(true);
              }, 1000);
            } 
          });
        }
    }},[receivedData,controlsRef.current]);
  
    //카드 마우스 오버 
    const handleMouseMove = (e) => {
        const { offsetX, offsetY, target } = e.nativeEvent;
        const { clientWidth, clientHeight } = target;
        
        // 마우스 위치에 따른 회전 각도 계산
        const rotateY = ((offsetX / clientWidth) * 30) - 20; // 가로 이동에 따른 Y축 회전 범위 조정
        const rotateX = -(((offsetY / clientHeight) * 30) - 20); // 세로 이동에 따른 X축 회전 범위 조정
    
        const backgroundPosition = `${offsetX / 5 + offsetY / 5}%`;
        const filterOpacity = offsetX / 200;

        setOverlayStyle({
            backgroundPosition,
            filter: `opacity(${filterOpacity}) brightness(4)`,
        });

        setTransform(`perspective(1200px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`);
    };

    // QR 코드 표시 여부 바꿈
    const handleQRClick = (e) => {
      e.stopPropagation();
      setShowQR(!showQR);
    };

    // 팝업 표시 여부 바꿈
    const handleYesClick = (e) => {
      e.stopPropagation();
      saveCardHandler();
      setShowSavePopup(false);
    };
    //카드 이미지로 저장
    const saveCardHandler = async() => {
      const cardElement = document.querySelector('.cute-card'); 
      if(cardElement){
        const canvas = await html2canvas(cardElement);
        const image = canvas.toDataURL('image/png');
        useCardImgStore.getState().addImage(image); //Base64 인코딩된 문자열 저장
        console.log("saved cardImg");
      }else{
        console.log("'.cute-card' was not found");
      }
    };
    const handleNoClick = (e) => {
      e.stopPropagation();
      setShowSavePopup(false);
    };

    const handleBackClick=(e)=>{
      e.stopPropagation()
      setIsVisible(true); // 플레이어를 표시
      setReceivedData(null);
      const playerPos = usePlayerStore.getState().playerPosition;
      if(playerPos && controlsRef.current) {
        gsap.to(camera.position, {
          x: playerPos.x,
          y: playerPos.y+130,
          z: playerPos.z+100,
          ease: "power3.inOut",
          duration: 1,
        });
        gsap.to(controlsRef.current.target, {
          x: playerPos.x,
          y: playerPos.y+65,
          z: playerPos.z,
          duration: 1,
          ease: "power3.inOut",
          onUpdate: () => { controlsRef.current.update(); },
          onComplete: () => { 
            clearFocus();
          },
        });
    }}           


    return (
      <>
        {receivedData && ( // receivedData가 있을 때만 아래의 내용을 렌더링
          <Html transform occlude position={[-11.6,120.5,250]}>
            <div className='print-canvas'>
              <div className="back" onClick={handleBackClick}>❌</div>
              {!showQR && (
                  <div 
                      className="cute-card"
                      style={{
                          transform: transform ? transform : undefined,
                      }} 
                      onMouseMove={handleMouseMove}
                      onClick={handleQRClick}
                  >
                      <div className="school-logo"><img src="/images/schoolLogo/숭실대학교.png" alt="schoolLogo" /></div>
                      <div className="name">🔖이름: {receivedData?.data?.name || 'N/A'}</div>
                      <div className="email">📬E-mail: {receivedData?.data?.email || 'N/A'}</div>
                      <div className="school">🎓학교: {receivedData?.data?.school || 'N/A'}</div>
                      <div className="MBTI">🥕MBTI: {receivedData?.data?.MBTI || 'N/A'}</div>
                      <div className="IG">🔖IG: {receivedData?.data?.ig || 'N/A'}</div>  
                      <div className="id-picture"><img src="/images/idPicture.png" alt="idPicture" /></div>
                      <div className="kim-logo"><img src="/images/kimLogo.png" alt="kimLogo" /></div>
                      <div className="overlay"/>
                  </div>
                  // <div 
                  //     className="card-test"
                  //     style={{
                  //         transform: transform ? transform : undefined,
                  //     }} 
                  //     onMouseMove={handleMouseMove}
                  //     onClick={handleQRClick}
                  // >
                  //     <img src="/images/명함테스트.jpeg" alt="BC test"/>
                  //     <div className="name">{receivedData?.data?.name || 'N/A'}</div>
                  //     <div className="overlay"/>
                  // </div>
              )}
              {showQR && (
                  <div className="QR" onClick={handleQRClick}>
                      <img src="/images/qrcodeTest.png" alt="QR Code" />
                  </div>
              )}
              {showSavePopup && (
                <>
                  <div className="popup-overlay"/>
                  <div className="save-popup">
                    <p>갤러리에 명함을 전시하시겠습니까?</p>
                    <div className="buttons-container">
                      <button className="yes-save" onClick={handleYesClick}>OK</button>
                      <button className="no-save" onClick={handleNoClick}>Cancel</button>
                    </div>
                  </div>
                </>
              )}
              {!showQR && (
                  <div className="qr-description">Click business card to show QR</div>
              )}
            </div>
          </Html>
        )}
      </>
  );
  
}

export default PrintCard;                                                      