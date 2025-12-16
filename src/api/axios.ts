import axios from 'axios';

// withCredentials = 쿠키 기반 인증 시스템에 필수적인 속성. true로 해야 쿠키가 요청에 포함 된다.
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// 매 요청 전 마다 실행
// 첫 매개변수 = 요청 성공 시, 두번째 매개변수 = 요청 실패 시
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      // 세션에 토큰이 있을 경우 요청마다 토큰값을 auth..에 포함해서 보내라
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 매 응답 직후(사용자가 받기 전) 실행
// 첫번째 파라미터 = res 서버에서 응답이 정상적으로 왔을 때, 그냥 res 객체 그대로 반환
// 두번째 파라미터 = 이 서버의 요청이 응답을 받았을 때 에러가 발생한 경우, 해당 파라미터의 콜백 함수 실행
// 정리
//  - 리프레시 토큰을 발급 받는다는 의미는 기존의 액세스 토큰 기한이 끝났다는 이야기다.
//  - 즉, 응답을 하고 싶어도 에러가 걸리니 두번째 파라미터에서 그걸 받아 토큰 기한을 늘려야(재발급) 한다.
let retry = false; // 계속 재발급 받으면 X
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config; // 에러 발생 시점의 설정 저장
    if (error.response && error.response.status === 401 && !retry) {
      retry = true;
      try {
        // 재발급 시작
        const res = await axiosInstance.post('/auth/refresh');
        if (!res.data.accessToken) {
          throw new Error('Access token is missing');
        }

        sessionStorage.setItem('access_token', res.data.accessToken);
        retry = false;
        return axiosInstance(originalRequest); // 실패한 요청 재요청
      } catch (error) {
        // 어쨋든 기존 토큰의 연장은 실패므로 기존 토큰 제거
        sessionStorage.removeItem('access_token');
        await axiosInstance.post('/auth/logout'); // httpOnly + cookie 제거
        // 실패한 내용 그대로 어플에 전달
        return Promise.reject(error);
      }
    }
  }
);
