import {create} from 'zustand';

const usePlayerStore = create(set => ({
  playerPosition: { x: 0, y: 0, z: 0 },
  setPlayerPosition: (x, y, z) => set(() => ({ playerPosition: { x, y, z } })),
  isCharacterVisible: false, // 플레이어의 초기 가시성 상태
  // isCharacterVisible: true, // 캐릭터 이동 확인용
  setIsCharacterVisible: (isCharacterVisible) => set(() => ({ isCharacterVisible })),
  playerToNPC:false,
  setPlayerToNPC:(playerToNPC)=>set(()=>({playerToNPC})),
}));

export default usePlayerStore;
