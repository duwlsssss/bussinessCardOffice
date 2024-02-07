import React,{useEffect,useRef, useState} from "react"
import { useLoader, useFrame, useThree, extend} from '@react-three/fiber';
import { useGLTF, Environment, Html, OrbitControls, } from "@react-three/drei"
import * as THREE from 'three'; // THREE 모듈을 임포트
import { Stats, useHelper } from '@react-three/drei';
import { DirectionalLightHelper, SpotLightHelper } from 'three';
import NPC from "./NPC";
import Player from "./Player";
import FocusOnMonitor from "./focusOnMonitor";
import FocusOnNoticeBoard from "./FocusOnNoticeBoard";
import { RigidBody } from "@react-three/rapier";
import { Controls } from '../App';
// import Player_ from "./Player_";


function Element3D(){
    // const office_objects = useGLTF('./models/office_objects.glb')
    // const floor = useGLTF('./models/wall_floor.glb')
    const monitor = useGLTF('./models/monitor.glb')
    const office = useGLTF('./models/office.glb')
    const {scene,animations} = useGLTF('./models/dancer.glb');

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

    const controlsRef = useRef();
    const { handleMonitorClick } = FocusOnMonitor(controlsRef);
    const { handleNoticeBoardClick } = FocusOnNoticeBoard(controlsRef);
    
    return(
        <>
            <OrbitControls ref={controlsRef} />
            <axesHelper args={[500, 500, 500]} /> {/*월드좌표축*/}
            <Stats/>
            <Environment preset="forest" backgroud/>
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
            <RigidBody type="fixed">
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
            </RigidBody>
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
            <RigidBody type="fixed"
                scale={1.8}
                position={[-110,-10,90]}
                rotation={[0, -90 * Math.PI / 180, 0]} 
            >
                <primitive
                    object={monitor.scene}
                    onClick={handleMonitorClick} // 이벤트 핸들러 수정
                />
            </RigidBody>
            <RigidBody type="fixed" 
                scale={1.1}
                position={[-70,0,63]}
                rotation={[0, -90 * Math.PI / 180, 0]}
            >
                <primitive
                    object={office.scene}
                />
            </RigidBody>
            <mesh onClick={handleNoticeBoardClick} position={[-260, 150, -200]}>
                <boxGeometry args={[10, 10, 10]} />
                <meshStandardMaterial color={'orange'} />
            </mesh>
            <NPC controlsRef={controlsRef}/>
            <Player/>
        </>
    );
}

export default Element3D;                                                      