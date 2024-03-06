import React, { useRef, useEffect, useState } from 'react';
import { useThree,useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useKeyboardControls} from '@react-three/drei';
import * as THREE from 'three';
import useCameraStore from '../store/cameraStore';
// import useInput from "../hooks/useInput"
// import { gsap } from 'gsap/gsap-core';
import usePlayerStore from  "../store/playerStore"
import { RigidBody,CapsuleCollider } from '@react-three/rapier';

const SPEED = 200;

const Player=({controlsRef})=>{
    const { isFocused, clearFocus } = useCameraStore();
    const setPlayerPosition = usePlayerStore(state => state.setPlayerPosition);
    const isVisible = usePlayerStore(state => state.isVisible);

    const playerRef=useRef();
    const rigidbody=useRef();
    const currentAction =useRef(null);

    const leftward = useKeyboardControls((state) => state[Controls.left]);
    const rightward = useKeyboardControls((state) => state[Controls.right]);
    const backward = useKeyboardControls((state) => state[Controls.back]);
    const forward = useKeyboardControls((state) => state[Controls.forward]);

    const { scene, animations } = useGLTF("./models/standing_55.glb");
    const { actions } = useAnimations(animations, scene);
    // console.log("actions",actions)

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

    
    
    useFrame((state,delta)=>{
        // Update character animation on movement
        const action = forward || backward || leftward || rightward ? "walkkk" : "standing_55";

        // 현재 액션과 다음 액션이 다르면 애니메이션 전환
        if (!currentAction.current || currentAction.current !== action) {
            if (actions[action]) {
                if (currentAction.current && actions[currentAction.current]) {
                    actions[currentAction.current].fadeOut(0.2); // 이전 애니메이션 fade out
                }
                currentAction.current = action;
                actions[action].reset().fadeIn(0.2).play(); // 새 애니메이션 fade in 및 재생
            }
        }

        if(!isFocused){
            const linvelY = rigidbody.current.linvel().y;

            // 직선속도와 대각선속도를 동일하게 맞춤 
            const normalizedSpeed = SPEED * delta;
        
            const impulse = {
              x: leftward ? -normalizedSpeed : rightward ? normalizedSpeed : 0,
              y: linvelY,
              z: forward ? -normalizedSpeed : backward ? normalizedSpeed : 0
            };
        
            // Set model currennt linear velocity
            rigidbody.current.setLinvel(impulse);

            const linvel = rigidbody.current.linvel();

            if (forward || backward || leftward || rightward) {
                changeRotation(true);
            }

            if (changeRotation) {
                const angle = Math.atan2(linvel.x, linvel.z);
                playerRef.current.rotation.y = angle;
            }


            // // Lock X and Z model rotations and update rotation Y
            // const quaternionRotation = new THREE.Quaternion();
            // quaternionRotation.setFromEuler(new THREE.Euler(0, orientation, 0));
            // rigidbody.current.setRotation(quaternionRotation);

            // CAMERA FOLLOW
            const characterWorldPosition = playerRef.current.getWorldPosition(new THREE.Vector3());
            setPlayerPosition(characterWorldPosition.x,characterWorldPosition.y,characterWorldPosition.z);
            const targetCameraPosition = new THREE.Vector3(
            characterWorldPosition.x,
            characterWorldPosition.y + 130,
            characterWorldPosition.z + 100
            );

            state.camera.position.lerp(targetCameraPosition, delta * 15);

            // 카메라 시선(Target) 업데이트
            if (controlsRef && controlsRef.current) {
                controlsRef.current.target.set(
                characterWorldPosition.x,
                characterWorldPosition.y + 65,
                characterWorldPosition.z
                );
                controlsRef.current.update(); // 필요한 경우 OrbitControls 업데이트
            }   
        }
    });

    // //캐릭터 크기
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
                enabledRotations={[false,false,flase]}
                // restitution={0.2}
                // friction={1}
            >
                <CapsuleCollider 
                    args={[20,30]} 
                    position={[0,56,3000]}
                    // position={[0,56,-200]} //내부 테스트용
                    onCollisionEnter={(other)=>{
                        if(other.rigidBodyObject.name!=="void"){
                            console.log("충돌 발생",other.rigidBodyObject.name);
                        }
                    }}
                    onCollisionExit={(other)=>{
                        if(other.rigidBodyObject.name!=="void"){
                            console.log("충돌 해제",other.rigidBodyObject.name);
                        }
                    }}
                />
                <primitive 
                    object={scene}
                    ref={playerRef}
                    scale={33}
                    position={[0,5,3000]}
                    // position={[0,15,-200]} //내부 테스트용
                    rotation={[0,180*Math.PI/180,0]}
                />
            </RigidBody>
        </>
    );
};


export default Player;


