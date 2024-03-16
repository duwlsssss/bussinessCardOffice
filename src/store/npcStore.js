import {create} from 'zustand';

const useNPCStore = create(set => ({
  npcPosition: { x: 0, y: 0, z: 0 },
  setNpcPosition: (x, y, z) => set(() => ({ npcPosition: { x, y, z } })),
  isNpcVisible: false, // npc 초기 가시성 상태
  setIsNpcVisible: (isNpcVisible) => set(() => ({ isNpcVisible })),
  isIntroductionEnd: false, // npc 설명 끝남 여부
  setIsIntroductionEnd: (isIntroductionEnd) => set(() => ({ isIntroductionEnd })),
}))
export default useNPCStore;