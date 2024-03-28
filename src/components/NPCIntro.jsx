import React, { useRef, useState, useEffect } from 'react';
import {useThree,useFrame} from "@react-three/fiber"
import { useGLTF, useAnimations, Html} from '@react-three/drei';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from  "../store/playerStore";
import useNPCStore from  "../store/npcIntroStore";
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider, CuboidCollider, useRapier, vec3, euler } from '@react-three/rapier';
import useLoginStore from '../store/logInStore';
import useResourceStore from '../store/resourceStore';

const NPCIntro = () => {

  // const { models, textures } = useResourceStore();
  // const model = models['npcModel'];
  // const texture = textures['speechBubble'];

  // if (!model) {
  //   return null; // 모델이 로드되지 않았다면, 렌더링하지 않음
  // }
  // const { scene, animations } = model;
 
  const [currentPointIndex, setCurrentPointIndex] = useState(0);//npc 사무실 안으로 들어가는 경로 
  const [currentRotationIndex, setCurrentRotationIndex] = useState(0);//npc 사무실 안으로 들어가는 경로 회전

  //npc 대사
  const introMessage = [
    " 안녕 김명사에 온 걸 환영해 ~~",
    " 김명사는 대학생을 위한 명함 사무소야",
    " 너만의 개성이 담긴 명함을 만들어봐",
    " 명함을 만드려면 로그인부터 해야해",
    " 아래 버튼을 클릭해 로그인해줘",
    " 난 바빠서 이만 사무실로 가야해 ∙∙∙",
    " 명함을 만들고싶으면 사무실로 와 !!!",
  ];

  const [message, setMessage] = useState(introMessage[0]);
  const [showMessage, setShowMessage] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userName, setUserName] = useState(''); // 사용자 이름을 저장

  const npcPosition = useNPCStore((state) => state.npcPosition);
  const setNpcPosition = useNPCStore(state => state.setNpcPosition);
  const isIntroductionEnd = useNPCStore((state) => state.isIntroductionEnd);
  const setIsIntroductionEnd = useNPCStore((state) => state.setIsIntroductionEnd);
  const isNpcVisible = useNPCStore(state => state.isNpcVisible);
  const setIsNpcVisible = useNPCStore(state => state.setIsNpcVisible);
  const setIsCharacterVisible = usePlayerStore(state => state.setIsCharacterVisible); //플레이어 가시성 설정


  const { scene, animations } = useGLTF("/models/character_standing_medium.glb");
  const { actions } = useAnimations(animations, scene);
  const [currentAnimation, setCurrentAnimation] = useState("standing_55");

  // console.log("actions",actions); //에니메이션 종류 확인 

  const {showSpeechBubble, setShowSpeechBubble} = useNPCStore();

  // 말풍선 텍스처
  const texture = useLoader(TextureLoader, '/images/sb.png');

  //로그인 관련 
  const { user, isLoggedIn } = useLoginStore(state => ({
    user: state.user,
    isLoggedIn: state.isLoggedIn
  }));
  const { showLogin, setShowLogin } = useLoginStore(state => ({
    showLogin: state.showLogin,
    setShowLogin: state.setShowLogin
  }));
  const { justLoggedOut, resetJustLoggedOut } = useLoginStore();
  const { animationRestart, resetAnimationRestart } = useLoginStore();
  // const three=useThree();
  // console.log("three",three);//정보 출력

  const npcRef = useRef();
  const npcRigidBody = useRef(null);


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


  useEffect(() => {
    // 로그아웃 상태에서 대화를 처음부터 시작해야 하는 경우
    if (animationRestart && !isLoggedIn) {
      console.log("대화 다시시작");
      setCurrentIndex(0); // 대화 인덱스를 처음으로 설정
      setMessage(introMessage[0]); // 첫 번째 메시지로 설정
      setCurrentAnimation("standing_55"); // NPC 애니메이션 초기화
      resetAnimationRestart(); // 애니메이션 재시작 후 상태 초기화
      // npc가 앞을 바라보게 설정
      if (npcRef.current) {
        npcRef.current.rotation.y = Math.PI/2;
      }
    }
  }, [animationRestart, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      setShowLogin(false); // 로그인 상태에서는 로그인 버튼을 숨김
      setUserName(user.user.name);
    } else if (!isLoggedIn && !animationRestart && currentIndex === 4) {
      // 로그인하지 않았고, 애니메이션 재시작 상태가 아니며, 현재 대화 인덱스가 4인 경우
      setShowLogin(true);
    }
  }, [isLoggedIn, currentIndex, animationRestart, user?.user?.name]);
  
  // 대화 중 로그아웃 상태로 전환되었을 때의 처리
  useEffect(() => {
    if (!isLoggedIn && justLoggedOut&&!animationRestart) {
      setCurrentIndex(4); // "로그인해줘" 메시지로 이동
      setMessage(introMessage[4]);
      resetJustLoggedOut();
    }
  }, [isLoggedIn, justLoggedOut]);
  

  const handleNextClick = () => {
    console.log("next click!!");
   
    let nextIndex = currentIndex + 1;

    console.log(`Next Index: ${nextIndex}, Message: ${introMessage[nextIndex]}`);

    if (nextIndex >= introMessage.length) {
      nextIndex = 0; // 다시 처음으로 돌아갔을 때
    }

    // "아래 버튼을 클릭해 로그인해줘" 메시지인 경우
    if (currentIndex === 4) {
      if (!isLoggedIn) {
        // 로그인이 되어있지 않다면, 현재 메시지에서 머무르도록 하고, 다음으로 넘어가지 않음
        console.log("계속 진행하려면 로그인하셈");
        return; // 여기서 함수 실행을 멈추고, 다음 메시지로 넘어가지 않음
      }
      else if(isLoggedIn){
        nextIndex = currentIndex + 1; //로그인 상태이면 다음 메시지로
      }
    }

    if (nextIndex === 0) {
      console.log("Speech End");
      setIsIntroductionEnd(true);
    }

    setMessage(introMessage[nextIndex]);
    setCurrentIndex(nextIndex); // 다음 인덱스로 업데이트
    ;}

  //말풍선 나오고 2초 후 메세지 시작
  useEffect(()=>{
    setTimeout(()=>{
      if(showSpeechBubble) setShowMessage(true);
    },2000);
  },[showSpeechBubble]);

  useEffect(() => {
    if (isIntroductionEnd) {
      setIsCharacterVisible(true);
      setShowSpeechBubble(false);
      setCurrentAnimation((prev) => prev==="standing_55" ? "walking_55" : "standing_55")
    }
  },[isIntroductionEnd]);

  const pathPoints = [
    { x: 0, y: 4.5, z: 73 },
    { x: 15, y: 4.5, z: 73 },
    { x: 15, y: 4.5, z: 28 },
    { x: 0, y: 4.5, z: 28 },
    { x: 0, y: 4.5, z: 20 },
    { x: 0, y: 5.2, z: 20 },
    { x: 0, y: 5.2, z: 17 },
    { x: 0, y: 6.1, z: 17 },
    { x: 0, y: 6.1, z: 14 },
  ];
  const rotations = [
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)), // 앞을 바라봄(-z)
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), // 오른쪽을 바라봄
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)), // 앞쪽을 바라봄
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)), // 왼쪽을 바라봄
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)), // 앞을 바라봄
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)), // 앞을 바라봄
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)), // 앞을 바라봄
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)), // 앞을 바라봄
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)), // 앞을 바라봄
  ];

  useFrame((state, delta) => {
    if (npcRef.current&&npcRigidBody.current) {
        try {
          // console.log("isNpcVisible",isNpcVisible);
          const currentPosition = vec3(npcRigidBody.current.translation());
          if(isIntroductionEnd){ 
            const targetPosition = pathPoints[currentPointIndex];
            const targetRotation = rotations[currentRotationIndex];
            const direction = new THREE.Vector3(
              targetPosition.x - currentPosition.x,
              targetPosition.y - currentPosition.y,
              targetPosition.z - currentPosition.z
            ).normalize();

            const speed=10
            const moveDistance = speed * delta; // 프레임당 이동 거리

            const moveX = currentPosition.x + direction.x * moveDistance;
            const moveY = currentPosition.y + direction.y * moveDistance;
            const moveZ = currentPosition.z + direction.z * moveDistance;

            npcRigidBody.current.setNextKinematicRotation(targetRotation, true);
            npcRigidBody.current.setNextKinematicTranslation(new THREE.Vector3(moveX, moveY, moveZ),true);

            // 목표 위치에 충분히 가까워졌는지 확인
            if (Math.hypot(moveX - targetPosition.x, moveZ - targetPosition.z) < 0.1) {
              const nextIndex = (currentPointIndex + 1) % pathPoints.length;

              if (nextIndex === 0) { //마지막 위치임
                setIsNpcVisible(false);
              }
              
              setCurrentPointIndex(nextIndex);
              setCurrentRotationIndex(nextIndex);

            }
          }
          setNpcPosition(currentPosition.x, currentPosition.y, currentPosition.z);

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
        {isNpcVisible&&(
          <RigidBody 
            type="kinematicPosition"
            name="NPC"
            colliders={false}
            ref={npcRigidBody}
            position={[0, 4.5, 129]}
          >
            <CapsuleCollider 
              args={[1.5, 1]} 
            />
            <primitive 
              object={scene}
              ref={npcRef}
              scale={2.4}
              position={[0, -3.4, 0]}
            />
          </RigidBody>
        )}
        {/*말풍선*/}
        {showSpeechBubble && (
          <mesh position={[npcPosition.x, npcPosition.y + 6.3, npcPosition.z]} onClick={handleNextClick}
            onPointerOver={(e) => {
              // 마우스가 Mesh 위에 있을 때 커서를 포인터로 변경
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              // 마우스가 Mesh에서 벗어났을 때 커서를 기본으로 변경
              document.body.style.cursor = 'auto';
            }}
          >
            <planeGeometry args={[10,5.5]} />
            <meshBasicMaterial map={texture} color="#ffffff" transparent={true} />
          </mesh>
        )}
        {showSpeechBubble && (
          <Html position={[npcPosition.x, npcPosition.y + 5, npcPosition.z+0.1]} transform occlude>
            <div className='speech-bubble'>
              <div key={message} className="speech-bubble-text">
                {(currentIndex === 4&&isLoggedIn) ? (
                    <div className="userNameTyping">
                    반가워 <span style={{ color: '#0339fc' }}>{userName}</span> *^^*
                    </div>
                  ): message }
              </div>
            </div>
          </Html>
        )}
    </>
  );
}

export default NPCIntro;
