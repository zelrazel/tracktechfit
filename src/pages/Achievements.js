import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/Achievements.css";

// Import Weight Loss badge images
import badge1kg from '../Weight Loss Badges/First Step Staken.png';
import badge2kg from '../Weight Loss Badges/Shedding Pounds.png';
import badge5kg from '../Weight Loss Badges/Getting Lean.png';
import badge10kg from '../Weight Loss Badges/Transformation Mode.png';
import badge15kg from '../Weight Loss Badges/Peak Physique.png';
import badgeSteady from '../Weight Loss Badges/Steady Cutter.png';

// Import Strength-Based badge images
import rookieBadge from '../Strength-Based Badges/Rookie Lifter.png';
import casualBadge from '../Strength-Based Badges/Casual Beast.png';
import powerBadge from '../Strength-Based Badges/Powerhouse.png';
import eliteBadge from '../Strength-Based Badges/Elite Lifter.png';
import titanBadge from '../Strength-Based Badges/Titan Mode.png';
import maxedBadge from '../Strength-Based Badges/Maxed Out.png';

// Import Consistency badge images
import oneStepBadge from '../Consistency Badges/One step at a time.png';
import streakStarterBadge from '../Consistency Badges/Streak Starter.png';
import grindingHardBadge from '../Consistency Badges/Grinding Hard.png';
import unstoppableBadge from '../Consistency Badges/Unstoppable.png';
import relentlessBadge from '../Consistency Badges/Relentless.png';

