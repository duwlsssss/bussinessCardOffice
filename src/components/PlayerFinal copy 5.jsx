import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import * as THREE from 'three';
import usePlayerStore from "../store/playerStore"
import { RigidBody, CapsuleCollider, CuboidCollider, useRapier, vec3 } from '@react-three/rapier';
import { usePersonControls } from "../hooks/usePlayerControls";
import useCameraStore from '../store/cameraStore';
import useNpcInsideStore from '../store/npcInsideStore'
import useNPCStore from '../store/npcIntroStore'
import { gsap } from 'gsap';
import useOverlayStore from '../store/overlayStore';

let walkDirection = new THREE.Vector3();
let rotateAngle = new THREE.Vector3(0, 1, 0);
let rotateQurternion = new THREE.Quaternion();

const SPEED = 30;

const Player = () => {
    const camera = useThree((state) => state.camera)
    const isNpcVisible = useNPCStore(state => state.isNpcVisible);
    const { isInside, setIsInside, setIsOutside } = useOverlayStore((state) => ({
        isInside: state.isInside,
        setIsInside: state.setIsInside,
        setIsOutside: state.setIsOutside,
    }));
    const {isIntroductionEnd} = useNPCStore();
    const [isCameraAnimated, setIsCameraAnimated] = useState(false);//플레이어 시점 이동시 부드러운 카메라 전환을 위함

    const playerToNPC=usePlayerStore(state=>state.playerToNPC); //볼 클릭시 플레이어가 npc 바라보게 회전하려고
    const npcPosition = useNpcInsideStore((state) => state.npcPosition);

    const rapier = useRapier(null);
    const characterRef = useRef();
    const characterCollider = useRef(null);
    const characterController = useRef();
    const characterRigidBody = useRef(null);

    const lastDirection = useRef(0);
    const updateDirection = (forward, backward, left, right) => {
        var directionOffset = 0; //front(in my project)
        if (forward) {
            if (left) {
                directionOffset = Math.PI / 4;
            } else if (right) {
                directionOffset = -Math.PI / 4;
            }
        } else if (backward) {
            if (left) {
                directionOffset = -Math.PI * 5 / 4;
            } else if (right) {
                directionOffset = Math.PI * 5 / 4;
            }
            else {
                directionOffset = Math.PI; //s
            }
        } else if (right) {
            directionOffset = -Math.PI / 2; //a
        }
        else if (left) {
            directionOffset = Math.PI / 2; //d
        }else {
            //if no key input
            return lastDirection.current;
        }

        // Update current direction to last direction
        lastDirection.current = directionOffset;
        return directionOffset;
    };

    const refState = useRef({
        grounded: false,
        jumping: false,
        velocity: vec3()
    });

    const { isFocused, clearFocus } = useCameraStore();
    const playerPosition = usePlayerStore(state => state.playerPosition);
    const setPlayerPosition = usePlayerStore(state => state.setPlayerPosition);
    const isCharacterVisible = usePlayerStore(state => state.isCharacterVisible);

    const currentAction = useRef(null);

    const { forward, backward, left, right, jump } = usePersonControls();


    const { scene, animations } = useGLTF("/models/character_standing_medium3.glb");
    const { actions } = useAnimations(animations, scene);
    // console.log("actions", actions)


    useEffect(() => {
        const isLoaded = scene && actions && Object.keys(actions).length > 0;
        if (isLoaded) {
            actions.standing_55.play();
        }
    }, [scene, actions]);

    //shadow
    useEffect(() => {
        scene.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, []);

    useEffect(() => {
        if (characterRef.current) {
            characterRef.current.visible = isCharacterVisible;
        }
    }, [isCharacterVisible]);

    // useEffect(() => {
    //     console.log(`Forward: ${forward}, Backward: ${backward}, Left: ${left}, Right: ${right}`);
    //   }, [forward, backward, left, right]);


    useEffect(() => {
        const action = forward || backward || left || right ? "walking_55" : "standing_55";

        if (!currentAction.current || currentAction.current !== action) { //현재 액션과 다음 액션이 다르면 
            if (actions[action]) {
                if (currentAction.current) {
                    actions[currentAction.current].fadeOut(0.2);
                }
                currentAction.current = action;
                actions[action].reset().fadeIn(0.2).play();
            }
        }
    }, [forward, backward, left, right, actions]);

    useEffect(() => {
        const { world } = rapier
        const c = world.createCharacterController(0.1)
        c.setUp({ x: 0.0, y: 1.0, z: 0.0 });
        c.enableAutostep(5, 0.005, true); //5보다 높은 장애물, 0.005보다 작은 너비의 장애물은 못 올라감
        c.setApplyImpulsesToDynamicBodies(true);
        c.enableSnapToGround(0.5);
        c.characterMass(1);
        characterController.current = c;
    }, [rapier]);

    //컴포넌트 마운트 될때 카메라 이동 부드럽게 
    useEffect(() => {
        if (isIntroductionEnd) {
            console.log("캐릭터 시점으로 이동");
            const playerPos = vec3(characterRigidBody.current.translation());
            // console.log(`x: ${playerPos.x} y: ${playerPos.y} z: ${playerPos.z}`);
            // npc의 시작 설명이 끝나면 캐릭터가 앞을 바라보게 설정
            if (characterRef.current) {
                characterRef.current.rotation.y = 0;
            }
            gsap.to(camera.position, {
                x: playerPos.x,
                y: playerPos.y+6,
                z: playerPos.z+10,
                duration: 0.4,
                onUpdate: () => {
                    camera.lookAt(playerPos.x, playerPos.y+2, playerPos.z);
                },
                onComplete: () => {
                    setIsCameraAnimated(true);
                }
            });
        }
      
    }, [camera,isIntroductionEnd]);


    const forOriginRot = useNpcInsideStore(state => state.forOriginRot); //characterRef의 원래 방향으로 돌아가기 위해
    const setForOriginRot = useNpcInsideStore(state => state.setForOriginRot); 
    const [originalRotation, setOriginalRotation] = useState();

    //볼 클릭하면 플레이어가 npc 바라보게 함 
    useEffect(() => {
        if (playerToNPC) {
            //초기 characterRef 방향 저장
            setOriginalRotation(characterRef.current.rotation.y); 
            // 플레이어 위치와 NPC 위치 사이의 차이 벡터를 계산
            const dx = npcPosition.x-playerPosition.x;
            const dz = npcPosition.z-playerPosition.z;

            // atan2 함수를 사용하여 플레이어 방향으로의 회전 각도를 계산
            const angle = Math.atan2(dx, dz);

            // NPC의 Y축 회전을 직접 설정
            characterRef.current.rotation.y = angle+Math.PI;
        }
        else if(!playerToNPC&&forOriginRot){
            characterRef.current.rotation.y = originalRotation;
            setForOriginRot(false);
        }
    }, [playerToNPC, npcPosition, playerPosition]);

    useFrame((state, delta) => {
        if (isCameraAnimated && characterCollider.current && characterRigidBody.current && characterController.current&&!isFocused) {
            try {
                const position = vec3(characterRigidBody.current.translation());
                const movement = vec3();
                // console.log(`Current Position: x=${position.x}, y=${position.y}, z=${position.z}`);

                // Calculate rotation angle from state.camera direction
                let angleYCameraDirection = Math.atan2(
                    state.camera.position.x - position.x,
                    state.camera.position.z - position.z
                );

                // Calculate movement direction offset based on input
                let newDirectionOffset = updateDirection(forward, backward, left, right,jump);

                // Update the model's rotation angle
                rotateQurternion.setFromAxisAngle(
                    rotateAngle,
                    angleYCameraDirection + newDirectionOffset
                );
                scene.quaternion.rotateTowards(rotateQurternion, 0.2);

                //Calculate final direction
                state.camera.getWorldDirection(walkDirection);
                walkDirection.y = 0;
                walkDirection.normalize();
                walkDirection.applyAxisAngle(rotateAngle, newDirectionOffset);


                //move model & camera
                const { velocity } = refState.current;

                if (forward || backward || left || right) {
                    const moveX = walkDirection.x * SPEED * delta;
                    const moveZ = walkDirection.z * SPEED * delta;
                    // console.log("moveX",moveX);
                    // console.log("moveZ",moveZ);

                    movement.x += moveX;
                    movement.z += moveZ;
                }
                // if(forward){
                //     movement.z -= 5;
                // }
                // if (backward) {
                //     movement.z += 5;
                // }
                // if (left) {
                //     movement.x -= 5;
                // }
                // if (right) {
                //     movement.x += 5;
                // }
                if (refState.current.grounded && jump) {
                    velocity.y = 1;
                }

                if (!refState.current.grounded) {
                    // Apply gravity
                    velocity.y -= (9.807 * delta) / 2.5;
                }
                movement.add(velocity);

                // console.log("before",position.x,position.y,position.z)

                characterController.current.computeColliderMovement(characterCollider.current, movement);
                refState.current.grounded = characterController.current.computedGrounded();

                let correctedMovement = characterController.current.computedMovement();
                position.add(vec3(correctedMovement));

                characterRigidBody.current.setNextKinematicTranslation(position);

                // console.log("after",position.x,position.y,position.z)

                for (let i = 0; i < characterController.current.numComputedCollisions(); i++) {
                    let collision = characterController.current.computedCollision(i);
                    let collider = collision.collider; // 충돌한 콜라이더 객체
                    // colliderSet에서 충돌한 콜라이더의 정보를 얻음
                    let colliderInfo = collider.colliderSet.get(collider.handle);
                    // 충돌한 콜라이더의 _shape 정보
                    let shape = colliderInfo._shape;
                    // shape의 halfExtents 값을 확인하여 문 크기 검사
                    if (shape.type === 1 && // Box 타입인지 확인
                    shape.halfExtents.x === 4.5 && // halfExtents의 x값
                    shape.halfExtents.y === 4.5 && // halfExtents의 y값
                    shape.halfExtents.z === 1) {   // halfExtents의 z값
                    console.log("GoInDoor와 충돌 감지");
                    setIsInside();
                    }
                    else if (shape.type === 1 &&
                    shape.halfExtents.x === 4 && 
                    shape.halfExtents.y === 4.5 && 
                    shape.halfExtents.z === 1) {   
                    console.log("GoOutDoor와 충돌 감지");
                    setIsOutside();
                    }
                }
                
                // 플레이어 위치에 따라 카메라 위치 업데이트
                camera.position.set(position.x,position.y+6,position.z+10);
                camera.lookAt(position.x,position.y+2,position.z);
                camera.updateProjectionMatrix()

                //npc가 플레이어 방향으로 회전하게 위치 저장
                // const characterWorldPosition = characterRef.current.getWorldPosition(new THREE.Vector3());
                // setPlayerPosition(characterWorldPosition.x, characterWorldPosition.y, characterWorldPosition.z);
                setPlayerPosition(position.x, position.y, position.z);
            } catch (err) {
                alert(err.name);
                alert(err.message);
                alert(err.stack);
                alert(err);
            }
        }
    })

    // //charater size
    // useEffect(() => {
    //     if (scene) {
    //         const box = new THREE.Box3().setFromObject(scene);
    //         const size = new THREE.Vector3();
    //         box.getSize(size);
    //         console.log("Model Height:", size.y,"Model width:", size.x);
    //     }
    // }, [scene]);


    return (
        <>
            <RigidBody
                name="Player"
                ref={characterRigidBody}
                type="kinematicPosition"
                colliders={false}
                rotation={[0,Math.PI,0]}
                enabledRotations={[false, false, false]}
                position={[0, 4.5, 130]} //시작위치
                // position={[0, 3, 30]} //문앞
            >
                <CapsuleCollider
                    args={[1.5, 2]}
                    ref={characterCollider}
                />
                <primitive
                    object={scene}
                    ref={characterRef}
                    scale={2.4}
                    position={[0, -3.4, 0]} 
                />
            </RigidBody>
        </>
    );
};


export default Player;


