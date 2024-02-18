import {create} from 'zustand';

const usePlayerStore = create(set => ({
  playerPosition: { x: 0, y: 0, z: 0 },
  setPlayerPosition: (x, y, z) => set(() => ({ playerPosition: { x, y, z } })),
}));

export default usePlayerStore;
