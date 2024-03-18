import React, { useRef, useState, useEffect } from 'react';
import {useThree,useFrame} from "@react-three/fiber"
import { useGLTF, useAnimations, Html} from '@react-three/drei';
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from  "../store/playerStore";
import useNPCStore from  "../store/npcStore";
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider, CuboidCollider, useRapier, vec3, euler } from '@react-three/rapier';
import useLoginStore from '../store/logInStore';

//npc 대사
const introMessage = [
  "안녕 김명사에 온 걸 환영해~~",
  "김명사는 대학생을 위한 명함 제작소야",
  "너만의 개성이 담긴 명함을 만들어봐",
  "명함을 만드려면 로그인부터 해야해",
  "난 바빠서 이만 사무실로 가야해 ∙∙∙",
  "명함을 만들고싶으면 사무실로 와 !!!",
];


const NPCIntro = () => {
 
  const [currentPointIndex, setCurrentPointIndex] = useState(0);//npc 사무실 안으로 들어가는 경로 
  const [currentRotationIndex, setCurrentRotationIndex] = useState(0);//npc 사무실 안으로 들어가는 경로 회전
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState(introMessage[0]);
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

  const [showSpeechBubble, setShowSpeechBubble] = useState(false); // 말풍선 표시 상태

  // 말풍선 텍스처
  const texture = useLoader(TextureLoader, '/images/speechBubble2.png');

  //로그인 관련 
  const { user, isLoggedIn } = useLoginStore(state => ({
    user: state.user,
    isLoggedIn: state.isLoggedIn
  }));
  const { showLogin, setShowLogin } = useLoginStore(state => ({
    showLogin: state.showLogin,
    setShowLogin: state.setShowLogin
  }));

  // const user = useLoginStore((state)=>state.user)
  // const [showLogin, setShowLogin] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [userName, setUserName] = useState(""); //사용자 이름 저장

  // useEffect(() =>{
  //   //백엔드 서버로 silent-refresh 요청을 보냄
  //   //사용자의 로그인 상태를 확인하고, 새로운 액세스 토큰을 발급받음
  //   axios.post('http://localhost:3000/user/auth/silent-refresh',{}, {
  //     withCredentials:true
  //   }).then(res=> {
  //     console.log(res);
  //     const {accessToken} = res.data; //accessToken을 추출하여 로컬 상태에 저장
  //     console.log(accessToken);
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; //Axios의 기본 헤더에 이 토큰을 추가
  //     //사용자가 로그인했음을 확인, 이후의 요청에 사용자 인증 정보를 포함시킬 수 있음
  //     setIsLoggedIn(true)
  //   }).catch(error => {
  //     console.error('Silent refresh error:', error);
  //   });
  // },[])


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

  const handleNextClick = () => {
    console.log("next click!!");
  
    let nextIndex = currentIndex + 1;
    
    // 로그인 상태가 아니고 현재 메시지가 "명함을 만드려면 로그인부터 해야해"이면 로그인 버튼 출력 
    if (nextIndex === 4 && !isLoggedIn) {
      setShowLogin(true);
      setMessage(introMessage[3]); // "명함을 만드려면 로그인부터 해야해" 메시지 유지
      return; // 로그인 하지 않은 상태에서는 다음 메시지로 넘어가지 않도록 함
    }
    // 로그인 상태이면 사용자 이름과 반가워 출력
    if (isLoggedIn && nextIndex === 4) {
      setMessage(`반가워 ${user.name} ><`);
      nextIndex++; // 사용자 이름을 포함한 메시지를 표시한 후 다음 메시지로 넘어감
    }
    const finalIndex = nextIndex % introMessage.length;
    console.log(`Next Index: ${finalIndex}, Message: ${introMessage[finalIndex]}`);
  
    setCurrentIndex(finalIndex);

    // "명함을 만드려면 로그인부터 해야해" 메시지가 아닐 때만 메시지 업데이트
    if (finalIndex !== 3) { 
      setMessage(introMessage[finalIndex]);
    }
  
    // 다시 처음으로 돌아갔을 때 
    if (finalIndex === 0) {
      console.log("speech end")
      setIsIntroductionEnd(true);
    }
  };

  useEffect(() => {
    // 로그인 상태(user가 존재하는 상태)가 되면 자동으로 다음 메시지로 넘어가기
    if (isLoggedIn  && currentIndex === 3) {
      handleNextClick();
    }
  }, [isLoggedIn]);


  useEffect(() => {
    if (isNpcVisible) {
      setShowSpeechBubble(true);
    }
  }, [isNpcVisible]);


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
    { x: 0, y: 5.2, z: 18 },
    { x: 0, y: 6.1, z: 18 },
    { x: 0, y: 6.1, z: 15 },
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
              
              setCurrentPointIndex(nextIndex);
              setCurrentRotationIndex(nextIndex);

              if (nextIndex === 0) { //마지막 위치임
                setIsNpcVisible(false);
              }
            }
          }
          //말풍선이 npcPosition 기반으로 출력됨 
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
            position={[0, 4.5, 120]}
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
        {showSpeechBubble && (
          <mesh position={[npcPosition.x, npcPosition.y + 6.7, npcPosition.z]}>
            <planeGeometry args={[16, 6]} />
            <meshBasicMaterial map={texture} transparent={true} />
          </mesh>
        )}
        {showSpeechBubble && (
          <Html position={[npcPosition.x, npcPosition.y + 5, npcPosition.z+0.1]} transform occlude>
            <div className='speech-bubble'>
              <div className="speech-bubble-text">
                {message}
              </div>
            </div>
          </Html>
        )}
        {showSpeechBubble && (
        <mesh position={[npcPosition.x + 5.5, npcPosition.y+5, npcPosition.z]} onClick={handleNextClick}
          onPointerOver={(e) => {
              // 마우스가 Mesh 위에 있을 때 커서를 포인터로 변경
              document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
              // 마우스가 Mesh에서 벗어났을 때 커서를 기본으로 변경
              document.body.style.cursor = 'auto';
          }}
        >
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color={"blue"} />
        </mesh>
        )} 
        {/* {showLogin && (
        <Html position={[npcPosition.x-2 , npcPosition.y+6, npcPosition.z+0.1]}>
          <button type="button" className="login-with-google-btn">
            <a href="http://localhost:8000/user/auth/google">
            구글로 로그인하기
            </a>
          </button>
        </Html>
        )} */}
    </>
  );
}

export default NPCIntro;
