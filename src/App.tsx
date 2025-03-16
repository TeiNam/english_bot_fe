import {Navigate, Route, Routes, useNavigate} from 'react-router-dom';
import {LoginForm} from './components/LoginForm';
import {Layout} from './components/Layout';
import {Practice} from './pages/Practice';
import {Chat} from './pages/Chat';
import {Learn} from './pages/Learn';
import {Manage} from './pages/Manage';
import {Grammar} from './pages/Grammar.tsx';
import {Opic} from './pages/Opic';
import {Vocabulary} from './pages/Vocabulary';
import {Diary} from './pages/Diary';
import {useAuthStore} from './store/authStore';
import {useEffect} from 'react';

// 인증이 필요한 라우트를 위한 래퍼 컴포넌트
function ProtectedRoute({children}: {children: JSX.Element}) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    
    if (!isAuthenticated) {
        // 현재 경로를 저장하고 로그인 페이지로 리디렉션
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
        }
        
        return <Navigate to="/login" replace />;
    }
    
    return children;
}

function App() {
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    
    // 앱 실행 시 인증 상태 체크
    useEffect(() => {
        // 현재 인증 상태 확인
        const authValid = isAuthenticated();
        
        if (!authValid && window.location.pathname !== '/login') {
            // 인증이 유효하지 않고 로그인 페이지가 아니라면, 세션 만료 처리
            console.log('Authentication invalid, redirecting to login...');
            useAuthStore.getState().logout();
        }
    }, [isAuthenticated]);
    
    return (
        <Routes>
            <Route
                path="/login"
                element={token ? <Navigate to="/practice" replace/> : <LoginForm/>}
            />
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout/>
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/practice" replace/>}/>
                <Route path="practice" element={<Practice/>}/>
                <Route path="chat" element={<Chat/>}/>
                <Route path="learn" element={<Learn/>}/>
                <Route path="vocabulary" element={<Vocabulary/>}/>
                <Route path="chat/:conversationId" element={<Chat/>}/>
                <Route path="grammar" element={<Grammar/>}/>
                <Route path="opic" element={<Opic/>}/>
                <Route path="diary" element={<Diary/>}/>
                <Route path="manage" element={<Manage/>}/>
                <Route path="*" element={<Navigate to="/practice" replace/>}/>
            </Route>
        </Routes>
    );
}

export default App