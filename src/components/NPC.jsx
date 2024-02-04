import { useAnimations, useFBO, useGLTF } from "@react-three/drei"
import { useFrame,useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

const NPC=()=>{

    // const three=useThree();
    // console.log("three",three);//정보 출력 

    const {scene,animations} = useGLTF('./models/dancer.glb');
    const ref=useRef(null);
    const [currentAnimation,setCurrentAnimation]=useState("wave");

    const {actions} = useAnimations(animations,ref);
    // console.log("actions",actions); //에니메이션 종류 확인 

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
        <primitive
            // onClick={()=>{
            //     setCurrentAnimation((prev)=>{
            //         if(prev==="wave") return "windmill";
            //         return "wave";
            //     })
            // }}
            ref={ref}
            scale={0.5}
            object={scene}
            position={[100,55,80]}
        ></primitive>
    );
}

export default NPC;