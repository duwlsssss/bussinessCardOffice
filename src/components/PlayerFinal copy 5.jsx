import React, { useRef, useEffect, useState } from 'react';
import { useThree,useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useKeyboardControls} from '@react-three/drei';
import * as THREE from 'three';
import useCameraStore from '../store/cameraStore';
// import useInput from "../hooks/useInput"
// import { gsap } from 'gsap/gsap-core';
import usePlayerStore from  "../store/playerStore"
import { RigidBody,CapsuleCollider,useRapier } from '@react-three/rapier';
import {Controls} from '../App'
// import RAPIER from '@dimforge/rapier3d-compat'
import {usePersonControls} from "../hooks/useInput copy";

const MOVEMENT_SPEED = 100;
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

const Player=({controlsRef})=>{

    const { isFocused, clearFocus } = useCameraStore();
    const setPlayerPosition = usePlayerStore(state => state.setPlayerPosition);
    const isVisible = usePlayerStore(state => state.isVisible);

    const playerRef=useRef();
    const rigidbody=useRef();
    const currentAction =useRef(null);
    const characterControllerRef=useRef(null);

    const rapier = useRapier();

    const { forward, backward, left, right } = usePersonControls();

    useEffect(() => {
        if (!rapier) {
            console.log("rapier npt initialized");
            return; // Rapier가 초기화되었는지 
        }else{
            console.log("Rapier initialized");
            const world = rapier.world;
            let characterController = world.createCharacterController(0.1);
            characterController.enableAutostep(0.7, 0.2, true);
            characterController.enableSnapToGround(0.7);
            characterControllerRef.current=characterController
        }
    }, []);
    
    //충돌 상태 
    const [isCollided, setIsCollided] = useState(false);

    const { scene, animations } = useGLTF("./models/character_standing.glb");
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

    //키 입력 확인
    useEffect(() => {
        console.log(`Forward: ${forward}, Backward: ${backward}, Left: ${left}, Right: ${right}`);
      }, [forward, backward, left, right]);
    
    
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
        if(!isFocused){

            if (forward) {
                // 캐릭터의 전진 방향을 계산합니다.
                const direction = new THREE.Vector3(0, 0, -1); // Z축 방향으로 전진
                direction.normalize(); // 방향 벡터 정규화
                direction.multiplyScalar(MOVEMENT_SPEED * delta); // delta를 사용하여 프레임당 이동 거리 계산
            
                // 캐릭터 컨트롤러에 이동 벡터 적용
                characterControllerRef.setLinvel(direction.x, direction.y, direction.z, true);
            }


            // const velocity = rigidbody.current.linvel();

            // console.log(`Before movement calculation - Position: x=${playerRef.current.position.x}, y=${playerRef.current.position.y}, z=${playerRef.current.position.z}`);
            // // movement
            // frontVector.set(0, 0, backward - forward)
            // sideVector.set(left - right, 0, 0)
            // direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(MOVEMENT_SPEED).applyEuler(state.camera.rotation)
            // rigidbody.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
            
            // if (forward || backward || left || right) {
            //     // 방향에 따른 회전 각도 계산
            //     const angle = Math.atan2(direction.x, direction.z);
            //     playerRef.current.rotation.y = angle;
            // }

            // console.log(`After movement calculation - Position: x=${playerRef.current.position.x}, y=${playerRef.current.position.y}, z=${playerRef.current.position.z}`);

            // CAMERA FOLLOW
            const characterWorldPosition = playerRef.current.getWorldPosition(new THREE.Vector3());

            setPlayerPosition(characterWorldPosition.x,characterWorldPosition.y,characterWorldPosition.z);

            const targetCameraPosition = new THREE.Vector3(
            characterWorldPosition.x,
            characterWorldPosition.y + 130,
            characterWorldPosition.z + 100
            );

            state.camera.position.lerp(targetCameraPosition, delta * 20);

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
    })

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
                mass={50}
                // type="kinematicPosition"
                // lockRotations
                enabledRotations={[false,false,false]}
            >
                <CapsuleCollider 
                    args={[20,27]} 
                    // position={[0,52,1600]}
                    position={[-10,56,450]} //내부 테스트용
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
                    scale={28}
                    // position={[0,10,1600]}
                    position={[-10,15,450]} //내부 테스트용
                    rotation={[0,180*Math.PI/180,0]}
                />
            </RigidBody>
        </>
    );
};


export default Player;


