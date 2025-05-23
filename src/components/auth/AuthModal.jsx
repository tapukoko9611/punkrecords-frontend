import React, { useState, useEffect, useContext } from 'react';
import { FiX, FiKey, FiUserPlus, FiUser, FiLogOut, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { AuthContext } from '../../context/UserContext';
import authApi from '../../api/userApi';
import { SocketContext } from '../../context/SocketContext';

const AuthModal = ({ onClose, userType: initialUserType, initialTab = 'login', externalUserInfo = null }) => {
    const { state, dispatch } = useContext(AuthContext);
    const isAuthenticated = state.isAuthenticated;
    const socket = useContext(SocketContext);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState(null);
    const [userType, setUserType] = useState(initialUserType);
    const [userInfo, setUserInfo] = useState({ username: '', joinedDate: '' });
    const [usernameAvailability, setUsernameAvailability] = useState(null);
    const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
    let usernameCheckTimeout;

    const handleUsernameChange = (e) => {
        const newUsername = e.target.value;
        setUsername(newUsername);
        setUsernameAvailability(null);

        clearTimeout(usernameCheckTimeout);
        if (newUsername.trim()) {
            setUsernameCheckLoading(true);
            usernameCheckTimeout = setTimeout(async () => {
                const isTaken = await authApi.checkUserName(state.token, newUsername);
                setUsernameAvailability(isTaken);
                setUsernameCheckLoading(false);
            }, 500);
        }
    };

    useEffect(() => {
        setUserType(initialUserType === 'Guest' ? 'Immigrant' : initialUserType);
        if ((initialUserType === 'User' || initialUserType === 'Immigrant') && !externalUserInfo) {
            setUserInfo({ username: state.user?.userName || '', joinedDate: 'N/A' });
            setActiveTab('userDetails');
        } else if (externalUserInfo) {
            setUserInfo({ username: externalUserInfo.username, joinedDate: externalUserInfo.joinedDate });
            setActiveTab('userDetails');
        } else {
            setActiveTab('login');
        }
    }, [initialUserType, externalUserInfo, state.user]);

    const handleLogin = async () => {
        dispatch({ type: 'LOGIN_REQUEST' });
        const response = await authApi.login(username, password);
        if (!response.isError) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.data.user, token: response.data.token } });
            localStorage.setItem('authToken', response.data.token);
            if (socket && response.data.token) {
                socket.emit('re-authenticate', { token: response.data.token });
            }
            onClose();
        } else {
            dispatch({ type: 'LOGIN_FAILURE', payload: response.message });
            setError(response.message);
        }
    };

    const handleSignup = async () => {
        dispatch({ type: 'SIGNUP_REQUEST' });
        if (usernameAvailability === true) {
            setError("Username is already taken. Please choose another one.");
            return;
        }
        const response = await authApi.signup(username, password, code, state.token);
        if (!response.isError) {
            dispatch({ type: 'SIGNUP_SUCCESS', payload: { user: response.data.user, token: response.token } });
            localStorage.setItem('authToken', response.token);
            if (socket && response.token) {
                socket.emit('re-authenticate', { token: response.token });
            }
            onClose();
        } else {
            dispatch({ type: 'SIGNUP_FAILURE', payload: response.message });
            setError(response.message);
        }
    };

    const handleResetPassword = async () => {
        const response = await authApi.updateUser(username, newPassword, code, state.token);
        if (!response.isError) {
            if (response.data.user) {
                dispatch({ type: 'SIGNUP_SUCCESS', payload: { user: response.data.user, token: response.data.token } });
                localStorage.setItem('authToken', response.data.token);
            }
            onClose();
        } else {
            setError(response.message);
            dispatch({ type: 'LOGIN_FAILURE', payload: response.message });
            setError(response.message);
        }
    };

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem('authToken');
        if (socket) {
            socket.emit('authenticate', { token: localStorage.getItem('authToken') || null });
        }
        onClose();
    };

    const renderTabButton = (tabName, label, icon) => {
        const shouldShow =
            (userType === 'Immigrant') ||
            (userType === 'User' && (tabName === 'forgotPassword' || tabName === 'userDetails' || tabName === 'logout'));

        if (!shouldShow) {
            return null;
        }

        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`px-4 py-2 mx-2 rounded-t-md text-sm font-medium focus:outline-none transition duration-200 ${activeTab === tabName
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                disabled={externalUserInfo && tabName !== 'userDetails'}
            >
                {icon && <span className="mr-1">{icon}</span>}
                {label}
            </button>
        );
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-96 border border-gray-700">
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                    <h2 className="text-xl font-semibold text-gray-300">Authentication</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <FiX className="text-xl" />
                    </button>
                </div>

                <div className="flex -mx-2 mb-3">
                    {userType === 'Immigrant' && renderTabButton('login', 'Login', <FiKey />)}
                    {userType === 'Immigrant' && renderTabButton('signup', 'Sign Up', <FiUserPlus />)}
                    {renderTabButton('forgotPassword', 'Forgot Password', <FiKey />)}
                    {renderTabButton('userDetails', 'User Info', <FiUser />)}
                    {isAuthenticated && renderTabButton('logout', 'Logout', <FiLogOut />)}
                </div>

                <div className="p-6 rounded-md bg-gray-800 border border-gray-700">
                    {error && <p className="text-red-500 mb-2">{error}</p>}

                    {activeTab === 'login' && userType === 'Immigrant' && (
                        <div>
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full p-3 mb-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                onClick={handleLogin}
                                className="w-full py-3 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Login
                            </button>
                        </div>
                    )}

                    {activeTab === 'signup' && userType === 'Immigrant' && (
                        <div>
                            <input
                                type="text"
                                placeholder="Username"
                                className={`w-full p-3 mb-1 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 ${usernameAvailability === true ? 'focus:ring-red-500' : (usernameAvailability === false ? 'focus:ring-green-500' : 'focus:ring-green-500')
                                    }`}
                                value={username}
                                onChange={handleUsernameChange}
                            />
                            {usernameCheckLoading && <p className="text-gray-500 text-xs mt-1">Checking availability...</p>}
                            {usernameAvailability === true && <p className="text-red-500 text-xs mt-1">Username already taken.</p>}
                            {usernameAvailability === false && username.trim() !== '' && !usernameCheckLoading && <p className="text-green-500 text-xs mt-1">Username available.</p>}
                            <p className='p-1'> </p>
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full p-3 mb-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Code (Birth Year)"
                                className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <button
                                onClick={handleSignup}
                                className="w-full py-3 bg-green-600 rounded-md text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {activeTab === 'forgotPassword' && (
                        <div>
                            <>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="w-full p-3 mb-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Code (Birth Year)"
                                    className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                                <p className="mb-2 text-gray-400">Enter your new password:</p>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    onClick={handleResetPassword}
                                    className="w-full py-3 bg-orange-600 rounded-md text-white font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    Reset Password
                                </button>
                            </>
                        </div>
                    )}

                    {activeTab === 'userDetails' && (
                        <div>
                            <p className="mb-2 text-gray-400">Username: <span className="text-white">{userInfo.username || 'N/A'}</span></p>
                            <p className="mb-4 text-gray-400">Joined: <span className="text-white">{userInfo.joinedDate || 'N/A'}</span></p>
                            {isAuthenticated && (
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 bg-red-600 rounded-md text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );


};

export default AuthModal;