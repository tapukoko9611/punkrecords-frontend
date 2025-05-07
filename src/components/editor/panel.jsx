import React from 'react';
import CompTopBar from '../TopBar/CompTopBar';
import TextSpace from './TextSpace';

const EditorPanel = ({ activeEditor, toggleSidebar, sidebarOpen, editor }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (editor && editor.isPrivate && !isPasswordCorrect) {
      setShowPasswordModal(true);
    } else {
      setShowPasswordModal(false);
    }
  }, [editor, isPasswordCorrect]);

  const handlePasswordSubmit = () => {
    if (editor && editor.password === passwordInput) {
      setIsPasswordCorrect(true);
      setShowPasswordModal(false);
    } else {
      alert('Incorrect password!');
      setPasswordInput('');
    }
  };

  const handleBackdropClick = (event) => {
    if (modalRef.current && event.target === modalRef.current) {
      setShowPasswordModal(false);
    }
  };

  if (!editor) {
    return <div className="flex-1 flex flex-col items-center justify-center text-gray-500">No editor selected.</div>;
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <CompTopBar compName={activeEditor} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} comp={editor} />
      <div className={`${showPasswordModal && editor.isPrivate && !isPasswordCorrect ? 'blur-lg' : ''} flex-1 flex flex-col`}>
        {(!showPasswordModal || isPasswordCorrect) && (
          <>
            <TextSpace editor={editor} />
          </>
        )}
      </div>
      {showPasswordModal && editor.isPrivate && (
        <div
          ref={modalRef}
          onClick={handleBackdropClick}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-gray-800 p-8 rounded shadow-lg w-80">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Enter Editor Password</h2>
            <input
              type="password"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button
              className="w-full py-3 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handlePasswordSubmit}
            >
              Enter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EditorPanel1 = ({ activeEditor, toggleSidebar, sidebarOpen, editor }) => {
  return (
    <div className="flex-1 flex flex-col">
      <CompTopBar compName={activeEditor} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} comp={editor} />
      {
        editor && <TextSpace editor={editor}/>
      }
    </div>
  );
}; 

export default EditorPanel;
