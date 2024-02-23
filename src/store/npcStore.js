import {create} from 'zustand';

const useNPCStore = create(set => ({
  npcPosition: { x: 0, y: 0, z: 0 },
  shouldRotatePlayer: false,
  setNpcPosition: (x, y, z) => set(() => ({ npcPosition: { x, y, z } })),
  triggerPlayerRotation: () => set(() => ({ shouldRotatePlayer: true })),
  resetPlayerRotationTrigger: () => set(() => ({ shouldRotatePlayer: false })),
}));

export default useNPCStore;