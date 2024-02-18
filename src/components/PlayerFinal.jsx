import React, { useRef, useEffect, useState } from 'react';
import { useThree,useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import useCameraStore from '../store/cameraStore';
import useInput from "../hooks/useInput"
import { gsap } from 'gsap/gsap-core';
import usePlayerStore from  "../store/playerStore"
import { RigidBody,CapsuleCollider } from '@react-three/rapier';
import {Controls} from '../App'

const MOVEMENT_SPEED = 500000;
const MAX_VEL = 1000000;

const Player=({controlsRef})=>{
    const {camera}=useThree();
    const { isFocused, clearFocus } = useCameraStore();
    const setPlayerPosition = usePlayerStore(state => state.setPlayerPosition);

    const playerRef=useRef();
    const rigidbody=useRef();
    const currentAction =useRef(null);

    const leftPressed = useKeyboardControls((state) => state[Controls.left]);
    const rightPressed = useKeyboardControls((state) => state[Controls.right]);
    const backPressed = useKeyboardControls((state) => state[Controls.back]);
    const forwardPressed = useKeyboardControls(
        (state) => state[Controls.forward]
    );

    // 모델과 애니메이션 로드 상태를 추적
    const [isLoaded, setIsLoaded] = useState(false);
    //충돌 상태 
    const [isCollided, setIsCollided] = useState(false);

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

    useEffect(()=>{
        const action = forwardPressed || backPressed || leftPressed || rightPressed ? "walkkk" : "standing_55";

        if(!currentAction.current||currentAction.current!==action){ //현재 액션과 다음 액션이 다르면 
            if(actions[action]){
                if (currentAction.current) {
                    actions[currentAction.current].fadeOut(0.2);
                }
                currentAction.current = action;
                actions[action].reset().fadeIn(0.2).play();
            }
        }
    },[forwardPressed,backPressed,leftPressed,rightPressed,actions])

    useFrame((state,delta)=>{
        if(!isFocused){
            // 충돌 상태이고, 이동 키 중 하나라도 눌렸다면
            if (isCollided && (forwardPressed || backPressed || leftPressed || rightPressed)) {
                setIsCollided(false);
            }
            else if(isCollided){
                // 리니어 및 각속도를 0으로 설정하여 이동과 회전을 멈춤
                rigidbody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                rigidbody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }
            
            //충돌 상태가 아니면
            else if(!isCollided){
                const impulse = { x: 0, y: 0, z: 0 };
                const isMoving = leftPressed || rightPressed || backPressed || forwardPressed;
                const linvel = rigidbody.current.linvel();

                let changeRotation = false;
                if (rightPressed && linvel.x < MAX_VEL) {
                impulse.x += MOVEMENT_SPEED;
                changeRotation = true;
                }
                if (leftPressed && linvel.x > -MAX_VEL) {
                impulse.x -= MOVEMENT_SPEED;
                changeRotation = true;
                }
                if (backPressed && linvel.z < MAX_VEL) {
                impulse.z += MOVEMENT_SPEED;
                changeRotation = true;
                }
                if (forwardPressed && linvel.z > -MAX_VEL) {
                impulse.z -= MOVEMENT_SPEED;
                changeRotation = true;
                }

                // console.log("Before impulse:", rigidbody.current.linvel());

                // 키를 누르고 있지 않으면 속도를 0으로 설정
                if (!isMoving) {
                    rigidbody.current.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
                } else {
                    rigidbody.current.applyImpulse(impulse, true);
                }
                // console.log("After impulse:", rigidbody.current.linvel());

                if (changeRotation) {
                const angle = Math.atan2(linvel.x, linvel.z);
                playerRef.current.rotation.y = angle;
                }
            }
            // CAMERA FOLLOW
            const characterWorldPosition = playerRef.current.getWorldPosition(
                new THREE.Vector3()
                );

                const targetCameraPosition = new THREE.Vector3(
                characterWorldPosition.x,
                characterWorldPosition.y + 170,
                characterWorldPosition.z + 120
                );

                state.camera.position.lerp(targetCameraPosition, delta * 20);

                // 카메라 시선(Target) 업데이트
                if (controlsRef && controlsRef.current) {
                    controlsRef.current.target.set(
                    characterWorldPosition.x,
                    0, 
                    characterWorldPosition.z
                    );
                    controlsRef.current.update(); // 필요한 경우 OrbitControls 업데이트
                }                              
        }
    })

    useEffect(() => {
        if (scene) {
            const box = new THREE.Box3().setFromObject(scene);
            const size = new THREE.Vector3();
            box.getSize(size);
            console.log("Model Height:", size.y);
        }
    }, [scene]);
    

    return (
        <>
            <RigidBody 
                name="Player"
                ref={rigidbody}
                colliders={false}
                enabledRotations={[false,false,false]}
                sclae={[0.5,0.5,0.5]}
            >
                <CapsuleCollider 
                    args={[14,30]} 
                    position={[0,48,180]}
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
                    scale={35}
                    position={[0,25,180]}
                    rotation={[0,180*Math.PI/180,0]}
                />
            </RigidBody>
        </>
    );
};


export default Player;