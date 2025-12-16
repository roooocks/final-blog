import { redirect } from 'react-router';
import { axiosInstance } from '../../../api/axios';
import { useAuthStore } from '../../../store/authStore';

export const fetchUserData = async () => {
  try {
    const user = useAuthStore.getState().user;

    // 이것만 쓰면 토큰 기한 끝날 경우 문제가 생김
    //  - 중간에 로그아웃이 되고 이후에 로그인이 불가능
    //  - 포스트 작성은 가능하지만 등록 불가능
    // const accessToken = sessionStorage.getItem('access_token');

    // 이를 위해 사용하는 방식이 Refresh 토큰이다.
    // 해당 토큰을 통해 액세스 토큰을 재발급 받는 형식
    // axios를 사용해 res 파트를 건드려야 한다. 확인하려면 axios.ts 보기
    const accessToken = sessionStorage.getItem('access_token');

    // 액세스 토큰의 경우 로그아웃, 창 껏음 아니면 안사라짐
    if (!user && accessToken) {
      // 새로고침을 했을 경우
      const { data } = await axiosInstance.get('/auth/me');
      const setUserData = useAuthStore.getState().setUserData;

      setUserData(data);
    }
  } catch (error) {
    console.error(error);
  }
};

// 로그인 안되어있을 경우
export const requireAuth = () => {
  const token = sessionStorage.getItem('access_token');
  if (!token) {
    return redirect('/auth/login');
  }
};

// 로그인 되어있을 경우
export const redirectIfAuth = () => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    return redirect('/');
  }
};
