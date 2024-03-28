import {create} from 'zustand';

const useResourceStore = create((set) => ({
  models: {},
  textures: {},
  loading: false,
  error: null,
  setModel: (name, model, animations) => set((state) => ({
    models: { ...state.models, [name]: { model, animations } },
  })),
  setTexture: (name, texture) => set((state) => ({
    textures: { ...state.textures, [name]: texture },
  })),
  setLoading: (loading) => set(() => ({ loading })),
  setError: (error) => set(() => ({ error })),
}));

export default useResourceStore;