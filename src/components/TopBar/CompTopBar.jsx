import React, { useContext, useState } from 'react';
import { FiInfo, FiUser, FiWind, FiMoreVertical, FiX } from 'react-icons/fi';
import AuthModal from "../auth/AuthModal"
import { AuthContext } from '../../context/UserContext';
import RoomInfoModal from '../room/RoomInfoModal';
import CompInfoModal from './CompInfoModal';

const CompTopBar = ({
  compName,
  comp,
  sidebarOpen,
  toggleSidebar,
  updateCompMetaData
  // You might need to add additional props if necessary
}) => {
  const { state } = useContext(AuthContext);
  const user = state.user;
  const isAuthenticated = state.isAuthenticated;

  // Manage both Auth modal and Room Info modal state
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
        {/* Info Icon Button */}
        <button
          onClick={() => setShowCompInfoModal(true)}
          aria-label={compName+" Information"}
        >
          <FiInfo className="text-xl hover:text-blue-400 transition" />
        </button>

        {/* Profile/User Icon */}
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

      {/* Room Info Modal */}
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

const CompTopBar4 = ({ compName = 'No Comp Selected', sidebarOpen, toggleSidebar, comp }) => {
  const { state } = useContext(AuthContext);
  const [showInfo, setShowInfo] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [externalUserInfoModalOpen, setExternalUserInfoModalOpen] = useState(false);
  const [selectedExternalUser, setSelectedExternalUser] = useState(null);

  const user = state.user;
  const isAuthenticated = state.isAuthenticated;

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
    setShowUserPopup(false);
    setExternalUserInfoModalOpen(false);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setExternalUserInfoModalOpen(false);
    setSelectedExternalUser(null);
  };

  return (
    <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700 relative">
      {!sidebarOpen && (
        <button onClick={toggleSidebar}>
          <FiWind className="text-xl text-gray-400 hover:text-white transition" />
        </button>
      )}

      {sidebarOpen && <div className="text-xl font-semibold"> </div>}

      <div className="text-xl font-semibold">{comp?.name}</div>

      <div className="flex items-center gap-4">

        <div
          onMouseEnter={() => setShowUserPopup(true)}
          onMouseLeave={() => setShowUserPopup(false)}
          className="relative cursor-pointer"
          onClick={toggleAuthModal}
        >
          <FiUser className="text-lg hover:text-green-400" />
          {showUserPopup && !isAuthModalOpen && (
            <div className="absolute right-0 mt-2 w-56 p-3 bg-gray-700 text-sm rounded shadow-lg z-10">
              {(user) ? (
                <>
                  <p>Name: {user.userName || 'Guest User'}</p>
                  <p>Type: {user.type}</p>
                  {isAuthenticated && <button className="text-red-400 hover:text-red-500 mt-2">Logout</button>}
                  {!isAuthenticated && <p className="text-center text-blue-400">Click to Authenticate</p>}
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
          initialTab={externalUserInfoModalOpen ? 'user' : 'login'}
          externalUserInfo={selectedExternalUser}
        />
      )}
    </div>
  );
};

const CompTopBar3 = ({ compName = 'No Comp Selected', sidebarOpen, toggleSidebar, comp }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userType, setUserType] = useState('Guest'); // Mock user type - replace with your actual logic
  const [externalUserInfoModalOpen, setExternalUserInfoModalOpen] = useState(false);
  const [selectedExternalUser, setSelectedExternalUser] = useState(null);

  // Mock user object structure
  const user = {
    id: "user1",
    userName: "Test User",
    type: userType // Include the type
  };

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
    setShowUserPopup(false);
    setExternalUserInfoModalOpen(false); // Close external user info modal if open
  };

  const handleUsernameClick = (clickedUser) => {
    setSelectedExternalUser({ username: clickedUser.username, joinedDate: clickedUser.joinedDate });
    setExternalUserInfoModalOpen(true);
    setIsAuthModalOpen(true); // Open the main modal
    setShowUserPopup(false);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setExternalUserInfoModalOpen(false);
    setSelectedExternalUser(null);
  };

  return (
    <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700 relative">
      {!sidebarOpen && (
        <button onClick={toggleSidebar}>
          <FiWind className="text-xl text-gray-400 hover:text-white transition" />
        </button>
      )}

      {sidebarOpen && <div className="text-xl font-semibold"> </div>}

      <div className="text-xl font-semibold">{compName}</div>

      <div className="flex items-center gap-4">
        {/* Comp Info Popup */}
        <div
          onMouseEnter={() => {
            if (!user) setShowInfo(true);
          }}
          onMouseLeave={() => {
            if (!user) setShowInfo(false);
          }}
          className="relative"
        >
          {comp && (!user || (user && user.id != comp.createdBy)) && (
            <FiInfo className="text-lg cursor-pointer hover:text-blue-400" />
          )}
          {comp && user && comp.createdBy == user.id && (
            <FiMoreVertical className="text-lg cursor-pointer hover:text-blue-400" />
          )}
          {showInfo && (
            <div
              className="absolute right-0 mt-2 w-48 p-3 bg-gray-700 text-sm rounded shadow-lg z-10"
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
            >
              <p>Created by: Admin</p>
              <p>Members: 24</p>
            </div>
          )}
        </div>

        {/* User Profile or Sign In Popup */}
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
                  <p>Name: {user.userName}</p>
                  <p>Joined: {user.userName || "N/A"}</p>
                  {user.type === 'User' && <button className="text-red-400 hover:text-red-500 mt-2">Logout</button>}
                  {user.type === 'Guest' && <p className="text-center text-blue-400">Click to Authenticate</p>}
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
          userType={user.type}
          initialTab={externalUserInfoModalOpen ? 'user' : 'login'}
          externalUserInfo={selectedExternalUser}
        />
      )}
    </div>
  );
};

