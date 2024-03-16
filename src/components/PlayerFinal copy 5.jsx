import React, { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import * as THREE from 'three';
import usePlayerStore from "../store/playerStore"
import { RigidBody, CapsuleCollider, CuboidCollider, useRapier, vec3 } from '@react-three/rapier';
import { usePersonControls } from "../hooks/usePlayerControls";
import useInOutStore from "../store/inOutStore";
import { KinematicCharacterController } from "@dimforge/rapier3d-compat";
import useCameraStore from '../store/cameraStore';
import useNPCStore from '../store/npcStore'

let walkDirection = new THREE.Vector3();
let rotateAngle = new THREE.Vector3(0, 1, 0);
let rotateQurternion = new THREE.Quaternion();

const SPEED = 8;

const Player = () => {
    const camera = useThree((state) => state.camera)
    const isAnimationComplete = useCameraStore((state) => state.isAnimationComplete);
    // const { cameraPosition, setCameraPosition, cameraTarget, setCameraTarget } = useCameraStore((state) => ({
    //     cameraPosition: state.cameraPosition,
    //     setCameraPosition: state.setCameraPosition,
    //     cameraTarget: state.cameraTarget,
    //     setCameraTarget: state.setCameraTarget,
    // }));
    
    const { isInside, setIsInside } = useInOutStore((state) => ({
        isInside: state.isInside,
        setIsInside: state.setIsInside,
    }));

    const isIntroductionEnd = useNPCStore((state) => state.isIntroductionEnd);

    const rapier = useRapier(null);
    const characterRef = useRef();
    const characterCollider = useRef(null);
    const characterController = useRef();
    const characterRigidBody = useRef(null);

    const lastDirection = useRef(Math.PI);
    const updateDirection = (forward, backward, left, right) => {
        var directionOffset = Math.PI; //front(in my project)
        if (forward) {
            if (left) {
                directionOffset = Math.PI * 5 / 4;
            } else if (right) {
                directionOffset = -Math.PI * 5 / 4;
            }
        } else if (backward) {
            if (left) {
                directionOffset = -Math.PI / 4;
            } else if (right) {
                directionOffset = Math.PI / 4;
            }
            else {
                directionOffset = 0; //s
            }
        } else if (right) {
            directionOffset = Math.PI / 2; //a
        }
        else if (left) {
            directionOffset = -Math.PI / 2; //d
        } else {
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
    const setPlayerPosition = usePlayerStore(state => state.setPlayerPosition);
    const isCharacterVisible = usePlayerStore(state => state.isCharacterVisible);

    const currentAction = useRef(null);

    const { forward, backward, left, right, jump } = usePersonControls();


    const { scene, animations } = useGLTF("/models/character_standing_medium.glb");
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
        // c.setCharacterMass(1);
        c.enableSnapToGround(0.5);
        characterController.current = c;
    }, [rapier]);

    useFrame((state, delta) => {
        if (characterCollider.current && characterRigidBody.current && characterController.current&&!isFocused) {
            try {
                console.log("캐릭터")
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

                    movement.x -= moveX;
                    movement.z -= moveZ;
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
                    velocity.y -= (9.807 * delta) / 3;
                }
                movement.add(velocity);

                // console.log("before",position.x,position.y,position.z)

                characterController.current.computeColliderMovement(characterCollider.current, movement);
                refState.current.grounded = characterController.current.computedGrounded();

                let correctedMovement = characterController.current.computedMovement();
                position.add(vec3(correctedMovement));

                characterRigidBody.current.setNextKinematicTranslation(position);
                characterRigidBody.current.setTranslation(position);

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
                    setIsInside(true);
                    }
                    else if (shape.type === 1 &&
                    shape.halfExtents.x === 4 && 
                    shape.halfExtents.y === 4.5 && 
                    shape.halfExtents.z === 1) {   
                    console.log("GoOutDoor와 충돌 감지");
                    setIsInside(false);
                    }
                }
                
                // 플레이어 위치에 따라 카메라 위치 업데이트
                camera.position.set(position.x,position.y+8,position.z+12);
                camera.lookAt(position.x,position.y+2,position.z);
                camera.updateProjectionMatrix()

                //npc가 플레이어 방향으로 회전하게 위치 저장
                // const characterWorldPosition = characterRef.current.getWorldPosition(new THREE.Vector3());
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
            {/* {isIntroductionEnd&&( */}
            <RigidBody
                name="Player"
                ref={characterRigidBody}
                type="kinematicPosition"
                colliders={false}
                enabledRotations={[false, false, false]}
                // position={[0, 5, 130]} //시작위치
                position={[0, 3, 30]} //문앞
            >
                <CapsuleCollider
                    args={[1.5, 2]}
                    ref={characterCollider}
                />
                <primitive
                    object={scene}
                    ref={characterRef}
                    scale={2.4}
                    position={[0, -3, 0]} 
                />
            </RigidBody>
            {/* )} */}
        </>
    );
};


export default Player;


