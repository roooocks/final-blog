import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { axiosInstance } from '../api/axios';

interface User {
  id: string;
  kakaoId: string;
  profileImage: string;
  nickname: string;
  email?: string;
}

interface AuthStore {
  isLogin: boolean;
  user: User | null;
  setUserData: (userData: User) => void;
  logout: () => void;
}

// 만약 access_token의 기한이 끝났다면
// f12 > Storage > clear site data 해서 지우고 재로그인
// 나중에 refresh 하는 방법을 배울거다.
export const useAuthStore = create<AuthStore>()(
  devtools(
    immer((set) => ({
      isLogin: false,
      user: null,
      setUserData: (userData) =>
        set((state) => {
          state.isLogin = true;
          state.user = userData;
        }),
      logout: async () => {
        await axiosInstance.post('/auth/logout');
        set((state) => {
          state.isLogin = false;
          state.user = null;
          sessionStorage.removeItem('access_token');
        });
      },
    }))
  )
);