// Import Hybrid Ranking badge images
import balancedWarriorBadge from '../Hybrid Badges/Balanced Warrior.png';
import eliteAthleteBadge from '../Hybrid Badges/Elite Athlete.png';
import dominatorBadge from '../Hybrid Badges/Dominator.png';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WeightLossAchievements = () => {
    const [weightHistory, setWeightHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryLoading, setCategoryLoading] = useState({
        weightLoss: true,
        strength: true,
        consistency: true,
        hybrid: true
    });
    const [allAchievements, setAllAchievements] = useState([]);
    const [recentAchievements, setRecentAchievements] = useState([]);
    const [initialWeight, setInitialWeight] = useState(null);
    const [currentWeight, setCurrentWeight] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('weightLoss');
    const [totalWeightLifted, setTotalWeightLifted] = useState(0);
    const [consistencyStreak, setConsistencyStreak] = useState(0);
    const [completedWorkouts, setCompletedWorkouts] = useState([]);

    const fetchData = async () => {
        try {
            setCategoryLoading(prev => ({...prev, weightLoss: true}));
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication required");
                setLoading(false);
                return;
            }

            // Fetch user profile for current weight and initial weight
            const profileResponse = await axios.get(`${API_URL}api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch weight history
            const weightResponse = await axios.get(`${API_URL}api/weight/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const weightData = weightResponse.data;
            setWeightHistory(weightData);
            
            // Get initial weight and current weight from profile
            let startWeight = profileResponse.data.initialWeight;
            let currentWeight = profileResponse.data.weight;
            
            // If initial weight is not set in profile, try to get it from weight history
            if (!startWeight && weightData && weightData.length > 0) {
                const sortedEntries = [...weightData].sort((a, b) => new Date(a.date) - new Date(b.date));
                startWeight = sortedEntries[0].weight;
            }
            
            // If still no initial weight, use current weight
            if (!startWeight) {
                startWeight = currentWeight;
            }
            
            // If we have weight history, use the most recent entry for current weight
            if (weightData && weightData.length > 0) {
                const sortedEntries = [...weightData].sort((a, b) => new Date(a.date) - new Date(b.date));
                const newestEntry = sortedEntries[sortedEntries.length - 1];
                if (newestEntry) {
                    currentWeight = newestEntry.weight;
                }
            }
            
            // Ensure we have valid numbers
            startWeight = Number(startWeight);
            currentWeight = Number(currentWeight);
            
            console.log('Weight Data:', {
                profileInitialWeight: profileResponse.data.initialWeight,
                profileCurrentWeight: profileResponse.data.weight,
                calculatedStartWeight: startWeight,
                calculatedCurrentWeight: currentWeight,
                weightHistoryLength: weightData.length
            });
            
            // Only set states and calculate achievements if we have valid weights
            if (!isNaN(startWeight) && !isNaN(currentWeight)) {
                setInitialWeight(startWeight);
                setCurrentWeight(currentWeight);
                
                // Calculate achievements using initial weight and current weight
                const weightLoss = Math.max(0, startWeight - currentWeight);
                calculateAchievements(startWeight, currentWeight, weightLoss, weightData);
                
                // Debug information
                console.log('Initial Weight:', startWeight);
                console.log('Current Weight:', currentWeight);
                console.log('Weight Loss:', weightLoss);
            } else {
                setError("Invalid weight data");
                console.error("Invalid weight data:", { startWeight, currentWeight });
            }
            
            setCategoryLoading(prev => ({...prev, weightLoss: false}));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError("Failed to load achievements data");
            setCategoryLoading(prev => ({...prev, weightLoss: false}));
            setLoading(false);
        }
    };

    const fetchStrengthData = async () => {
        try {
            setCategoryLoading(prev => ({...prev, strength: true}));
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication required");
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}api/weight/total-lifted`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTotalWeightLifted(response.data.totalWeightLifted || 0);
            calculateStrengthAchievements(response.data.totalWeightLifted || 0);
            setCategoryLoading(prev => ({...prev, strength: false}));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching strength data:', error);
            setError("Failed to load strength achievements");
            setCategoryLoading(prev => ({...prev, strength: false}));
            setLoading(false);
        }
    };

    const fetchCompletedWorkouts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`${API_URL}api/workouts/completed`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCompletedWorkouts(response.data);
            const currentStreak = calculateStreak(response.data);
            setConsistencyStreak(currentStreak);
            calculateConsistencyAchievements(currentStreak);
        } catch (error) {
            console.error('Error fetching completed workouts:', error);
        }
    };

    const fetchHybridData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication required");
                setLoading(false);
                return;
            }
            
            // Get weight lifted data
            const weightResponse = await axios.get(`${API_URL}api/weight/total-lifted`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const totalLiftedWeight = weightResponse.data.totalWeightLifted || 0;
            setTotalWeightLifted(totalLiftedWeight);
            
            // Get completed workouts for streak calculation
            const workoutsResponse = await axios.get(`${API_URL}api/workouts/completed`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Calculate streak
            const streak = calculateStreak(workoutsResponse.data);
            setCompletedWorkouts(workoutsResponse.data);
            setConsistencyStreak(streak);
            
            // Calculate hybrid score (total weight + streak days)
            const hybridScore = totalLiftedWeight + streak;
            
            // Calculate achievements based on score
            calculateHybridAchievements(hybridScore);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching hybrid data:', error);
            setError("Failed to load hybrid achievements");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'weightLoss') {
            fetchData();
        } else if (activeTab === 'strength') {
            fetchStrengthData();
        } else if (activeTab === 'consistency') {
            fetchCompletedWorkouts();
        } else if (activeTab === 'hybrid') {
            fetchHybridData();
        }
    }, [activeTab]);

    // Add an effect to load existing achievement activities once on component mount
    useEffect(() => {
        // Load existing achievement activities from all app sections
        const loadExistingActivities = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                // Fetch activities from the backend to ensure we have complete data
                const response = await axios.get(`${API_URL}api/activity`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data && response.data.length > 0) {
                    // Extract achievement activities
                    const achievementActivities = response.data.filter(
                        activity => activity.activityType === 'achievement'
                    );
                    
                    // Build a map of achievement IDs that already have activities
                    const savedActivities = JSON.parse(localStorage.getItem('achievementActivities') || '{}');
                    
                    // Add any activities from the backend that aren't in localStorage
                    achievementActivities.forEach(activity => {
                        if (activity.content && activity.content.achievementId) {
                            savedActivities[activity.content.achievementId] = true;
                        }
                    });
                    
                    // Update localStorage with complete achievement activity list
                    localStorage.setItem('achievementActivities', JSON.stringify(savedActivities));
                    console.log('Loaded existing achievement activities:', Object.keys(savedActivities).length);
                }
            } catch (error) {
                console.error('Error loading existing activities:', error);
            }
        };
        
        loadExistingActivities();
    }, []);

    const processWeightData = (weightData, profileWeight) => {
        let startWeight = profileWeight;
        let endWeight = profileWeight;
        
        if (weightData.length > 0) {
            const weights = weightData.map(entry => entry.weight);
            const highestWeight = Math.max(...weights);
            const lowestWeight = Math.min(...weights);
            
            if (highestWeight > lowestWeight) {
                startWeight = Math.max(highestWeight, profileWeight);
                endWeight = lowestWeight;
            } else {
                const sortedHistory = [...weightData].sort((a, b) => 
                    new Date(a.date) - new Date(b.date)
                );
                
                if (sortedHistory.length === 1) {
                    if (sortedHistory[0].weight < profileWeight) {
                        startWeight = profileWeight;
                        endWeight = sortedHistory[0].weight;
                    } else {
                        startWeight = sortedHistory[0].weight;
                        endWeight = sortedHistory[0].weight;
                    }
                } else {
                    const firstEntry = sortedHistory[0];
                    const lastEntry = sortedHistory[sortedHistory.length - 1];
                    
                    if (firstEntry.weight > lastEntry.weight) {
                        startWeight = firstEntry.weight;
                        endWeight = lastEntry.weight;
                    } else {
                        startWeight = Math.max(profileWeight, highestWeight);
                        endWeight = Math.min(profileWeight, lowestWeight);
                    }
                }
            }
        }
        
        const weightLoss = Math.max(0, startWeight - endWeight);
        
        setInitialWeight(startWeight);
        setCurrentWeight(endWeight);
        
        calculateAchievements(startWeight, endWeight, weightLoss, weightData);
    };

    const createActivityForAchievement = async (achievement) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Use a shared activities storage across all achievement types
            const savedActivities = JSON.parse(localStorage.getItem('achievementActivities') || '{}');
            if (savedActivities[achievement.id]) {
                console.log(`Activity for achievement ${achievement.title} already exists, skipping creation`);
                return; // Already created activity for this achievement
            }

            // Create activity
            const response = await axios.post(`${API_URL}api/activity/achievement`, {
                achievementId: achievement.id,
                achievementTitle: achievement.title,
                achievementDescription: achievement.description,
                achievementIcon: achievement.badge,
                achievementCategory: achievement.type || 'weightLoss'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                // Mark this achievement as having an activity created in the shared storage
                savedActivities[achievement.id] = true;
                localStorage.setItem('achievementActivities', JSON.stringify(savedActivities));
                
                console.log(`Created activity for achievement: ${achievement.title}`);
            }
        } catch (error) {
            console.error('Error creating activity:', error);
        }
    };

    const calculateAchievements = (startWeight, endWeight, weightLoss, weightData) => {
        // Calculate weight loss from initial weight to current weight
        const totalWeightLoss = startWeight > endWeight ? startWeight - endWeight : 0;
        
        console.log('Achievement Calculation:', {
            startWeight,
            endWeight,
            totalWeightLoss,
            hasWeightHistory: weightData && weightData.length > 0
        });
        
        // Define achievements with proper unlocking logic
        const achievements = [
            {
                id: 1,
                title: "First Step Staken",
                description: "Lose 1kg",
                badge: badge1kg,
                threshold: 1,
                unlocked: totalWeightLoss >= 1,
                unlockDate: totalWeightLoss >= 1 ? new Date() : null,
                type: 'weightLoss'
            },
            {
                id: 2,
                title: "Shedding Pounds",
                description: "Lose 3kg",
                badge: badge2kg,
                threshold: 3, 
                unlocked: totalWeightLoss >= 3,
                unlockDate: totalWeightLoss >= 3 ? new Date() : null,
                type: 'weightLoss'
            },
            {
                id: 5,
                title: "Getting Lean",
                description: "Lose 5kg",
                badge: badge5kg,
                threshold: 5,
                unlocked: totalWeightLoss >= 5,
                unlockDate: totalWeightLoss >= 5 ? new Date() : null,
                type: 'weightLoss'
            },
            {
                id: 10,
                title: "Transformation Mode",
                description: "Lose 10kg",
                badge: badge10kg,
                threshold: 10,
                unlocked: totalWeightLoss >= 10,
                unlockDate: totalWeightLoss >= 10 ? new Date() : null,
                type: 'weightLoss'
            },
            {
                id: 15,
                title: "Peak Physique",
                description: "Lose 15kg",
                badge: badge15kg,
                threshold: 15, 
                unlocked: totalWeightLoss >= 15,
                unlockDate: totalWeightLoss >= 15 ? new Date() : null,
                type: 'weightLoss'
            },
            {
                id: 'steady',
                title: "Steady Cutter",
                description: "Lose weight consistently for 3 months",
                badge: badgeSteady,
                threshold: null,
                unlocked: checkSteadyCutter(weightData),
                unlockDate: checkSteadyCutter(weightData) ? new Date() : null,
                type: 'weightLoss'
            }
        ];

        // Get previously unlocked achievements from the shared activities storage
        const savedActivities = JSON.parse(localStorage.getItem('achievementActivities') || '{}');
        
        // Keep track of achievement unlock status for local state
        const previouslyUnlocked = JSON.parse(localStorage.getItem('previouslyUnlocked') || '{}');
        
        // Check for newly unlocked achievements and create activities
        achievements.forEach(async (achievement) => {
            if (achievement.unlocked && !previouslyUnlocked[achievement.id]) {
                // Create activity only if it doesn't already exist in the shared storage
                if (!savedActivities[achievement.id]) {
                    await createActivityForAchievement(achievement);
                }
                
                // Record that we've unlocked this achievement in the local state
                previouslyUnlocked[achievement.id] = true;
            }
        });
        
        // Save updated unlocked status
        localStorage.setItem('previouslyUnlocked', JSON.stringify(previouslyUnlocked));

        // Update state with all achievements
        setAllAchievements(achievements);
        
        // Set recent achievements to all unlocked achievements
        const unlockedAchievements = achievements.filter(achievement => achievement.unlocked);
        setRecentAchievements(unlockedAchievements);
        
        // Log achievement status
        console.log('Achievement Status:', {
            totalWeightLoss,
            unlockedCount: unlockedAchievements.length,
            unlockedAchievements: unlockedAchievements.map(a => a.title)
        });
    };

    const calculateStrengthAchievements = (totalWeight) => {
        const strengthAchievements = [
            {
                id: 'rookie',
                title: "Rookie Lifter",
                description: "Lift a total of 5,000 kg",
                badge: rookieBadge,
                threshold: 5000,
                unlocked: totalWeight >= 5000,
                unlockDate: totalWeight >= 5000 ? new Date() : null,
                type: 'strength'
            },
            {
                id: 'casual',
                title: "Casual Beast",
                description: "Lift a total of 10,000 kg",
                badge: casualBadge,
                threshold: 10000,
                unlocked: totalWeight >= 10000,
                unlockDate: totalWeight >= 10000 ? new Date() : null,
                type: 'strength'
            },
            {
                id: 'power',
                title: "Powerhouse",
                description: "Lift a total of 50,000 kg",
                badge: powerBadge,
                threshold: 50000,
                unlocked: totalWeight >= 50000,
                unlockDate: totalWeight >= 50000 ? new Date() : null,
                type: 'strength'
            },
            {
                id: 'elite',
                title: "Elite Lifter",
                description: "Lift a total of 100,000 kg",
                badge: eliteBadge,
                threshold: 100000,
                unlocked: totalWeight >= 100000,
                unlockDate: totalWeight >= 100000 ? new Date() : null,
                type: 'strength'
            },
            {
                id: 'titan',
                title: "Titan Mode",
                description: "Lift a total of 250,000 kg",
                badge: titanBadge,
                threshold: 250000,
                unlocked: totalWeight >= 250000,
                unlockDate: totalWeight >= 250000 ? new Date() : null,
                type: 'strength'
            },
            {
                id: 'maxed',
                title: "Maxed Out",
                description: "Lift your body weight in a single rep",
                badge: maxedBadge,
                threshold: null,
                unlocked: false, // This will be implemented in the future
                unlockDate: null,
                type: 'strength'
            }
        ];

        // Get shared activities status
        const savedActivities = JSON.parse(localStorage.getItem('achievementActivities') || '{}');
        
        // Get local achievement unlock status
        const previouslyUnlocked = JSON.parse(localStorage.getItem('previouslyUnlockedStrength') || '{}');
        
        // Check for newly unlocked achievements and create activities
        strengthAchievements.forEach(async (achievement) => {
            if (achievement.unlocked && !previouslyUnlocked[achievement.id]) {
                // Create activity only if it doesn't already exist in the shared storage
                if (!savedActivities[achievement.id]) {
                    await createActivityForAchievement(achievement);
                }
                
                // Record that we've unlocked this achievement
                previouslyUnlocked[achievement.id] = true;
            }
        });
        
        // Save updated unlocked status
        localStorage.setItem('previouslyUnlockedStrength', JSON.stringify(previouslyUnlocked));

        setAllAchievements(strengthAchievements);
        setRecentAchievements(strengthAchievements.filter(achievement => achievement.unlocked));
    };

    const checkSteadyCutter = (sortedHistory) => {
        // Need at least 2 entries spanning 3 months
        if (!sortedHistory || sortedHistory.length < 2) return false;
        
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        // Get entries from the last 3 months
        const recentEntries = sortedHistory.filter(entry => 
            new Date(entry.date) >= threeMonthsAgo
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Need at least 2 entries in the last 3 months
        if (recentEntries.length < 2) return false;
        
        // Check if there's a general downward trend
        const firstEntry = recentEntries[0];
        const lastEntry = recentEntries[recentEntries.length - 1];
        
        // Calculate time difference in days
        const daysDifference = Math.round(
            (new Date(lastEntry.date) - new Date(firstEntry.date)) / (1000 * 60 * 60 * 24)
        );
        
        // Must span at least 30 days and show weight loss
        return daysDifference >= 30 && lastEntry.weight < firstEntry.weight;
    };

    // Modify calculateStreak to properly check consecutive days
    const calculateStreak = (workouts) => {
        if (!workouts || workouts.length === 0) return 0;
        
        // Sort workouts by date in descending order (newest first)
        const sortedWorkouts = [...workouts].sort((a, b) => 
            new Date(b.completedDate) - new Date(a.completedDate)
        );

        let currentStreak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let lastWorkout = new Date(sortedWorkouts[0].completedDate);
        lastWorkout.setHours(0, 0, 0, 0);

        // If the most recent workout is more than a day old, streak is broken
        const daysSinceLastWorkout = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));
        if (daysSinceLastWorkout > 1) return 0;

        // Count consecutive days
        for (let i = 1; i < sortedWorkouts.length; i++) {
            const currentDate = new Date(sortedWorkouts[i - 1].completedDate);
            const prevDate = new Date(sortedWorkouts[i].completedDate);
            currentDate.setHours(0, 0, 0, 0);
            prevDate.setHours(0, 0, 0, 0);

            const dayDifference = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            if (dayDifference === 1) {
                currentStreak++;
            } else {
                break;
            }
        }

        return currentStreak;
    };

    // Update calculateConsistencyAchievements
    const calculateConsistencyAchievements = (streak) => {
        // Clear all achievements if streak is broken
        if (streak === 0) {
            localStorage.removeItem('unlockedConsistencyAchievements');
            localStorage.removeItem('achievementUnlockDates');
        }

        let unlockedAchievementIds = [];
        try {
            const savedAchievements = localStorage.getItem('unlockedConsistencyAchievements');
            if (savedAchievements && streak > 0) {
                unlockedAchievementIds = JSON.parse(savedAchievements);
            }
        } catch (error) {
            console.error('Error loading saved achievements:', error);
        }

        const savedUnlockDates = JSON.parse(localStorage.getItem('achievementUnlockDates') || '{}');
        const previouslyUnlocked = JSON.parse(localStorage.getItem('previouslyUnlockedConsistency') || '{}');

        // Get shared activities status
        const savedActivities = JSON.parse(localStorage.getItem('achievementActivities') || '{}');

        const consistencyAchievements = [
            {
                id: 'oneStep',
                title: "One step at a time",
                description: "Workout 3 days in a row",
                badge: oneStepBadge,
                threshold: 3,
                unlocked: streak >= 3,
                unlockDate: streak >= 3 ? new Date().toISOString() : null,
                type: 'consistency'
            },
            {
                id: 'streakStarter',
                title: "Streak Starter",
                description: "Workout 7 days in a row",
                badge: streakStarterBadge,
                threshold: 7,
                unlocked: streak >= 7,
                unlockDate: streak >= 7 ? new Date().toISOString() : null,
                type: 'consistency'
            },
            {
                id: 'grindingHard',
                title: "Grinding Hard",
                description: "Workout 15 days in a row",
                badge: grindingHardBadge,
                threshold: 15,
                unlocked: streak >= 15,
                unlockDate: streak >= 15 ? new Date().toISOString() : null,
                type: 'consistency'
            },
            {
                id: 'unstoppable',
                title: "Unstoppable",
                description: "Workout 30 days in a row",
                badge: unstoppableBadge,
                threshold: 30,
                unlocked: streak >= 30,
                unlockDate: streak >= 30 ? new Date().toISOString() : null,
                type: 'consistency'
            },
            {
                id: 'relentless',
                title: "Relentless",
                description: "60 day workout streak",
                badge: relentlessBadge,
                threshold: 60,
                unlocked: streak >= 60,
                unlockDate: streak >= 60 ? new Date().toISOString() : null,
                type: 'consistency'
            }
        ];

        // Check for newly unlocked achievements and create activities
        consistencyAchievements.forEach(async (achievement) => {
            if (achievement.unlocked && !previouslyUnlocked[achievement.id]) {
                // Create activity only if it doesn't already exist in the shared storage
                if (!savedActivities[achievement.id]) {
                    await createActivityForAchievement(achievement);
                }
                
                // Record that we've unlocked this achievement
                previouslyUnlocked[achievement.id] = true;
            }
        });
        
        // Save updated unlocked status
        localStorage.setItem('previouslyUnlockedConsistency', JSON.stringify(previouslyUnlocked));

        // Only update localStorage if there are actual achievements
        if (streak > 0) {
            const currentlyUnlocked = consistencyAchievements
                .filter(a => a.unlocked)
                .map(a => a.id);
            
            localStorage.setItem('unlockedConsistencyAchievements', JSON.stringify(currentlyUnlocked));
            
            // Update unlock dates
            const newUnlockDates = { ...savedUnlockDates };
            consistencyAchievements.forEach(achievement => {
                if (achievement.unlocked && !savedUnlockDates[achievement.id]) {
                    newUnlockDates[achievement.id] = new Date().toISOString();
                }
            });
            localStorage.setItem('achievementUnlockDates', JSON.stringify(newUnlockDates));
        }

        setAllAchievements(consistencyAchievements);
        setRecentAchievements(consistencyAchievements.filter(achievement => achievement.unlocked));
    };

    // Update calculateHybridAchievements
    const calculateHybridAchievements = (hybridScore) => {
        const hybridAchievements = [
            {
                id: 'balancedWarrior',
                title: "Balanced Warrior",
                description: "Score 5,000 total points",
                badge: balancedWarriorBadge,
                threshold: 5000,
                unlocked: hybridScore >= 5000,
                unlockDate: hybridScore >= 5000 ? new Date() : null,
                type: 'hybrid',
                score: hybridScore
            },
            {
                id: 'eliteAthlete',
                title: "Elite Athlete",
                description: "Score 10,000 points",
                badge: eliteAthleteBadge,
                threshold: 10000,
                unlocked: hybridScore >= 10000,
                unlockDate: hybridScore >= 10000 ? new Date() : null,
                type: 'hybrid',
                score: hybridScore
            },
            {
                id: 'dominator',
                title: "Dominator",
                description: "Score 25,000 points",
                badge: dominatorBadge,
                threshold: 25000,
                unlocked: hybridScore >= 25000,
                unlockDate: hybridScore >= 25000 ? new Date() : null,
                type: 'hybrid',
                score: hybridScore
            }
        ];
        
        // Get shared activities status
        const savedActivities = JSON.parse(localStorage.getItem('achievementActivities') || '{}');
        
        // Get local achievement unlock status
        const previouslyUnlocked = JSON.parse(localStorage.getItem('previouslyUnlockedHybrid') || '{}');
        
        // Check for newly unlocked achievements and create activities
        hybridAchievements.forEach(async (achievement) => {
            if (achievement.unlocked && !previouslyUnlocked[achievement.id]) {
                // Create activity only if it doesn't already exist in the shared storage
                if (!savedActivities[achievement.id]) {
                    await createActivityForAchievement(achievement);
                }
                
                // Record that we've unlocked this achievement
                previouslyUnlocked[achievement.id] = true;
            }
        });
        
        // Save updated unlocked status
        localStorage.setItem('previouslyUnlockedHybrid', JSON.stringify(previouslyUnlocked));
        
        setAllAchievements(hybridAchievements);
        setRecentAchievements(hybridAchievements.filter(achievement => achievement.unlocked));
    };

    const renderAchievements = () => {
        if (!allAchievements || allAchievements.length === 0) {
            return (
                <div className="wl-no-achievements">
                    <p>Loading achievements...</p>
                    {activeTab === 'weightLoss' ? (
                        <>
                            <p>Initial Weight: {initialWeight} kg</p>
                            <p>Current Weight: {currentWeight} kg</p>
                            <p>Weight Loss: {initialWeight && currentWeight ? Math.max(0, initialWeight - currentWeight) : 0} kg</p>
                        </>
                    ) : activeTab === 'strength' ? (
                        <p>Total Weight Lifted: {totalWeightLifted.toLocaleString()} kg</p>
                    ) : activeTab === 'consistency' ? (
                        <p>Current Streak: {consistencyStreak} days</p>
                    ) : (
                        <p>Hybrid Score: {(totalWeightLifted + consistencyStreak).toLocaleString()} points</p>
                    )}
                </div>
            );
        }

        return (
            <>
                {activeTab === 'weightLoss' ? (
                    <div className="wl-weight-info">
                        <p>Initial Weight: {initialWeight} kg</p>
                        <p>Current Weight: {currentWeight} kg</p>
                        <p>Weight Loss: {initialWeight && currentWeight ? Math.max(0, initialWeight - currentWeight) : 0} kg</p>
                    </div>
                ) : activeTab === 'strength' ? (
                    <div className="wl-weight-info">
                        <p>Total Weight Lifted: {totalWeightLifted.toLocaleString()} kg</p>
                    </div>
                ) : activeTab === 'consistency' ? (
                    <div className="wl-weight-info">
                        <p>Current Streak: {consistencyStreak} days</p>
                    </div>
                ) : (
                    <div className="wl-weight-info">
                        <p>Hybrid Score: {(totalWeightLifted + consistencyStreak).toLocaleString()} points</p>
                        <p>Days Active: {consistencyStreak} days</p>
                    </div>
                )}
                <div className="wl-achievements-list">
                    {allAchievements.map((achievement) => (
                        <div 
                            key={achievement.id} 
                            className={`wl-achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                            data-type={achievement.type || 'weightLoss'}
                        >
                            <div className="wl-badge-wrapper">
                                <img 
                                    src={achievement.badge} 
                                    alt={`${achievement.title} badge`} 
                                    className={`wl-badge-image ${achievement.unlocked ? '' : 'locked-badge'}`}
                                />
                            </div>
                            <div className="wl-achievement-desc">
                                <div className="achievement-title">
                                    {achievement.title}
                                </div>
                                <div className="achievement-requirement">
                                    {achievement.description}
                                    {!achievement.unlocked && (
                                        <span className="locked-progress">
                                            {achievement.threshold ? 
                                                activeTab === 'weightLoss' ?
                                                    ` (${Math.max(0, initialWeight - currentWeight)}/${achievement.threshold}kg)` :
                                                activeTab === 'strength' ?
                                                    ` (${totalWeightLifted.toLocaleString()}/${achievement.threshold.toLocaleString()}kg)` :
                                                activeTab === 'consistency' ?
                                                    ` (${consistencyStreak}/${achievement.threshold} days)` :
                                                    ' (In Progress)' :
                                                ' (In Progress)'}
                                        </span>
                                    )}
                                </div>
                                {achievement.unlocked && (
                                    <div className="achievement-status">
                                        <span className="unlocked-tag">✓ Unlocked!</span>
                                        <span className="unlock-date">
                                            {achievement.unlockDate ? new Date(achievement.unlockDate).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className={`wl-achievements-page ${process.env.NODE_ENV === 'development' ? 'dev-mode' : ''}`}
             data-env={process.env.NODE_ENV}>
            <div className="wl-achievements-outer-container">
                <h2 className="wl-achievements-title">Achievements</h2>
                
                <div className="achievement-type-dropdown">
                    <select 
                        className={`achievement-select ${activeTab === 'hybrid' ? 'hybrid-selected' : ''}`}
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                    >
                        <option value="weightLoss">WEIGHT LOSS</option>
                        <option value="strength">STRENGTH</option>
                        <option value="consistency">CONSISTENCY</option>
                        <option value="hybrid">HYBRID RANKING</option>
                    </select>
                </div>

                {loading ? (
                    <div className="wl-loading-message">Loading achievements...</div>
                ) : error ? (
                    <div className="wl-error-message">{error}</div>
                ) : (
                    <div className="wl-achievements-content">
                        {renderAchievements()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeightLossAchievements;
