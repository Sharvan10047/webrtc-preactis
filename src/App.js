import { Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/home';
import RoomPage from './pages/room';

function App() {
  return (
    <div className="App" text-id="react-router-div">
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/room/:roomId' element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;