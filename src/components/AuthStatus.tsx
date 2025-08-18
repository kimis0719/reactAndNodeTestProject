// client/src/components/AuthStatus.tsx
import React, { useState } from 'react';

// App.tsx로부터 user 상태와 setUser 함수를 props로 받기 위한 타입 정의
interface AuthStatusProps {
    user: { email: string } | null;
    setUser: React.Dispatch<React.SetStateAction<{ email: string } | null>>;
}

const AuthStatus: React.FC<AuthStatusProps> = ({ user, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // 실제로는 여기서 서버 API를 호출해서 로그인 처리를 해야함
        // 지금은 임시로 입력한 이메일로 로그인 성공 처리
        const loggedInUser = { email };
        setUser(loggedInUser);
        // 로그인 정보를 localStorage에 저장
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        setEmail('');
        setPassword('');
    };

    const handleLogout = () => {
        // localStorage 초기화
        localStorage.clear();
        // 로그아웃 시 user 상태를 null로 변경
        setUser(null);
    };

    // --- 로그인 된 상태일 때 보여줄 UI ---
    if (user) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold dark:text-gray-100">내 정보</h3>
                <p className="dark:text-gray-300 break-all">{user.email}</p>
                <button
                    onClick={handleLogout}
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 transition"
                >
                    로그아웃
                </button>
            </div>
        );
    }

    // --- 로그인되지 않은 상태일 때 보여줄 UI ---
    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-gray-100">로그인</h3>
            <div>
                <label htmlFor="email-auth" className="block text-sm font-medium dark:text-gray-300">이메일</label>
                <input
                    id="email-auth"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900 dark:bg-gray-700 dark:border-gray-400 dark:text-white"
                    required
                />
            </div>
            <div>
                <label htmlFor="password-auth" className="block text-sm font-medium dark:text-gray-300">비밀번호</label>
                <input
                    id="password-auth"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900 dark:bg-gray-700 dark:border-gray-400 dark:text-white"
                    required
                />
            </div>
            <div className="space-y-2 pt-2">
                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900 transition"
                >
                    로그인
                </button>
                <button
                    type="button"
                    className="w-full rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-900 transition"
                >
                    회원가입
                </button>
            </div>
        </form>
    );
};

export default AuthStatus;
