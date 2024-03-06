import React, { useRef, useEffect, useState } from 'react';
import { useThree,useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations} from '@react-three/drei';
// import { Ray, RigidBody, CapsuleCollider, World } from '@dimforge/rapier3d';
import * as THREE from 'three';
import useCameraStore from '../store/cameraStore';
import useInput from "../hooks/useInput"
import { gsap } from 'gsap/gsap-core';
import usePlayerStore from  "../store/playerStore"
import { RigidBody,CapsuleCollider } from '@react-three/rapier';

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

const Player=({controlsRef})=>{
    const {camera}=useThree();
    const { isFocused, clearFocus } = useCameraStore();
    const setPlayerPosition = usePlayerStore(state => state.setPlayerPosition);
    const isVisible = usePlayerStore(state => state.isVisible);
    const [isCollided, setIsCollided] = useState(false); //충돌상태

    const playerRef=useRef();
    const rigidbody=useRef();
    const currentAction =useRef();
    const { forward, backward, left, right } = useInput();

    // 모델과 애니메이션 로드 상태를 추적하는 상태 변수
    const [isLoaded, setIsLoaded] = useState(false);

    const { scene, animations } = useGLTF("/models/standing_55.glb");
    const { actions } = useAnimations(animations, scene);

    useEffect(() => {
        // 모델과 애니메이션 로드 상태를 감지하고, 상태를 업데이트
        const isLoaded = scene && actions && Object.keys(actions).length > 0;
        if (isLoaded) {
            actions.standing_55.play();
        }
    }, [scene, actions]);
    // 로드 완료 후 standing_55 애니메이션으로 설정

    //그림자
    scene.traverse((obj) => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    //player의 가시성
    useEffect(() => {
        if (playerRef.current) {
          // 플레이어 객체의 가시성 설정
          playerRef.current.visible = isVisible;
        }
      }, [isVisible]);

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
        const action = forward || backward || left || right ? "walkkk" : "standing_55";

        if(!currentAction.current||currentAction.current!==action){ //현재 액션과 다음 액션이 다르면 
            if(actions[action]){
                if (currentAction.current) {
                    actions[currentAction.current].fadeOut(0.2);
                }
                currentAction.current = action;
                actions[action].reset().fadeIn(0.2).play();
            }
        }
    },[forward,backward,left,right,actions])


    useFrame((state,delta)=>{
            if(currentAction.current=="walkkk"){
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
    );

    // 카메라 포커스가 해제되었을 때의 처리
    useEffect(() => {
        if (!isFocused && playerRef.current) {
            const playerPosition = playerRef.current.position;
      
            // 카메라를 플레이어의 위치로 부드럽게 이동
            gsap.to(camera.position, {
              x: playerPosition.x,
              y: playerPosition.y + 130, // 카메라 높이 조정
              z: playerPosition.z + 100, // 카메라와 플레이어 사이의 거리
              duration: 1,
              ease: "power3.inOut",
              onUpdate: () => {
                // 카메라가 항상 플레이어를 바라보도록 업데이트
                camera.lookAt(playerPosition.x, playerPosition.y+65, playerPosition.z);
              }
            });
          }
        }, [isFocused, camera, playerRef]);

    // 캐릭터 크기
    // useEffect(() => {
    //     if (scene) {
    //         const box = new THREE.Box3().setFromObject(scene);
    //         const size = new THREE.Vector3();
    //         box.getSize(size);
    //         console.log("Model Height:", size.y);
    //     }
    // }, [scene]);

    return (
        <>
            <RigidBody 
                name="Player"
                ref={rigidbody}
                colliders={false}
                enabledRotations={[false, false, false]}
            >
                <CapsuleCollider 
                    args={[20,30]} 
                    position={[0,56,1600]}
                    // position={[0,56,450]} //내부 테스트용
                    onCollisionEnter={(other)=>{
                        if(other.rigidBodyObject.name!=="void"){
                            console.log("충돌 발생",other.rigidBodyObject.name);
                            setIsCollided(true);
                        }
                    }}
                    onCollisionExit={(other)=>{
                        if(other.rigidBodyObject.name!=="void"){
                            console.log("충돌 해제",other.rigidBodyObject.name);
                            setIsCollided(false);
                        }
                    }}
                />
                <primitive 
                    object={scene}
                    ref={playerRef}
                    scale={33}
                    position={[0,15,1600]}
                    // position={[0,15,450]} //내부 테스트용
                    rotation={[0,180*Math.PI/180,0]}
                />
            </RigidBody>
        </>
    );
};


export default Player;


