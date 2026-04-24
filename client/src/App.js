import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import Launch from './pages/Launch';
import TokenPage from './pages/TokenPage';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/launch" element={<Launch />} />
      <Route path="/token/:address" element={<TokenPage />} />
      <Route path="/profile/:address" element={<Profile />} />
    </Routes>
  );
}

export default App;