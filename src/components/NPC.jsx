import React, { useRef, useState, useEffect } from 'react';
import {useThree,extend,useFrame} from "@react-three/fiber"
import { useGLTF, useAnimations, Html} from '@react-three/drei';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from  "../store/playerStore";
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

//npc 대사
const messages = [
  "안녕안뇽방가방가",
  "다음 메시지 누르셈 다음 메시지 누르셈 다음 메시지 누르셈",
  "마지막 메시지 마지막 메시지 마지막 메시지 마지막 메시지",
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
  const playerPosition = usePlayerStore(state => state.playerPosition); // 플레이어 위치 추적
  const setIsVisible = usePlayerStore(state => state.setIsVisible); //플레이어 가시성 설정

  // console.log("actions",actions); //에니메이션 종류 확인 
  // const texture = useLoader(TextureLoader, '/images/speechBubble.png');
  const texture = useLoader(TextureLoader, '/images/speechBubble2.png');

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

  useEffect(() => {
    // npcRef가 현재 Three.js 객체를 참조하고 있고, 플레이어 위치가 유효한 경우
    if (npcRef.current && playerPosition) {
      // NPC가 플레이어 위치를 바라보도록 설정
      npcRef.current.lookAt(playerPosition.x, npcRef.current.position.y, playerPosition.z);
    }
  }, [playerPosition]); // 플레이어 위치가 변경될 때마다 
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState(messages[0]);

  // 큐브 클릭 이벤트 핸들러
  const handleNextClick = () => {
    console.log("next click!!")
    const nextIndex = (currentIndex + 1) % messages.length; // 다음 메시지 인덱스 계산
    // 마지막 메시지에 도달했을 경우 handleBackClick 함수 호출
    if (nextIndex === 0) {
      handleBackClick();
    } else {
      setCurrentIndex(nextIndex); // 인덱스 상태 업데이트
      setMessage(messages[nextIndex]); // 메시지 상태 업데이트
    }
  };

  // 볼 클릭 핸들러
  const handleSphereClick = () => {
    console.log("npc click, speech start!!")
    setCurrentIndex(0); // 인덱스를 0으로 초기화_대화를 첨부터
    setMessage(messages[0]);
    setShowSphere(false); // Sphere 숨김
    setShowSpeechBubble(true); // 말풍선 표시
    setIsVisible(false); // 플레이어를 숨김

    const npcPosition = { x: 130, y: 100, z: 1350 }; 
    const npcTarget = { x: 130, y: 0, z: 1350 };

    setFocus(npcPosition); // 포커스 대상 좌표 설정

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

  const handleBackClick=() => {
    console.log("back click!!, speech end")
    setShowSpeechBubble(false); // 말풍선 숨김
    setShowSphere(true); // Sphere 다시 표시
    setIsVisible(true); // 플레이어를 다시 표시

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
        args={[20,30]} 
        position={[130,45,1210]}
        //Player와 부딪혔을때 에니메이션
        onCollisionEnter={(other)=>{
          if(other.rigidBodyObject.name==="Player"){
            console.log("캐릭터와 충돌 발생",other.rigidBodyObject.name);
            setCurrentAnimation("walkkk"); // 충돌 애니메이션 설정
            setShowSphere(true);
        }}}
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
        position={[130,0,1210]}
      />
      {/* showSphere 상태가 true일 때 */}
      {showSphere && (
        <mesh position={[130, 115, 1220]} onClick={handleSphereClick}>
          <sphereGeometry args={[5, 24, 24]} />
          <meshStandardMaterial color={"green"} />
        </mesh>
      )}
      {/* showSpeechBubble 상태가 true일 때 */}
      {showSpeechBubble && (
        <mesh position={[134, 142, 1220]}>
          <planeGeometry args={[150, 80]} />
          <meshBasicMaterial map={texture} transparent={true}/>
        </mesh>
      )}
      {showSpeechBubble && (
        <Html position={[130, 140, 1220]} transform occlude>
          <div className='speech-bubble'>
            <div className="speech-bubble-text">{message}</div>
          </div>
        </Html>
      )}
      {showSpeechBubble && (
      <mesh position={[190, 160, 1220]} onClick={handleBackClick}>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
      )}
      {showSpeechBubble&&(
      <mesh position={[190, 120, 1220]} onClick={handleNextClick}>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial color={"blue"} />
      </mesh>
      )}
    </RigidBody>
  );
};

export default NPC;