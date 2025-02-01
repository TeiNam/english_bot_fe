import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Learn } from './pages/Learn';
import { Manage } from './pages/Manage';
import { Grammar } from './pages/Grammar.tsx';
import { Vocabulary } from './pages/Vocabulary';
import { useAuthStore } from './store/authStore';

function App() {
    const token = useAuthStore((state) => state.token);

    return (
        <Routes>
            <Route
                path="/login"
                element={token ? <Navigate to="/learn" replace /> : <LoginForm />}
            />
            <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/learn" replace />} />
                <Route path="learn" element={<Learn />} />
                <Route path="vocabulary" element={<Vocabulary />} />
                <Route path="grammar" element={<Grammar />} />
                <Route path="manage" element={<Manage />} />
                <Route path="*" element={<Navigate to="/learn" replace />} />
            </Route>
        </Routes>
    );
}

export default App