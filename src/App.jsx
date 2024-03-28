import {Canvas,useLoader} from '@react-three/fiber'
import React, { Suspense, useMemo, useState, lazy, useEffect } from 'react'
import { Physics } from '@react-three/rapier'
import { useGLTF, KeyboardControls, OrbitControls,Stats, Html,Preload,useProgress,Loader} from '@react-three/drei'
import LoadingScreen2 from './components/LoadingScreen2';
import CameraAnimation from './components/CameraAnimation'
import * as THREE from 'three';
import "./App.css"
import Element3D from "./components/Element3D"
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera';
import useCameraStore from "./store/cameraStore"
import { useControls,Leva } from 'leva';
import { Perf } from "r3f-perf";
import Overlay from './components/Overlay'
import useOverlayStore from './store/overlayStore';
import preloadResources from './components/PreloadResources';
import useResourceStore from './store/resourceStore'; 
import { TextureLoader } from 'three';
import { GLTFLoader } from 'three-stdlib';

function App() {
 
  const { axesHelperEnabled, statsEnabled, physicsDebugEnabled, PerfEnabled } = useControls({
    axesHelperEnabled: true,
    statsEnabled: false,
    physicsDebugEnabled: true,
    PerfEnabled: true,
  });
  const {start} = useOverlayStore((state) => ({start: state.start}));
  
  // //자원들을 먼저 로드함 
  // useEffect(() => {
  //   preloadResources();
  // }, []);
  // const loading = useResourceStore((state) => state.loading);
  // const error = useResourceStore((state) => state.error);
  // if (loading) {
  //   return (<Html center><div style={{fontSize:20}}>Loading...</div></Html>);
  // }

  // if (error) {
  //   return (<Html center><div>Error loading resources: {error.message}</div></Html>);
  // }


  useGLTF.preload('/models/office_modeling_draco.glb');
  useGLTF.preload('/models/external_modeling_draco.glb');
  useGLTF.preload("/models/character_standing_medium.glb");
  useGLTF.preload("/models/character_standing_medium2.glb");
  useGLTF.preload("/models/character_standing_medium3.glb");
  
  useLoader.preload(TextureLoader, '/images/sb.png');

  return (
    <>
      <Canvas style={{ zIndex: 0 }} shadows camera={{ position:[0,50,160], fov: 75, near: 0.1, far: 1000 }}>
        <Suspense fallback={<Html center><div style={{fontSize:20}}>Loading...</div></Html>}>
          <Physics debug={physicsDebugEnabled} timeStep={"vary"}> 
            {PerfEnabled && <Perf position="top-left" />}
            {axesHelperEnabled && <axesHelper args={[500, 500, 500]} />}
            {statsEnabled && <Stats />}
            <Element3D/>
            {start && <CameraAnimation/>}
          </Physics>
          <Preload all />{/*<Canvas> 안에 정의된 모든 3D 오브젝트들을 렌더링하기 전에 미리 컴파일*/}
        </Suspense>
      </Canvas>
      <Overlay/>
    </>
  );
}


export default App;
