import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import Default from "./layouts/Default";
import PostCreate from "./pages/posts/PostCreate";
import Login from "./pages/auth/Login";
import Posts from "./pages/posts/Posts";
import PostRead from "./pages/posts/PostRead";
import NotFoundPage from "./pages/NotFound";
import Kakao from "./pages/auth/callback/Kakao";
import Signup from "./pages/auth/Signup";
import EmailLogin from "./pages/auth/EmailLogin";
import { fetchUserData, redirectIfAuth, requireAuth } from "./pages/loader/auth.loader";
import FullLoading from "../components/common/FullLoading";
import ErrorState from "../components/common/ErrorState";
import { fetchOverView, fetchPostDetail, fetchPostModify, fetchPosts } from "./pages/loader/post.loader";

// loader 문제점 = https://velog.io/@jungkyu_lol/post20250404
// React Query = https://velog.io/@wns2252/React-query
// React Query 공부도 좀 해두기
const router = createBrowserRouter([
  {
    Component: Default,
    loader: fetchUserData,
    HydrateFallback: FullLoading,
    errorElement: <ErrorState />,
    children: [
      {
        path: "",
        Component: Home,
        loader: fetchOverView
      },
      {
        path: "/posts",
        Component: Posts,
        loader: fetchPosts
      },
      {
        path: "/create-post",
        Component: PostCreate,
        loader: requireAuth
      },
      {
        path: "/edit/:id",
        Component: PostCreate,
        loader: fetchPostModify
      },
      {
        path: "/post/:id",
        Component: PostRead,
        loader: fetchPostDetail
      },
      {
        path: "/auth/login",
        Component: Login,
        loader: redirectIfAuth
      },
      {
        path: "/auth/email-login",
        Component: EmailLogin,
        loader: redirectIfAuth
      },
      {
        path: "/auth/signup",
        Component: Signup,
        loader: redirectIfAuth
      },
      {
        path: "/auth/callback/kakao",
        Component: Kakao,
        loader: redirectIfAuth
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);

export default function Route() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
