// import { useState, useEffect } from 'react';
// import { useThree } from '@react-three/fiber';
// import { gsap } from 'gsap';
// import useCameraStore from '../store/cameraStore';
// import usePlayerStore from  "../store/playerStore";
// import * as THREE from "three"
// import { vec3 } from '@react-three/rapier';

// const FocusOnMonitor = () => {
//   const setIsVisible = usePlayerStore(state => state.setIsVisible); //플레이어 가시성 설정
//   const camera = useThree((state) => state.camera)
//   const { setFocus,clearFocus } = useCameraStore();
//   // const { cameraPosition, setCameraPosition, cameraTarget, setCameraTarget } = useCameraStore((state) => ({
//   //   cameraPosition: state.cameraPosition,
//   //   setCameraPosition: state.setCameraPosition,
//   //   cameraTarget: state.cameraTarget,
//   //   setCameraTarget: state.setCameraTarget,
//   // }));
//   const [beforeCamera, setBeforeCamera] = useState(null);
//   const monitorPosition = { x: -0.65, y: 11.3, z: -8.5 };
//   const monitorTarget = { x: -0.65, y: 11.3, z: -11 };

//   const handleMonitorClick = () => {
//     console.log("monitor click")
//     setFocus({ x: -0.65, y: 11.3, z: -8.5 }); // 포커스 설정
//     setIsVisible(false); // 플레이어를 숨김
//     if (!beforeCamera) {
//       setBeforeCamera({
//         position: camera.position.clone(),
//         rotation: camera.rotation.clone(),
//       });
//       gsap.to(camera.position, {
//         x: monitorPosition.x,
//         y: monitorPosition.y,
//         z: monitorPosition.z,
//         duration: 1,
//         ease: "power3.inOut",
//         // onComplete: () => {
//         //   camera.lookAt(monitorTarget.x, monitorTarget.y, monitorTarget.z);
//         // },
//       });
//       gsap.to(targetPosition, {
//         x: -0.65,
//         y: 11.3,
//         z: -11,
//         duration: 1,
//         ease: "power3.inOut",
//         onUpdate: () => {
//           // 애니메이션이 진행될 때마다 targetPosition 상태 업데이트
//           camera.lookAt(targetPosition);
//         },
//         onComplete: () => {
//           // 애니메이션 완료 후 필요한 추가 작업
//         },
//       });
//     } else {
//       setIsVisible(true); // 플레이어를 다시 표시
//       gsap.to(camera.position, {
//         x: beforeCamera.position.x,
//         y: beforeCamera.position.y,
//         z: beforeCamera.position.z,
//         ease: "power3.inOut",
//         duration: 1,})
//       gsap.to(camera.rotation, {
//         x: beforeCamera.rotation.x,
//         y: beforeCamera.rotation.y,
//         z: beforeCamera.rotation.z,
//         ease: "power3.inOut",
//         duration: 1,
//         onComplete: () => { 
//           setBeforeCamera(null);
//           clearFocus();
//         },
//       });
//     }
//   }

//   return { handleMonitorClick };
// };

// export default FocusOnMonitor;

import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { Vector3, Quaternion, Matrix4 } from 'three';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from "../store/playerStore";

const FocusOnMonitor = () => {
  // 이전 상태 및 기타 필요한 상태 훅스
  const setIsVisible = usePlayerStore(state => state.setIsVisible); //플레이어 가시성 설정
  const { setFocus,clearFocus } = useCameraStore();
  const [beforeCamera, setBeforeCamera] = useState(null);
  const camera = useThree((state) => state.camera);

  // 카메라를 원하는 위치와 방향으로 부드럽게 이동시키는 함수
  const handleMonitorClick = () => {
    console.log("monitor click")
    setFocus({ x: -0.65, y: 11.3, z: -8.5 }); // 포커스 설정
    // 목표 위치와 시점을 설정
    const targetPosition = new Vector3(-0.65, 11.3, -8.5);
    const targetLookAt = new Vector3(-0.65, 11.3, -11);
    // 목표 Quaternion 계산
    const targetQuaternion = new Quaternion().setFromRotationMatrix(
      new Matrix4().lookAt(targetPosition, targetLookAt, camera.up)
    );
    setIsVisible(false); // 플레이어를 숨김

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
          setIsVisible(true);
          setBeforeCamera(null);
          clearFocus();
        },
      });
    }
  };

  return { handleMonitorClick };
};

export default FocusOnMonitor;
