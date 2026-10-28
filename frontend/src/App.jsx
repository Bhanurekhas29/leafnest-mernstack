import { Routes, Route } from 'react-router-dom';
import Landing from './site/Landing.jsx';
import AdminApp from './admin/AdminApp.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}
