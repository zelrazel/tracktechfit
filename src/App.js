import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SignOut from './pages/Signout';  
import Workouts from './pages/Workouts';
import MyWorkout from './pages/MyWorkout';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import WorkoutSchedule from './pages/WorkoutSchedule';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import WeightTracking from './pages/WeightTracking';
import Notifications from './pages/Notifications';
import DumbbellTraining from './pages/DumbbellTraining';
import MachineExercises from './pages/MachineExercises';
import BarbellTraining from './pages/BarbellTraining';
import BodyweightFitness from './pages/BodyweightFitness';
import ResetPassword from './pages/ResetPassword';
import MutualFriends from './pages/MutualFriends';
import Header from './components/Header';
import Footer from './components/Footer';

import './styles/App.css'; 

function App() {
  // Add keep-alive mechanism to prevent backend from sleeping
  useEffect(() => {
    const API_URL = process.env.REACT_APP_BACKEND_URL;
    
    // Function to ping the backend to keep it warm
    const keepAlive = () => {
      axios.get(`${API_URL}health`)
        .catch(err => console.log("Keep-alive ping error (can be ignored)"));
    };
    
    // Initial ping when app loads
    keepAlive();
    
    // Set up interval for regular pings (every 4 minutes)
    const interval = setInterval(keepAlive, 240000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signout" element={<SignOut />} />  {}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/my-workout" element={<MyWorkout />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/schedule" element={<WorkoutSchedule />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:email" element={<Profile />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/weight-tracking" element={<WeightTracking />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/dumbbell-training" element={<DumbbellTraining />} />
        <Route path="/machine-exercises" element={<MachineExercises />} />
        <Route path="/barbell-training" element={<BarbellTraining />} />
        <Route path="/bodyweight-fitness" element={<BodyweightFitness />} />
        <Route path="/mutual-friends/:email" element={<MutualFriends />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
