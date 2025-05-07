// context/AppProviders.jsx
import { UserProvider } from './UserContext';

export default function AppProviders({ children }) {
  return (
    <UserProvider>
      {/* <RoomProvider>
        <CallProvider>
          <FileProvider>
            <EditorProvider> */}
              {children}
            {/* </EditorProvider>
          </FileProvider>
        </CallProvider>
      </RoomProvider> */}
    </UserProvider>
  );
}
