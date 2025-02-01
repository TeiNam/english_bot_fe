import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut } from 'lucide-react';

export const Layout = () => {
  const { pathname } = useLocation();
  const { token, logout } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex space-x-8">
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
                      to="/manage"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          pathname === '/manage'
                              ? 'border-indigo-500 text-gray-900'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    Management
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <button
                    onClick={() => logout()}
                    className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
  );
};