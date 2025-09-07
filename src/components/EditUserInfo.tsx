import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

// 로그인 상태를 관리하는 setUser 함수를 props로 받기 위한 타입 정의
interface EditUserInfoProps {
    setUser: React.Dispatch<React.SetStateAction<{ uid?: number; email: string } | null>>;
}

// 같은 오리진이 아니라면 withCredentials가 필요합니다.
// 같은 오리진이어도 명시해두면 안전합니다.
const api = axios.create({
    withCredentials: true,
});

type MeResponse =
    | { authenticated: false }
    | { authenticated: true; user: { uid: number; email: string; nName?: string } };

const EditUserInfo: React.FC<EditUserInfoProps> = ({ setUser }) => {
    // 세션 로그인 정보 상태
    const [me, setMe] = useState<{ uid: number; email: string; nName?: string } | null>(null);
    const [loadingMe, setLoadingMe] = useState(true);

    // 회원가입 폼 상태 관리
    const [uid, setUid] = useState('');         // 이메일
    const [authorEmail, setAuthorEmail] = useState('');         // 이메일
    const [nName, setNName] = useState('');                     // 닉네임
    const [password, setPassword] = useState('');               // 비밀번호
    const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인
    const [mblNo, setMblNo] = useState('');                     //핸드폰번호

    // 요청에 modify 이 있으면 수정 화면으로 인식
    const isModifyMode = location.pathname.includes('/modify');

    // 비밀번호 관련 상태
    const [passwordStrength, setPasswordStrength] = useState(''); // 비밀번호 강도 텍스트
    const [passwordsMatch, setPasswordsMatch] = useState(false); // 비밀번호 일치 상태

    //핸드폰 인증 관련 상태
    const [verificationCode, setVerificationCode] = useState('');   // 사용자가 입력할 인증번호
    const [isCodeSent, setIsCodeSent] = useState(false);            // 인증번호 발송 여부
    const [isVerified, setIsVerified] = useState(false);            // 인증 성공 여부
    const [serverCode, setServerCode] = useState('');               // 서버에서 받았다고 가정한 인증번호
    const [timer, setTimer] = useState(180);                        // 3분 타이머 (180초)
    const [isTimerRunning, setIsTimerRunning] = useState(false);    // 타이머 동작 여부


    // 페이지 이동을 위한 navigate 함수
    const navigate = useNavigate();

    // 회원정보 수정일경우
    useEffect(() => {
        if(isModifyMode) {
            const fetchMember = async () => {
                setLoadingMe(true);
                const { data } = await api.get<MeResponse>('/api/members/logme');
                if (data.authenticated) {
                    setMe(data.user);
                    const response = await api.get(`/api/members/${data.user.uid}`);
                    setUid(response.data.uid);
                    setAuthorEmail(response.data.authorEmail);
                    setNName(response.data.nName);
                    setMblNo(response.data.mblNo);
                }

            };
            fetchMember();
        }
    }, [location.pathname]);

    // 비밀번호 강도 체크 로직
    useEffect(() => {
        if (!password || isModifyMode ) {
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

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        if (isTimerRunning && timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerRunning(false);
            setIsCodeSent(false);       // 재전송 버튼 활성화를 위해
            alert('인증 시간이 만료되었습니다. 인증번호를 다시 받아주세요.');
        }
        return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
    }, [isTimerRunning, timer]);

    // 타이머 포맷 변환 함수 (MM:SS)
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    // 인증번호 받기/재전송 핸들러
    const handleSendCode = async () => {
        if (!mblNo) {
            alert('핸드폰 번호를 입력해주세요.');
            return;
        }
        try {
            // todo 실제로는 여기에 서버로 핸드폰 번호를 보내는 API 호출 들어가야함
            console.log(`${mblNo}로 인증번호 발송 요청`);
            const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
            setServerCode(generatedCode);
            setIsCodeSent(true);
            setTimer(180); // 타이머 3분으로 초기화
            setIsTimerRunning(true);
            setIsVerified(false); // 재전송 시 인증상태 초기화
            setVerificationCode(''); // 재전송 시 입력 필드 초기화
            alert(`[DEMO] 인증번호: ${generatedCode}`);
        } catch (error) {
            console.error('인증번호 발송 실패:', error);
            alert('인증번호 발송에 실패했습니다.');
        }
    };

    // 인증번호 확인 핸들러
    const handleVerifyCode = () => {
        if (verificationCode === serverCode) {
            setIsVerified(true);
            setIsTimerRunning(false); // 인증 성공 시 타이머 중지
            alert('인증에 성공했습니다!');
        } else {
            alert('인증번호가 일치하지 않습니다.');
        }
    };

    const withdraw = async () => {
        if (!password) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        
        // 1. 사용자에게 정말 탈퇴할 것인지 물어보기
        if (window.confirm('정말 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            try {
                const userData = { uid, nName, password, mblNo };
                const response = await api.post(`/api/members/withdraw`, userData);

                // 3. 요청이 성공적으로 처리되었을 때
                if (response.status === 200) { // 성공 상태 코드가 200이라고 가정
                    alert('회원탈퇴가 완료되었습니다.');
                    setUser(null); // 전역 user 상태를 null로 만들어 로그아웃 처리
                    navigate('/'); // 홈페이지로 이동
                }

            } catch (error) {
                // 5. API 요청 실패 시 에러 처리
                console.error('회원탈퇴 실패:', error);

            }
        }
    }


    // 폼 제출 이벤트 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지

        // 비밀번호와 비밀번호 확인이 일치하는지 검사
        if (!passwordsMatch && !isModifyMode) {
            alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
            return;
        }

        if (!isVerified && !isModifyMode) {
            alert('핸드폰 번호 인증을 완료해주세요.');
            return;
        }

        // 비밀번호와 비밀번호 확인이 일치하는지 검사
        if (passwordStrength === '위험') {
            alert('비밀번호가 안전하지 않습니다.\n8자 이상, 문자, 숫자, 특수문자 포함하여 입력해 주세요.');
            return;
        }

        // 실제 회원가입 로직 (API 호출)
        try {
            if(!isModifyMode) {
                const userData = { authorEmail, nName, password, mblNo };
                await api.put('/api/members/signup', userData);

                alert('회원가입이 완료되었습니다!');
            }else{
                //const uid = localStorage.getItem('uid');
                const userData = { uid, nName, password, mblNo };
                await api.post('/api/members/modify', userData);

                alert('회원정보 수정이 완료되었습니다!');
            }
            navigate('/'); // 성공 후 메인페이지로 이동

        } catch (error) {
            if(!isModifyMode) {
                console.error('회원가입 처리 중 오류 발생', error);
                alert('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }else{
                console.error('회원정보수정 처리 중 오류 발생', error);
                alert('회원정보수정에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
        }
    };
    return (
        <div className="mx-auto max-w-lg p-4">
            <h2 className="mb-4 text-center text-2xl font-bold dark:text-gray-100">
                {isModifyMode ? '회원정보수정' : '회원가입'}
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
                        disabled={isModifyMode}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900 dark:disabled:bg-gray-600"
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
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900 dark:disabled:bg-gray-600"
                        placeholder={isModifyMode ? "":"8자 이상, 문자, 숫자, 특수문자 포함"}
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
                        required={!isModifyMode}
                        disabled={isModifyMode}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900 dark:disabled:bg-gray-600"
                        placeholder={isModifyMode ? "":"비밀번호를 다시 한번 입력하세요"}
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
                    <div className="flex gap-2">
                        <input
                            id="mblNo"
                            type="tel"
                            value={mblNo}
                            onChange={(e) => setMblNo(e.target.value)}
                            required
                            disabled={isVerified || isTimerRunning}
                            className="flex-grow rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900 dark:disabled:bg-gray-600"
                            placeholder="'-' 없이 숫자만 입력하세요"
                        />
                        <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={isTimerRunning || isVerified}
                            className="w-32 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            {isCodeSent ? '재전송' : '인증번호 받기'}
                        </button>
                    </div>
                </div>

                {/* 인증번호 입력 필드 (인증번호가 발송되었고, 아직 인증되지 않았을 때만 보임) */}
                {isCodeSent && !isVerified && (
                    <div>
                        <label
                            htmlFor="verificationCode"
                            className="mb-2 block text-sm font-medium dark:text-gray-300"
                        >
                            인증번호
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full">
                                <input
                                    id="verificationCode"
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                                    placeholder="6자리 인증번호를 입력하세요"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-red-500">
                                        {formatTime(timer)}
                                     </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleVerifyCode}
                                className="w-32 shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
                            >
                                인증 확인
                            </button>
                        </div>
                    </div>
                )}

                {/* 버튼 영역 */}
                <div className="!mt-8 flex flex-col items-center gap-2">
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900"
                    >
                        {isModifyMode ? "회원정보수정" : "가입하기"}
                    </button>
                    {isModifyMode &&(
                        <button
                            type="button"
                            onClick={() => withdraw()} //
                            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-red-900"
                        >
                            회원탈퇴
                        </button>
                    )}
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

export default EditUserInfo;