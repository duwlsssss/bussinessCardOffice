import React,{useEffect,useRef,useState } from "react"
import { useThree } from "@react-three/fiber";
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from "../store/playerStore";
import useCardImgStore from "../store/cardImgStore";
import { Html, Image } from "@react-three/drei";
import { Vector3, Quaternion, Matrix4 } from 'three';

const Gallery = () => {
    const { camera } = useThree();
    const { setFocus, clearFocus } = useCameraStore();
    const [beforeCamera, setBeforeCamera] = useState(null); 
    const [showCube, setShowCube]=useState(true);
    const setIsCharacterVisible = usePlayerStore(state => state.setIsCharacterVisible); //플레이어 가시성 설정
    const images = useCardImgStore((state) => state.images); // Zustand 스토어에서 이미지 배열 가져오기

    const handleNoticeBoardClick = () => {
      console.log("nbClick")
      setIsCharacterVisible(false); // 플레이어를 숨김
      setShowCube(false); //큐브 숨김
      setFocus({ x: -24, y: 15, z: -12 }); // 포커스 대상의 좌표
      // 목표 위치와 시점을 설정
      const targetPosition = new Vector3(-24, 15, -12);
      const targetLookAt = new Vector3(-24, 15, -24);
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
      });
    } else {
      handleBackClick(); //원래 위치로 돌아감
      }
    }

    const handleBackClick=()=>{
      if (beforeCamera) {
        setIsCharacterVisible(true);
        setShowCube(true);
        gsap.to(camera.position, {
            x: beforeCamera.position.x,
            y: beforeCamera.position.y,
            z: beforeCamera.position.z,
            duration: 1,
            ease: "power3.inOut",
        });
        // Quaternion을 사용하여 카메라 회전을 원래대로 복원
        gsap.to(camera.quaternion, {
          x: beforeCamera.rotation.x,
          y: beforeCamera.rotation.y,
          z: beforeCamera.rotation.z,
          w: beforeCamera.rotation.w,
          duration: 1,
          ease: "power3.inOut",
          onComplete: () => {
            setBeforeCamera(null);
            clearFocus();
          },
        })
      }
    };
    

    return (
      <>
        <mesh 
          onClick={handleNoticeBoardClick} 
          position={[-24,15,-30]}
          onPointerOver={(e) => {
            // 마우스가 Mesh 위에 있을 때 커서를 포인터로 변경
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
              // 마우스가 Mesh에서 벗어났을 때 커서를 기본으로 변경
              document.body.style.cursor = 'auto';
          }}>
          <boxGeometry args={[1,1,1]} />
          <meshStandardMaterial color={'orange'} />
        </mesh>
        {!showCube&&(<Html transform occlude position={[-24,15,-29]}>
          <div className='gallery-canvas'>
            <div className="back" onClick={handleBackClick}>❌</div>
            <div className="gallery-description">Scroll to view Gallery</div>
          </div>
        </Html>)}
      </>
  );
}

export default Gallery;                                                      