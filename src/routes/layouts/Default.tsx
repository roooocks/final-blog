import { Outlet, ScrollRestoration } from "react-router";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

export default function Default() {
  return (
    <>
      {/* 게시글 수정 시 스크롤이 밑으로 가는 문제 해결 */}
      {/* 리액트 자체에 스크롤 관련 컴포넌트가 있으니 편하게 그걸 쓰자 */}
      {/* 지가 알아서 UX에 맞게 잘 조정해준다. */}
      <ScrollRestoration />
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
