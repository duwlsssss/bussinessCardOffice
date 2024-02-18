import React, { useRef, useState, useEffect } from 'react';
import {useThree,extend,useFrame} from "@react-three/fiber"
import { useGLTF, useAnimations, Html, useTexture } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import { geometry } from 'maath'
import usePlayerStore from  "../store/playerStore"
import * as THREE from "three"

extend(geometry);

//npc 대사
const messages = [
  "안녕안뇽",
  "다음 메시지",
  "마지막 메시지"
];

const NPC = ({controlsRef}) => {
  const npcRef = useRef();
  const { scene, animations } = useGLTF("/dancer.glb");
  const { actions } = useAnimations(animations, npcRef);
  const { camera } = useThree();
  const [beforeCamera, setBeforeCamera] = useState(null);
  const { setFocus } = useCameraStore();
  const [showSpeechBubble, setShowSpeechBubble] = useState(false); // 말풍선 표시 상태
  const [currentAnimation, setCurrentAnimation] = useState("twerk");
  const playerPosition = usePlayerStore(state => state.playerPosition);
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

  // // Player와 충돌했을 때 NPC가 Player를 바라보게 하는 로직
  // const onCollisionEnter = ({other}) => {
  //   if (other.rigidBodyObject.name === "Player") {
  //     // Player 위치를 바탕으로 NPC가 회전하도록 설정
  //     const playerPos = new THREE.Vector3(); // Player 위치를 얻기 위한 임시 벡터
  //     other.getObject().getWorldPosition(playerPos); // other는 Player의 RigidBody 참조
  //     npcRef.current.lookAt(playerPos); // NPC가 Player를 바라보도록 설정
  //     setCurrentAnimation("wave"); // 충돌 애니메이션 설정
  //   }
  // };

  // // Player와의 충돌이 끝났을 때 NPC가 원래 방향(또는 기본 상태)을 바라보도록 설정
  // const onCollisionExit = ({other}) => {
  //   if (other.rigidBodyObject.name === "Player") {
  //     // NPC가 기본 방향 또는 초기 설정된 방향을 바라보도록 설정할 수 있습니다.
  //     // 예시로, 여기서는 간단하게 Z축 방향(혹은 다른 고정된 방향)을 바라보게 할 수 있습니다.
  //     // 실제 게임에서는 NPC의 초기 방향이나 게임 세계의 특정 지점을 바라보게 설정할 수 있습니다.
  //     npcRef.current.lookAt(new THREE.Vector3(npcRef.current.position.x, npcRef.current.position.y, npcRef.current.position.z + 10));
  //     setCurrentAnimation("twerk"); // 원래 애니메이션으로 복귀
  //   }
  // };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState(messages[0]);

  // 큐브 클릭 이벤트 핸들러
  const handleClick = () => {
    const nextIndex = (currentIndex + 1) % messages.length; // 다음 메시지 인덱스 계산
    setCurrentIndex(nextIndex); // 인덱스 상태 업데이트
    setMessage(messages[nextIndex]); // 메시지 상태 업데이트
  };



  // 볼 클릭 핸들러
  const handleImageClick = () => {
    setShowSpeechBubble(!showSpeechBubble); // 말풍선 표시 상태를 토글
    
    const npcPosition = { x: 130, y: 80, z:220 }; //npc 클릭 후 focus
    const npcTarget = { x: 130, y: 80, z: 180 };
        
    console.log("npc Click")

    setFocus({ x: 130, y: 70, z: 120 }); // 포커스 대상의 좌표

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
            onComplete: () => { 
              setBeforeCamera(null); 
              clearFocus();},
        });
    }
    setCurrentAnimation((prev) => prev==="windmill" ? "twerk" : "windmill")
  }

  return (
    <RigidBody 
      type="fixed"
      name="NPC"
      // //Player와 부딪혔을때 에니메이션
      // onCollisionEnter={onCollisionEnter}
      // onCollisionExit={onCollisionExit}
    >
      <primitive
        scale={0.7}
        ref={npcRef}
        object={scene}
        position={[130,70,120]}
      />
      <mesh position={[130, 157, 120]} onClick={handleImageClick}>
        <sphereGeometry args={[5, 24, 24]} />
        <meshStandardMaterial color={"blue"} />
      </mesh>

      {/* showSpeechBubble 상태가 true일 때만 큐브 렌더링 */}
      {showSpeechBubble && (
      <mesh position={[170, 115, 120]} onClick={handleClick}>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
      )}

      {showSpeechBubble && (
        <Html position={[130, 130, 120]} transform occlude="blending"
        geometry={
          <roundedPlaneGeometry args={[100, 40, 10]} />}
        >
          <div className="speech-bubble-text">{message}</div>
        </Html>
      )}
    </RigidBody>
    
  );
};

export default NPC;
