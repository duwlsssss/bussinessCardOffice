import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { RigidBody,CapsuleCollider } from '@react-three/rapier';
import useCameraStore from '../store/cameraStore';
import useInput from "../hooks/useInput"
import { gsap } from 'gsap/gsap-core';

let walkDirection = new THREE.Vector3();
let rotateAngle = new THREE.Vector3(0,1,0);
let rotateQurternion = new THREE.Quaternion();
let cameraTarget= new THREE.Vector3();

//캐릭터 방향 안바뀌어서 캐릭터 기준으로는 w뒤 a오 s앞 d왼 임!!
const directionOffset = ({forward, backward, left, right})=>{
    var directionOffset=0; 

    if(forward){
        if (left) {
            directionOffset = -3 * Math.PI / 4; // 왼쪽 앞
        } else if (right) {
            directionOffset = 3 * Math.PI / 4; // 오른쪽 앞
        } else {
            directionOffset = Math.PI; // 직진
        }
    }else if(backward){
        if (right) {
            directionOffset = Math.PI / 4; // 왼쪽 뒤
        } else if (left) {
            directionOffset = -Math.PI / 4; // 오른쪽 뒤
        } else {
            directionOffset = 0; // 후진
        }
    }else if(right){
        directionOffset=Math.PI/2; //d
    }
    else if(left){
        directionOffset=-Math.PI/2; //a
    }

    return directionOffset;
}

const Player=({controlsRef})=>{
    const {camera}=useThree();
    const { isFocused, clearFocus } = useCameraStore();

    const playerRef=useRef();
    const rigidbody=useRef();
    const currentAction =useRef(null);
    const { forward, backward, left, right } = useInput();

    // 모델과 애니메이션 로드 상태를 추적하는 상태 변수
    const [isLoaded, setIsLoaded] = useState(false);

    const { scene, animations } = useGLTF("./models/standing_idle.glb");
    const { actions } = useAnimations(animations, scene);
    // console.log("actions",actions)

    useEffect(() => {
        // 모델과 애니메이션 로드 상태를 감지하고, 상태를 업데이트
        const isLoaded = scene && actions && Object.keys(actions).length > 0;
        if (isLoaded) {
            actions.standing_kk.play();
        }
    }, [scene, actions]);
    // 로드 완료 후 standing_kk 애니메이션으로 설정

    //그림자
    scene.traverse((obj) => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    //카메라 타겟 업데이트
    const updateCameraTarget=(moveX, moveZ)=>{
        //move camera
        camera.position.x-=moveX;
        camera.position.z-=moveZ;

        //update camera target
        cameraTarget.x=scene.position.x;
        cameraTarget.y=scene.position.y;
        cameraTarget.z=scene.position.z;
        if(controlsRef.current) controlsRef.current.target=cameraTarget;
    }

    useEffect(()=>{
        const action = forward || backward || left || right ? "walking_idle" : "standing_kk";

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
        let angleYCameraDirection;
        let newDirectionOffset = directionOffset({ forward, backward, left, right });

        if (forward || backward || left || right) {
                // 카메라 방향으로부터 회전 각도 계산
                angleYCameraDirection = Math.atan2(
                    camera.position.x - scene.position.x,
                    camera.position.z - scene.position.z
                );

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
                const velocity=40;
                // const velocity=currentAction.current=="running"?10:5;

                //move model & camera
                const moveX=walkDirection.x*velocity*delta;
                const moveZ=walkDirection.z*velocity*delta;
                scene.position.x-=moveX;
                scene.position.z-=moveZ;

                updateCameraTarget(moveX,moveZ);

                //  // 모델의 새 위치와 회전을 계산한 후, RigidBody의 상태를 업데이트
                // if (rigidbody.current) {
                //     // 위치 업데이트
                //     rigidbody.current.setLinvel(new THREE.Vector3(moveX / delta, 0, moveZ / delta), true);

                //     // 회전 업데이트 (예시로 쿼터니언을 사용)
                //     const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleYCameraDirection + newDirectionOffset);
                //     rigidbody.current.setRotation(q, true);
                // }
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
              y: playerPosition.y+120 , // 카메라 높이 조정
              z: playerPosition.z+150, // 카메라와 플레이어 사이의 거리
              duration: 1,
              ease: "power3.inOut",
            });
            gsap.to(controlsRef.current.target, {
                x: playerPosition.x,
                y: playerPosition.y,
                z: playerPosition.z,
                duration: 1,
                ease: "power3.inOut",
                onUpdate: () => { controlsRef.current.update(); },
              });
          }
        }, [isFocused, camera, playerRef]);


    return (
        <>
            <RigidBody 
                name="Player"
                ref={rigidbody}
                colliders={false}
                // scale={[1,1,1]}
                type="kinematicPosition"
                enabledRotations={[false, false, false]}
            >
                <CapsuleCollider args={[10,20]} position={[-25,50,210]}/>
                <primitive 
                    object={scene}
                    ref={playerRef}
                    scale={35}
                    position={[0,11,260]}
                    rotation={[0,180*Math.PI/180,0]}
                />
            </RigidBody>
        </>
    );
};


export default Player;