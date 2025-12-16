import { useMemo } from "react";

const Pagination = ({
  pageRange,
  currentPage,
  maxPage,
  onPageChange
}: {
  pageRange: number;
  currentPage: number;
  maxPage: number;
  onPageChange: (page: number) => void;
}) => {
  const half = Math.floor(pageRange / 2); // 중앙값(이때 범위는 홀수 기준)
  const pages = useMemo(() => {
    let start = currentPage - half;
    let end = currentPage + half;

    // 시작값이 0이하면 안된다. 애초에 존재를 안한다.
    if (start < 1) {
      start = 1;
      end = Math.min(maxPage, pageRange); // 시작 1로 고정이라 사실 pageRange만 넣어도 된다.
    }

    // 끝값이 maxPage초과면 안된다. 애초에 존재를 안한다.
    if (end > maxPage) {
      start = Math.max(1, maxPage - pageRange + 1);
      end = maxPage;
    }

    const arr = [];
    for (let i = start; i <= end; i++) {
      arr.push(i);
    }

    return arr;
  }, [currentPage, maxPage, pageRange, half]);

  return (
    <>
      <div className="flex justify-center mt-12 gap-2">
        {/* 이전 버튼 */}
        <button
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        {/* 버튼들 */}
        {pages.map(page =>
          <button
            key={page}
            className={currentPage === page
              ? `w-10 h-10 rounded-lg cursor-pointer bg-blue-500 text-white`
              : `w-10 h-10 rounded-lg cursor-pointer bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )}
        {/* 다음 버튼 */}
        <button
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          disabled={currentPage === maxPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default Pagination;