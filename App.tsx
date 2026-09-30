import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { AppRoutes } from '@/routes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <PreferencesProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </PreferencesProvider>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
