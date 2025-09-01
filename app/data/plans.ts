// --- INTERFACES ---
export interface Exercise {
  id: string;
  name: string;
  sets: { reps: number | string; weight: string; completed: boolean }[];
  notes?: string;
}

export interface Workout {
  title: string;
  exercises: Exercise[];
}

export interface WeeklyPlan {
    [key: string]: Workout | null;
}

// --- DYNAMIC DETAIL GENERATOR ---
const generatePlanDetails = (basePlan: { phase1Description: string, phase2Description: string }, weeks: number) => {
  return {
    phase1: `Weeks 1-${Math.floor(weeks / 2)}: ${basePlan.phase1Description}`,
    phase2: `Weeks ${Math.floor(weeks / 2) + 1}-${weeks}: ${basePlan.phase2Description}`,
  };
};

// --- BEGINNER FITNESS START PLAN (Used as the initial default) ---
export const initialWeeklyPlan: WeeklyPlan = {
  Monday: { title: "Full Body Workout A", exercises: [ 
      { id: 'ex1', name: 'Goblet Squats', sets: [{ reps: 12, weight: 'Light', completed: false }, { reps: 12, weight: 'Light', completed: false }, { reps: 12, weight: 'Light', completed: false }] },
      { id: 'ex2', name: 'Push-ups (on knees if needed)', sets: [{ reps: 'AMRAP', weight: 'Bodyweight', completed: false }, { reps: 'AMRAP', weight: 'Bodyweight', completed: false }] },
      { id: 'ex3', name: 'Dumbbell Rows', sets: [{ reps: 12, weight: 'Light', completed: false }, { reps: 12, weight: 'Light', completed: false }, { reps: 12, weight: 'Light', completed: false }] },
      { id: 'ex4', name: 'Plank', sets: [{ reps: 1, weight: '30s Hold', completed: false }, { reps: 1, weight: '30s Hold', completed: false }] },
      { id: 'ex5', name: 'Glute Bridges', sets: [{ reps: 15, weight: 'Bodyweight', completed: false }, { reps: 15, weight: 'Bodyweight', completed: false }] },
  ] },
  Tuesday: null,
  Wednesday: { title: "Full Body Workout B", exercises: [ 
      { id: 'ex6', name: 'Lunges', sets: [{ reps: 10, weight: 'Bodyweight', completed: false }, { reps: 10, weight: 'Bodyweight', completed: false }, { reps: 10, weight: 'Bodyweight', completed: false }] },
      { id: 'ex7', name: 'Overhead Press (Dumbbell)', sets: [{ reps: 10, weight: 'Light', completed: false }, { reps: 10, weight: 'Light', completed: false }, { reps: 10, weight: 'Light', completed: false }] },
      { id: 'ex8', name: 'Lat Pulldowns', sets: [{ reps: 12, weight: 'Light', completed: false }, { reps: 12, weight: 'Light', completed: false }, { reps: 12, weight: 'Light', completed: false }] },
      { id: 'ex9', name: 'Leg Curls (Machine)', sets: [{ reps: 15, weight: 'Light', completed: false }, { reps: 15, weight: 'Light', completed: false }] },
      { id: 'ex10', name: 'Bicep Curls', sets: [{ reps: 12, weight: 'Light', completed: false }, { reps: 12, weight: 'Light', completed: false }] },
  ] },
  Thursday: null,
  Friday: { title: "Full Body Workout C", exercises: [ 
      { id: 'ex11', name: 'Romanian Deadlifts (Dumbbell)', sets: [{ reps: 15, weight: 'Light', completed: false }, { reps: 15, weight: 'Light', completed: false }, { reps: 15, weight: 'Light', completed: false }] },
      { id: 'ex12', name: 'Dumbbell Bench Press', sets: [{ reps: 12, weight: 'Light', completed: false }, { reps: 12, weight: 'Light', completed: false }, { reps: 12, weight: 'Light', completed: false }] },
      { id: 'ex13', name: 'Face Pulls', sets: [{ reps: 15, weight: 'Light', completed: false }, { reps: 15, weight: 'Light', completed: false }] },
      { id: 'ex14', name: 'Leg Press', sets: [{ reps: 15, weight: 'Moderate', completed: false }, { reps: 15, weight: 'Moderate', completed: false }] },
      { id: 'ex15', name: 'Hanging Knee Raises', sets: [{ reps: 15, weight: 'Bodyweight', completed: false }, { reps: 15, weight: 'Bodyweight', completed: false }] },
  ] },
  Saturday: null,
  Sunday: null,
};


