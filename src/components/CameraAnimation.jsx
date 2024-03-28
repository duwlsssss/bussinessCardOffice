import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import * as TWEEN from '@tweenjs/tween.js'
import useCameraStore from '../store/cameraStore';
import usePlayerStore from '../store/playerStore';
import useNPCStore from '../store/npcIntroStore';
import useLoginStore from '../store/logInStore';
import useOverlayStore from '../store/overlayStore';

function CameraAnimation() {

  const setIsNpcVisible = useNPCStore((state) => state.setIsNpcVisible);
  const camera = useThree((state) => state.camera);

  
  const { animationRestart, resetAnimationRestart } = useLoginStore();
  const {showSpeechBubble, setShowSpeechBubble} =  useNPCStore();

  const start = useOverlayStore((state) => ({start: state.start}));

  
  useEffect(() => {
      console.log("카메라 에니메이션 시작");
      // 애니메이션 시작 각도
      let angle = 0;

      // 애니메이션 함수
      const animateCamera = () => {

        setIsNpcVisible(false);
        
        // 경로를 따라 카메라의 새 위치 계산
        const x = 100 * Math.sin(angle);
        const z = 100 * Math.cos(angle)+70; // 원점에서 z축 방향으로 70만큼 떨어진 위치
        const y = 50 - angle * 5; // 높이를 점진적으로 감소

        // 카메라 위치 업데이트
        camera.position.set(x, y, z);
        // 카메라가 모델(원점)을 바라보도록 설정
        camera.lookAt(0, 0, 0);

        // 프레임마다 증가하는 각도
        // angle += 0.03;
        angle += 0.1;

        // 한바퀴 돌때까지 애니메이션 유지
        if (angle <= Math.PI * 2) {
          requestAnimationFrame(animateCamera);
        }else {
          setIsNpcVisible(true);
          setShowSpeechBubble(true);
          gsap.to(camera.position, {
            x: 0, 
            y: 7, 
            z: 138,
            ease:"power1.in",
            onUpdate: () => {camera.lookAt(0, 7, 128);},
            onComplete: () => {resetAnimationRestart();},
          });
      };
    }
      
      animateCamera();

      if (animationRestart) {
        animateCamera(); 
      }

  }, [camera,setIsNpcVisible,animationRestart, resetAnimationRestart, setShowSpeechBubble]);


  return null;
}

export default CameraAnimation;