import React,{useEffect,useRef, useState, useMemo} from "react"
import { useLoader, useFrame, useThree, extend} from '@react-three/fiber';
import { useGLTF, Environment, Html, OrbitControls,Text, Sky,ContactShadows} from "@react-three/drei"
import * as THREE from 'three'; // THREE 모듈을 임포트
import { Stats, useHelper } from '@react-three/drei';
import { DirectionalLightHelper, SpotLightHelper } from 'three';
import NPC from "./NPC";
// import Player from "./PlayerFinal";
// import Player from "./PlayerFinal copy 4";
import Player from "./PlayerFinal copy 5";
import FocusOnMonitor from "./FocusOnMonitor";
import FocusOnNoticeBoard from "./FocusOnNoticeBoard";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import PrintCard from "./PrintCard";
import Gallery from "./Gallery";
import { useControls } from "leva";
import useInOutStore from "../store/inOutStore"
import { Water } from 'three-stdlib'

extend({ Water })


function Ocean() {
    const ref = useRef()
    const gl = useThree((state) => state.gl)
    const waterNormals = useLoader(THREE.TextureLoader, '/images/waternormals.jpeg')
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
    const geom = useMemo(() => new THREE.CircleGeometry(9, 20), [])
    const config = useMemo(
      () => ({
        textureWidth: 265,
        textureHeight: 265,
        waterNormals,
        sunDirection: new THREE.Vector3(),
        sunColor: "#ffffff",
        waterColor: "#2280cc",
        distortionScale: 5, //물결 왜곡값
        fog: false,
        format: gl.encoding
      }),
      [waterNormals]
    )
    useFrame((state, delta) => (ref.current.material.uniforms.time.value += delta))
    return <water ref={ref} args={[geom, config]} position={[0, 5, 52]} rotation-x={-Math.PI / 2} />
  }

