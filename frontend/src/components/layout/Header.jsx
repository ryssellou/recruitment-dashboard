import { useAuth } from '../../context/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Recruitment Dashboard
            </h1>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Signed in as <span className="font-medium">{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
