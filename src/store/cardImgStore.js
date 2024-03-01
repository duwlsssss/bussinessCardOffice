import {create} from 'zustand'

const useCardImgStore = create((set) => ({
  images: [], // 이미지 URL 배열
  clicked: null,
  addImage: (image) => set((state) => { 
    // 이미지 배열의 길이가 30개를 초과할 경우, 배열의 앞부분을 자름
    const newImages = [...state.images, image].slice(-30);
    return { images: newImages };
  }),
  setClicked: (index) => set(() => ({ clicked: index })),
}));

export default useCardImgStore;