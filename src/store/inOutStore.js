import {create} from 'zustand'

const useInOutStore = create((set) => ({
  isInside: false, 
  //  isInside: true, 
  setIsInside: (isInside) => set(() => ({ isInside })),
}));

export default useInOutStore;