import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from '../store/playerStore';
import useNPCStore from '../store/npcStore';

function CameraAnimation() {
  const setAnimationComplete = useCameraStore((state) => state.setAnimationComplete);
  const setIsCharacterVisible = usePlayerStore((state) => state.setIsCharacterVisible);
  const setIsNpcVisible = useNPCStore((state) => state.setIsNpcVisible);
  // const npcPosition = useNPCStore((state) => state.npcPosition);
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    // 애니메이션 시작 각도
    let angle = 0;

    // 애니메이션 함수
    const animateCamera = () => {
      // 경로를 따라 카메라의 새 위치 계산
      const x = 100 * Math.sin(angle);
      const z = 100 * Math.cos(angle)+70; // 원점에서 z축 방향으로 70만큼 떨어진 위치
      const y = 50 - angle * 5; // 높이를 점진적으로 감소

      // 카메라 위치 업데이트
      camera.position.set(x, y, z);
      // 카메라가 모델(원점)을 바라보도록 설정
      camera.lookAt(0, 0, 0);

      // 프레임마다 증가하는 각도
      angle += 0.05;

      // 한바퀴 돌때까지 애니메이션 유지
      if (angle <= Math.PI * 2) {
        requestAnimationFrame(animateCamera);
      }else {
        gsap.to(camera.position, {
          x: 0, 
          y: 8, 
          z: 130,
          duration: 0.5,
          onStart:()=>{setIsNpcVisible(true);},
          onUpdate: () => {camera.lookAt(0, 7.5, 120);},
          onComplete: () => {}
        });
      }
    };
    // 애니메이션 시작
    animateCamera();
  }, [camera,setIsNpcVisible]);


  return null;
}

export default CameraAnimation;