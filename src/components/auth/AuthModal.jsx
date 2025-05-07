import React, { useState, useEffect } from 'react';
import { FiX, FiKey, FiUserPlus, FiUser, FiLogOut, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Simulate API call for checking username and code
const checkUsernameAndCode = async (username, code) => {
    // Replace this with your actual API call later
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demonstration, let's say it's true if username and code are not empty
            resolve(username.trim() !== '' && code.trim() !== '');
        }, 500); // Simulate network delay
    });
};

const AuthModal = ({ onClose, userType, initialTab = 'login', externalUserInfo = null }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const [userInfo, setUserInfo] = useState({ username: 'Guest User', joinedDate: 'N/A' });

    useEffect(() => {
        if (userType === 'User' && !externalUserInfo) {
            setUserInfo({ username: 'LoggedInUser', joinedDate: '2024-05-06' });
        } else if (externalUserInfo) {
            setUserInfo({ username: externalUserInfo.username, joinedDate: externalUserInfo.joinedDate });
            setActiveTab('user');
        } else {
            setUserInfo({ username: 'Guest User', joinedDate: 'N/A' });
            setActiveTab('login');
        }
    }, [userType, externalUserInfo]);

    const handleLogin = () => {
        console.log('Logging in with:', { username, password });
        onClose();
    };

    const handleSignup = () => {
        console.log('Signing up with:', { username, password, code });
        onClose();
    };

    const handleVerifyCode = async () => {
        const isVerified = await checkUsernameAndCode(username, code);
        setIsCodeVerified(isVerified);
    };

    const handleResetPassword = () => {
        if (isCodeVerified) {
            console.log('Resetting password for:', username, 'with new password:', newPassword);
            onClose();
        } else {
            alert('Please verify your username and code first.');
        }
    };

    const handleLogout = () => {
        console.log('Logging out user');
        onClose();
    };

    const renderTabButton = (tabName, label, icon) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 mx-2 rounded-t-md text-sm font-medium focus:outline-none transition duration-200 ${activeTab === tabName
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            disabled={externalUserInfo && tabName !== 'user'}
        >
            {icon && <span className="mr-1">{icon}</span>}
            {label}
        </button>
    );

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
                    {userType === 'Guest' && renderTabButton('login', 'Login', <FiKey />)}
                    {userType === 'Guest' && renderTabButton('signup', 'Sign Up', <FiUserPlus />)}
                    {renderTabButton('forgotPassword', 'Forgot Password', <FiKey />)}
                    {renderTabButton('user', 'User Info', <FiUser />)}
                </div>

                <div className="p-6 rounded-md bg-gray-800 border border-gray-700">
                    {activeTab === 'login' && userType === 'Guest' && (
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

                    {activeTab === 'signup' && userType === 'Guest' && (
                        <div>
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full p-3 mb-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
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
                            {!isCodeVerified ? (
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
                                    <button
                                        onClick={handleVerifyCode}
                                        className="w-full py-3 bg-yellow-600 rounded-md text-gray-900 font-semibold hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        Verify Code
                                    </button>
                                </>
                            ) : (
                                <>
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
                            )}
                        </div>
                    )}

                    {activeTab === 'user' && (
                        <div>
                            <p className="mb-2 text-gray-400">Username: <span className="text-white">{userInfo.username}</span></p>
                            <p className="mb-4 text-gray-400">Joined: <span className="text-white">{userInfo.joinedDate}</span></p>
                            {userType === 'User' && !externalUserInfo && (
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

const AuthModal3 = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleLogin = () => {
        console.log('Logging in with:', { username, password });
        onClose();
    };

    const handleSignup = () => {
        console.log('Signing up with:', { username, password, code });
        onClose();
    };

    const handleForgotPassword = () => {
        console.log('Verifying username and code for password reset:', { username, code });
        setActiveTab('resetPassword');
    };

    const handleResetPassword = () => {
        console.log('Resetting password for:', username, 'with new password:', newPassword, 'and code:', code);
        onClose();
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded shadow-lg w-96">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <h2 className="text-xl font-semibold">Authentication</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FiX className="text-xl" />
                    </button>
                </div>

                <div className="flex -mx-2 mb-4">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`px-4 py-2 mx-2 rounded-t-md ${activeTab === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`px-4 py-2 mx-2 rounded-t-md ${activeTab === 'signup' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        Sign Up
                    </button>
                    <button
                        onClick={() => setActiveTab('forgotPassword')}
                        className={`px-4 py-2 mx-2 rounded-t-md ${activeTab === 'forgotPassword' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        Forgot Password
                    </button>
                </div>

                <div className="p-4 rounded bg-gray-700">
                    {activeTab === 'login' && (
                        <div>
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full p-2 mb-2 bg-gray-600 rounded text-white"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full p-2 mb-4 bg-gray-600 rounded text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button onClick={handleLogin} className="w-full py-2 bg-blue-500 rounded text-white hover:bg-blue-600">
                                Login
                            </button>
                        </div>
                    )}

                    {activeTab === 'signup' && (
                        <div>
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full p-2 mb-2 bg-gray-600 rounded text-white"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full p-2 mb-2 bg-gray-600 rounded text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Code (Birth Year)"
                                className="w-full p-2 mb-4 bg-gray-600 rounded text-white"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <button onClick={handleSignup} className="w-full py-2 bg-green-500 rounded text-white hover:bg-green-600">
                                Sign Up
                            </button>
                        </div>
                    )}

                    {activeTab === 'forgotPassword' && (
                        <div>
                            {activeTab === 'forgotPassword' && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className="w-full p-2 mb-2 bg-gray-600 rounded text-white"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Code (Birth Year)"
                                        className="w-full p-2 mb-4 bg-gray-600 rounded text-white"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />
                                    <button onClick={handleForgotPassword} className="w-full py-2 bg-yellow-500 rounded text-white hover:bg-yellow-600">
                                        Verify & Reset Password
                                    </button>
                                </>
                            )}
                            {activeTab === 'resetPassword' && (
                                <>
                                    <p className="mb-2 text-gray-400">Enter your new password:</p>
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        className="w-full p-2 mb-4 bg-gray-600 rounded text-white"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button onClick={handleResetPassword} className="w-full py-2 bg-orange-500 rounded text-white hover:bg-orange-600">
                                        Reset Password
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AuthModal2 = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleLogin = () => {
        console.log('Logging in with:', { username, password });
        // In a real app, you'd make an API call here
        onClose(); // Close the modal after attempting login
    };

    const handleSignup = () => {
        console.log('Signing up with:', { username, password, code });
        // In a real app, you'd make an API call here
        onClose(); // Close the modal after attempting signup
    };

    const handleForgotPassword = () => {
        console.log('Verifying username and code for password reset:', { username, code });
        setActiveTab('resetPassword'); // Move to the reset password tab
        // In a real app, you'd make an API call to verify
    };

    const handleResetPassword = () => {
        console.log('Resetting password for:', username, 'with new password:', newPassword, 'and code:', code);
        // In a real app, you'd make an API call to reset the password
        onClose(); // Close the modal after attempting reset
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded shadow-lg w-96">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <h2 className="text-xl font-semibold">Authentication</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FiX className="text-xl" />
                    </button>
                </div>

                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`px-4 py-2 rounded ${activeTab === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`px-4 py-2 rounded ${activeTab === 'signup' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Sign Up
                    </button>
                    <button
                        onClick={() => setActiveTab('forgotPassword')}
                        className={`px-4 py-2 rounded ${activeTab === 'forgotPassword' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Forgot Password
                    </button>
                </div>

                {activeTab === 'login' && (
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button onClick={handleLogin} className="w-full py-2 bg-blue-500 rounded text-white hover:bg-blue-600">
                            Login
                        </button>
                    </div>
                )}

                {activeTab === 'signup' && (
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Code (Birth Year)"
                            className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button onClick={handleSignup} className="w-full py-2 bg-green-500 rounded text-white hover:bg-green-600">
                            Sign Up
                        </button>
                    </div>
                )}

                {activeTab === 'forgotPassword' && (
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Code (Birth Year)"
                            className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button onClick={handleForgotPassword} className="w-full py-2 bg-yellow-500 rounded text-white hover:bg-yellow-600">
                            Verify & Reset Password
                        </button>
                    </div>
                )}

                {activeTab === 'resetPassword' && (
                    <div>
                        <p className="mb-2 text-gray-400">Enter your new password:</p>
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button onClick={handleResetPassword} className="w-full py-2 bg-orange-500 rounded text-white hover:bg-orange-600">
                            Reset Password
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const AuthModal1 = ({ onClose }) => {
    const [expandedSection, setExpandedSection] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleLogin = () => {
        console.log('Logging in with:', { username, password });
        onClose();
    };

    const handleSignup = () => {
        console.log('Signing up with:', { username, password, code });
        onClose();
    };

    const handleForgotPassword = () => {
        console.log('Verifying username and code for password reset:', { username, code });
        setExpandedSection('resetPassword'); // Directly expand reset password form
    };

    const handleResetPassword = () => {
        console.log('Resetting password for:', username, 'with new password:', newPassword, 'and code:', code);
        onClose();
    };

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded shadow-lg w-96">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <h2 className="text-xl font-semibold">Authentication</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FiX className="text-xl" />
                    </button>
                </div>

                <div className="mb-2 border-b border-gray-700">
                    <button
                        onClick={() => toggleSection('login')}
                        className="flex justify-between items-center w-full py-2 text-left hover:bg-gray-700"
                    >
                        <span className="font-semibold">Login</span>
                        {expandedSection === 'login' ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {expandedSection === 'login' && (
                        <div className="py-2">
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button onClick={handleLogin} className="w-full py-2 bg-blue-500 rounded text-white hover:bg-blue-600">
                                Login
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-2 border-b border-gray-700">
                    <button
                        onClick={() => toggleSection('signup')}
                        className="flex justify-between items-center w-full py-2 text-left hover:bg-gray-700"
                    >
                        <span className="font-semibold">Sign Up</span>
                        {expandedSection === 'signup' ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {expandedSection === 'signup' && (
                        <div className="py-2">
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Code (Birth Year)"
                                className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <button onClick={handleSignup} className="w-full py-2 bg-green-500 rounded text-white hover:bg-green-600">
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-2 border-b border-gray-700">
                    <button
                        onClick={() => toggleSection('forgotPassword')}
                        className="flex justify-between items-center w-full py-2 text-left hover:bg-gray-700"
                    >
                        <span className="font-semibold">Forgot Password</span>
                        {expandedSection === 'forgotPassword' || expandedSection === 'resetPassword' ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {(expandedSection === 'forgotPassword' || expandedSection === 'resetPassword') && (
                        <div className="py-2">
                            {expandedSection === 'forgotPassword' && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className="w-full p-2 mb-2 bg-gray-700 rounded text-white"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Code (Birth Year)"
                                        className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />
                                    <button onClick={handleForgotPassword} className="w-full py-2 bg-yellow-500 rounded text-white hover:bg-yellow-600">
                                        Verify & Reset Password
                                    </button>
                                </>
                            )}
                            {expandedSection === 'resetPassword' && (
                                <>
                                    <p className="mb-2 text-gray-400">Enter your new password:</p>
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button onClick={handleResetPassword} className="w-full py-2 bg-orange-500 rounded text-white hover:bg-orange-600">
                                        Reset Password
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;