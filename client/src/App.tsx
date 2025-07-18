import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@context/theme';
import { SocketProvider } from '@context/socket';
import { Toast } from '@components/ui/Toast';
import AppRoutes from '@routes/index';

function App() {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <SocketProvider>
          <BrowserRouter>
            <Toast />
            <AppRoutes />
          </BrowserRouter>
        </SocketProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
