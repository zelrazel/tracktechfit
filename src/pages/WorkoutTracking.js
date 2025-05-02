import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/WeightTracking.css'; // We'll reuse some styles from WeightTracking

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WorkoutTracking = () => {
    const navigate = useNavigate();
    const [workoutWeight, setWorkoutWeight] = useState('');
    const [totalWeightLifted, setTotalWeightLifted] = useState(0);
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWorkoutData();
    }, []);

    const fetchWorkoutData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await axios.get(`${API_URL}api/weight/total-lifted`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTotalWeightLifted(response.data.totalWeightLifted || 0);
            setWorkoutHistory(response.data.workouts || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching workout data:', error);
            setError('Failed to load workout data');
            setLoading(false);
        }
    };

    const handleWorkoutSubmit = async (e) => {
        e.preventDefault();
        try {
            const weight = parseFloat(workoutWeight);
            if (isNaN(weight) || weight <= 0) {
                setError('Please enter a valid weight');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            await axios.post(
                `${API_URL}api/weight/log-workout`,
                { workoutWeight: weight },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setWorkoutWeight('');
            fetchWorkoutData(); // Refresh the data
        } catch (error) {
            console.error('Error logging workout:', error);
            setError('Failed to log workout');
        }
    };

    if (loading) {
        return <div className="loading">Loading workout data...</div>;
    }

    return (
        <div className="weight-tracking-container">
            <div className="weight-tracking-card">
                <h1>Workout Tracking</h1>

                <div className="current-weight-display">
                    <h2>Total Weight Lifted</h2>
                    <div className="weight-value">{totalWeightLifted.toLocaleString()} kg</div>
                </div>

                <form onSubmit={handleWorkoutSubmit} className="weight-input-section">
                    <h3>Log Workout Weight</h3>
                    <div className="weight-input-wrapper">
                        <input
                            type="number"
                            value={workoutWeight}
                            onChange={(e) => setWorkoutWeight(e.target.value)}
                            placeholder="Enter weight lifted (kg)"
                            step="0.5"
                            min="0"
                            className="weight-input"
                        />
                    </div>
                    <button type="submit" className="weight-btn">Log Workout</button>
                </form>

                {error && <div className="error-message">{error}</div>}

                <div className="weight-history">
                    <h2>Workout History</h2>
                    <div className="history-list">
                        {workoutHistory.map((workout) => (
                            <div key={workout._id} className="history-item">
                                <div className="history-info">
                                    <span className="date">
                                        {new Date(workout.date).toLocaleDateString()}
                                    </span>
                                    <span className="weight">{workout.workoutWeight} kg</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutTracking; 