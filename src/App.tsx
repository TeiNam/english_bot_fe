import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Practice } from './pages/Practice';
import { Learn } from './pages/Learn';
import { Manage } from './pages/Manage';
import { Grammar } from './pages/Grammar.tsx';
import { Opic } from './pages/Opic';
import { Vocabulary } from './pages/Vocabulary';
import { useAuthStore } from './store/authStore';

function App() {
    const token = useAuthStore((state) => state.token);

    return (
        <Routes>
            <Route
                path="/login"
                element={token ? <Navigate to="/practice" replace /> : <LoginForm />}
            />
            <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/practice" replace />} />
                <Route path="practice" element={<Practice />} />
                <Route path="learn" element={<Learn />} />
                <Route path="vocabulary" element={<Vocabulary />} />
                <Route path="grammar" element={<Grammar />} />
                <Route path="opic" element={<Opic />} />
                <Route path="manage" element={<Manage />} />
                <Route path="*" element={<Navigate to="/practice" replace />} />
            </Route>
        </Routes>
    );
}

export default App