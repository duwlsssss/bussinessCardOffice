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
import useLoginStore from '../store/logInStore';

//npc 대사
const messsages = [
  "궁금한 게 있으면 나한테 물어봐!!",
];

const NPCIntro = () => {
 
  const { isFocused, clearFocus } = useCameraStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState(messsages[0]);
  const npcPosition = useNPCStore((state) => state.npcPosition);
  const setNpcPosition = useNPCStore(state => state.setNpcPosition);
  const isIntroductionEnd = useNPCStore((state) => state.isIntroductionEnd);
  const setIsIntroductionEnd = useNPCStore((state) => state.setIsIntroductionEnd);
  const isNpcVisible = useNPCStore(state => state.isNpcVisible);
  const playerPosition = usePlayerStore(state => state.playerPosition); // 플레이어 위치 추적
  const setPlayerPosition = usePlayerStore(state => state.setPlayerPosition);
  const isCharacterVisible = usePlayerStore(state => state.isCharacterVisible);
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
    
    // '반가워' 메시지를 건너뛸 필요가 있는지 결정합니다. (로그인 상태일 때)
    if (nextIndex === 4 && user) {
      nextIndex++; // 로그인 상태일 경우, '반가워' 메시지를 건너뜁니다.
    }
  
    const finalIndex = nextIndex % messsages.length;
    console.log(`Next Index: ${finalIndex}, Message: ${messsages[finalIndex]}`);
  
    setCurrentIndex(finalIndex);
    setMessage(messsages[finalIndex]);
  
    if (finalIndex !== 4) {
      setShowLogin(false); // '반가워' 메시지가 아닐 경우, 로그인 버튼을 숨깁니다.
    }
  
    // 다시 처음으로 돌아갔을 때 처리
    if (finalIndex === 0) {
      handleBackClick();
    }
  };

  useEffect(() => {
    // 로그인 상태(user가 존재하는 상태)가 되면 자동으로 다음 메시지로 넘어가기
    if (user && currentIndex === 3) {
      handleNextClick();
    }
  }, [user]);

  const handleBackClick=() => {
    console.log("speech end")
    setIsCharacterVisible(true);
    setIsIntroductionEnd(true);
    setShowSpeechBubble(false);
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
          const currentPosition = vec3(npcRigidBody.current.translation());
        // //player와 부딪혔을 떄 애니메이션 _내부에서

        //npc가 플레이어 방향으로 회전하게 위치 저장
        //말풍선도 npcPosition 기반으로 출력됨 
        // const npcWorldPosition = npcRef.current.getWorldPosition(new THREE.Vector3());
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
        <RigidBody 
          type="kinematicPosition"
          name="NPC"
          colliders={false}
          ref={npcRigidBody}
          position={[12, 6, -5]}
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
              <div className="speech-bubble-text">
                {message}
              </div>
            </div>
          </Html>
        )}
        {showSpeechBubble && (
        <mesh position={[npcPosition.x + 5.5, npcPosition.y+5, npcPosition.z]} onClick={handleNextClick}>
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
        {/* {showSpeechBubble && (
        <mesh position={[npcPosition.x + 5.5, npcPosition.y+8, npcPosition.z]} onClick={handleBackClick}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color={"red"} />
        </mesh> 
        )} */}
    </>
  );
}

export default NPCIntro;
