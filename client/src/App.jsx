import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Room from './pages/Room';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: 'var(--accent-success)',
                secondary: 'var(--bg-card)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--accent-danger)',
                secondary: 'var(--bg-card)',
              },
            },
          }}
        />
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
