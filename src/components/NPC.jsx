import React, { useRef, useState, useEffect } from 'react';
import {useThree,extend,useFrame} from "@react-three/fiber"
import { useGLTF, useAnimations, Html, useTexture,  } from '@react-three/drei';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from  "../store/playerStore"
import * as THREE from "three"
import { geometry } from 'maath'
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

extend(geometry);

//npc 대사
const messages = [
  "안녕안뇽",
  "다음 메시지",
  "마지막 메시지"
];

const NPC = ({controlsRef}) => {
  const npcRef = useRef();
  const { scene, animations } = useGLTF("/models/standing_55.glb");
  const { actions } = useAnimations(animations, npcRef);
  const { camera } = useThree();
  const [beforeCamera, setBeforeCamera] = useState(null);
  const { setFocus } = useCameraStore();
  const [showSphere,setShowSphere]=useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false); // 말풍선 표시 상태
  const [currentAnimation, setCurrentAnimation] = useState("standing_55");
  const playerPosition = usePlayerStore(state => state.playerPosition);
  // console.log("actions",actions); //에니메이션 종류 확인 
  const texture = useLoader(TextureLoader, '/images/speechBubble.png');

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState(messages[0]);

  // 큐브 클릭 이벤트 핸들러
  const handleNextClick = (event) => {
    event.stopPropagation();
    console.log("next click!!")
    const nextIndex = (currentIndex + 1) % messages.length; // 다음 메시지 인덱스 계산
    setCurrentIndex(nextIndex); // 인덱스 상태 업데이트
    setMessage(messages[nextIndex]); // 메시지 상태 업데이트
  };


  // 볼 클릭 핸들러
  const handleSphereClick = () => {
    console.log("npc click!!")
    setShowSphere(false); // Sphere 숨김
    setShowSpeechBubble(true); // 말풍선 표시

    const npcPosition = { x: 130, y: 70, z:180 }; 
    const npcTarget = { x: 130, y: 70, z: 150 };
        
    console.log("npc speech start")

    setFocus({ x: 120, y: 80, z: 200 }); // 포커스 대상의 좌표

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
    }
    setCurrentAnimation((prev) => prev==="walkkk" ? "null" : "walkkk")
  }

  const handleBackClick=(event) => {
    event.stopPropagation();
    console.log("npc click again!!")
    setShowSpeechBubble(false); // 말풍선 숨김
    setShowSphere(true); // Sphere 다시 표시

    if (beforeCamera && controlsRef && controlsRef.current) {
      // gsap 애니메이션을 사용하여 카메라와 타겟을 원래대로 복귀
      gsap.to(camera.position, {
          x: beforeCamera.position.x,
          y: beforeCamera.position.y,
          z: beforeCamera.position.z,
          duration: 1,
          ease: "power3.inOut",
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
    setCurrentAnimation((prev) => prev==="null" ? "walkkk" : "null")
  }



  return (
    <RigidBody 
      type="kinematicPosition"
      name="NPC"
      colliders={false}
    >
      <CapsuleCollider 
        args={[14,30]} 
        position={[130,40,10]}
        //Player와 부딪혔을때 에니메이션
        onCollisionEnter={(other)=>{
          if(other.rigidBodyObject.name==="Player"){
            console.log("캐릭터와 충돌 발생",other.rigidBodyObject.name);
            setCurrentAnimation("walkkk"); // 충돌 애니메이션 설정
            setShowSphere(true);
            }
        }}
        onCollisionExit={(other)=>{
          if(other.rigidBodyObject.name==="Player"){
            console.log("캐릭터와 충돌 해제",other.rigidBodyObject.name);
            setCurrentAnimation("standing_kk"); // 원래 애니메이션으로 복귀
            setShowSphere(false);
          }
        }}
      />
      <primitive 
        object={scene}
        ref={npcRef}
        scale={33}
        position={[130,0,10]}
      />
      {/* showSphere 상태가 true일 때 */}
      {showSphere && (
        <mesh position={[130, 115, 20]} onClick={handleSphereClick}>
          <sphereGeometry args={[5, 24, 24]} />
          <meshStandardMaterial color={"green"} />
        </mesh>
      )}
      {/* showSpeechBubble 상태가 true일 때 */}
      {showSpeechBubble && (
        <mesh position={[134, 142, 20]}>
          <planeGeometry args={[150, 80]} />
          <meshStandardMaterial map={texture} />
        </mesh>
      )}
      {showSpeechBubble && (
        <Html position={[130, 140, 21]} transform occlude>
          <div className="speech-bubble-text">{message}</div>
        </Html>
      )}
      {showSpeechBubble && (
      <mesh position={[178, 160, 20]} onClick={handleBackClick}>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
      )}
      {showSpeechBubble&&(
      <mesh position={[178, 133, 20]} onClick={handleNextClick}>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial color={"blue"} />
      </mesh>
      )}
    </RigidBody>
    
  );
};

export default NPC;
