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
import { RigidBody, CapsuleCollider, CuboidCollider, useRapier, vec3 } from '@react-three/rapier';
import useInOutStore from "../store/inOutStore";
import useLoginStore from '../store/logInStore';
import axios from 'axios';

//npc 대사
const messages = [
  "안녕 김명사에 온 걸 환영해",
  "김명사는 대학생을 위한 명함 제작소야",
  "너만의 개성이 담긴 명함을 만들어봐",
  "명함을 만드려면 로그인부터 해야해",
  "반가워 ><",
  "이제 명함을 만들러 가보자 !"
];

const NPC = () => {
  const isAnimationComplete = useCameraStore((state) => state.isAnimationComplete);
  const { isInside, setIsInside } = useInOutStore((state) => ({
    isInside: state.isInside,
    setIsInside: state.setIsInside,
  }));
  const npcRef = useRef();
  const npcRigidBody = useRef(null);

  const { isFocused, clearFocus } = useCameraStore();
  // const { user, isLoggedIn } = useLoginStore(state => ({
  //   user: state.user,
  //   isLoggedIn: state.isLoggedIn
  // }));
  // const user = useLoginStore((state)=>state.user)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState(messages[0]);
  const npcPosition = useNPCStore((state) => state.npcPosition);
  const setNpcPosition = useNPCStore(state => state.setNpcPosition);
  const isIntroductionEnd = useNPCStore((state) => state.isIntroductionEnd);
  const setIsIntroductionEnd = useNPCStore((state) => state.setIsIntroductionEnd);
  const isNpcVisible = useNPCStore(state => state.isNpcVisible);
  const playerPosition = usePlayerStore(state => state.playerPosition); // 플레이어 위치 추적
  const setPlayerPosition = usePlayerStore(state => state.setPlayerPosition);
  const isCharacterVisible = usePlayerStore(state => state.isCharacterVisible);
  const setIsCharacterVisible = usePlayerStore(state => state.setIsCharacterVisible); //플레이어 가시성 설정
  // const setIsCollided = usePlayerStore(state => state.setIsCollided); //플레이어 충돌

  const { scene, animations } = useGLTF("/models/character_standing_medium.glb");
  const { actions } = useAnimations(animations, scene);

  // const [beforeCamera, setBeforeCamera] = useState(null);
  // const [showSphere,setShowSphere]=useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false); // 말풍선 표시 상태
  const [currentAnimation, setCurrentAnimation] = useState("standing_55");

  // console.log("actions",actions); //에니메이션 종류 확인 

  // 말풍선 텍스처
  // const texture = useLoader(TextureLoader, '/images/speechBubble.png');
  const texture = useLoader(TextureLoader, '/images/speechBubble2.png');

  // const three=useThree();
  // console.log("three",three);//정보 출력

  
  //로그인 관련 
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(""); //사용자 이름 저장

  useEffect(() =>{
    //백엔드 서버로 silent-refresh 요청을 보냄
    //사용자의 로그인 상태를 확인하고, 새로운 액세스 토큰을 발급받음
    axios.post('http://localhost:3000/user/auth/silent-refresh',{}, {
      withCredentials:true
    }).then(res=> {
      console.log(res);
      const {accessToken} = res.data; //accessToken을 추출하여 로컬 상태에 저장
      console.log(accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; //Axios의 기본 헤더에 이 토큰을 추가
      //사용자가 로그인했음을 확인, 이후의 요청에 사용자 인증 정보를 포함시킬 수 있음
      setIsLoggedIn(true)
    });
  },[])

  //그림자
  useEffect(()=>{
    scene.traverse((obj)=>{
        if(obj.isMesh){
            obj.castShadow=true;
            obj.recieveShadow=true;
        }
    });
  },[scene]);

  // useEffect(() => {
  //   const isLoaded = scene && actions && Object.keys(actions).length > 0;
  //   if (isLoaded) {
  //       actions.standing_55.play();
  //   }
  // }, [scene, actions]);

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

  // useEffect(() => {
  //   // npcRef가 현재 Three.js 객체를 참조하고 있고, 플레이어 위치가 유효한 경우
  //   if (npcRef.current && playerPosition) {
  //     // NPC가 플레이어 위치를 바라보도록 설정
  //     npcRef.current.lookAt(playerPosition.x, npcRef.current.position.y, playerPosition.z);
  //   }
  // }, [playerPosition]); // 플레이어 위치가 변경될 때마다 
  
  const handleNextClick = () => {
    console.log("next click!!");

    let nextIndex = (currentIndex + 1) % messages.length;
    console.log(`Next Index: ${nextIndex}, Message: ${messages[nextIndex]}`);

    let nextMessage = messages[nextIndex]; // 기본 메시지

    if (nextIndex === 0) {
      handleBackClick();
    } else if (nextIndex === 4&& isLoggedIn) {  // 사용자가 로그인한 경우, 메시지를 사용자 이름으로 개인화 
       // user 객체에서 사용자 이름 가져오기
      nextMessage = `반가워,  ><`; // 메시지를 사용자 이름으로 개인화
    } else if (nextIndex === 4&& !isLoggedIn) {
        // 사용자가 로그인하지 않은 경우, 로그인 버튼 표시
        setShowLogin(true);
        return; // 이후 로직 중단
    }
    
    setCurrentIndex(nextIndex);
    setMessage(nextMessage);
};

  

  


  // 볼 클릭 핸들러
  // const handleSphereClick = () => {
  //   console.log("npc click, speech start!!")
  //   setCurrentIndex(0); // 인덱스를 0으로 초기화_대화를 첨부터
  //   setMessage(messages[0]);
  //   setShowSphere(false); // Sphere 숨김
  //   setShowSpeechBubble(true); // 말풍선 표시
  //   setIsCharacterVisible(false); // 플레이어를 숨김
  //   // setIsCollided(true);

  //   const npcPosition = { x: 130, y: 110, z: 1350 }; 
  //   const npcTarget = { x: 130, y: 90, z: 1200 };

  //   setFocus(npcPosition); // 포커스 대상 좌표 설정

  //   if (!beforeCamera && controlsRef.current) {
  //       setBeforeCamera({
  //           position: camera.position.clone(),
  //           target: controlsRef.current.target.clone(),
  //       });
  //       gsap.to(camera.position, {
  //           x: npcPosition.x,
  //           y: npcPosition.y,
  //           z: npcPosition.z,
  //           duration: 1,
  //           ease: "power3.inOut",
  //       });
  //       gsap.to(controlsRef.current.target, {
  //           x: npcTarget.x,
  //           y: npcTarget.y,
  //           z: npcTarget.z,
  //           duration: 1,
  //           ease: "power3.inOut",
  //           onUpdate: () => { controlsRef.current.update(); },
  //       });
  //   }
  //   setCurrentAnimation((prev) => prev==="walking_55" ? "null" : "walking_55")

  // }

  const handleBackClick=() => {
    console.log("speech end")
    setIsCharacterVisible(true);
    isIntroductionEnd(true);
    setCurrentAnimation((prev) => prev==="standing_55" ? "walking_55" : "standing_55")
  }

  useEffect(() => {
    if (isNpcVisible) {
      setShowSpeechBubble(true);
    }
  }, [isNpcVisible]);

  useFrame((state, delta) => {
    if (npcRef.current&&npcRigidBody.current&&!isFocused) {
        try {
          //player와 부딪혔을 떄 애니메이션 _내부에서

          //npc가 플레이어 방향으로 회전하게 위치 저장
          const position = vec3(npcRigidBody.current.translation());
          // const npcWorldPosition = npcRef.current.getWorldPosition(new THREE.Vector3());
          setNpcPosition(position.x, position.y, position.z);

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
              args={[1.5, 2]} 
            />
            <primitive 
              object={scene}
              ref={npcRef}
              scale={2.4}
              position={[0, -3.4, 0]}
            />
          </RigidBody>
        )}
        {/* showSphere 상태가 true일 때 */}
        {/* {showSphere && (
          <mesh position={[npcPosition.x, npcPosition.y + 10, npcPosition.z]} onClick={handleSphereClick}>
            <sphereGeometry args={[5, 24, 24]} />
            <meshStandardMaterial color={"green"} />
          </mesh>
        )} */}
        {showSpeechBubble && (
          <mesh position={[npcPosition.x, npcPosition.y + 6.7, npcPosition.z]}>
            <planeGeometry args={[16, 6]} />
            <meshBasicMaterial map={texture} transparent={true} />
          </mesh>
        )}
        {showSpeechBubble && (
          <Html position={[npcPosition.x, npcPosition.y + 5, npcPosition.z+0.1]} transform occlude>
            <div className='speech-bubble'>
              <div className="speech-bubble-text">{message}</div>
            </div>
          </Html>
        )}
        {showSpeechBubble && (
        <mesh position={[npcPosition.x + 5.5, npcPosition.y+5, npcPosition.z]} onClick={handleNextClick}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color={"blue"} />
        </mesh>
        )} 
        {showLogin && (
        <Html position={[npcPosition.x-2 , npcPosition.y+6, npcPosition.z+0.1]}>
          <button type="button" className="login-with-google-btn">
            <a href="http://localhost:8000/user/auth/google">구글로 로그인하기</a>
            {/*사용자가 이 주소로 접근, 서버는 사용자를 Google의 OAuth 인증 페이지로 리다이렉트(redirect), 여기서 사용자는 자신의 Google 계정으로 로그인*/}
          </button>
        </Html>
        )}
        {/* {showSpeechBubble && (
        <mesh position={[npcPosition.x + 5.5, npcPosition.y+8, npcPosition.z]} onClick={handleBackClick}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color={"red"} />
        </mesh> 
        )} */}
    </>
  );
}

export default NPC;
