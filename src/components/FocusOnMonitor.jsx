import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { Vector3, Quaternion, Matrix4 } from 'three';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from "../store/playerStore";

const FocusOnMonitor = () => {
  const setIsCharacterVisible = usePlayerStore(state => state.setIsCharacterVisible); //플레이어 가시성 설정
  const {isFocused, setFocus, clearFocus}=useCameraStore((state) => ({
    isFocused: state.isFocused,
    setFocus: state.setFocus,
    clearFocus: state.clearFocus,
  }));
  const [beforeCamera, setBeforeCamera] = useState(null);
  const camera = useThree((state) => state.camera);

  // 카메라를 원하는 위치와 방향으로 부드럽게 이동시키는 함수
  const handleMonitorClick = () => {
    
    console.log("monitor click")
    setFocus({ x: -0.65, y: 11, z: -10.3 }); // 포커스 설정
    console.log("isfocused",isFocused)
    // 목표 위치와 시점을 설정
    const targetPosition = new Vector3(-0.65, 11, -10.3);
    const targetLookAt = new Vector3(-0.65, 11, -12);
    // 목표 Quaternion 계산
    const targetQuaternion = new Quaternion().setFromRotationMatrix(
      new Matrix4().lookAt(targetPosition, targetLookAt, camera.up)
    );
    setIsCharacterVisible(false); // 플레이어를 숨김

    if (!beforeCamera) {
      // 현재 카메라 상태 저장
      setBeforeCamera({
        position: camera.position.clone(),
        rotation: camera.quaternion.clone(),
      });

      // gsap을 사용하여 카메라 위치와 Quaternion을 목표 값으로 애니메이션
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
      setIsCharacterVisible(true);
      gsap.to(camera.position, {
        x: beforeCamera.position.x,
        y: beforeCamera.position.y,
        z: beforeCamera.position.z,
        duration: 1,
        ease: "power3.inOut",
      });
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
      });
    }
  };

  return { handleMonitorClick };
};

export default FocusOnMonitor;
