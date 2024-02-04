//캐릭터와 모니터 간 카메라 나눠쓰기
import React, { createContext, useState, useContext } from 'react';

const CameraControlContext = createContext();

export const useCameraControl = () => useContext(CameraControlContext);

export const CameraControlProvider = ({ children }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  return (
    <CameraControlContext.Provider value={{ isFocusMode, setIsFocusMode }}>
      {children}
    </CameraControlContext.Provider>
  );
};