function Element3D(){

    const { isInside, setIsInside } = useInOutStore((state) => ({
        isInside: state.isInside,
        setIsInside: state.setIsInside,
    }));
    // const [isInside, setIsInside]=useState(false);
    // const [isInside, setIsInside]=useState(true); //내부 테스트용
    

    const office_objects = useGLTF('./models/office_modeling.glb')
    // const floor = useGLTF('./models/wall_floor.glb')
    const monitor = useGLTF('/models/monitor.glb')
    const office_outside = useGLTF('/models/external_modeling.glb')
    // const office = useGLTF('/models/office.glb')


    //조명 헬퍼
    const directionalLightRef = useRef();
    useHelper(directionalLightRef, DirectionalLightHelper,5, "red");
    const spotLightRef = useRef();
    useHelper(spotLightRef, SpotLightHelper,5, "red");

    //그림자 넣기
    useEffect(() => {
        office_objects.scene.traverse(child => {
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
    }, [office_objects,office_outside]);

    //문 충돌 확인 떔에 옮겨놓음
    const arrowRef = useRef();
    //화살표 에니메이션
    useFrame((state, delta) => {
        if (arrowRef.current) { // arrowRef.current가 존재하는지 확인
            arrowRef.current.position.y += Math.sin(state.clock.getElapsedTime()*5) * 0.01;
        }
    });

    const { handleMonitorClick } = FocusOnMonitor();
    // const { handleNoticeBoardClick } = FocusOnNoticeBoard();

    return(
        <>
            {/* <OrbitControls makeDefault/> */}
            <Sky distance={200} sunPosition={[100,400,0]}/>
            <Environment
                preset="sunset"
            />
            <ambientLight intensity={0.1} color="#ffffff"/>
            <directionalLight
                castShadow
                ref={directionalLightRef}
                intensity={1}
                position={[100,400,0]}
                color={"#ffffff"}
                shadow-camera-left={60}
                shadow-camera-right={-130}
                shadow-camera-top={90}
                shadow-camera-bottom={-90}
                shadow-camera-near={1}
                shadow-camera-far={1000}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            /> 
            {!isInside&&(<Ocean />)}
            {!isInside&&(
            <RigidBody
                type="fixed"
                colliders="trimesh"
                name="out_floor"
                position={[4,-5,0]}
                rotation={[0, 90 * Math.PI / 180, 0]} 
            >
                <primitive
                    object={office_outside.scene}
                />
            </RigidBody>
            )}
            {/*outSide-inSide*/}
            {!isInside && (
                <RigidBody
                    type="fixed"
                    name="GoInDoor"
                    // setNextKinamaticTranslation-kinematicPosition 장:부드러운 움직임 단:충돌 이벤트 불가
                    // setTranslation-dynamic 장: 단: 충돌 이벤트가 되긴하는데 잘 인식이 안됨, 움직임 끊김
                    // onCollisionEnter={({other}) => {
                    //     console.log("collision detected")
                    //     if(other.rigidBodyObject.name==="Player"){
                    //         console.log("GoInDoor collision with",other.rigidBodyObject.name);
                    //     }}}
                    // onCollisionExit={({other}) => {
                    //     console.log("collision detected")
                    //     if(other.rigidBodyObject.name==="Player"){
                    //         console.log("GoInDoor collision exit with",other.rigidBodyObject.name);
                    //         setIsInside(true);
                    //     }}}
                >
                    <mesh 
                        position={[-0.4, 7.1, 12]} 
                        onClick={() => { console.log("GoInDoor clicked!"); setIsInside(true); }}
                    >
                        <boxGeometry args={[9, 9, 2]} />
                        <meshStandardMaterial color="red"
                            transparent={true}
                            opacity={0.1} />
                    </mesh>
                </RigidBody>
            )}
            {/* //stair test
            {!isInside && (
                <RigidBody
                    type="fixed"
                >
                    <mesh 
                        position={[0, 0.5, 25.5]} 
                    >
                        <boxGeometry args={[10, 2, 2]} />
                        <meshStandardMaterial color="blue"
                            transparent={true}
                            opacity={0.5} />
                    </mesh>
                </RigidBody>
            )}
            {!isInside && (
                <RigidBody
                    type="fixed"
                >
                    <mesh 
                        position={[0, 0.5, 28]} 
                    >
                        <boxGeometry args={[10, 2, 2]} />
                        <meshStandardMaterial color="blue"
                            transparent={true}
                            opacity={0.5} />
                    </mesh>
                </RigidBody> 
            )}*/}
            {/* 나갈떄 내려가는 거 방지용 */}
            {!isInside&&(
            <RigidBody colliders={false} type="fixed" name="in_floor">
                <CuboidCollider position={[0, 0, 12]} args={[30, 1, 25]} />
            </RigidBody>
            )}

            {isInside && (
                <RigidBody type="fixed" name="GoOutDoor"
                    // onCollisionEnter={({other}) => {
                    //     console.log("collision detected")
                    //     if(other.rigidBodyObject.name==="Player"){
                    //         console.log("GoOutDoor collision with",other.rigidBodyObject.name);
                            
                    //     }}}
                    //     onCollisionExit={({other}) => {
                    //         console.log("collision detected")
                    //         if(other.rigidBodyObject.name==="Player"){
                    //             console.log("GoOutDoor collision with",other.rigidBodyObject.name);
                    //             setIsInside(false);
                    //     }}}
                >
                    <mesh 
                        position={[-0.4, 7.1, 22]}  
                        onClick={() => { console.log("GoOutDoor clicked!"); setIsInside(false);}}
                    >
                        <boxGeometry
                            args={[9, 9, 2]}
                        />
                        <meshStandardMaterial color="blue"
                            transparent={true}
                            opacity={0.1} />
                    </mesh>
                </RigidBody>
            )}
            {isInside && (
                <Text
                    color="blue"
                    fontSize={2}
                    letterSpacing={0.02}
                    textAlign={'center'}
                    anchorX="center"
                    anchorY="middle"
                    position={[0, 14, 20]}
                >
                    Go Outside
                </Text>
            )}
            {isInside && (
                <mesh
                    ref={arrowRef}
                    position={[0, 12.5, 20]}
                    rotation={[Math.PI, 0, 0]}
                >
                    <coneGeometry args={[0.5, 0.8, 10]} />
                    <meshStandardMaterial color="blue" />
                </mesh>
            )}
            {isInside&&(        
            <spotLight
                ref={spotLightRef}
                position={[-28.5,15,-30.5]} // 램프의 위치에 맞게 조정
                target-position={[-28.5,0,-30.5]}
                angle={40*Math.PI/180}
                penumbra={0.2}
                color={"gold"}
                intensity={500}
            />)}
            {isInside&&(
                <RigidBody type="fixed">
                <Html 
                    className="monitorScreen" 
                    transform
                    occlude="blending"
                    //[-12.7,-1.6,-4]
                    scale={0.11}
                    position={[-0.65,11.3,-11.6]}
                >
                    <iframe src="https://kimmyungsa.netlify.app"
                        allow="camera;"
                        style={{ width: '1600px', height: '1200px' }}
                    />
                </Html>
                </RigidBody>
            )}

            {/*<CameraHelper targetPosition={new Vector3(0, 106, 30)} />*/}
            {/*<primitive
                object={floor.scene} 
                scale={1.1}
                position={[100,0,63]}
            />  */}
            {/*<CameraHelper targetPosition={new Vector3(0, 106, 30)} />*/}
            {isInside&&(<RigidBody 
                type="fixed"
                colliders={false}
                // colliders="trimesh"
                scale={0.1}
                rotation={[0, -90 * Math.PI / 180, 0]} 
                position={[-7,1.3,-8]}
            >
                <primitive
                    object={office_objects.scene} 
                /> 
            </RigidBody>)}
            {isInside&&(
            <RigidBody 
                type="fixed"
                scale={0.2}
                position={[-12.7,-1.6,-4]}
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
            {/*사무실 바닥*/}
            {isInside&&(
            <RigidBody colliders={false} type="fixed" name="in_floor">
                <CuboidCollider position={[10, 1.5, -20]} args={[45, 0.5, 40]} />
            </RigidBody>
            )}
            {/* <NPC/>  */}
            <Player/>
            {/* {isInside&&(
            <PrintCard/>
            )}  */}
            {/* {isInside&&(
            <Gallery/>
            )}  */}
        </>
    );
}

export default Element3D;                                                      