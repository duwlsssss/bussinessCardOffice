import {create} from 'zustand';

const usePlayerStore = create(set => ({
  playerPosition: { x: 0, y: 0, z: 0 },
  setPlayerPosition: (x, y, z) => set(() => ({ playerPosition: { x, y, z } })),
  isVisible: true, // 플레이어의 초기 가시성 상태
  setIsVisible: (isVisible) => set(() => ({ isVisible })),
  isCollided: false,
  setIsCollided: (isCollided) => set(() => ({ isCollided })),
}));

export default usePlayerStore;
