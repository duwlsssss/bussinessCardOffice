import { useAnimations, useGLTF } from "@react-three/drei"
import { useEffect, useRef, useState } from "react";
// import { RigidBody, useRigidBody, BoxCollider, useContactEvents } from '@react-three/rapier';

const NPC=()=>{

    // const three=useThree();
    // console.log("three",three);//정보 출력 

    const {scene,animations} = useGLTF('./models/dancer.glb');
    const ref=useRef(null);
    const [currentAnimation,setCurrentAnimation]=useState("wave");
    const {actions} = useAnimations(animations,ref);
    // console.log("actions",actions); //에니메이션 종류 확인 

    // const [rigidBodyRef, api] = useRigidBody(() => ({ type: 'kinematic' }));//코드를 통해서만 움직임 제어하는 객체
    // 충돌 이벤트 처리
    // useContactEvents(rigidBodyRef, {
    //     onCollideStart: (e) => {
    //         // 여기에서 충돌이 시작될 때 원하는 로직을 실행
    //         // 예: 다른 특정 물체와의 충돌을 감지하고 애니메이션 변경
    //         setCurrentAnimation(prev => prev === "wave" ? "twerk" : "wave");
    //     },
    // });

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
        actions[currentAnimation].fadeIn(0.5).play();
        return()=>{
            actions[currentAnimation].fadeOut(0.5).stop();
        }
    },[actions,currentAnimation]);



    //iframe 소통
    const handleIframeMessage = (event) => {
        console.log(event.data);
        if (event.data === 'danceChange') {
            setCurrentAnimation((prev)=>{
                if(prev=="wave") return "windmill";
                else return "wave"
            });
        }
    };
    useEffect(() => {
        window.addEventListener('message', handleIframeMessage);
        return () => {
            window.removeEventListener('message', handleIframeMessage);
        };
    }, []);


    return(
        // <RigidBody type="dynamic">
        //     <BoxCollider args={[1,1,1]}>
                <primitive
                    ref={ref}
                    scale={0.7}
                    object={scene}
                    position={[110,70,80]}
                    // onclick={} //마주쳤을떄 반응하는 에니메이션, 클릭했을때 본격 에니메이션
                ></primitive>
        //     </BoxCollider>
        // </RigidBody>
    );
}

export default NPC;