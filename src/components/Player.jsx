import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { RigidBody,CapsuleCollider,vec3 } from '@react-three/rapier';
import { Controls } from '../App';

const MOVEMENT_SPEED = 2;
const MAX_VEL = 3;

const Player=()=>{
    const PlayerRef=useRef();
    const rigidbody=useRef();

    // 키보드 입력에 따라 Player 움직임 제어
    const leftPressed = useKeyboardControls((state) => state[Controls.left])
    const rightPressed = useKeyboardControls((state) => state[Controls.right])
    const backPressed = useKeyboardControls((state) => state[Controls.back])
    const forwardPressed = useKeyboardControls((state) => state[Controls.forward])

    useFrame((state)=>{
        const impulse = { x: 0, y: 0, z: 0 };
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

        rigidbody.current.applyImpulse(impulse, true);
        if (changeRotation) {
        const angle = Math.atan2(linvel.x, linvel.z);
        PlayerRef.current.rotation.y = angle;
        }

        //카메라 따라감
        const characterWorldPosition = PlayerRef.current.getWorldPosition(
        new THREE.Vector3()
        );
        state.camera.position.x = characterWorldPosition.x;
        state.camera.position.z = characterWorldPosition.z + 14;

        const targetLookAt = new THREE.Vector3(
        characterWorldPosition.x,
        0,
        characterWorldPosition.z
        );

        state.camera.lookAt(targetLookAt);
    });


    // 모델과 애니메이션 로드 상태를 추적하는 상태 변수
    const [isLoaded, setIsLoaded] = useState(false);

    const model = useGLTF("./models/idle_.glb");
    const {actions} = useAnimations(model.animations, model.scene);

    // 모델과 애니메이션이 로드되었는지 감지하고, 상태를 업데이트
    useEffect(() => {
        if (model && actions && Object.keys(actions).length > 0) {
        setIsLoaded(true);
        }
    }, [model, actions]);

    // 로드 완료 후 standing 애니메이션으로 설정
    const currentAction = useRef();

    useEffect(() => {
        if (isLoaded) {
        currentAction.current = actions.standing;
        currentAction.current.play();
        }
    }, [isLoaded, actions]);

    //그림자
    model.scene.traverse((obj) => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    useEffect(()=>{
        let action="standing";

        if(leftPressed || rightPressed || backPressed || forwardPressed){
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
    },[leftPressed || rightPressed || backPressed || forwardPressed])

    return (
        <>
            <RigidBody 
                type="kinematicPosition"
                name="Player"
                ref={rigidbody}
                enabledRotations={[false, false, false]}
            >
                <primitive 
                    object={model.scene}
                    ref={PlayerRef}
                    scale={24}
                    position={[0,10,270]}
                    rotation={[0,180*Math.PI/180,0]}
                />
            </RigidBody>
        </>
    );
};


export default Player;