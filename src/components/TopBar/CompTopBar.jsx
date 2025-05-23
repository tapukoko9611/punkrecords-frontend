import React, { useContext, useState } from 'react';
import { FiInfo, FiUser, FiWind, } from 'react-icons/fi';
import AuthModal from "../auth/AuthModal"
import { AuthContext } from '../../context/UserContext';
import CompInfoModal from './CompInfoModal';

const CompTopBar = ({
  compName,
  comp,
  sidebarOpen,
  toggleSidebar,
  updateCompMetaData
}) => {
  const { state } = useContext(AuthContext);
  const user = state.user;
  const isAuthenticated = state.isAuthenticated;

  const [showUserPopup, setShowUserPopup] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showCompInfoModal, setShowCompInfoModal] = useState(false);

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700 relative">
      {!sidebarOpen && (
        <button onClick={toggleSidebar}>
          <FiWind className="text-xl text-gray-400 hover:text-white transition" />
        </button>
      )}
      {sidebarOpen && <div className="text-xl font-semibold" />}
      <div className="text-xl font-semibold">{comp?.name}</div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowCompInfoModal(true)}
          aria-label={compName+" Information"}
        >
          <FiInfo className="text-xl hover:text-blue-400 transition" />
        </button>

        <div
          onMouseEnter={() => setShowUserPopup(true)}
          onMouseLeave={() => setShowUserPopup(false)}
          className="relative cursor-pointer"
          onClick={toggleAuthModal}
        >
          <FiUser className="text-lg hover:text-green-400" />
          {showUserPopup && !isAuthModalOpen && (
            <div className="absolute right-0 mt-2 w-56 p-3 bg-gray-700 text-sm rounded shadow-lg z-10">
              {user ? (
                <>
                  <p>Name: {user.userName || 'Guest User'}</p>
                  <p>Type: {user.type}</p>
                  {isAuthenticated && (
                    <button className="text-red-400 hover:text-red-500 mt-2">
                      Logout
                    </button>
                  )}
                  {!isAuthenticated && (
                    <p className="text-center text-blue-400">
                      Click to Authenticate
                    </p>
                  )}
                </>
              ) : (
                <p className="text-center">Click to Sign In</p>
              )}
            </div>
          )}
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthModal
          onClose={closeAuthModal}
          userType={user ? user.type : 'Guest'}
          initialTab="login"
          externalUserInfo={null}
        />
      )}

      {showCompInfoModal && (
        <CompInfoModal
          comp={comp}
          isCreator={user && comp?.createdBy === user._id}
          onClose={() => setShowCompInfoModal(false)}
          onUpdatePrivacy={(compName, isPrivate, password) => updateCompMetaData(compName, isPrivate, password)}
          compName={compName}
        />
      )}
    </div>
  );
};

export default CompTopBar;
