import {Canvas} from '@react-three/fiber'
import { Suspense, lazy, useState } from "react";
import Loader from './components/Loader';
import * as THREE from 'three';
import "./App.css"
import { CameraControlProvider } from './components/CameraControltext';
import Element3D from "./components/Element3D"

const LazyComponent = lazy(() => import('./components/Element3D'));

function App() {
  return (
    <>
      <CameraControlProvider>
        <Canvas
          shadows
          camera={{
            position: [0, 200, 400],
            fov: 75,
            near: 0.1,
            far: 5000,
          }}
        >
          <Suspense fallback={<Loader />}>
            <LazyComponent/>
          </Suspense>
        </Canvas>
      </CameraControlProvider>
  </>
  );
}

export default App
