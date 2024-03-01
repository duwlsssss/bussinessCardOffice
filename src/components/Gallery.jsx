import React,{useEffect,useRef,useState } from "react"
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from 'three'; // THREE 모듈을 임포트
import { gsap } from 'gsap';
import useCameraStore from '../store/cameraStore';
import usePlayerStore from "../store/playerStore";
import useCardImgStore from "../store/cardImgStore";
import { Html, Image, ScrollControls, Scroll } from "@react-three/drei";
import { easing } from 'maath'

const Gallery = ({ controlsRef }) => {
    const { camera } = useThree();
    const { setFocus, clearFocus } = useCameraStore();
    const [showCube, setShowCube]=useState(true);
    const setIsVisible = usePlayerStore(state => state.setIsVisible); //플레이어 가시성 설정
    const images = useCardImgStore((state) => state.images); // Zustand 스토어에서 이미지 배열 가져오기

    const nbPosition = { x: -270, y: 140, z: -100 };
    const nbTarget = { x: -270, y: 140, z: -180 };

    const handleNoticeBoardClick = () => {
      console.log("nbClick")
      setIsVisible(false); // 플레이어를 숨김
      setShowCube(false); //큐브 숨김
      setFocus({ x: -270, y: 140, z: -100 }); // 포커스 대상의 좌표
        gsap.to(camera.position, {
          x: nbPosition.x,
          y: nbPosition.y,
          z: nbPosition.z,
          duration: 1,
          ease: "power3.inOut",
        });
        gsap.to(controlsRef.current.target, {
          x: nbTarget.x,
          y: nbTarget.y,
          z: nbTarget.z,
          duration: 1,
          ease: "power3.inOut",
          onUpdate: () => { controlsRef.current.update(); },
          // onComplete: () => {onEnterGallery();}
        });
      }

    const handleBackClick=()=>{
      // onExitGallery();
      setIsVisible(true); // 플레이어를 표시
      setShowCube(true); //큐브 표시
      const playerPos = usePlayerStore.getState().playerPosition;
      if(playerPos && controlsRef.current) {
        gsap.to(camera.position, {
          x: playerPos.x,
          y: playerPos.y+130,
          z: playerPos.z+100,
          ease: "power3.inOut",
          duration: 1,
        });
        gsap.to(controlsRef.current.target, {
          x: playerPos.x,
          y: playerPos.y+65,
          z: playerPos.z,
          duration: 1,
          ease: "power3.inOut",
          onUpdate: () => { controlsRef.current.update(); },
          onComplete: () => { 
            clearFocus();
            }
        });
    }}     
    
    

    return (
      <>
      {showCube ? (
        <mesh onClick={handleNoticeBoardClick} position={[-260, 150, -200]}>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial color={'orange'} />
        </mesh>
      ) : (
        <>
          {/* <ScrollControls horizontal damping={0.1} pages={images.length / 5}>
            <Scroll>
              {images.map((url, index) => (
                <Image key={index} position={[index * 3 - images.length / 2, 0, 0]} url={url} scale={[1.5, 1.5, 1.5]} />
              ))}
            </Scroll>
          </ScrollControls> */}
          <Html transform occlude position={[-270, 140, -115]}>
            <div className='gallery-canvas'>
              <div className="back" onClick={handleBackClick}>❌</div>
              <div className="gallery-description">Scroll to view Gallery</div>
            </div>
          </Html>
        </>
      )}
      </>
  );
  
}

export default Gallery;                                                      