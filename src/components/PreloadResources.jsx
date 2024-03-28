import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three';
import useResourceStore from '../store/resourceStore';

// 자원 목록
const resources = {
  models: [
    { name: 'npcModel', path: '/models/character_standing_medium.glb' },
    // { name: 'model2', path: '/path/to/model2.glb' },
    // 추가 모델 경로 및 이름
  ],
  textures: [
    { name: 'speechBubble', path: '/images/sb.png' },
    // { name: 'texture2', path: '/path/to/texture2.png' },
    // 추가 텍스처 경로 및 이름
  ],
};

const loadModels = (models) => {
  const loader = new GLTFLoader();
  const promises = models.map(({ name, path }) =>
    new Promise((resolve, reject) => {
      loader.load(path, (gltf) => {
        const { scene, animations } = gltf;
        resolve({ name, scene, animations });
      }, null, reject);
    })
  );
  return Promise.all(promises);
};

const loadTextures = (textures) => {
  const loader = new TextureLoader();
  const promises = textures.map(({ name, path }) =>
    new Promise((resolve, reject) => {
      loader.load(path, (texture) => resolve({ name, texture }), null, reject);
    })
  );
  return Promise.all(promises);
};

const preloadResources = async () => {
  const store = useResourceStore.getState();
  store.setLoading(true);
  try {
    const loadedModels = await loadModels(resources.models);
    const loadedTextures = await loadTextures(resources.textures);

    // 로드된 모델과 텍스처를 이름을 키로 사용하여 저장
    loadedModels.forEach(({ name, scene, animations }) => {
      store.setModel(name, scene, animations); // 스토어의 setModel 액션을 사용
    });

    loadedTextures.forEach(({ name, texture }) => {
      store.setTexture(name, texture); // 스토어의 setTexture 액션을 사용
    });

    store.setLoading(false);
  } catch (error) {
    store.setError(error);
    store.setLoading(false);
  }
};


export default preloadResources;