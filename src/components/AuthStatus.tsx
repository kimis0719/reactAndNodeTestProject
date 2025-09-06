import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

interface AuthStatusProps {
    user: { uid?: number; email: string } | null;
    setUser: React.Dispatch<React.SetStateAction<{ uid?: number; email: string } | null>>;
}

// 같은 오리진이 아니라면 withCredentials가 필요합니다.
// 같은 오리진이어도 명시해두면 안전합니다.
const api = axios.create({
    withCredentials: true,
});

const AuthStatus: React.FC<AuthStatusProps> = ({ user, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    // 앱 진입 시/새로고침 시 로그인 상태 복구
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setBusy(true);
                setError(null);
                const { data } = await api.get('/api/members/logme');
                if (!mounted) return;
                if (data?.authenticated && data?.user) {
                    setUser({ uid: data.user.uid, email: data.user.email });
                } else {
                    setUser(null);
                }
            } catch {
                if (mounted) setUser(null);
            } finally {
                if (mounted) setBusy(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [setUser]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (busy) return;
        try {
            setBusy(true);
            setError(null);
            // 서버는 authorEmail/password를 기대
            const { data } = await api.post('/api/members/login', {
                authorEmail: email,
                password,
            });
            // 쿠키는 자동 저장(HttpOnly). 응답의 최소 정보로 상태 갱신
            setUser({ uid: data.uid, email: data.email });
            setEmail('');
            setPassword('');
        } catch (err: any) {
            const msg = err?.response?.data?.message || '로그인에 실패했습니다.';
            setError(msg);
            setUser(null);
        } finally {
            setBusy(false);
        }
    };

    const handleLogout = async () => {
        if (busy) return;
        try {
            setBusy(true);
            setError(null);
            await api.post('/api/members/logout');
            setUser(null);
        } catch {
            setError('로그아웃에 실패했습니다..');
        } finally {
            setBusy(false);
        }
    };

    if (user) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold dark:text-gray-100">내 정보</h3>
                <p className="dark:text-gray-300 break-all">
                    {user.email}
                </p>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                    onClick={handleLogout}
                    disabled={busy}
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 transition disabled:opacity-60"
                >
                    {busy ? '로그아웃 중...' : '로그아웃'}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-gray-100">로그인</h3>

            <div>
                <label htmlFor="email-auth" className="block text-sm font-medium dark:text-gray-300">
                    이메일
                </label>
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
                <label htmlFor="password-auth" className="block text-sm font-medium dark:text-gray-300">
                    비밀번호
                </label>
                <input
                    id="password-auth"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900 dark:bg-gray-700 dark:border-gray-400 dark:text-white"
                    required
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="space-y-2 pt-2">
                <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900 transition disabled:opacity-60"
                >
                    {busy ? '로그인 중...' : '로그인'}
                </button>
                <button
                    type="button"
                    className="w-full rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-900 transition"
                    onClick={() => navigate('/signUp')}
                >
                    회원가입
                </button>
            </div>
        </form>
    );
};

export default AuthStatus;
