import {Link, Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuthStore} from '../store/authStore';
import {Github, LogOut} from 'lucide-react';

export const Layout = () => {
    const {pathname} = useLocation();
    const {token, logout} = useAuthStore();

    if (!token) {
        return <Navigate to="/login" replace/>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex space-x-8 whitespace-nowrap">
                                <Link
                                    to="/practice"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        pathname === '/practice'
                                            ? 'border-indigo-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Practice
                                </Link>
                                <Link
                                    to="/chat"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        pathname === '/chat'
                                            ? 'border-indigo-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Chat
                                </Link>
                                <Link
                                    to="/grammar"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        pathname === '/grammar'
                                            ? 'border-indigo-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Grammar
                                </Link>
                                <Link
                                    to="/vocabulary"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        pathname === '/vocabulary'
                                            ? 'border-indigo-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Vocabulary
                                </Link>
                                <Link
                                    to="/diary"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        pathname === '/diary'
                                            ? 'border-indigo-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Diary
                                </Link>
                                <Link
                                    to="/opic"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        pathname === '/opic'
                                            ? 'border-indigo-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    OPic
                                </Link>
                                <Link
                                    to="/learn"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        pathname === '/learn'
                                            ? 'border-indigo-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Sentence
                                </Link>
                                <Link
                                    to="/manage"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        pathname === '/manage'
                                            ? 'border-indigo-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 mr-8'
                                    }`}
                                >
                                    Management
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => logout()}
                                className="flex items-center text-gray-500 hover:text-gray-700 ml-8"
                            >
                                <LogOut className="h-5 w-5 mr-1"/>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet/>
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center space-x-4">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} English Learning Assistant. Designed by TeiNam
                        </p>
                        <div className="flex items-center space-x-2">
                            <a
                                href="https://github.com/TeiNam"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600"
                                title="GitHub"
                            >
                                <Github className="h-4 w-4" />
                            </a>
                            <a
                                href="https://rastalion.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600"
                                title="WordPress"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 fill-current"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12.158,12.786L9.46,20.625c0.806,0.237,1.657,0.366,2.54,0.366c1.047,0,2.051-0.181,2.986-0.51 c-0.024-0.038-0.046-0.079-0.065-0.124L12.158,12.786z M3.009,12c0,3.559,2.068,6.634,5.067,8.092L3.788,8.341 C3.289,9.459,3.009,10.696,3.009,12z M18.069,11.546c0-1.112-0.399-1.881-0.741-2.48c-0.456-0.741-0.883-1.368-0.883-2.109 c0-0.826,0.627-1.596,1.51-1.596c0.04,0,0.078,0.005,0.116,0.007C16.472,3.904,14.34,3.009,12,3.009 c-3.141,0-5.904,1.612-7.512,4.052c0.211,0.007,0.41,0.011,0.579,0.011c0.94,0,2.396-0.114,2.396-0.114 C7.947,6.93,8.004,7.642,7.52,7.699c0,0-0.487,0.057-1.029,0.085l3.274,9.739l1.968-5.901l-1.401-3.838 C9.848,7.756,9.389,7.699,9.389,7.699C8.904,7.67,8.961,6.93,9.446,6.958c0,0,1.484,0.114,2.368,0.114 c0.94,0,2.397-0.114,2.397-0.114c0.485-0.028,0.542,0.684,0.057,0.741c0,0-0.488,0.057-1.029,0.085l3.249,9.665l0.897-2.996 C17.841,13.284,18.069,12.316,18.069,11.546z M19.889,7.686c0.039,0.286,0.06,0.593,0.06,0.924c0,0.912-0.171,1.938-0.684,3.22 l-2.746,7.94c2.673-1.558,4.47-4.454,4.47-7.771C20.991,10.436,20.591,8.967,19.889,7.686z M12,22C6.486,22,2,17.514,2,12 C2,6.486,6.486,2,12,2c5.514,0,10,4.486,10,10C22,17.514,17.514,22,12,22z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};