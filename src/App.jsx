import {Canvas} from '@react-three/fiber'
import React, { Suspense, useMemo, useState, lazy } from 'react'
import { Physics } from '@react-three/rapier'
import { Gltf, KeyboardControls, OrbitControls,Stats} from '@react-three/drei'
import Loader from './components/Loader';
import * as THREE from 'three';
import "./App.css"
import Element3D from "./components/Element3D"
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera';
import useCameraStore from "./store/cameraStore"
import { useControls } from 'leva';
import { Perf } from "r3f-perf";

// const LazyComponent = lazy(() => import('./components/Element3D'));

// export const Controls = {
//   forward: "forward",
//   back: "back",
//   left: "left",
//   right: "right",
// };

function App() {

  const { cameraPosition, setCameraPosition } = useCameraStore();

  // const map = useMemo(() =>
  //   [
  //     { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
  //     { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
  //     { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  //     { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  //   ], []
  // );

  const { x, y, z } = cameraPosition;

  const { axesHelperEnabled, statsEnabled, physicsDebugEnabled, PerfEnabled } = useControls({
    axesHelperEnabled: true,
    statsEnabled: false,
    physicsDebugEnabled: true,
    PerfEnabled: true,
  });

  return (
    //   <KeyboardControls 
    //    map={[
    //     {name: "forward", keys: ["ArraowUp", "KeyW"]},
    //     {name: "backward", keys: ["ArraowDown", "KeyS"]},
    //     {name: "leftward", keys: ["ArrowLeft", "KeyA"]},
    //     {name: "rightward", keys: ["ArrowRight", "KeyD"]},
    // ]}
    // >
        <Canvas shadows 
        // camera={{
        //     position: [0, 300, 1500],
        //     fov: 45,
        //     near: 0.1,
        //     far: 5000,
        //   }}
        >
          
          <PerspectiveCamera position={[x,y,z]} fov={75} near={1} far={1000} />
          <Suspense debug fallback={<Loader/>}>
            <Physics debug={physicsDebugEnabled} timeStep={"vary"}> 
              {axesHelperEnabled &&<axesHelper args={[500, 500, 500]} />} {/*월드좌표축*/}
              {statsEnabled && <Stats />}
              {PerfEnabled&&<Perf position="top-left" />}
              <Element3D/>
            </Physics>
          </Suspense>
        </Canvas>
      // </KeyboardControls>

  );
}

export default App;
