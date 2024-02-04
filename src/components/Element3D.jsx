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
    const { camera, scene} = useThree();
    const meshRef = useRef();
    const controls = useRef();
    const [beforeCamera, setBeforeCamera] = useState(null);
    
    const aboutCameraPos = {
        x: -1.6,
        y: 106,
        z: 100,
      };
    const aboutCameraRot = {
        x: -20 * (Math.PI / 180), // 위쪽으로 20도 회전
        y: 0,
        z: 0,
      };

    //카메라 위치와 타겟 
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(aboutCameraPos);
    scene.add(sphere);

    const handleMonitorClick = () => {
        if(!beforeCamera){
            // 카메라의 현재 위치와 방향을 저장
            setBeforeCamera({
                position: camera.position.clone(),
                rotation: { x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z }
            });
            gsap.to(camera.position, {
                ...aboutCameraPos,
                ease: "power3.inOut",
                duration: 1.5,
            });
            gsap.to(camera.rotation, {
                ...aboutCameraRot,
                ease: "power3.inOut",
                duration: 1.5,
            });
        }
        else {
            // 카메라를 원래 위치로 이동시키고 원래 방향을 바라보게 함
            // 두 번째 클릭 시: 카메라를 원래 위치와 회전으로 복귀
            gsap.to(camera.position, {
                ...beforeCamera.position,
                ease: "power3.inOut",
                duration: 1.5,
            });
            gsap.to(camera.rotation, {
                ...beforeCamera.rotation,
                ease: "power3.inOut",
                duration: 1.5,
                onComplete: () => {
                    // 원래 상태로 복귀한 후 beforeCamera 상태를 초기화
                    setBeforeCamera(null);
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
                position={[-1.6,106,23]}
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
                ref={meshRef}
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