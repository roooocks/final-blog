import { LoaderFunctionArgs } from 'react-router';
import { axiosInstance } from '../../../api/axios';
import { requireAuth } from './auth.loader';

export const fetchOverView = async () => {
  try {
    const { data } = await axiosInstance.get('/posts/overview');
    return data;
  } catch (error) {
    // console.log(error instanceof Error ? error.message : 'unknown error');
    console.error(error);
  }
};

export const fetchPosts = async ({ request }: LoaderFunctionArgs) => {
  try {
    let query = '';
    const url = new URL(request.url);
    const sort = url.searchParams.get('sort') ?? 'newest'; // views도 있다.
    const category = url.searchParams.get('category') ?? '';
    const page = url.searchParams.get('page') ?? '1';
    const search = url.searchParams.get('search') ?? '';

    if (sort !== '') query += `sort=${sort}&`;
    if (category !== '') query += `category=${category}&`;
    if (page !== '') query += `page=${page}&`;
    if (search !== '') query += `search=${search}`;

    const { data } = await axiosInstance.get(`/posts?${query}`);
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const fetchPostDetail = async ({ params }: LoaderFunctionArgs) => {
  try {
    const { data } = await axiosInstance.get(`/posts/${params.id}`);
    const {
      data: { posts: relatedPosts },
    } = await axiosInstance.get(`/posts?category=${data.category}&limit=3`);

    return { post: data, relatedPosts };
  } catch {
    // 이렇게 하면 디버깅용 페이지가 나오지 않게 된다.
    // 만약 console을 내보냈다면 부모의 errorElement를 출력하게 된다.
    return { post: null, relatedPosts: null };
    // console.error(error);
  }
};

export const fetchPostModify = async ({ params }: LoaderFunctionArgs) => {
  try {
    const auth = requireAuth();
    if (auth) {
      return auth;
    }

    const { data } = await axiosInstance.get(`/posts/${params.id}`);

    return data;
  } catch (error) {
    console.error(error);
  }
};
