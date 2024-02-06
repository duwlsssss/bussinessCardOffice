import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { debounce } from 'lodash';

const FocusOnMonitor = (controlsRef) => {
  const { camera } = useThree();
  const [beforeCamera, setBeforeCamera] = useState(null);

  const monitorPosition = { x: -1.6, y: 106, z: 47 };
  const monitorTarget = { x: -1.6, y: 106, z: 23 };

  const handleMonitorClick = debounce(() => {
    console.log("monitorClick")
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
  }, 300); // 300ms 내에 중복 호출 방지

  return { handleMonitorClick };

};

export default FocusOnMonitor;