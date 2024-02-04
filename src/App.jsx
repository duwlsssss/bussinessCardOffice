import {Canvas} from '@react-three/fiber'
import { Suspense, lazy } from "react";
import Loader from './components/Loader';
import * as THREE from 'three';
import "./App.css"
import { CameraControlProvider } from './components/CameraControltext';

const LazyComponent = lazy(() => import('./components/Element3D'));

function App() {

  return (
    <>

        <CameraControlProvider>
          <Canvas
            shadows
            camera = {{
              position:[0,200,350],
              fov: 75, //광각 화각
              near: 0.1,
              far: 5000,
            }}
          >
            <Suspense fallback={<Loader/>}>
              <LazyComponent/>
            </Suspense>
          </Canvas>
        </CameraControlProvider>
  </>
  );
}

export default App
