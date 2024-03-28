import {create} from 'zustand';
import api from '../api/axios'

const playAudio = (path) => {
  const audio = new Audio(`./sounds/${path}.mp3`);
  audio.play();
};

const useOverlayStore = create((set) => ({
  start: false,
  isInside: false,  
  setIsInside: () => {
    set(() => ({ isInside:true })),
    playAudio("");//바깥음악 끄고 사무실 음악
  },
  setIsOutside: () => {
    set(() => ({ isInside:false })),
    playAudio("");//사무실 끄고 바깥 음악 
  },
  setStart: ()=>{
    set(()=>({start:true})),
    playAudio("");//바깥 음악
  },
  setBeforeStart: ()=>{
    set(()=>({start:false})),
    playAudio("");//바깥 음악 멈추기(극단적으로 멈춰도 됨)
  },

}))

export default useOverlayStore;





