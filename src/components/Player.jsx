import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import useInput from "../hooks/useInput"
// import { RigidBody, useRigidBody, BoxCollider, useContactEvents } from '@react-three/rapier';

let walkDirection = new THREE.Vector3();
let rotateAngle = new THREE.Vector3(0,1,0);
let rotateQurternion = new THREE.Quaternion();
let cameraTarget= new THREE.Vector3();

const directionOffset = ({forward, backward, left, right})=>{
    var directionOffset=0;//w

    if(forward){
        if(left){
            directionOffset=Math.PI/4; //w+a
        }else if(right){
            directionOffset=-Math.PI/4; //w+d
        }
    }else if(backward){
        if(left){
            directionOffset=Math.PI/4+Math.PI/2; //s+a
        }else if(right){
            directionOffset=-Math.PI/4-Math.PI/2; //s+d
        }
        else{
            directionOffset=Math.PI; //s
        }
    }else if(left){
        directionOffset=Math.PI/2; //a
    }
    else if(right){
        directionOffset=-Math.PI/2; //d
    }

    return directionOffset;
}

const Player=()=>{
    // Player의 물리적 속성
    // const [ref, api] = useRigidBody(() => ({ type: 'dynamic' }));

    // 모델과 애니메이션 로드 상태를 추적하는 상태 변수
    const [isLoaded, setIsLoaded] = useState(false);

    const {forward,backward,left,right}=useInput();
    const model = useGLTF("./models/idle_.glb");
    const {actions} = useAnimations(model.animations, model.scene);

    // 모델과 애니메이션이 로드되었는지 감지하고, 상태를 업데이트
    useEffect(() => {
        if (model && actions && Object.keys(actions).length > 0) {
        setIsLoaded(true);
        }
    }, [model, actions]);

    // 로드 완료 후 standing 애니메이션으로 설정
    useEffect(() => {
        if (isLoaded) {
        currentAction.current = actions.standing;
        currentAction.current.play();
        }
    }, [isLoaded, actions]);

    model.scene.traverse((obj) => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    const updateCameraTarget=(moveX, moveZ)=>{
        //move camera
        camera.position.x+=moveX;
        camera.position.z+=moveZ;

        //update camera target
        cameraTarget.x=model.scene.position.x;
        cameraTarget.y=model.scene.position.y+1;
        cameraTarget.z=model.scene.position.z;
        if(controlsRef.current) controlsRef.current.target=cameraTarget;
    }
    const currentAction =useRef();
    const controlsRef = useRef();
    const camera = useThree((state)=>state.camera);

    useEffect(()=>{
        let action="";

        if(forward||backward||left||right){
            action="walking";
            // if(shift){
            //     action="running"
            // }
        }else{
            action="standing";
        }

        if(currentAction.current!=action){
            const nextActionToPlay=actions[action];
            const current = actions[currentAction.current];
            current?.fadeOut(0.2);
            nextActionToPlay?.reset().fadeIn(0.2).play();
            currentAction.current=action;
        }
    },[forward,backward,left,right,actions])


    useFrame((state,delta)=>{
        
            if(currentAction.current=="walking"){
                // 카메라 방향으로부터 회전 각도 계산
                let angleYCameraDirection = Math.atan2(
                    camera.position.x - model.scene.position.x,
                    camera.position.z - model.scene.position.z
                );

                // 입력에 따른 이동 방향 오프셋 계산
                let newDirectionOffset = directionOffset({ forward, backward, left, right });

                // 모델의 회전 각도 업데이트
                rotateQurternion.setFromAxisAngle(
                    rotateAngle,
                    angleYCameraDirection + newDirectionOffset
                );
                model.scene.quaternion.rotateTowards(rotateQurternion, 0.2);

                // //최종 방향 계산
                camera.getWorldDirection(walkDirection);
                walkDirection.y=0;
                walkDirection.normalize();
                walkDirection.applyAxisAngle(rotateAngle,newDirectionOffset);

                //walk||run velocity
                const velocity=30;
                // const velocity=currentAction.current=="running"?10:5;

                //move model & camera
                const moveX=walkDirection.x*velocity*delta;
                const moveZ=walkDirection.z*velocity*delta;
                model.scene.position.x+=moveX;
                model.scene.position.z+=moveZ;

                updateCameraTarget(moveX,moveZ);
            
                }
            }
        
    );

    return (
        <>
            <OrbitControls ref={controlsRef}/>
            {/* <RigidBody ref={ref}>
                <BoxCollider args={[1, 2, 1]} /> */}
                <primitive 
                    object={model.scene}
                    scale={24}
                    position={[140,10,280]}
                    rotation={[0,180*Math.PI/180,0]}
                />
             {/* </RigidBody> */}
        </>
    );
};

export default Player;

