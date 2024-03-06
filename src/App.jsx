import {Canvas} from '@react-three/fiber'
import React, { Suspense, useMemo, useState, lazy } from 'react'
import { Physics } from '@react-three/rapier'
import { Gltf, KeyboardControls} from '@react-three/drei'
import Loader from './components/Loader';
import * as THREE from 'three';
import "./App.css"
import Element3D from "./components/Element3D"

// const LazyComponent = lazy(() => import('./components/Element3D'));

export const Controls = {
  forward: "forward",
  back: "back",
  left: "left",
  right: "right",
};

function App() {

  const map = useMemo(() =>
    [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
    ], []
  );

  return (
      <KeyboardControls map={map}>
        <Canvas
          shadows
          camera={{
            position: [0, 200, 400],
            fov: 75,
            near: 0.1,
            far: 5000,
          }}
        >
          <Suspense fallback={<Loader/>}>
            <Physics debug timeStep={"vary"}> 
              <Element3D/>
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>

  );
}

export default App;
