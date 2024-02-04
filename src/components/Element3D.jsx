import React,{useEffect,useRef, useState} from "react"
import { useLoader, useFrame, useThree} from '@react-three/fiber';
import { useGLTF, Environment, Html,  OrbitControls } from "@react-three/drei"
import * as THREE from 'three'; // THREE 모듈을 임포트
import { Stats, useHelper } from '@react-three/drei';
import { DirectionalLightHelper, SpotLightHelper } from 'three';
import { Vector3, SphereGeometry, MeshStandardMaterial, Mesh } from 'three';
import NPC from "./NPC";
import Player from "./Player";
import FocusOnObjects from "./FocusOnObjects";
import { gsap } from "gsap/gsap-core";
import CameraHelper from "./FocusOnObjects"
// import Player_ from "./Player_";


function Element3D(){
    // const office_objects = useGLTF('./models/office_objects.glb')
    // const floor = useGLTF('./models/wall_floor.glb')
    const monitor = useGLTF('./models/monitor.glb')
    const office = useGLTF('./models/office.glb')

    //조명 헬퍼
    const directionalLightRef = useRef();
    useHelper(directionalLightRef, DirectionalLightHelper,5, "red");
    const spotLightRef = useRef();
    useHelper(spotLightRef, SpotLightHelper,5, "red");

    // const three=useThree();
    // console.log("three",three);//정보 출력 

    // //그림자 넣기
    // useEffect(() => {
    //     office_objects.scene.traverse(child => {
    //         if (child.isMesh) {
    //             child.castShadow = true;
    //             child.receiveShadow = true;
    //         }
    //     });
    //     floor.scene.traverse(child => {
    //         if (child.isMesh) {
    //             child.receiveShadow = true;
    //         }
    //     });
    //     monitor.scene.traverse(child => {
    //         if (child.isMesh) {
    //             child.castShadow = true;
    //             child.receiveShadow = true;
    //         }
    //     });

    // }, [ office_objects, floor, monitor ]);

    //모니터 화면 확대
    const { camera, scene } = useThree();
    const [beforeCamera, setBeforeCamera] = useState(null);
    
    const monitorPosition= new THREE.Vector3(0,106,50)
    const monitorTarget= new THREE.Vector3(0,106,25)
    
    //카메라 위치와 타겟 
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(monitorPosition);
    scene.add(sphere);
    const geometry2 = new THREE.SphereGeometry(1, 32, 32);
    const material2 = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const sphere2 = new THREE.Mesh(geometry2, material2);
    sphere2.position.copy(monitorTarget);
    scene.add(sphere2);

    // const direction = new THREE.Vector3();
    // camera.getWorldDirection(direction);
    // const estimatedTarget = new THREE.Vector3().addVectors(camera.position, direction.multiplyScalar(100)); // 예시 거리값

    const handleMonitorClick = () => {
        if(!beforeCamera){
            // 카메라의 현재 위치와 방향을 저장
            setBeforeCamera({
                position: camera.position.clone(),
                // target: new THREE.Vector3(0,0,0) // 계산된 타겟 위치 사용
            });

            console.log("monitor click")
            console.log("position",monitorPosition)
            console.log("target",monitorTarget)
            // camera.position.set(monitorPosition.x,monitorPosition.y,monitorPosition.z);
            // camera.lookAt(monitorTarget);

            // console.log("target",monitorTarget)
            // 카메라를 모니터 위치로 이동시키고 모니터를 바라보게 함
            gsap.to(camera.position, {
                x: monitorPosition.x,
                y: monitorPosition.y,
                z: monitorPosition.z,
                duration: 1,
                ease: "easeOut",
                onUpdate: function() {
                    // 카메라의 위치가 변경될 때마다 camera.lookAt을 호출하여 카메라가 계속 대상을 바라보도록 함.
                    camera.lookAt(monitorTarget.x,monitorTarget.y,monitorTarget.z);
                },
                onComplete: function() {
                    camera.lookAt(monitorTarget.x, monitorTarget.y, monitorTarget.z);
                    // 카메라의 현재 방향 벡터를 계산
                    const direction = new THREE.Vector3();
                    camera.getWorldDirection(direction);

                    // 카메라의 위치에서 방향 벡터를 더하여 실제 바라보고 있는 포인트를 추정
                    const actualLookAtPoint = new THREE.Vector3().addVectors(camera.position, direction.multiplyScalar(100));
                    
                    console.log("after gsap position", camera.position);
                    console.log("Camera is actually looking at:", actualLookAtPoint);
                    console.log("Expected to look at:", monitorTarget);
                }
                // onComplete: () => {
                //     camera.up.set(0,1,0)
                //     camera.lookAt(monitorTarget.x,monitorTarget.y,monitorTarget.z);
                //     // 카메라의 현재 방향 벡터를 계산
                //     const direction = new THREE.Vector3();
                //     camera.getWorldDirection(direction);

                //     // 카메라의 위치에서 방향 벡터를 더하여 실제 바라보고 있는 포인트를 추정
                //     const actualLookAtPoint = new THREE.Vector3().addVectors(camera.position, direction.multiplyScalar(100));
                    
                //     console.log("after gsap position", camera.position);
                //     console.log("Camera is actually looking at:", actualLookAtPoint);
                //     console.log("Expected to look at:", monitorTarget);
                // }
            }); }else {
                console.log("monitor click again")
                console.log("position",beforeCamera.position)
                console.log("target",beforeCamera.target)
                // 카메라를 원래 위치로 이동시키고 원래 방향을 바라보게 함
                gsap.to(camera.position, {
                    x: beforeCamera.position.x,
                    y: beforeCamera.position.y,
                    z: beforeCamera.position.z,
                    duration: 1,
                    ease: "easeOut",
                    onComplete: () => {
                        camera.lookAt(beforeCamera.target);
                        setBeforeCamera(null); // 이전 위치 정보 초기화
                    }
                });
            }
            useEffect(() => {
                window.addEventListener('click', handleMonitorClick);
                return () => {
                    window.removeEventListener('click', handleMonitorClick);
                };
            }, [handleMonitorClick]);
    }

    return(
        <>
            <OrbitControls/>
            <axesHelper args={[500, 500, 500]} /> {/*월드좌표축*/}
            <Stats/>
            <Environment preset="sunset" background />
            <directionalLight
                    ref={directionalLightRef}
                    intensity={1}
                    position={[-100,400,0]}
                    color={"#fdfbfb"}
                    castShadow
                    shadow-camera-left={-500}
                    shadow-camera-right={500}
                    shadow-camera-top={500}
                    shadow-camera-bottom={-500}
                    shadow-camera-near={10}
                    shadow-camera-far={1000}
                    shadow-mapSize-width={10000}
                    shadow-mapSize-height={10000}
                />             
            <spotLight
                ref={spotLightRef}
                position={[-100,115,162]} // 램프의 위치에 맞게 조정
                target-position={[-100,0,162]}
                angle={40*Math.PI/180}
                penumbra={0.1}
                color={"gold"}
                intensity={45000}
                // castShadow
            />
            <Html 
                className="monitorScreen" 
                transform
                occlude="blending"
                position={[0,106,25]}
            >
                <iframe src="https://kimssinemyeongham.netlify.app"
                    style={{ width: '1600px', height: '1200px' }}
                />
            </Html>
            {/*<CameraHelper targetPosition={new Vector3(0, 106, 30)} />*/}
            {/* <primitive
                object={office_objects.scene} 
                scale={1.1}
                position={[100,0,63]}
            /> 
            <primitive
                object={floor.scene} 
                scale={1.1}
                position={[100,0,63]}
            />  */}
             <primitive
                object={monitor.scene}
                onClick={handleMonitorClick}
                scale={1.8}
                position={[-110,-10,90]}
                rotation={[0, -90 * Math.PI / 180, 0]} 
            />
             <primitive
                object={office.scene}
                scale={1.1}
                position={[-70,0,63]}
                rotation={[0, -90 * Math.PI / 180, 0]}
            />
            <Player/>
            <NPC/>
            {/* <Player_/> */}
        </>
    );
}
export default Element3D;                                                      