import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, User } from 'lucide-react';

const AdminLayout = ({ handleLogout }) => {
    const navigate = useNavigate();

    const onLogout = () => {
        handleLogout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-purple-700">Admin Panel</h1>
                </div>
                <nav className="flex-grow p-4">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-200'
                            }`
                        }
                    >
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/profile"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-200'
                            }`
                        }
                    >
                        <User className="w-5 h-5 mr-3" />
                        Profile
                    </NavLink>
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-gray-600 hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
