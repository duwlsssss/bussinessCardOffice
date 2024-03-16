import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from  "../store/playerStore";

const FocusOnNoticeBoard = () => {
  const setCharacterVisibl = usePlayerStore(state => state.setCharacterVisible); //플레이어 가시성 설정
  const { camera } = useThree();
  const { setFocus, clearFocus } = useCameraStore();
  const [beforeCamera, setBeforeCamera] = useState(null);

  const nbPosition = { x: -0.65, y: 12, z: 0 };
  const nbTarget = { x: -0.65, y: 12, z: -11 };

  const handleNoticeBoardClick = () => {
    console.log("nbClick")
    setCharacterVisible(false); // 플레이어를 숨김
    setFocus({ x: -270, y: 140, z: -100 }); // 포커스 대상의 좌표
    if (!beforeCamera && controlsRef.current) {
      setBeforeCamera({
        position: camera.position.clone(),
        target: controlsRef.current.target.clone(),
      });

      gsap.to(camera.position, {
        x: nbPosition.x,
        y: nbPosition.y,
        z: nbPosition.z,
        duration: 1,
        ease: "power3.inOut",
      });
      gsap.to(controlsRef.current.target, {
        x: nbTarget.x,
        y: nbTarget.y,
        z: nbTarget.z,
        duration: 1,
        ease: "power3.inOut",
        onUpdate: () => { controlsRef.current.update(); },
      });
    } else if(beforeCamera && controlsRef && controlsRef.current) {
      setCharacterVisible
(true); // 플레이어를 다시 표시
      gsap.to(camera.position, {
        x: beforeCamera.position.x,
        y: beforeCamera.position.y,
        z: beforeCamera.position.z,
        ease: "power3.inOut",
        duration: 1,
      });
      gsap.to(controlsRef.current.target, {
        x: beforeCamera.target.x,
        y: beforeCamera.target.y,
        z: beforeCamera.target.z,
        duration: 1,
        ease: "power3.inOut",
        onUpdate: () => { controlsRef.current.update(); },
        onComplete: () => { 
          setBeforeCamera(null); 
          clearFocus();},
      });
    }
  };

  return { handleNoticeBoardClick };
};

export default FocusOnNoticeBoard;