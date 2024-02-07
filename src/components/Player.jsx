import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations,OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RigidBody,CapsuleCollider } from '@react-three/rapier';
import useCameraStore from '../store/cameraStore';
import useInput from "../hooks/useInput"
import { gsap } from 'gsap/gsap-core';

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
    const {camera}=useThree();
    const { isFocused, clearFocus } = useCameraStore();

    const playerRef=useRef();
    const rigidbody=useRef();
    const currentAction =useRef();
    const { forward, backward, left, right } = useInput();

    // 모델과 애니메이션 로드 상태를 추적하는 상태 변수
    const [isLoaded, setIsLoaded] = useState(false);

    const { scene, animations } = useGLTF("./models/idle_.glb");
    const { actions } = useAnimations(animations, scene);

    useEffect(() => {
        // 모델과 애니메이션 로드 상태를 감지하고, 상태를 업데이트
        const isLoaded = scene && actions && Object.keys(actions).length > 0;
        if (isLoaded) {
            actions.standing.play();
        }
    }, [scene, actions]);
    // 로드 완료 후 standing 애니메이션으로 설정

    //그림자
    scene.traverse((obj) => {
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
        cameraTarget.x=scene.position.x;
        cameraTarget.y=scene.position.y+1;
        cameraTarget.z=scene.position.z;
        if(controlsRef.current) controlsRef.current.target=cameraTarget;
    }

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
        if (!isFocused) {
        
            if(currentAction.current=="walking"){
                // 카메라 방향으로부터 회전 각도 계산
                let angleYCameraDirection = Math.atan2(
                    camera.position.x - scene.position.x,
                    camera.position.z - scene.position.z
                );

                // 입력에 따른 이동 방향 오프셋 계산
                let newDirectionOffset = directionOffset({ forward, backward, left, right });

                // 모델의 회전 각도 업데이트
                rotateQurternion.setFromAxisAngle(
                    rotateAngle,
                    angleYCameraDirection + newDirectionOffset
                );
                scene.quaternion.rotateTowards(rotateQurternion, 0.2);

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
                scene.position.x+=moveX;
                scene.position.z+=moveZ;

                updateCameraTarget(moveX,moveZ);
            
                }
            }
        }
    );


    // 카메라 포커스가 해제되었을 때의 처리
    useEffect(() => {
        if (!isFocused && playerRef.current) {
            const playerPosition = playerRef.current.position;
      
            // 카메라를 플레이어의 위치로 부드럽게 이동
            gsap.to(camera.position, {
              x: playerPosition.x,
              y: playerPosition.y + 5, // 카메라 높이 조정
              z: playerPosition.z + 10, // 카메라와 플레이어 사이의 거리
              duration: 1,
              ease: "power3.inOut",
              onUpdate: () => {
                // 카메라가 항상 플레이어를 바라보도록 업데이트
                camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z);
              }
            });
          }
        }, [isFocused, camera, playerRef]);


    return (
        <>
            {/* <RigidBody 
                name="Player"
                ref={rigidbody}
                colliders={false}
                enabledRotations={[false, false, false]}
            >
                <CapsuleCollider args={[3, 18]} position={[0,30,240]} /> */}
                <primitive 
                    object={scene}
                    ref={playerRef}
                    scale={24}
                    position={[0,10,240]}
                    rotation={[0,180*Math.PI/180,0]}
                />
            {/* </RigidBody> */}
        </>
    );
};


export default Player;