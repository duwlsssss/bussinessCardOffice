import './App.css'
import {Canvas} from '@react-three/fiber'
import { Suspense, lazy } from "react";
import Element3D from './Element3D';
import Loader from './Loader';

const LazyComponent = lazy(() => import('./Element3D'));

function App() {
  return (
    <>
      {/* 기본 카메라 : Perspective Camera */}
      {/* fov 카메라 렌즈 화각 : 도 단위(0<~<180)
          position 카메라 위치 : x, y, z 
      */}
      <Canvas 
        shadows
        camera = {{
          position: [300,200,0],
          near: 10,
          far: 1000
        }} 
      >

      {/* orthographic Camera */}
      {/* <Canvas 
        orthographic
        camera = {{
          near: 0.1,
          far: 20,
          position: [7, 7, 0],
          zoom: 100
      }}*/}

        <Suspense fallback={<Loader />}>
          <LazyComponent/>
        </Suspense>
      </Canvas>
    </>
  );
}

export default App
