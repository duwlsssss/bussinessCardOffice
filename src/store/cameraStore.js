import {create} from 'zustand'

const useCameraStore = create((set) => ({
  isFocused: false,
  focusTarget: null,
  setFocus: (focusTarget) => set(() => ({ isFocused: true, focusTarget })),
  clearFocus: () => set(() => ({ isFocused: false, focusTarget: null })),
}));

export default useCameraStore;