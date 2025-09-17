import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Meal, MealPlan } from '../types';
import { useAuth } from './AuthContext';

interface MealPlanContextType {
    localMealPlan: MealPlan | null;
    allMeals: Meal[];
    addMealToLibrary: (meal: Omit<Meal, 'id' | 'user_id'>) => Promise<void>;
    updateMealInPlan: (day: string, mealType: 'breakfast' | 'lunch' | 'dinner', meal: Meal) => void;
    updateSnackInPlan: (day: string, snackIndex: number, meal: Meal) => void;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

// Helper for a default empty plan
const createDefaultPlan = (): MealPlan => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const defaultMealTimes = { breakfast: "08:00", lunch: "13:00", dinner: "19:00" };
    return days.reduce((acc, day) => {
        acc[day] = {
            breakfast: { name: "", time: defaultMealTimes.breakfast, id: '', servings: 1 },
            lunch: { name: "", time: defaultMealTimes.lunch, id: '', servings: 1 },
            dinner: { name: "", time: defaultMealTimes.dinner, id: '', servings: 1 },
            snacks: [],
        };
        return acc;
    }, {} as MealPlan);
};


export const MealPlanProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [localMealPlan, setLocalMealPlan] = useState<MealPlan | null>(null);
    const [allMeals, setAllMeals] = useState<Meal[]>([]);

    // This useEffect fetches all meal data from Supabase when a user logs in
    useEffect(() => {
        if (user) {
            const fetchMealData = async () => {
                // Fetch the user's library of all meals
                const { data: mealsData, error: mealsError } = await supabase
                    .from('meals')
                    .select('*')
                    .eq('user_id', user.id);
                
                if (mealsError) console.error("Error fetching meals:", mealsError);
                else setAllMeals(mealsData || []);

                // Fetch the user's weekly meal plan
                const { data: planData, error: planError } = await supabase
                    .from('meal_plans')
                    .select('plan_data')
                    .eq('user_id', user.id)
                    .single();
                
                if (planError && planError.code !== 'PGRST116') console.error("Error fetching meal plan:", planError);
                else setLocalMealPlan(planData?.plan_data || createDefaultPlan());
            };
            fetchMealData();
        } else {
            // Clear data on logout
            setLocalMealPlan(null);
            setAllMeals([]);
        }
    }, [user]);

    // This function saves the entire weekly plan to the database
    const saveMealPlan = useCallback(async (plan: MealPlan) => {
        if (!user) return;
        const { error } = await supabase
            .from('meal_plans')
            .upsert({ user_id: user.id, plan_data: plan })
            .eq('user_id', user.id);
        
        if (error) console.error("Error saving meal plan:", error);
    }, [user]);

    // This function adds a new meal to the user's central library
    const addMealToLibrary = async (meal: Omit<Meal, 'id' | 'user_id'>) => {
        if (!user) return;
        const { data, error } = await supabase
            .from('meals')
            .insert({ ...meal, user_id: user.id })
            .select()
            .single();

        if (error) console.error("Error adding meal to library:", error);
        else if (data) setAllMeals(prev => [...prev, data]);
    };

    const updateMealInPlan = (day: string, mealType: 'breakfast' | 'lunch' | 'dinner', meal: Meal) => {
        setLocalMealPlan(plan => {
            if (!plan) return null;
            const newPlan = JSON.parse(JSON.stringify(plan));
            newPlan[day][mealType] = { ...newPlan[day][mealType], name: meal.name, id: meal.id, servings: 1};
            saveMealPlan(newPlan); // Save the updated plan to the database
            return newPlan;
        });
    };

    const updateSnackInPlan = (day: string, snackIndex: number, meal: Meal) => {
        setLocalMealPlan(plan => {
            if (!plan) return null;
            const newPlan = JSON.parse(JSON.stringify(plan));
            if (!newPlan[day].snacks) newPlan[day].snacks = [];
            while(newPlan[day].snacks.length <= snackIndex) {
                newPlan[day].snacks.push({name: "", time: "15:00", servings: 1, id: ''});
            }
            newPlan[day].snacks[snackIndex] = { ...newPlan[day].snacks[snackIndex], name: meal.name, id: meal.id, servings: 1};
            saveMealPlan(newPlan); // Save the updated plan to the database
            return newPlan;
        });
    };

    const value = { 
        localMealPlan,
        allMeals, 
        addMealToLibrary, 
        updateMealInPlan, 
        updateSnackInPlan,
    };

    return (
        <MealPlanContext.Provider value={value}>
            {children}
        </MealPlanContext.Provider>
    );
};

export const useMealPlan = () => {
    const context = useContext(MealPlanContext);
    if (context === undefined) {
        throw new Error('useMealPlan must be used within a MealPlanProvider');
    }
    return context;
};