// --- FULL LIBRARY OF DEFAULT PLANS ---
export const defaultPlans = [
  { 
    id: 'plan_beginner', 
    name: 'Beginner Fitness Start', 
    goal: 'Build consistency and foundational strength.', 
    icon: 'school-outline', 
    minWeeks: 6, 
    maxWeeks: 12,
    generateDetails: (weeks: number) => generatePlanDetails({
      phase1Description: 'Focus on mastering form with 3 full-body workouts per week. Keep weights light and focus on controlled movements.',
      phase2Description: 'Begin to gradually increase weight or reps each week to introduce progressive overload.',
    }, weeks),
    weeklyMap: initialWeeklyPlan
  },
  { 
    id: 'plan_loss', 
    name: 'Weight Loss & Conditioning', 
    goal: 'Calorie deficit and full-body conditioning.', 
    icon: 'flame-outline', 
    minWeeks: 8, 
    maxWeeks: 16,
    generateDetails: (weeks: number) => generatePlanDetails({
      phase1Description: 'Build a metabolic base with full-body strength 2x/week and cardio 3x/week.',
      phase2Description: 'Increase intensity with HIIT sessions. Strength training focuses on major compound movements.',
    }, weeks),
    weeklyMap: {
      Monday: { title: "Full Body Strength A", exercises: [
          { id: 'wlex1', name: 'Goblet Squats', sets: [{ reps: 12, weight: 'Challenging', completed: false }, { reps: 12, weight: 'Challenging', completed: false }, { reps: 12, weight: 'Challenging', completed: false }] },
          { id: 'wlex2', name: 'Push-ups', sets: [{ reps: 'AMRAP', weight: 'Bodyweight', completed: false }, { reps: 'AMRAP', weight: 'Bodyweight', completed: false }, { reps: 'AMRAP', weight: 'Bodyweight', completed: false }] },
          { id: 'wlex3', name: 'Dumbbell Rows', sets: [{ reps: 12, weight: 'Challenging', completed: false }, { reps: 12, weight: 'Challenging', completed: false }, { reps: 12, weight: 'Challenging', completed: false }] },
          { id: 'wlex4', name: 'Overhead Press', sets: [{ reps: 10, weight: 'Moderate', completed: false }, { reps: 10, weight: 'Moderate', completed: false }, { reps: 10, weight: 'Moderate', completed: false }] },
          { id: 'wlex5', name: 'Plank', sets: [{ reps: 1, weight: '60s Hold', completed: false }, { reps: 1, weight: '60s Hold', completed: false }] },
          { id: 'wlex6', name: 'Bicep Curls', sets: [{ reps: 15, weight: 'Moderate', completed: false }, { reps: 15, weight: 'Moderate', completed: false }] },
      ] },
      Tuesday: { title: "LISS Cardio", exercises: [{ id: 'wlex7', name: 'Incline Treadmill Walk', sets: [{ reps: 1, weight: '45min', completed: false }] }] },
      Wednesday: { title: "Full Body Strength B", exercises: [
          { id: 'wlex8', name: 'Romanian Deadlifts', sets: [{ reps: 15, weight: 'Moderate', completed: false }, { reps: 15, weight: 'Moderate', completed: false }, { reps: 15, weight: 'Moderate', completed: false }] },
          { id: 'wlex9', name: 'Lat Pulldowns', sets: [{ reps: 12, weight: 'Challenging', completed: false }, { reps: 12, weight: 'Challenging', completed: false }, { reps: 12, weight: 'Challenging', completed: false }] },
          { id: 'wlex10', name: 'Leg Press', sets: [{ reps: 15, weight: 'Challenging', completed: false }, { reps: 15, weight: 'Challenging', completed: false }, { reps: 15, weight: 'Challenging', completed: false }] },
          { id: 'wlex11', name: 'Dumbbell Bench Press', sets: [{ reps: 12, weight: 'Moderate', completed: false }, { reps: 12, weight: 'Moderate', completed: false }, { reps: 12, weight: 'Moderate', completed: false }] },
          { id: 'wlex12', name: 'Face Pulls', sets: [{ reps: 20, weight: 'Light', completed: false }, { reps: 20, weight: 'Light', completed: false }] },
          { id: 'wlex13', name: 'Hanging Knee Raises', sets: [{ reps: 'AMRAP', weight: 'Bodyweight', completed: false }, { reps: 'AMRAP', weight: 'Bodyweight', completed: false }] },
      ] },
      Thursday: null,
      Friday: { title: "HIIT Cardio", exercises: [{ id: 'wlex14', name: 'Kettlebell Swings', sets: [{ reps: 1, weight: '45s on, 15s off', completed: false }, { reps: 1, weight: 'x15 rounds', completed: false }] }] },
      Saturday: { title: "Active Recovery", exercises: [{ id: 'wlex15', name: 'Walk & Stretch', sets: [{ reps: 1, weight: '30-45min', completed: false }] }] },
      Sunday: null,
    }
  },
  { 
    id: 'plan_gain', 
    name: 'Muscle Gain Foundation', 
    goal: 'Progressive overload with compound lifts.', 
    icon: 'barbell-outline', 
    minWeeks: 12, 
    maxWeeks: 24,
    generateDetails: (weeks: number) => generatePlanDetails({
      phase1Description: 'Hypertrophy focus with a 4x/week Upper/Lower split. Rep range is 8-12.',
      phase2Description: 'Strength focus with lower reps (5-8) on compound lifts. Introduce drop sets and supersets.',
    }, weeks),
    weeklyMap: {
      Monday: { title: "Upper Body Hypertrophy", exercises: [
          { id: 'mgex1', name: 'Bench Press', sets: [{ reps: 10, weight: 'Challenging', completed: false }, { reps: 10, weight: 'Challenging', completed: false }, { reps: 10, weight: 'Challenging', completed: false }] },
          { id: 'mgex2', name: 'Bent Over Rows', sets: [{ reps: 10, weight: 'Challenging', completed: false }, { reps: 10, weight: 'Challenging', completed: false }, { reps: 10, weight: 'Challenging', completed: false }] },
          { id: 'mgex3', name: 'Incline Dumbbell Press', sets: [{ reps: 12, weight: 'Moderate', completed: false }, { reps: 12, weight: 'Moderate', completed: false }, { reps: 12, weight: 'Moderate', completed: false }] },
          { id: 'mgex4', name: 'Lat Pulldowns', sets: [{ reps: 12, weight: 'Moderate', completed: false }, { reps: 12, weight: 'Moderate', completed: false }, { reps: 12, weight: 'Moderate', completed: false }] },
          { id: 'mgex5', name: 'Lateral Raises', sets: [{ reps: 15, weight: 'Light', completed: false }, { reps: 15, weight: 'Light', completed: false }, { reps: 15, weight: 'Light', completed: false }] },
          { id: 'mgex6', name: 'Tricep Pushdowns', sets: [{ reps: 15, weight: 'Moderate', completed: false }, { reps: 15, weight: 'Moderate', completed: false }] },
      ] },
      Tuesday: { title: "Lower Body Hypertrophy", exercises: [
          { id: 'mgex7', name: 'Barbell Squats', sets: [{ reps: 12, weight: 'Challenging', completed: false }, { reps: 12, weight: 'Challenging', completed: false }, { reps: 12, weight: 'Challenging', completed: false }] },
          { id: 'mgex8', name: 'Leg Press', sets: [{ reps: 15, weight: 'Challenging', completed: false }, { reps: 15, weight: 'Challenging', completed: false }, { reps: 15, weight: 'Challenging', completed: false }] },
          { id: 'mgex9', name: 'Romanian Deadlifts', sets: [{ reps: 12, weight: 'Moderate', completed: false }, { reps: 12, weight: 'Moderate', completed: false }, { reps: 12, weight: 'Moderate', completed: false }] },
          { id: 'mgex10', name: 'Leg Curls', sets: [{ reps: 15, weight: 'Moderate', completed: false }, { reps: 15, weight: 'Moderate', completed: false }, { reps: 15, weight: 'Moderate', completed: false }] },
          { id: 'mgex11', name: 'Leg Extensions', sets: [{ reps: 20, weight: 'Light', completed: false }, { reps: 20, weight: 'Light', completed: false }] },
          { id: 'mgex12', name: 'Calf Raises', sets: [{ reps: 20, weight: 'Heavy', completed: false }, { reps: 20, weight: 'Heavy', completed: false }, { reps: 20, weight: 'Heavy', completed: false }] },
      ] },
      Wednesday: null,
      Thursday: { title: "Upper Body Power", exercises: [
          { id: 'mgex13', name: 'Overhead Press', sets: [{ reps: 8, weight: 'Heavy', completed: false }, { reps: 8, weight: 'Heavy', completed: false }, { reps: 8, weight: 'Heavy', completed: false }] },
          { id: 'mgex14', name: 'Weighted Pull-ups', sets: [{ reps: 8, weight: 'Bodyweight+', completed: false }, { reps: 8, weight: 'Bodyweight+', completed: false }, { reps: 8, weight: 'Bodyweight+', completed: false }] },
          { id: 'mgex15', name: 'Dumbbell Bench Press', sets: [{ reps: 8, weight: 'Heavy', completed: false }, { reps: 8, weight: 'Heavy', completed: false }, { reps: 8, weight: 'Heavy', completed: false }] },
          { id: 'mgex16', name: 'T-Bar Rows', sets: [{ reps: 8, weight: 'Heavy', completed: false }, { reps: 8, weight: 'Heavy', completed: false }, { reps: 8, weight: 'Heavy', completed: false }] },
          { id: 'mgex17', name: 'Shrugs', sets: [{ reps: 15, weight: 'Heavy', completed: false }, { reps: 15, weight: 'Heavy', completed: false }] },
          { id: 'mgex18', name: 'Bicep Curls', sets: [{ reps: 10, weight: 'Heavy', completed: false }, { reps: 10, weight: 'Heavy', completed: false }, { reps: 10, weight: 'Heavy', completed: false }] },
      ] },
      Friday: { title: "Lower Body Power", exercises: [
          { id: 'mgex19', name: 'Deadlifts', sets: [{ reps: 5, weight: 'Heavy', completed: false }, { reps: 5, weight: 'Heavy', completed: false }, { reps: 5, weight: 'Heavy', completed: false }] },
          { id: 'mgex20', name: 'Front Squats', sets: [{ reps: 8, weight: 'Heavy', completed: false }, { reps: 8, weight: 'Heavy', completed: false }, { reps: 8, weight: 'Heavy', completed: false }] },
          { id: 'mgex21', name: 'Walking Lunges', sets: [{ reps: 20, weight: 'Moderate', completed: false }, { reps: 20, weight: 'Moderate', completed: false }] },
          { id: 'mgex22', name: 'Glute Ham Raises', sets: [{ reps: 10, weight: 'Bodyweight', completed: false }, { reps: 10, weight: 'Bodyweight', completed: false }] },
          { id: 'mgex23', name: 'Seated Calf Raises', sets: [{ reps: 15, weight: 'Heavy', completed: false }, { reps: 15, weight: 'Heavy', completed: false }, { reps: 15, weight: 'Heavy', completed: false }] },
          { id: 'mgex24', name: 'Ab Wheel Rollouts', sets: [{ reps: 15, weight: 'Bodyweight', completed: false }, { reps: 15, weight: 'Bodyweight', completed: false }] },
      ] },
      Saturday: null,
      Sunday: null,
    }
  },
];