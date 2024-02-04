import { useState, useEffect } from "react"

const useInput=()=>{
  const [input,setInput]=useState({
    forward:false,
    backward:false,
    left:false,
    right:false,
    shift:false
  })

  const keys={
    KeyW:"forward",
    KeyS:"backward",
    KeyA:"left",
    KeyD:"right",
    ShiftLeft:"shift"
  }

  function findKey(key) {
    return keys[key];
  }

  useEffect(()=>{
    const handleKeyDown=(e)=>{
      console.log("Key Down:", e.code);  // 실제 눌린 키의 코드 출력
      setInput((m)=>({...m,[findKey(e.code)]:true}));
      console.log(findKey(e.code))
    };
    const handleKeyUp=(e)=>{
      console.log("Key Up:", e.code);  // 실제 눌린 키의 코드 출력
      setInput((m)=>({...m,[findKey(e.code)]:false}));
      console.log(findKey(e.code))
    };
    document.addEventListener("keydown",handleKeyDown);
    document.addEventListener("keyup",handleKeyUp);
    return()=>{
      document.removeEventListener("keydown",handleKeyDown);
      document.removeEventListener("keyup",handleKeyUp);
    }
  },[]);
  return input;
}

export default useInput;