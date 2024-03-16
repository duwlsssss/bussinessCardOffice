import { Html, useProgress } from '@react-three/drei'
import styled from 'styled-components';
import React from 'react';

const LoadingScreen=()=>{
  const {progress}=useProgress();
  return(
    <Html>
      <LoadingContainer>
        <div className="wrapper">
            <div className="circle1"></div>
            <div className="circle2"></div>
            <div className="circle3"></div>
            <span>
              {Math.round(progress)}% 
              Loading</span>
        </div>
      </LoadingContainer>
    </Html>
  );
}
const LoadingContainer = styled.div`
  .wrapper{
    width:200px;
    height:60;
    position: absolute;
    left:50%;
    top:50%;
    background-color: '#fff';
    transform: translate(-50%, -50%);
  }
  .circle1, .circle2, .circle3 {
    width:20px;
    height:20px;
    position: absolute;
    border-radius: 50%;
    transform-origin: 50%;
    animation: circle .5s alternate infinite ease;
  }
  .circle1 {
    background-color: #BFACE2;
    left:15%; 
  }
  .circle2 {
    background-color: #A084DC;
    left:45%;
    animation-delay: .1s; 
  }
  .circle3 {
    background-color: #645CBB;
    right:15%; 
    animation-delay: .2s;
  }
  @keyframes circle{
    0%{
        top:50px;
        height:5px;
        border-radius: 50px 50px 25px 25px;
        transform: scaleX(1.7);
    }
    40%{
        height:20px;
        border-radius: 50%;
        transform: scaleX(1);
    }
    100%{
        top:0%;
    }
  }
  .wrapper span{
    position: absolute;
    top:75px;
    font-size: 20px;
    letter-spacing: 12px;
    color: #5f5f5f;
    left:15%;
  `

export default LoadingScreen;