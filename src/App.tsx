// client/src/App.tsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import PostForm from './components/PostForm.js'; // 새로 만들 PostForm 컴포넌트 임포
import ThemeToggle from './components/ThemeToggle.js';
import BoardPage from "./components/BoardPage.js";
import AuthStatus from './components/AuthStatus.js';
import SignUp from './components/SignUp.js';


function App() {
    // 로그인 상태를 App 컴포넌트 최상단에서 관리
    // 앱 시작 시 localStorage에서 사용자 정보를 읽어와 초기 상태로 설정
    const [user, setUser] = useState<{ email: string } | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
            {/* 메인 콘텐츠 영역 (왼쪽) */}
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold dark:text-gray-100">
                    게시판 프로젝트
                </h1>
                <ThemeToggle />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* 메인 콘텐츠 영역 (큰 화면에서 2/3 차지) */}
                <main className="lg:col-span-4">
                    <Routes>
                        <Route path="/" element={<BoardPage />} >
                            <Route path="/posts/:id" element={<PostForm />} />
                        </Route>
                        <Route path="/write" element={<PostForm />} />
                        <Route path="/edit/:id" element={<PostForm />} />
                        <Route path="/signUp" element={<SignUp />} />
                    </Routes>
                </main>

                {/* 로그인/인증을 위한 사이드바 (오른쪽) */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-8 p-6 rounded-lg  dark:bg-gray-800 shadow">
                        <AuthStatus user={user} setUser={setUser} />
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default App;