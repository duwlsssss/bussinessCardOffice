import React,{useEffect,useRef, useState, useMemo} from "react"
import { useLoader, useFrame, useThree, extend} from '@react-three/fiber';
import { useGLTF, Environment, Html, OrbitControls,Text, Sky, useAnimations} from "@react-three/drei"
import * as THREE from 'three'; // THREE 모듈을 임포트
import { Stats, useHelper } from '@react-three/drei';
import { DirectionalLightHelper, SpotLightHelper } from 'three';
import NPC from "./NPC";
import Player from "./PlayerFinal copy 5";
import FocusOnMonitor from "./FocusOnMonitor";
import FocusOnNoticeBoard from "./FocusOnNoticeBoard";
import usePlayerStore from  "../store/playerStore";
import PrintCard from "./PrintCard";
import Gallery from "./Gallery";
import useInOutStore from "../store/inOutStore"
import { Water } from 'three-stdlib'
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import useNPCStore from "../store/npcStore";

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
    const isIntroductionEnd = useNPCStore((state) => state.isIntroductionEnd);
    


    const office_objects = useGLTF('/models/office_modeling_draco.glb')
    // const floor = useGLTF('/models/wall_floor.glb')
    // const monitor = useGLTF('/models/monitor_draco.glb')
    const office_outside = useGLTF('/models/external_modeling_draco.glb')
    // const office = useGLTF('/models/office.glb')
    const flowers = useGLTF('/models/flowers.glb')

    // const duckRef=useRef();
    // const { scene, animations } = useGLTF("/models/lowpoly_duck_animated.glb");
    // const { actions } = useAnimations(animations, scene);
    // const [duckPosition, setduckPosition] = useState([0, 0, 0]);
    // const [duckDirection, setDuckDirection] = useState(new THREE.Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize());
    // const speed = 0.1;
    // useEffect(() => {
    //     // "walkcycle_1" 애니메이션을 찾아 재생
    //     const action = actions["walkcycle_1"];
    //     if (action) {
    //         action.reset().play();
    //     }

    //     // 컴포넌트 언마운트 시 애니메이션 정지
    //     return () => {
    //         if (action) {
    //             action.stop();
    //         }
    //     };
    // }, [actions]); // 의존성 배열에 actions 추가
    // useFrame(() => {
    //     setduckPosition((prevPosition) => [
    //       prevPosition[0] + duckDirection.x * speed,
    //       2,
    //       prevPosition[2] + duckDirection.z * speed
    //     ]);
    
    //     // X축 경계 조정
    //     if (duckPosition[0] > 5) {
    //         setDuckDirection(new THREE.Vector3(-Math.abs(duckDirection.x), 0, duckDirection.z));
    //     } else if (duckPosition[0] < -5) {
    //         setDuckDirection(new THREE.Vector3(Math.abs(duckDirection.x), 0, duckDirection.z));
    //     }

    //     // Z축 경계 조정
    //     if (duckPosition[2] > 140) {
    //         setDuckDirection(new THREE.Vector3(duckDirection.x, 0, -Math.abs(duckDirection.z)));
    //     } else if (duckPosition[2] < 80) {
    //         setDuckDirection(new THREE.Vector3(duckDirection.x, 0, Math.abs(duckDirection.z)));
    //     }
    // });


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
        flowers.scene.traverse(child => {
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



    const isCharacterVisible = usePlayerStore(state => state.isCharacterVisible);



    return(
        <>
            {/* <OrbitControls makeDefault/>  */}
            <Sky distance={350} sunPosition={[100,400,0]}/>
            <Environment preset="sunset"/>
            <ambientLight intensity={2} color="#ffffff"/>
            <directionalLight
                castShadow
                ref={directionalLightRef}
                intensity={5}
                position={[100,400,0]}
                color={"#ffffff"}
                shadow-camera-left={75}
                shadow-camera-right={-200}
                shadow-camera-top={110}
                shadow-camera-bottom={-110}
                shadow-camera-near={1}
                shadow-camera-far={1000}
                shadow-mapSize-width={4000}
                shadow-mapSize-height={4000}
            /> 
                {/* 나갈떄 내려가는 거 방지용 */}
                {!isInside&&(
                <RigidBody colliders={false} type="fixed" name="in_floor">
                    <CuboidCollider position={[0, 0, 40]} args={[120, 1, 120]} />
                </RigidBody>
                )}
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
                {!isInside&&(
                <RigidBody
                    type="fixed"
                    scale={1}
                    position={[125,-5,130]}
                >
                    <primitive
                        object={flowers.scene}
                    />
                </RigidBody>
                )}
                {/*outSide*/}
                {!isInside && (
                    <RigidBody
                        type="fixed"
                        name="GoInDoor"
                    >
                        <mesh 
                            position={[-0.4, 7.1, 12]} 
                            onClick={() => { console.log("GoInDoor clicked!"); setIsInside(true); }} //orbit 켰을떄
                        >
                            <boxGeometry args={[9, 9, 2]} />
                            <meshStandardMaterial color="red"
                                transparent={true}
                                opacity={0.1} />
                        </mesh>
                    </RigidBody>
                )}
                {/*이상한데 올라가는 거 방지*/}
                {/*왼쪽기둥*/}
                {!isInside&&(
                <RigidBody colliders="cuboid" type="fixed" >
                    <mesh 
                            position={[-6.1, 7, 14.5]}  
                        >
                            <boxGeometry
                                args={[2.3, 12, 5]}
                            />
                            <meshStandardMaterial color="gray"
                                transparent={true}
                                opacity={0.1} />
                        </mesh>
                </RigidBody>
                )}
                {/*오른쪽기둥*/}
                {!isInside&&(
                <RigidBody colliders="cuboid" type="fixed" >
                    <mesh 
                            position={[5.45, 7, 14.5]}  
                        >
                            <boxGeometry
                                args={[2.3, 12, 5]}
                            />
                            <meshStandardMaterial color="gray"
                                transparent={true}
                                opacity={0.1} />
                        </mesh>
                </RigidBody>
                )}
                {/*분수대*/}
                {!isInside&&(
                <RigidBody colliders="hull" type="fixed" >
                    <mesh 
                            position={[0.4, 3, 51.6]}  
                        >
                            <cylinderGeometry
                                args={[11, 11, 10, 15]}
                            />
                            <meshStandardMaterial color="gray"
                                transparent={true}
                                opacity={0.1} />
                        </mesh>
                </RigidBody>
                )}
                {/*계단 자연스럽게 오르게*/}
                {!isInside && (
                    <RigidBody
                        type="fixed"
                    >
                        <mesh 
                            position={[-0.4, -0, 16]} 
                            rotation={[-50*Math.PI/180,0,0]}
                        >
                            <boxGeometry args={[9.3, 4.9, 2]} />
                            <meshStandardMaterial color="gray"
                                transparent={true}
                                opacity={0.2} />
                        </mesh>
                    </RigidBody>
                )}
                {/* {!isInside&&(
                    <RigidBody 
                    type="kinematicPosition"
                    scale={7}
                    ref={duckRef}
                    position={duckPosition}
                >
                    <primitive
                        object={scene} 
                    /> 
                </RigidBody>
                )} */}
                {/*inSide*/}
                {isInside && (
                    <RigidBody type="fixed" name="GoOutDoor"
                    >
                        <mesh 
                            position={[-0.4, 7.1, 22]}  
                            onClick={() => { console.log("GoOutDoor clicked!"); setIsInside(false);}} //orbit 켰을떄
                        >
                            <boxGeometry
                                args={[8, 9, 2]}
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
                    angle={30*Math.PI/180}
                    penumbra={0.2}
                    color={"gold"}
                    intensity={1000}
                />)}
                {isInside&&(
                    <Html 
                        className="monitorScreen" 
                        transform
                        occlude="blending"
                        scale={0.087}
                        position={[-0.62,11.025,-12.16]}
                    >
                        <iframe src="https://kimmyungsa.netlify.app"
                            allow="camera;"
                            style={{ width: '1630px', height: '1210px' }}
                        />
                    </Html>
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
                {/*건물 밖에서 보이는 안 부분*/}
                </RigidBody>)}
                {!isInside&&(<RigidBody 
                    type="fixed"
                    colliders={false}
                    scale={[0.01,0.04,0.033]}
                    rotation={[0, -90 * Math.PI / 180, 0]} 
                    position={[-5.7,1.3,7.5]}
                >
                    <primitive
                        object={office_objects.scene} 
                    /> 
                </RigidBody>)}
                {isInside&&(
                <RigidBody 
                    type="fixed" 
                    name="monitor" 
                    onClick={handleMonitorClick} >
                    <mesh 
                            position={[-0.6,10.7,-13.2]} 
                        >
                            <boxGeometry args={[4.5, 4.5, 3]} />
                            <meshStandardMaterial color="purple"
                                transparent={true}
                                opacity={0} />
                        </mesh>
                </RigidBody>
                )}
                {/* {isInside&&(
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
                </RigidBody> */}
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
                    <CuboidCollider position={[10, 1.5, -10]} args={[45, 0.5, 30]} />
                </RigidBody>
                )}
                <NPC/>
                {isIntroductionEnd&&(<Player/>)}
                {isInside&&(
                <PrintCard/>
                )} 
                {isInside&&(
                <Gallery/>
                )} 
        </>
    );
}

export default Element3D;                                                      