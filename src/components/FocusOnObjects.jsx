import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ArrowHelper,Vector3, SphereGeometry, MeshStandardMaterial, Mesh } from 'three';

function CameraHelper({ targetPosition }) {
    const { camera, scene } = useThree();
    
    // 카메라 타겟 위치에 대한 참조
    const targetPosRef = useRef();

    useFrame(() => {
        // 카메라 방향을 나타내는 화살표 업데이트 (옵션)
        const direction = new Vector3();
        camera.getWorldDirection(direction);
        const arrowHelper = new ArrowHelper(direction, camera.position, 10, 0xffff00);
        
        // 매 프레임마다 화살표를 새로 추가하기보다는, 초기화할 때 한 번만 추가하고, 위치나 방향을 업데이트하는 것이 더 효율적
        // scene.add(arrowHelper); // 이 줄을 삭제하거나 주석 처리

        // 카메라 타겟 위치 업데이트
        if (targetPosRef.current) {
            targetPosRef.current.position.copy(targetPosition);
        }

        // 이전 프레임의 화살표를 제거하는 것은 필요 없음
        // return () => scene.remove(arrowHelper); // 이 줄을 삭제하거나 주석 처리
    });

    return (
        <>
            <mesh ref={targetPosRef} position={[...targetPosition]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </>
    );
}

export default CameraHelper;
