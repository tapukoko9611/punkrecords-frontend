import { SocketProvider } from './SocketContext';
import { AuthProvider } from './UserContext';
import { RoomProvider } from './RoomContext';
import { EditorProvider } from './EditorContext';
import { FileProvider } from './FileContext';
import { CallProvider } from './CallContext';


export default function AppProviders({ children }) {
  return (
    <SocketProvider>
      <AuthProvider>
        {/* <SocketProvider> */}
          <RoomProvider>
          <EditorProvider>
            <FileProvider>
              <CallProvider>
                {children}
              </CallProvider>
            </FileProvider>
          </EditorProvider>
        </RoomProvider>
        {/* </SocketProvider> */}
      </AuthProvider>
    </SocketProvider>
  );
}
