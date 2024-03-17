import {Canvas} from '@react-three/fiber'
import React, { Suspense, useMemo, useState, lazy, useEffect } from 'react'
import { Physics } from '@react-three/rapier'
import { Gltf, KeyboardControls, OrbitControls,Stats,Preload, Html,useProgress} from '@react-three/drei'
import LoadingScreen from './components/LoadingScreen';
import CameraAnimation from './components/CameraAnimation'
import * as THREE from 'three';
import "./App.css"
import Element3D from "./components/Element3D"
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera';
import useCameraStore from "./store/cameraStore"
import { useControls,Leva } from 'leva';
import { Perf } from "r3f-perf";
import LoginOverlay from './components/LoginOverlay';


const LazyComponent = lazy(() => import('./components/Element3D'));

function App() {

  const { axesHelperEnabled, statsEnabled, physicsDebugEnabled, PerfEnabled } = useControls({
    axesHelperEnabled: true,
    statsEnabled: false,
    physicsDebugEnabled: true,
    PerfEnabled: true,
  });

  return (
   <>
      <Canvas shadows 
        camera={{
            position:[0,50,160],
            fov: 75,
            near: 0.1,
            far: 1000,
          }}
      >
      <Suspense fallback={<LoadingScreen/>}>
            {/* <PerspectiveCamera position={[0,50,150]} fov={75} near={1} far={1000} /> */}
           <Physics debug={physicsDebugEnabled} timeStep={"vary"}> 
             {PerfEnabled&&<Perf position="top-left" />}
             {axesHelperEnabled &&<axesHelper args={[500, 500, 500]} />}월드좌표축 
             {statsEnabled && <Stats />}
             <LazyComponent/>
             <CameraAnimation/>
           </Physics>
         </Suspense>
      </Canvas>
      <LoginOverlay/>
    </>

  );
}

export default App;
