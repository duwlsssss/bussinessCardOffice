import React,{useEffect,useRef, useState} from "react"
import { Canvas, useLoader, useFrame, useThree} from '@react-three/fiber';
import {OrbitControls, useGLTF, Html } from "@react-three/drei"
import * as THREE from 'three'; // THREE 모듈을 임포트
import { Stats } from '@react-three/drei'

function Element3D(){
    const office = useGLTF('./models/kims_office.glb')
    const floor = useGLTF('./models/floor.glb')
    const monitor = useGLTF('./models/monitor.glb')

    //모니터 선택하면 확대, 클릭하는 곳에 따라 시점 이동   
    const iframeRef = useRef();
    const { camera, scene } = useThree();
    const raycaster = new THREE.Raycaster();

    useFrame(() => {
    });

    return(
        <>
            <OrbitControls/>
            <axesHelper args={[500, 500, 500]} /> {/*월드좌표축*/}
            <ambientLight intensity={0.4} />
            <directionalLight
                // ref={directionalLightRef}
                intensity={1}
                position={[0, 25, -10]}
                castShadow // 그림자 생성 활성화
                depthTest={true}
            />
            <spotLight
                // ref={spotLightRef}
                position={[-18.5, 11, 9]} // 램프의 위치에 맞게 조정
                angle={Math.PI / 4}
                penumbra={0.5}
                intensity={10}
                castShadow
            />
            <Stats/>
            <Html 
                // ref={iframeRef}
                wrapperClass="monitor" 
                transform
                rotation={[0, 90 * Math.PI / 180, 0]} 
                position={[59,71.3,-3.2]}
            >
                <iframe src="https://winxp.vercel.app/"
                    style={{ width: '950px', height: '700px' }}
                />
            </Html> 
            <group>
                <primitive
                    object={office.scene} 
                    scale={1.1}
                    position={[100,0,63]}
                    castShadow
                /> 
                <primitive
                    object={floor.scene} 
                    scale={1.1}
                    position={[0,0,0]}
                    receiveShadow
                /> 
                {/* <primitive
                    object={monitor.scene} 
                    scale={2}
                    position={[0,0,0]}
                    castShadow
                    // onClick={handleModelClick} // 클릭 이벤트 핸들러 추가
                />  */}
            </group> 
           </>
    );
}

export default Element3D;                                                      