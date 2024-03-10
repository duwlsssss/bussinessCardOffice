import React, { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Text, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import usePlayerStore from "../store/playerStore"
import { RigidBody, CapsuleCollider, CuboidCollider, useRapier, vec3 } from '@react-three/rapier';
import { usePersonControls } from "../hooks/usePlayerControls";
import useInOutStore from "../store/inOutStore";
import { KinematicCharacterController } from "@dimforge/rapier3d-compat";
import useCameraStore from '../store/cameraStore';
import FocusOnMonitor from "./FocusOnMonitor";
let walkDirection = new THREE.Vector3();
let rotateAngle = new THREE.Vector3(0, 1, 0);
let rotateQurternion = new THREE.Quaternion();

const SPEED = 8;

const Player = () => {
    const camera = useThree((state) => state.camera)
    // const { cameraPosition, setCameraPosition, cameraTarget, setCameraTarget } = useCameraStore((state) => ({
    //     cameraPosition: state.cameraPosition,
    //     setCameraPosition: state.setCameraPosition,
    //     cameraTarget: state.cameraTarget,
    //     setCameraTarget: state.setCameraTarget,
    // }));
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
    const isVisible = usePlayerStore(state => state.isVisible);

    const currentAction = useRef(null);

    const { forward, backward, left, right, jump } = usePersonControls();


    const monitor = useGLTF('/models/monitor.glb')
    const { handleMonitorClick } = FocusOnMonitor();

    const { scene, animations } = useGLTF("./models/character_standing.glb");
    const { actions } = useAnimations(animations, scene);
    // console.log("actions",actions)


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
            characterRef.current.visible = isVisible;
        }
    }, [isVisible]);

    // useEffect(() => {
    //     console.log(`Forward: ${forward}, Backward: ${backward}, Left: ${left}, Right: ${right}`);
    //   }, [forward, backward, left, right]);


    useEffect(() => {
        const action = forward || backward || left || right ? "walkkk" : "standing_55";

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
        c.enableAutostep(0.5, 0.01, true);
        c.setApplyImpulsesToDynamicBodies(true);
        // c.setCharacterMass(1);
        c.enableSnapToGround(0.5);
        characterController.current = c;
    }, [rapier]);

    useFrame((state, delta) => {
        if (characterCollider.current && characterRigidBody.current && characterController.current&&!isFocused) {
            try {
                const position = vec3(characterRigidBody.current.translation());
                const movement = vec3();
                // console.log("curent position test",position)
                // console.log(`Current Position: x=${position.x}, y=${position.y}, z=${position.z}`);

                // Calculate rotation angle from state.camera direction
                let angleYCameraDirection = Math.atan2(
                    state.camera.position.x - position.x,
                    state.camera.position.z - position.z
                );

                // Calculate movement direction offset based on input
                let newDirectionOffset = updateDirection(forward, backward, left, right);

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

                
                // 플레이어 위치에 따라 카메라 위치 업데이트
                camera.position.set(position.x,position.y+13,position.z+40);
                camera.lookAt(position.x,position.y-2,position.z);
                camera.updateProjectionMatrix()

                //npc가 플레이어 방향으로 회전하게 위치 저장
                const characterWorldPosition = characterRef.current.getWorldPosition(new THREE.Vector3());
                setPlayerPosition(characterWorldPosition.x, characterWorldPosition.y, characterWorldPosition.z);
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
                enabledRotations={[false, false, false]}
            >
                <CapsuleCollider
                    args={[1.5, 2]}
                    ref={characterCollider}
                    // position={[0,60,1600]}
                    position={[0, 5.7, 30]} //외부 테스트(문앞)
                />
                <primitive
                    object={scene}
                    ref={characterRef}
                    scale={2.4}
                    // position={[0,28,1600]}
                    position={[0, 2.5, 30]} //외부 테스트(문앞)
                />
            </RigidBody>
        </>
    );
};


export default Player;


