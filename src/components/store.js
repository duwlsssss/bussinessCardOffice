import create from 'zustand';

const useStore = create((set) => ({
  isFocusMode: false,
  setFocusMode: (isFocused) => set(() => ({ isFocusMode: isFocused }))
}));

export default useStore;
