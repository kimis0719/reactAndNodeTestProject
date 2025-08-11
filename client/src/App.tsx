// client/src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Board from './components/Board';
import PostForm from './components/PostForm'; // 새로 만들 PostForm 컴포넌트 임포트
import ThemeToggle from './components/ThemeToggle';


function App() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <header className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-gray-100">
                    게시판 프로젝트
                </h1>
                <ThemeToggle />
            </header>

            <Routes>
                <Route path="/" element={<Board />} />
                <Route path="/write" element={<PostForm />} />
                <Route path="/edit/:id" element={<PostForm />} />
            </Routes>
        </div>

    );
}

export default App;