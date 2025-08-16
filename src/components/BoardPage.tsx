import { Outlet, useLocation } from 'react-router-dom';
import BoardList from './BoardList.js'; // 게시판 목록 컴포넌트

const BoardPage = () => {
    // 현재 경로가 루트('/')인지 확인. 루트일 때는 상세보기를 렌더링하지 않음.
    const location = useLocation();
    const isRootPath = location.pathname === '/';

    return (
        // 페이지 전체를 감싸는 컨테이너
        <div className="mb-4 text-xl font-semibold dark:text-gray-200">

            {/* 자식 페이지 렌더링 영역 (상세 보기 등) */}
            <main>
                {!isRootPath && (
                    <div className="mb-8 rounded-xl border border-gray-200  p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <Outlet key={location.pathname} />
                    </div>
                )}
            </main>

            {/* 게시판 목록:  */}
            <section>
                <h2 className="mb-4 text-xl font-semibold dark:text-gray-200">
                    전체 글 목록ㅋㅋ
                </h2>
                <BoardList />
            </section>

        </div>
  );
};

export default BoardPage;