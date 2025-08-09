// client/src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Board from './components/Board';
import PostForm from './components/PostForm'; // 새로 만들 PostForm 컴포넌트 임포트

function App() {
    return (
        <div>
            <h1>게시판 프로젝트1123</h1>
            <Routes>
                <Route path="/" element={<Board />} />
                <Route path="/write" element={<PostForm />} /> {/* 글쓰기 페이지 */}
                <Route path="/edit/:id" element={<PostForm />} /> {/* 수정 페이지 */}
            </Routes>
        </div>
    );
}

export default App;