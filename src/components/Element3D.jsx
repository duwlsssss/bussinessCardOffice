import React,{useEffect,useRef, useState} from "react"
import { useLoader, useFrame, useThree, extend} from '@react-three/fiber';
import { useGLTF, Environment, Html, OrbitControls,Text} from "@react-three/drei"
import * as THREE from 'three'; // THREE 모듈을 임포트
import { Stats, useHelper } from '@react-three/drei';
import { DirectionalLightHelper, SpotLightHelper } from 'three';
import NPC from "./NPC";
import Player from "./PlayerFinal";
import FocusOnMonitor from "./FocusOnMonitor";
import FocusOnNoticeBoard from "./FocusOnNoticeBoard";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import PrintCard from "./PrintCard";
import Gallery from "./Gallery";
import { TexturePass, initSplineTexture } from "three-stdlib";

function Element3D(){
    const [isInside, setIsInside]=useState(false);
    // const [isInside, setIsInside]=useState(true); //내부 테스트용
    const arrowRef = useRef();

    // const office_objects = useGLTF('./models/office_objects.glb')
    // const floor = useGLTF('./models/wall_floor.glb')
    const monitor = useGLTF('/models/monitor.glb')
    const office_outside = useGLTF('/models/office_outside.glb')
    const tree = useGLTF('/models/tree.glb')
    // const office = useGLTF('/models/office.glb')

    //조명 헬퍼
    const directionalLightRef = useRef();
    useHelper(directionalLightRef, DirectionalLightHelper,5, "red");
    const spotLightRef = useRef();
    useHelper(spotLightRef, SpotLightHelper,5, "red");

    // const { camera } = useThree();
    // //orbitControls 사용 여부
    // const [enableOrbit, setEnableOrbit] = useState(true);

    // //orbitcontrols 비활성화-활성화될때 target 저장하기 위함
    // const [cameraState, setCameraState] = useState({
    //     position: camera.position.clone(),
    //     target: new THREE.Vector3()
    // });

    // useEffect(() => {
    // if (enableOrbit) {
    //     // OrbitControls를 활성화할 때, 카메라 상태를 복원
    //     camera.position.copy(cameraState.position);
    //     controlsRef.current.target.copy(cameraState.target);
    //     controlsRef.current.update();
    // } else {
    //     // OrbitControls를 비활성화할 때, 현재 카메라 상태 저장
    //     setCameraState({
    //     position: camera.position.clone(),
    //     target: controlsRef.current.target.clone()
    //     });
    // }
    // }, [enableOrbit, camera, controlsRef]);




    // 갤러리 모드 진입 시 OrbitControls 비활성화
    const handleEnterGalleryMode = () => {
        setEnableOrbit(false);
        console.log("!enableOrbit")
    };
    // 갤러리 모드 종료 시 OrbitControls 활성화
    const handleExitGalleryMode = () => {
        setEnableOrbit(true);
        console.log("enableOrbit")
    };

    // const three=useThree();
    // console.log("three",three);//정보 출력 

    //그림자 넣기
    useEffect(() => {
        office_outside.scene.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        office_outside.scene.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [office_outside,tree]);

    //화살표 에니메이션
    useFrame((state, delta) => {
        if (arrowRef.current) { // arrowRef.current가 존재하는지 확인
            arrowRef.current.position.y += Math.sin(state.clock.getElapsedTime() * 3) * 0.1;
        }
    });


    const controlsRef = useRef();
    const { handleMonitorClick } = FocusOnMonitor(controlsRef);
    // const { handleNoticeBoardClick } = FocusOnNoticeBoard(controlsRef);


     

    return(
        <>
            {/* {enableOrbit && <OrbitControls ref={controlsRef} />} */}
            <OrbitControls ref={controlsRef} />
            <axesHelper args={[500, 500, 500]} /> {/*월드좌표축*/}
            <Stats/>
            <Environment preset="forest" background/>
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
            {/* <spotLight
                ref={spotLightRef}
                position={[-100,115,162]} // 램프의 위치에 맞게 조정
                target-position={[-100,0,162]}
                angle={40*Math.PI/180}
                penumbra={0.1}
                color={"gold"}
                intensity={45000}
                // castShadow
            /> */}

            {!isInside&&(
            <RigidBody
                type="fixed"
                colliders="trimesh"
                scale={10}
                position={[30,-58,300]}
                rotation={[0, 90 * Math.PI / 180, 0]} 
            >
                <primitive
                    object={office_outside.scene}
                />
            </RigidBody>
            )}
            {/*안으로 들어가는 문*/}
            {!isInside&&(
            <RigidBody type="fixed" name="GoInDoor"
                onCollisionEnter={(other)=>{
                    if(other.rigidBodyObject.name==="Player"){
                      console.log("들어가는 문과 캐릭터와 충돌 발생",other.rigidBodyObject.name);
                      setIsInside(true);
                  }}}
            >
                <mesh position={[0, 59, 410]}>
                    <boxGeometry args={[50, 100, 10]} />
                    <meshBasicMaterial color="red"/>
                </mesh>
            </RigidBody>
            )}
            {/*밖으로 나가는 문*/}
            {isInside&&(
            <RigidBody type="fixed" name="GoOutDoor"
                onCollisionEnter={(other)=>{
                    if(other.rigidBodyObject.name==="Player"){
                      console.log("나가는 문과 캐릭터와 충돌 발생",other.rigidBodyObject.name);
                      setIsInside(false);
                  }}}
            >
                <mesh position={[0, 59, 500]}>
                    <boxGeometry args={[50, 100, 10]} />
                    <meshBasicMaterial color="blue"/>
                </mesh>
            </RigidBody>
            )}
            {isInside&&(
            <Text
                    color="blue" // 텍스트 색상
                    fontSize={10} // 텍스트 크기
                    letterSpacing={0.02} // 글자 간격
                    textAlign={'center'} // 텍스트 정렬
                    anchorX="center" // X축 기준 중앙 정렬
                    anchorY="middle" // Y축 기준 중앙 정렬
                    position={[0, 130,490]} // 텍스트 위치
                >
                    Go Outside
                </Text>
            )}
            {isInside&&(
               <mesh
                    ref={arrowRef}
                    position={[0, 118, 490]} // 화살표 초기 위치
                    rotation={[Math.PI,0,0]}
                >
                    <coneGeometry args={[3, 5, 15]}/>
                    <meshStandardMaterial color="blue" /> 
                </mesh>
            )}
            {isInside&&(
            <RigidBody type="fixed">
                <Html 
                    className="monitorScreen" 
                    transform
                    occlude="blending"
                    position={[-1.6,106.5,24]}
                >
                    <iframe src="https://kimmyungsa.netlify.app"
                        style={{ width: '1600px', height: '1200px' }}
                    />
                </Html>
            </RigidBody>
            )}

            {/*<CameraHelper targetPosition={new Vector3(0, 106, 30)} />*/}
            {/* <primitive
                object={office_objects.scene} 
                scale={1.1}
                position={[100,0,63]}
            />  */}
            {/*
            <primitive
                object={floor.scene} 
                scale={1.1}
                position={[100,0,63]}
             />  */}
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
            {isInside&&(
            <RigidBody 
                type="fixed"
                scale={1.8}
                position={[-110,-10,90]}
                rotation={[0, -90 * Math.PI / 180, 0]} 
            >
                <primitive
                    object={monitor.scene}
                    onClick={handleMonitorClick} // 이벤트 핸들러 수정
                />
            </RigidBody>
            )}
            {/* <RigidBody type="fixed" 
                scale={1.1}
                position={[-70,0,63]}
                rotation={[0, -90 * Math.PI / 180, 0]}
            >
                <primitive
                    object={office.scene}
                />
            </RigidBody> */}
            {isInside&&(
            <RigidBody colliders={false} type="fixed" name="void">
                <mesh position={[0, 20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[2000, 2000]} />
                    <meshBasicMaterial color="#e3daf7" />
                </mesh>
                <CuboidCollider position={[0, 20, 0]} args={[1000, 1, 1000]} />
            </RigidBody>
            )} 
            <NPC controlsRef={controlsRef}/>
            <Player controlsRef={controlsRef}/>
            {isInside&&(
            <PrintCard controlsRef={controlsRef}/>
            )} 
            {isInside&&(
            <Gallery controlsRef={controlsRef}/>
            )}
            {/* {isInside&&(
            <primitive
                object={tree.scene}
                scale={5}
                position={[0,30,300]}
            />
            )} */}
        </>
    );
}

export default Element3D;                                                      