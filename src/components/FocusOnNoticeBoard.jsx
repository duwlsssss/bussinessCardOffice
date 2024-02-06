import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';

const FocusOnNoticeBoard = (controlsRef) => {
  const { camera } = useThree();
  const [beforeCamera, setBeforeCamera] = useState(null);

  const nbPosition = { x: -270, y: 140, z: -100 };
  const nbTarget = { x: -270, y: 140, z: -180 };

  const handleNoticeBoardClick = () => {
    console.log("nbClick")
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
        onComplete: () => { setBeforeCamera(null); },
      });
    }
  };

  return { handleNoticeBoardClick };
};

export default FocusOnNoticeBoard;