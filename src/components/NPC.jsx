import React, { useRef, useState, useEffect } from 'react';
import {useThree} from "@react-three/fiber"
import { useGLTF, useAnimations } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { gsap } from 'gsap';

const NPC = ({controlsRef}) => {
  const npcRef = useRef();
  const { scene, animations } = useGLTF("./models/dancer.glb");
  const { actions } = useAnimations(animations, npcRef);
  const { camera } = useThree();
  const [beforeCamera, setBeforeCamera] = useState(null);
  const [currentAnimation, setCurrentAnimation] = useState("wave");

  // console.log("actions",actions); //에니메이션 종류 확인 

  // const three=useThree();
  // console.log("three",three);//정보 출력

  //그림자
  useEffect(()=>{
    scene.traverse((obj)=>{
        if(obj.isMesh){
            obj.castShadow=true;
            obj.recieveShadow=true;
        }
    });
  },[scene]);

  // 에니메이션 바뀔 때 효과 
  useEffect(()=>{
    if (actions[currentAnimation]) {
      actions[currentAnimation].reset().fadeIn(0.5).play();
    }
    return()=>{
      if (actions[currentAnimation]) {
        actions[currentAnimation].fadeOut(0.5).stop();
      }
    }
  },[actions,currentAnimation]);

  // //iframe 소통
  // const handleIframeMessage = (event) => {
  //     console.log(event.data);
  //     if (event.data === 'danceChange') {
  //         setCurrentAnimation((prev)=>{
  //             if(prev=="wave") return "windmill";
  //             else return "wave"
  //         });
  //     }
  // };
  // useEffect(() => {
  //     window.addEventListener('message', handleIframeMessage);
  //     return () => {
  //         window.removeEventListener('message', handleIframeMessage);
  //     };
  // }, []);


  const handleNPCClick = () => {

    const npcPosition = { x: -270, y: 140, z: -100 }; //npc 클릭 후 focus
    const npcTarget = { x: -270, y: 140, z: -180 };
        
    console.log("npc Click")

    if (!beforeCamera && controlsRef.current) {
        setBeforeCamera({
            position: camera.position.clone(),
            target: controlsRef.current.target.clone(),
        });

        gsap.to(camera.position, {
            x: npcPosition.x,
            y: npcPosition.y,
            z: npcPosition.z,
            duration: 1,
            ease: "power3.inOut",
        });
        gsap.to(controlsRef.current.target, {
            x: npcTarget.x,
            y: npcTarget.y,
            z: npcTarget.z,
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
    setCurrentAnimation((prev) => prev==="windmill" ? "twerk" : "windmill")
  }

  return (
    <RigidBody 
      type="kinematicPosition"
      ref={npcRef}
      name="NPC"
      //Player와 부딪혔을때 에니메이션
      onCollisionEnter={({other})=>{
        if(other.rigidBodyObject.name==="Player"){
          setCurrentAnimation("windmill")
        }
      }}
      onCollisionExit={({other})=>{
        if(other.rigidBodyObject.name==="Player"){
          setCurrentAnimation("wave")
        }
      }}
    >
      <primitive
        scale={0.7}
        object={scene}
        position={[110,70,80]}
        onClick={() => handleNPCClick()}
      />
    </RigidBody>
  );
};

export default NPC;
