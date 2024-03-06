import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from  "../store/playerStore";

const FocusOnMonitor = (controlsRef) => {
  const setIsVisible = usePlayerStore(state => state.setIsVisible); //플레이어 가시성 설정
  const { camera } = useThree();
  const { setFocus,clearFocus } = useCameraStore();
  const [beforeCamera, setBeforeCamera] = useState(null);

  const monitorPosition = { x: -16.6, y: 116.5, z: 230 };
  const monitorTarget = { x: -16.6, y: 116.5, z: 200 };

  const handleMonitorClick = () => {
    console.log("monitor click")
    setFocus({ x: -1.6, y: 106, z: 50 }); // 포커스 대상의 좌표
    setIsVisible(false); // 플레이어를 숨김
    if (!beforeCamera && controlsRef.current) {
      setBeforeCamera({
        position: camera.position.clone(),
        target: controlsRef.current.target.clone(),
      });

      gsap.to(camera.position, {
        x: monitorPosition.x,
        y: monitorPosition.y,
        z: monitorPosition.z,
        duration: 1,
        ease: "power3.inOut",
      });
      gsap.to(controlsRef.current.target, {
        x: monitorTarget.x,
        y: monitorTarget.y,
        z: monitorTarget.z,
        duration: 1,
        ease: "power3.inOut",
        onUpdate: () => { controlsRef.current.update(); },
      });
    } else if(beforeCamera && controlsRef && controlsRef.current) {
      setIsVisible(true); // 플레이어를 다시 표시
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
          clearFocus();
        },
      });
    }
  }

  return { handleMonitorClick };
};

export default FocusOnMonitor;