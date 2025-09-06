import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    // 회원가입 폼 상태 관리
    const [authorEmail, setAuthorEmail] = useState('');
    const [nName, setNName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mblNo, setMblNo] = useState('');

    // 비밀번호 관련 상태
    const [passwordStrength, setPasswordStrength] = useState(''); // 비밀번호 강도 텍스트
    const [passwordsMatch, setPasswordsMatch] = useState(false); // 비밀번호 일치 상태텍스트

    // 페이지 이동을 위한 navigate 함수
    const navigate = useNavigate();

    // 비밀번호 강도 체크 로직
    useEffect(() => {
        if (!password) {
            setPasswordStrength('');
            return;
        }

        const hasNumbers = /[0-9]/.test(password);
        const hasLetters = /[a-zA-Z]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);

        if (password.length < 8) {
            setPasswordStrength('위험');
        } else if (hasLetters && hasNumbers && hasSpecial) {
            setPasswordStrength('안전');
        } else if (hasLetters && hasNumbers) {
            setPasswordStrength('보통');
        } else {
            setPasswordStrength('위험');
        }
    }, [password]);

    // 비밀번호 확인 체크 로직
    useEffect(() => {
        // confirmPassword 필드가 비어있지 않을 때만 검사
        if (confirmPassword) {
            setPasswordsMatch(password === confirmPassword);
        } else {
            // 비어있을 때는 에러 메시지를 보여주지 않음
            setPasswordsMatch(true);
        }
    }, [password, confirmPassword]);

    // 폼 제출 이벤트 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지

        // 비밀번호와 비밀번호 확인이 일치하는지 검사
        if (!passwordsMatch) {
            alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
            return;
        }

        // 비밀번호와 비밀번호 확인이 일치하는지 검사
        if (passwordStrength === '위험') {
            alert('비밀번호가 안전하지 않습니다.\n8자 이상, 문자, 숫자, 특수문자 포함하여 입력해 주세요.');
            return;
        }

        // 실제 회원가입 로직 (API 호출)
        try {
            const userData = {
                authorEmail,
                nName,
                password,
                mblNo,
            };
             await axios.post('/api/members/signup', userData);

            alert('회원가입이 완료되었습니다!');
            navigate('/'); // 회원가입 성공 후 메인페이지로 이동
        } catch (error) {
            console.error('회원가입 처리 중 오류 발생', error);
            alert('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    };
    return (
        <div className="mx-auto max-w-lg p-4">
            <h2 className="mb-4 text-center text-2xl font-bold dark:text-gray-100">
                회원가입
            </h2>
            <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-xl border border-gray-200 p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
                {/* 이메일 입력 필드 */}
                <div>
                    <label
                        htmlFor="authorEmail"
                        className="mb-2 block text-sm font-medium dark:text-gray-300"
                    >
                        이메일
                    </label>
                    <input
                        id="authorEmail"
                        type="email"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                        placeholder="이메일 주소를 입력하세요"
                    />
                </div>

                {/* 닉네임 입력 필드 */}
                <div>
                    <label htmlFor="nName"
                        className="mb-2 block text-sm font-medium dark:text-gray-300"
                    >
                        닉네임
                    </label>
                    <input
                        id="nName"
                        type="text"
                        value={nName}
                        onChange={(e) => setNName(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                        placeholder="사용하실 닉네임을 입력하세요"
                    />
                </div>

                {/* 비밀번호 입력 필드 */}
                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium dark:text-gray-300"
                    >
                        비밀번호
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                        placeholder="8자 이상, 문자, 숫자, 특수문자 포함"
                    />
                    {passwordStrength && (
                        <p className={`mt-2 text-xs font-semibold ${
                            passwordStrength === '위험' ? 'text-red-500' :
                                passwordStrength === '보통' ? 'text-yellow-500' :
                                    'text-green-500'
                        }`}>
                            비밀번호 강도: {passwordStrength}
                        </p>
                    )}
                </div>

                {/* 비밀번호 확인 입력 필드 */}
                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-medium dark:text-gray-300"
                    >
                        비밀번호 확인
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                        placeholder="비밀번호를 다시 한번 입력하세요"
                    />
                    {confirmPassword && !passwordsMatch && (
                        <p className="mt-2 text-xs font-semibold text-red-500">
                            비밀번호가 일치하지 않습니다.
                        </p>
                    )}
                </div>

                {/* 핸드폰 번호 입력 필드 */}
                <div>
                    <label
                        htmlFor="mblNo"
                        className="mb-2 block text-sm font-medium dark:text-gray-300"
                    >
                        핸드폰 번호
                    </label>
                    <input
                        id="mblNo"
                        type="tel"
                        value={mblNo}
                        onChange={(e) => setMblNo(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                        placeholder="'-' 없이 숫자만 입력하세요"
                    />
                </div>

                {/* 버튼 영역 */}
                <div className="!mt-8 flex flex-col items-center gap-2">
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900"
                    >
                        가입하기
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')} // 메인 페이지나 이전 페이지로 이동
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-blue-900"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;