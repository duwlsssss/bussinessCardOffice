import React,{useEffect,useRef,useState } from "react"
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from 'three'; // THREE 모듈을 임포트
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from "../store/playerStore";

const PrintCard = ({controlsRef}) => {
    const { camera } = useThree();
    const { setFocus,clearFocus } = useCameraStore();
    const [beforeCamera, setBeforeCamera] = useState(null);
    const [receivedData, setReceivedData] = useState(null);

    const [transform, setTransform] = useState(null);
    const [overlayStyle, setOverlayStyle] = useState({}); //overlay 스타일 변화
    const [showQR, setShowQR] = useState(false); // QR 코드 표시 여부
    
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
    const cameraPosition = { x: -1.6, y: 106, z: 100 };
    const cameraTarget = { x: -1.6, y: 106, z: 50 };
    useEffect(() => {
      if (receivedData) {
        console.log('새로 받은 데이터:', receivedData);
        setFocus({  x: -1.6, y: 106, z: 100 }); //포커스 대상의 좌표(isFocus)
        if (controlsRef.current) {
          // setBeforeCamera({
          //   position: camera.position.clone(),
          //   target: controlsRef.current.target.clone(),
          // });

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
          } 
        });
        }
    }},[receivedData,beforeCamera,controlsRef.current]);

    // QR 코드 표시 여부 바꿈
    const handleQRClick = (e) => {
      e.stopPropagation();
      setShowQR(!showQR); 
  };
  
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
            filter: `opacity(${filterOpacity}) brightness(2)`,
        });

        setTransform(`perspective(1200px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`);
    };

    const handleBackClick=()=>{
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
            // setBeforeCamera(null);
            setReceivedData(null);
          },
        });
    }}            


    return (
      <>
        {receivedData && ( // receivedData가 있을 때만 아래의 내용을 렌더링
          <Html transform occlude position={[-1.6, 106.5, 80]}>
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
                      <div className="overlay"/>
                      <p>🔖이름: {receivedData?.data?.name || 'N/A'}</p>
                      <p>📬E-mail: {receivedData?.data?.email || 'N/A'}</p>
                      <p>🎓학교: {receivedData?.data?.school || 'N/A'}</p>
                      <p>🥕MBTI: {receivedData?.data?.MBTI || 'N/A'}</p>
                      <p>🔖IG: {receivedData?.data?.ig || 'N/A'}</p>  
                  </div>
              )}
              {showQR && (
                  <div className="QR" onClick={handleQRClick}>
                      <img src="/images/qrcodeTest.png" alt="QR Code" />
                  </div>
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