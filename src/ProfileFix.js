import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaTimes, FaCamera } from 'react-icons/fa';

const ProfileFix = () => {
    const [isOwnProfile, setIsOwnProfile] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [profileEmail, setProfileEmail] = useState('');
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [userActivities, setUserActivities] = useState([]);
    const [achievementsLoading, setAchievementsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser(tokenPayload);
            
            if (profileEmail && tokenPayload.email !== profileEmail) {
                setIsOwnProfile(false);
            } else {
                setIsOwnProfile(true);
            }
        }
    }, [profileEmail]);

    const fetchUserActivities = useCallback(async () => {
        try {
            console.log("Starting to fetch user activities");
            setActivitiesLoading(true);
            
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("No token found, aborting fetchUserActivities");
                return;
            }
            
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = tokenPayload.userId;
            
            const targetEmail = profileEmail && !isOwnProfile ? profileEmail : undefined;
            const queryParam = targetEmail ? `?email=${targetEmail}` : '';
            
            console.log("Making API request to fetch activities");
            const response = await axios.get(`${API_URL}api/activity${queryParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const activitiesData = response.data.activities || response.data;
            
            console.log("User activities received:", activitiesData ? activitiesData.length : 0);
            
            if (!activitiesData || !Array.isArray(activitiesData)) {
                console.error("Invalid activities data received:", response.data);
                setActivitiesLoading(false);
                return;
            }
            
            const activitiesWithUserReactions = activitiesData.map(activity => {
                const userReactions = [];
                
                if (activity.reactions && Array.isArray(activity.reactions)) {
                    for (const reaction of activity.reactions) {
                        if (reaction.userId && reaction.userId._id && reaction.userId._id.toString() === currentUserId) {
                            userReactions.push(reaction.reactionType);
                        }
                    }
                }
                
                return {
                    ...activity,
                    userReactions
                };
            });
            
            setUserActivities(activitiesWithUserReactions);
            setActivitiesLoading(false);
        } catch (error) {
            console.error('Error fetching activities:', error);
            if (error.response) {
                console.error('Server response:', error.response.status, error.response.data);
            }
            setActivitiesLoading(false);
        }
    }, [profileEmail, isOwnProfile]);

    const fetchAchievements = useCallback(async () => {
        try {
            setAchievementsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const targetEmail = profileEmail && !isOwnProfile ? profileEmail : undefined;
            const queryParam = targetEmail ? `?email=${targetEmail}` : '';
            
            const weightResponse = await axios.get(`${API_URL}api/weight/history${queryParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const profileEndpoint = profileEmail && !isOwnProfile
                ? `${API_URL}api/profile/${profileEmail}`
                : `${API_URL}api/profile`;
            
            const profileResponse = await axios.get(profileEndpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const strengthResponse = await axios.get(`${API_URL}api/weight/total-lifted${queryParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const workoutResponse = await axios.get(`${API_URL}api/workout/completed${queryParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
        } catch (error) {
            console.error('Error fetching achievements:', error);
            setAchievementsLoading(false);
        }
    }, [profileEmail, isOwnProfile]);

    return (
        <div>
            {/* Render your component content here */}
        </div>
    );
};

export default ProfileFix; 