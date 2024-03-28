import React,{useEffect,useRef,useState } from "react"
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Vector3, Quaternion, Matrix4 } from 'three';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from "../store/playerStore";
import useLoginStore from "../store/logInStore"
import api from '../api/axios'
import QRCode from 'qrcode.react';

const PrintCard = () => {
    const { camera } = useThree();
    const { isFocused,setFocus,clearFocus } = useCameraStore();
    const [receivedData, setReceivedData] = useState(null);
    const [beforeCamera, setBeforeCamera] = useState(null); 
    const [showQR,setShowQR]=useState("false");
    const [isFlipped, setIsFlipped] = useState(false);
    const setIsCharacterVisible = usePlayerStore(state => state.setIsCharacterVisible); //플레이어 가시성 설정
    const playerPosition = usePlayerStore(state => state.playerPosition);
    const [cardImage, setCardImage] = useState(null);//이미지 저장

    const userEmail = useLoginStore((state) => state.userEmail);

    //서버에서 이미지 가져오기 
    const fetchImages = async () => {
      try {
        const response = await api.get('/images', {
          params: {
            tags: userEmail
          }
          });
        if (response.data && response.data.length > 0) {
          // 이미지 데이터 배열 중 마지막 이미지의 URL을 사용
          const lastImageIndex = response.data.length - 1;
          setCardImage(response.data[lastImageIndex].url);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
    }};
    
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
    useEffect(() => {
      if (receivedData) {
        console.log('새로 받은 데이터:', receivedData);
        setIsFlipped(false); // receivedData가 있을 때 카드를 앞면으로 초기화
        setFocus({ x: -0.5, y: 10, z: -6 }); //포커스 대상의 좌표(isFocus)
        console.log("isFocused",isFocused);
        // 목표 위치와 시점을 설정
        const targetPosition = new Vector3(-0.5, 10, -6);
        const targetLookAt = new Vector3(-0.5, 10, -9);
        // 목표 Quaternion 계산
        const targetQuaternion = new Quaternion().setFromRotationMatrix(
          new Matrix4().lookAt(targetPosition, targetLookAt, camera.up)
        );
        if (!beforeCamera) {
          // 현재 카메라 상태 저장
          setBeforeCamera({
            position: camera.position.clone(),
            rotation: camera.quaternion.clone(),
          });
        gsap.to(camera.position, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: 1,
          ease: "power3.inOut",
        });
        gsap.to(camera.quaternion, {
          x: targetQuaternion.x,
          y: targetQuaternion.y,
          z: targetQuaternion.z,
          w: targetQuaternion.w,
          duration: 1,
          ease: "power3.inOut",
          onComplete:()=>{},
        });
      } else {
        handleBackClick(); //원래 위치로 돌아감
      }
    }},[receivedData,setFocus,clearFocus]);

    const handleBackClick=(e)=>{
      if (e) e.stopPropagation();
      if (beforeCamera && playerPosition) {
        setIsCharacterVisible(true);
        setReceivedData(null);
        const targetPosition = new Vector3(playerPosition.x, playerPosition.y + 6, playerPosition.z + 10); // 예시 위치, 조정 필요
        const targetLookAt = new Vector3(playerPosition.x, playerPosition.y + 2, playerPosition.z); // 캐릭터를 바라보는 방향

        // Quaternion을 사용하여 카메라 회전 목표 계산
        const targetQuaternion = new Quaternion().setFromRotationMatrix(
          new Matrix4().lookAt(targetPosition, targetLookAt, camera.up)
        );
        gsap.to(camera.position, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,

          duration: 1,
          ease: "power3.inOut",
        });

        gsap.to(camera.quaternion, {
          x: targetQuaternion.x,
          y: targetQuaternion.y,
          z: targetQuaternion.z,
          w: targetQuaternion.w,
          duration: 1,
          ease: "power3.inOut",
          onComplete: () => {
            setBeforeCamera(null);
            clearFocus();
          },
        });
    }}        
    
    //card flip
    const handleCardClick = () => {
      //앞면이면
      if (isFlipped) {
        setShowQR(true);
        // 애니메이션이 조금 진행된 후 QR 코드를 보여줌
        // 애니메이션 지속 시간이 1초일 때
        setTimeout(() => {
          setShowQR(false);
        }, 300); 
      }
      
      // 카드의 뒤집힌 상태를 토글
      setIsFlipped(!isFlipped);
      console.log("card flipped!")

      // 카드가 뒤집히기 시작할 때 (앞면에서 뒷면으로 가는 경우)
      if (!isFlipped) {
        setShowQR(false);
        // 애니메이션이 조금 진행된 후 QR 코드를 보여줌
        // 애니메이션 지속 시간이 1초일 때
        setTimeout(() => {
          setShowQR(true);
        }, 300); 
      }
    };

    //이메일 받음 - 개인 qr 사이트 이동용
    useEffect(()=>{
        console.log(`userEmail : ${userEmail} type: ${typeof userEmail}`);
        console.log(`모바일 사이트 주소 http://localhost:3001/?userEmail=${userEmail}`);
        // console.log(`모바일 사이트 주소 https://kimmobile.netlify.app?userEmail=${userEmail}`);
    },[userEmail]);


    return (
      <>
        {receivedData && ( // receivedData가 있을 때만 아래의 내용을 렌더링
          <Html transform occlude position={[-0.5,10,-9]} scale={0.2}>
            <div className='print-canvas' onClick={(e)=>e.stopPropagation()}>
              <div className="back" onClick={handleBackClick}>❌</div>
              <div 
                className="card"
                onClick={handleCardClick}
              >
                <div className={`cardFront ${isFlipped ? 'flipped' : ''}`}>
                  <div className="info-container">
                    <div className="info-item date">
                      {receivedData?.data?.updatedAt ? new Date(receivedData.data.updatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="info-item name"> {receivedData?.data?.name || 'N/A'}</div>
                    <div className="info-item school"> {receivedData?.data?.school || 'N/A'}</div>
                    <div className="info-item studentNum"> {receivedData?.data?.studentNum || 'N/A'}</div>
                    <div className="info-item major"> {receivedData?.data?.major || 'N/A'}</div>
                    <div className="info-item email"> {receivedData?.data?.email || 'N/A'}</div>
                    <div className="info-item session"> {receivedData?.data?.session || 'N/A'}</div>
                    <div className="info-item MBTI"> {receivedData?.data?.MBTI || 'N/A'}</div>
                    <div className="info-item IG"> {receivedData?.data?.ig || 'N/A'}</div>  
                    <div className="info-item moto"> {receivedData?.data?.moto || 'N/A'}</div>
                    {cardImage && <img src={cardImage} alt="Profile" className="card-image" />}
                  </div>
                </div>
                <div className={`cardBack ${isFlipped ? 'flipped' : ''}`}>
                {showQR && (
                  <div className="QR"> 
                    <QRCode value={`http://localhost:3001/?userEmail=${userEmail}`} />
                    {/* <QRCode value={`https://kimmobile.netlify.app?userEmail=${userEmail}`} /> */}
                  </div>
                )}
                </div>
              </div>
              <div className="qr-description" >QR을 보려면 명함을 클릭하세요</div>
            </div>
          </Html>
        )}
      </>
  );
}

export default PrintCard;                                                      