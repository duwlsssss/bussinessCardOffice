import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from  "../store/playerStore";
import * as THREE from "three"
import { vec3 } from '@react-three/rapier';

const FocusOnMonitor = () => {
  const setIsVisible = usePlayerStore(state => state.setIsVisible); //플레이어 가시성 설정
  const camera = useThree((state) => state.camera)
  const { setFocus,clearFocus } = useCameraStore();
  // const { cameraPosition, setCameraPosition, cameraTarget, setCameraTarget } = useCameraStore((state) => ({
  //   cameraPosition: state.cameraPosition,
  //   setCameraPosition: state.setCameraPosition,
  //   cameraTarget: state.cameraTarget,
  //   setCameraTarget: state.setCameraTarget,
  // }));
  const [beforeCamera, setBeforeCamera] = useState(null);
  const monitorPosition = { x: -0.65, y: 11.3, z: -8.5 };
  const monitorTarget = { x: -0.65, y: 11.3, z: -11 };

  const handleMonitorClick = () => {
    console.log("monitor click")
    setFocus({ x: -0.65, y: 11.3, z: -8.5 }); // 포커스 설정
    setIsVisible(false); // 플레이어를 숨김
    if (!beforeCamera) {
      setBeforeCamera({
        position: camera.position.clone(),
        rotation: camera.rotation.clone(),
      });
      gsap.to(camera.position, {
        x: monitorPosition.x,
        y: monitorPosition.y,
        z: monitorPosition.z,
        duration: 1,
        ease: "power3.inOut",
        onComplete: () => {
          camera.lookAt(monitorTarget.x, monitorTarget.y, monitorTarget.z);
        },
      });
    } else {
      setIsVisible(true); // 플레이어를 다시 표시
      gsap.to(camera.position, {
        x: beforeCamera.position.x,
        y: beforeCamera.position.y,
        z: beforeCamera.position.z,
        ease: "power3.inOut",
        duration: 1,})
      gsap.to(camera.rotation, {
        x: beforeCamera.rotation.x,
        y: beforeCamera.rotation.y,
        z: beforeCamera.rotation.z,
        ease: "power3.inOut",
        duration: 1,
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