const CompTopBar2 = ({ compName = 'No Comp Selected', sidebarOpen, toggleSidebar, comp }) => {
  // const { auth } = useContext(AuthContext);
  const [showInfo, setShowInfo] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);

  // const user = auth.user;
  const user = {
    id: "user1"
  };

  return (
    <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700 relative">
      {!sidebarOpen && <button onClick={toggleSidebar}>
        <FiWind className="text-xl text-gray-400 hover:text-white transition" />
      </button>}

      {
        sidebarOpen && <div className="text-xl font-semibold"> </div>
      }

      <div className="text-xl font-semibold">{compName}</div>

      <div className="flex items-center gap-4">
        {/* Comp Info Popup */}
        <div
          onMouseEnter={() => { if (!user) setShowInfo(true) }}
          onMouseLeave={() => { if (!user) setShowInfo(false) }}
          className="relative"
        >
          {
            comp && (!user || (user && user.id != comp.createdBy)) && <FiInfo className="text-lg cursor-pointer hover:text-blue-400" />
          }
          {
            comp && user && comp.createdBy == user.id && <FiMoreVertical className="text-lg cursor-pointer hover:text-blue-400" />
          }
          {showInfo && (
            <div className="absolute right-0 mt-2 w-48 p-3 bg-gray-700 text-sm rounded shadow-lg z-10" onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}>
              <p>Created by: Admin</p>
              <p>Members: 24</p>
            </div>
          )}
        </div>

        {/* User Profile or Sign In Popup */}
        <div
          onMouseEnter={() => setShowUserPopup(true)}
          onMouseLeave={() => setShowUserPopup(false)}
          className="relative cursor-pointer"
          onClick={() => {
            if (!user) {
              // You could open a modal or navigate to sign-in here
              console.log("Redirect to sign in or show modal");
            } else {
              // Navigate to user page
              console.log("Go to user profile");
            }
          }}
        >
          <FiUser className="text-lg hover:text-green-400" />
          {showUserPopup && (
            <div className="absolute right-0 mt-2 w-56 p-3 bg-gray-700 text-sm rounded shadow-lg z-10">
              {user ? (
                <>
                  <p>Name: {user.userName}</p>
                  <p>Joined: {user.userName || "N/A"}</p>
                </>
              ) : (
                <p className="text-center">Click to Sign In</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CompTopBar1 = ({ compName = 'No Comp Selected', sidebarOpen, toggleSidebar, comp }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // const { auth } = useContext(AuthContext);
  const user = {
    id: "user1",
    userName: "Test User" // Added a mock username
  };

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
    setShowUserPopup(false); // Close the quick user popup when modal opens
  };

  return (
    <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700 relative">
      {!sidebarOpen && (
        <button onClick={toggleSidebar}>
          <FiWind className="text-xl text-gray-400 hover:text-white transition" />
        </button>
      )}

      {sidebarOpen && <div className="text-xl font-semibold"> </div>}

      <div className="text-xl font-semibold">{compName}</div>

      <div className="flex items-center gap-4">
        {/* Comp Info Popup */}
        <div
          onMouseEnter={() => {
            if (!user) setShowInfo(true);
          }}
          onMouseLeave={() => {
            if (!user) setShowInfo(false);
          }}
          className="relative"
        >
          {comp && (!user || (user && user.id != comp.createdBy)) && (
            <FiInfo className="text-lg cursor-pointer hover:text-blue-400" />
          )}
          {comp && user && comp.createdBy == user.id && (
            <FiMoreVertical className="text-lg cursor-pointer hover:text-blue-400" />
          )}
          {showInfo && (
            <div
              className="absolute right-0 mt-2 w-48 p-3 bg-gray-700 text-sm rounded shadow-lg z-10"
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
            >
              <p>Created by: Admin</p>
              <p>Members: 24</p>
            </div>
          )}
        </div>

        {/* User Profile or Sign In Popup */}
        <div
          onMouseEnter={() => setShowUserPopup(true)}
          onMouseLeave={() => setShowUserPopup(false)}
          className="relative cursor-pointer"
          onClick={toggleAuthModal} // Open the modal on click
        >
          <FiUser className="text-lg hover:text-green-400" />
          {showUserPopup && !isAuthModalOpen && ( // Only show quick popup if modal is closed
            <div className="absolute right-0 mt-2 w-56 p-3 bg-gray-700 text-sm rounded shadow-lg z-10">
              {user ? (
                <>
                  <p>Name: {user.userName}</p>
                  <p>Joined: {user.userName || "N/A"}</p>
                </>
              ) : (
                <p className="text-center">Click to Sign In</p>
              )}
            </div>
          )}
        </div>
      </div>

      {isAuthModalOpen && <AuthModal onClose={toggleAuthModal} />}
    </div>
  );
};

export default CompTopBar;
