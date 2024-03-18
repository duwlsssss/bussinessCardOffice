import axios from 'axios';
const host = window.location.hostname === "localhost" ? "http://localhost:8000": 'http://kimmyungsa.us-east-2.elasticbeanstalk.com';
//로컬 서버(http://localhost:8000)를 사용하고, 실제 운영 환경에서는 다른 주소(http://kimmyungsa.us-east-2.elasticbeanstalk.com)를 사용
//로컬 네트워크에서 다른 컴퓨터의 IP 주소가 192.168.1.5라면, baseURL을 http://192.168.1.5:8000으로 설정해야 
//axios 인스턴스 생성
const api = axios.create({
    baseURL: host, //API baseURL 
    timeout:5000, //요청이 5000ms(5초) 이내에 완료되지 않으면 요청이 중단됨
    headers:{ //모든 요청,응답에 기본으로 포함될 헤더 
      'Content-Type' : 'application/json', // json 형식 데이터
    }
})
// 요청 인터셉터 / 요청이 실제로 서버에 전송되기 전 가로채 
api.interceptors.request.use(
    //요청 설정 객체 출력, 그대로반환
    (config) => {
      console.log(`Request Interceptor - Config:`, config);
      return config;
    },
    //오류 발생시 request process 중단시킴
    (error) => {
      console.error(`Request Interceptor - Error:`, error);
      return Promise.reject(error);
    }
  );
// 응답 인터셉터 / 서버 응답을 받은 직후 응답데이터가 .then(catch)로 처리되기 전 
api.interceptors.response.use(
    //성공적인 응답있으면 응답 객체를 출력, 반환
    (response) => {
      console.log('Response Interceptor - Response:', response);
      return response;
    },
    //오류 발생시 상태 코드, 에러 데이터 출력, 에러 반환 
    (error) => {
        console.error(`Response Interceptor - Error:`, error);
        return Promise.reject(error);
    }
  );
export default api;







