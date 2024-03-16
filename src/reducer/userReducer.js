import {
  GOOGLE_LOGIN_REQUEST,
  GOOGLE_LOGIN_SUCCESS,
  GOOGLE_LOGIN_FAIL,
} from '../action/types';

const initialState = {
  user: null,
  isLoading: false,
  error: null,
};
export default function userReducer(state=initialState,action){
  switch (action.type) {
    case GOOGLE_LOGIN_REQUEST:
      return { ...state, isLoading: true, error: null };
    case GOOGLE_LOGIN_SUCCESS:
      return { ...state, isLoading: false, user: action.payload, error: null };
    case GOOGLE_LOGIN_FAIL:
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}