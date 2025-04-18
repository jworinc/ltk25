import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Harness from './Harness';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
        <Link to="/">Home</Link> | <Link to="/harness">Harness</Link>
      </nav>
      <Routes>
        <Route path="/" element={
          <div style={{ padding: '2rem' }}>
            <h1>Vite + React Migration Harness</h1>
            <p>Welcome! Use the navigation above to access the migration harness for testing converted components/services.</p>
          </div>
        } />
        <Route path="/harness" element={<Harness />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
