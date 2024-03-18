import { Html, useProgress } from '@react-three/drei';
import styled from 'styled-components';
import React from 'react';

const LoadingScreen2 = () => {
  const { progress } = useProgress();

  if (progress >= 100) return null;

  return (
    <Html center>
      <Dots className="dots" />
    </Html>
  );
}

const Dots = styled.div`
  width: 30px;
  aspect-ratio: 1;
  border-radius: 50%;
  animation: d5 1s infinite linear alternate;

  @keyframes d5 {
    0%  { box-shadow: 70px 0 #000, -70px 0 #0002; background: #000; }
    33% { box-shadow: 70px 0 #000, -70px 0 #0002; background: #0002; }
    66% { box-shadow: 70px 0 #0002, -70px 0 #000; background: #0002; }
    100%{ box-shadow: 70px 0 #0002, -70px 0 #000; background: #000; }
  }
`;

export default LoadingScreen2;
