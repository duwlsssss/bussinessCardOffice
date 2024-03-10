import {create} from 'zustand'

const useCameraStore = create((set) => ({
  isFocused: false,
  focusTarget: null,
  setFocus: (focusTarget) => set(() => ({ isFocused: true, focusTarget })),
  clearFocus: () => set(() => ({ isFocused: false, focusTarget: null })),
  cameraPosition: { x: 0, y: 80, z: 500 },
  cameraTarget: { x: 0, y: 0, z: 0 }, 
  setCameraPosition: (x, y, z) => set(() => ({ cameraPosition: { x, y, z } })),
  setCameraTarget: (x, y, z) => set(() => ({ cameraTarget: { x, y, z } })),
}));

export default useCameraStore;