import {Canvas} from '@react-three/fiber'
import React, { Suspense, useMemo, useState, lazy, useEffect } from 'react'
import { Physics } from '@react-three/rapier'
import { Gltf, KeyboardControls, OrbitControls,Stats,Preload, Html,useProgress} from '@react-three/drei'
import Loader from './components/Loader';
// import Menu from "./components/Menu";
import * as THREE from 'three';
import "./App.css"
import Element3D from "./components/Element3D"
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera';
import useCameraStore from "./store/cameraStore"
import { useControls,Leva } from 'leva';
import { Perf } from "r3f-perf";

// const LazyComponent = lazy(() => import('./components/Element3D'));

function App() {

  const { axesHelperEnabled, statsEnabled, physicsDebugEnabled, PerfEnabled } = useControls({
    axesHelperEnabled: true,
    statsEnabled: false,
    physicsDebugEnabled: true,
    PerfEnabled: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const { active, progress } = useProgress();
  useEffect(() => {
    if (!active) {
      setIsLoaded(true);
    }
  }, [active]);

  return (
   <>
        <Canvas shadows 
        camera={{
            position: [0, 100, 500],
            fov: 75,
            near: 1,
            far: 1000,
          }}
        >
          <Suspense fallback={<Loader/>}>
            {/* <PerspectiveCamera position={[0,100,500]} fov={75} near={1} far={1000} /> */}
            <Physics debug={physicsDebugEnabled} timeStep={"vary"}> 
              {PerfEnabled&&<Perf position="top-left" />}
              {axesHelperEnabled &&<axesHelper args={[500, 500, 500]} />} {/*월드좌표축 */}
              {statsEnabled && <Stats />}
              <Preload all />
              <Element3D/>
            </Physics>
          </Suspense>
        </Canvas>
        {/* <menu/> */}
    </>
  );
}

export default App;
