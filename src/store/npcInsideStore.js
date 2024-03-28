import {create} from 'zustand';

const useNpcInsideStore = create(set => ({
  npcPosition: { x: 0, y: 0, z: 0 },
  setNpcPositionIn: (x, y, z) => set(() => ({ npcPosition: { x, y, z } })),
  showSpeechBubble: false, // npc 초기 가시성 상태
  setShowSpeechBubbleIn: (showSpeechBubble) => set(() => ({ showSpeechBubble })),
  forOriginRot: false,
  setForOriginRot: (forOriginRot) => set(() => ({ forOriginRot })),
}))
export default useNpcInsideStore;