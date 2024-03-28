import React, { useRef, useState, useEffect } from 'react';
import {useThree,useFrame} from "@react-three/fiber"
import { useGLTF, useAnimations, Html} from '@react-three/drei';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from  "../store/playerStore";
import useNpcInsideStore from  "../store/npcInsideStore";
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider, CuboidCollider, useRapier, vec3 } from '@react-three/rapier';

//npc 대사
const messsages = [
  "궁금한 게 있으면 나한테 물어봐 !!",
  "내 명함이 궁금해 ??"
];

const NPCInside = () => {
 
  const { isFocused, setFocus, clearFocus } = useCameraStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [message, setMessage] = useState(messsages[0]);
  const npcPosition = useNpcInsideStore((state) => state.npcPosition);
  const setNpcPositionIn = useNpcInsideStore(state => state.setNpcPositionIn);
  const forOriginRot = useNpcInsideStore(state => state.forOriginRot); //characterRef의 원래 방향으로 돌아가기 위해
  const setForOriginRot = useNpcInsideStore(state => state.setForOriginRot); 

  const setPlayerToNPC=usePlayerStore(state=>state.setPlayerToNPC);
  const playerPosition = usePlayerStore(state => state.playerPosition); // 플레이어 위치 추적
  const setPlayerPosition = usePlayerStore(state => state.setPlayerPosition);
  const isCharacterVisible = usePlayerStore(state => state.isCharacterVisible);
  const setIsCharacterVisible = usePlayerStore(state => state.setIsCharacterVisible); //플레이어 가시성 설정

  const [showSphere,setShowSphere]=useState(true);

  const { scene, animations } = useGLTF("/models/character_standing_medium2.glb");
  const { actions } = useAnimations(animations, scene);
  const [currentAnimation, setCurrentAnimation] = useState("standing_55");

  // console.log("actions",actions); //에니메이션 종류 확인 

  const [showSpeechBubble, setShowSpeechBubble] = useState(false); // 말풍선 표시 상태

  // 말풍선 텍스처
  const texture = useLoader(TextureLoader, '/images/sb.png');

  const npcInRef = useRef();
  const npcInRigidBody = useRef(null);

  const sbRef = useRef();

  const [beforeCamera, setBeforeCamera] = useState(null)
  const camera = useThree((state) => state.camera)

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
      actions[currentAnimation].reset().fadeIn(0.2).play();
    }
    return()=>{
      if (actions[currentAnimation]) {
        actions[currentAnimation].fadeOut(0.2).stop();
      }
    }
  },[actions,currentAnimation]);

  const handleNextClick = () => {
    console.log("next click!!");
  
    let nextIndex = (currentIndex + 1) % messsages.length;
    console.log(`Next Index: ${nextIndex}, Message: ${messsages[nextIndex]}`);
  
    setCurrentIndex(nextIndex);
    setMessage(messsages[nextIndex]);
    
    // 다시 처음으로 돌아갔을 때 처리
    if (nextIndex === 0) {
      handleBackClick();
    }
  };

  const handleBackClick=() => {
    setIsCharacterVisible(true);
    console.log("inside NPC speech end")
    setShowSpeechBubble(false);
    setCurrentAnimation((prev) => prev==="walking_55" ? "standing_55" : "walking_55")
    setPlayerToNPC(false); //평소 상태
    setForOriginRot(true);

    if (beforeCamera) {
      gsap.to(camera.position, {
        x: beforeCamera.position.x,
        y: beforeCamera.position.y,
        z: beforeCamera.position.z,
        duration: 0.5,
        ease: "power1.out",
        onUpdate: () => {
          camera.lookAt(playerPosition.x, playerPosition.y+2, playerPosition.z);
        },
        onComplete: () => {
          setShowSphere(true);
          setBeforeCamera(null); // 이전 카메라 상태 해제
          clearFocus(); // 카메라 포커스 해제
        },
      });
    }

  }


  //볼 클릭하면 npc 대화시작
  const handleBallClick = () => {
    console.log("ball click");
    setShowSphere(false);
    setShowSpeechBubble(true);
    setIsCharacterVisible(false); // 플레이어를 숨김
    setPlayerToNPC(true);
    setCurrentAnimation((prev) => prev === "standing_55" ? "walking_55" : "standing_55");

    // NPC의 위치를 THREE.Vector3 객체로 변환합니다.
    const npcPosVector = new THREE.Vector3(npcPosition.x, npcPosition.y, npcPosition.z);
    
    // Determine the forward vector of the NPC based on its rotation
    const forward = new THREE.Vector3(0, 0, -1); // Assuming the NPC's forward is along the negative z-axis
    forward.applyQuaternion(npcInRef.current.quaternion); // Use the NPC's current rotation

    // Calculate a point in front of the NPC where the camera should move to
    const distanceFromNPC = 10; // Distance from the NPC to the camera
    const targetPosition = npcPosVector.clone().add(forward.multiplyScalar(-distanceFromNPC)); // add 함수를 사용하기 전에 clone 메소드로 복제합니다.
    const targetLookAt = new THREE.Vector3(npcPosition.x, npcPosition.y + 3, npcPosition.z);

    setFocus({ x: targetPosition.x, y: targetPosition.y+3, z: targetPosition.z }); // 포커스 설정

    if (!beforeCamera) {
        // 현재 카메라 상태 저장
        setBeforeCamera({
            position: camera.position.clone(),
        });

        // Camera를 NPC가 바라보는 방향으로 부드럽게 이동시킵니다.
        gsap.to(camera.position, {
            x: targetPosition.x,
            y: targetPosition.y+3,
            z: targetPosition.z,
            duration: 1,
            ease: "power3.inOut",
            onUpdate: () => {
                camera.lookAt(targetLookAt);
          },
        });
    }
};

  useEffect(() => {
     const npcPos = vec3(npcInRigidBody.current.translation());
     setNpcPositionIn(npcPos.x,npcPos.y,npcPos.z);
  }, [npcInRigidBody]);


  const [angle,setAngle]=useState(0);

  useFrame((state, delta) => {
      if (npcInRef.current &&npcInRigidBody.current&&!isFocused) {
        try {
          //npc가 플레이어 방향으로 회전
          // console.log(`npc position x ${npcPosition.x}  y ${npcPosition.y}  z ${npcPosition.z}`);

          // 플레이어 위치와 NPC 위치 사이의 차이 벡터를 계산
          const dx = playerPosition.x - npcPosition.x;
          const dz = playerPosition.z - npcPosition.z;
  
          // atan2 함수를 사용하여 플레이어 방향으로의 회전 각도를 계산
          const angle = Math.atan2(dx, dz);
          setAngle(angle);
  
          // NPC의 Y축 회전을 직접 설정
          npcInRef.current.rotation.y = angle;
          // //말풍선
          if (sbRef.current) {
            sbRef.current.rotation.y = angle;
          }

        } catch (err) {
          alert(err.name);
          alert(err.message);
          alert(err.stack);
          alert(err);
      }
  }
})

  
  return (
    <>
        <RigidBody 
          type="kinematicPosition"
          name="NPC"
          colliders={false}
          ref={npcInRigidBody}
          position={[12, 6, -5]}
        >
          <CapsuleCollider 
            args={[1.5, 2]} 
          />
          <primitive 
            object={scene}
            ref={npcInRef}
            scale={2.4}
            position={[0, -3.4, 0]}
          />
        </RigidBody>
        {/* showSphere 상태가 true일 때 */}
        {showSphere && (
          <mesh position={[npcPosition.x, npcPosition.y+5, npcPosition.z]} onClick={handleBallClick} 
            onPointerOver={(e) => {
              // 마우스가 Mesh 위에 있을 때 커서를 포인터로 변경
              document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
              // 마우스가 Mesh에서 벗어났을 때 커서를 기본으로 변경
              document.body.style.cursor = 'auto';
          }}
          >
            <sphereGeometry args={[0.5, 10, 10]} />
            <meshStandardMaterial color={"green"} />
          </mesh>
        )}
        {/*말풍선*/}
        {showSpeechBubble && (
          <mesh position={[npcPosition.x, npcPosition.y + 6.5, npcPosition.z]} rotation={[0,angle,0]} onClick={handleNextClick}
            onPointerOver={(e) => {
              // 마우스가 Mesh 위에 있을 때 커서를 포인터로 변경
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              // 마우스가 Mesh에서 벗어났을 때 커서를 기본으로 변경
              document.body.style.cursor = 'auto';
            }}
          >
            <planeGeometry args={[14, 6]} />
            <meshBasicMaterial map={texture} color="#ffffff" transparent={true} />
          </mesh>
        )}
        {showSpeechBubble && (
          <Html position={[npcPosition.x, npcPosition.y + 5, npcPosition.z+0.1]} 
           rotation={[0, angle, 0]}
           transform  >
            <div className='speech-bubble'>
              <div key={message} className="speech-bubble-text">
                {message }
              </div>
            </div>
          </Html>
        )}
    </>
  );
}

export default NPCInside;
