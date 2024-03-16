import axios from 'axios';
import {
  GOOGLE_LOGIN_REQUEST,
  GOOGLE_LOGIN_SUCCESS,
  GOOGLE_LOGIN_FAIL,
} from './types';

const loginWithGoogle=(token)=>async(dispatch)=>{
  try{
    dispatch({type:GOOGLE_LOGIN_REQUEST});
    const response=await axios.post("/auth/google", { token });

    if (response.status === 200) {
      dispatch({ 
        type:GOOGLE_LOGIN_SUCCESS, 
        payload: response.data 
      });
    }
  }catch(error){
    dispatch({
      type: GOOGLE_LOGIN_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export default loginWithGoogle;