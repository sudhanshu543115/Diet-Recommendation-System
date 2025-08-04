const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Diet recommendation data
const dietData = {
  weightLoss: {
    name: "Weight Loss Diet",
    description: "A balanced diet focused on calorie deficit and healthy eating habits",
    dailyCalories: 1500,
    meals: {
      breakfast: [
        { name: "Oatmeal with berries", calories: 250, protein: 8, carbs: 45, fat: 5 },
        { name: "Greek yogurt with nuts", calories: 200, protein: 15, carbs: 20, fat: 8 },
        { name: "Egg white omelette", calories: 180, protein: 20, carbs: 5, fat: 8 }
      ],
      lunch: [
        { name: "Grilled chicken salad", calories: 300, protein: 25, carbs: 15, fat: 12 },
        { name: "Quinoa bowl with vegetables", calories: 280, protein: 12, carbs: 45, fat: 6 },
        { name: "Tuna sandwich on whole grain", calories: 320, protein: 22, carbs: 35, fat: 10 }
      ],
      dinner: [
        { name: "Salmon with steamed vegetables", calories: 350, protein: 30, carbs: 20, fat: 15 },
        { name: "Lean beef stir-fry", calories: 320, protein: 28, carbs: 25, fat: 12 },
        { name: "Vegetarian lentil curry", calories: 290, protein: 15, carbs: 50, fat: 8 }
      ],
      snacks: [
        { name: "Apple with almond butter", calories: 150, protein: 4, carbs: 25, fat: 8 },
        { name: "Carrot sticks with hummus", calories: 120, protein: 3, carbs: 18, fat: 6 },
        { name: "Greek yogurt", calories: 100, protein: 12, carbs: 8, fat: 2 }
      ]
    }
  },
  muscleGain: {
    name: "Muscle Gain Diet",
    description: "High protein diet designed for muscle building and strength training",
    dailyCalories: 2500,
    meals: {
      breakfast: [
        { name: "Protein smoothie with banana", calories: 400, protein: 25, carbs: 60, fat: 8 },
        { name: "Eggs with whole grain toast", calories: 350, protein: 20, carbs: 35, fat: 15 },
        { name: "Protein pancakes", calories: 380, protein: 22, carbs: 45, fat: 12 }
      ],
      lunch: [
        { name: "Chicken rice bowl", calories: 500, protein: 35, carbs: 65, fat: 15 },
        { name: "Turkey sandwich with avocado", calories: 450, protein: 28, carbs: 40, fat: 20 },
        { name: "Protein pasta with meatballs", calories: 480, protein: 32, carbs: 55, fat: 18 }
      ],
      dinner: [
        { name: "Steak with sweet potato", calories: 550, protein: 40, carbs: 45, fat: 25 },
        { name: "Salmon with quinoa", calories: 520, protein: 35, carbs: 50, fat: 22 },
        { name: "Chicken stir-fry with rice", calories: 480, protein: 30, carbs: 60, fat: 18 }
      ],
      snacks: [
        { name: "Protein bar", calories: 200, protein: 20, carbs: 25, fat: 8 },
        { name: "Nuts and dried fruits", calories: 180, protein: 6, carbs: 20, fat: 12 },
        { name: "Greek yogurt with granola", calories: 220, protein: 15, carbs: 30, fat: 8 }
      ]
    }
  },
  maintenance: {
    name: "Maintenance Diet",
    description: "Balanced diet for maintaining current weight and overall health",
    dailyCalories: 2000,
    meals: {
      breakfast: [
        { name: "Whole grain cereal with milk", calories: 300, protein: 12, carbs: 50, fat: 8 },
        { name: "Avocado toast", calories: 280, protein: 10, carbs: 35, fat: 15 },
        { name: "Smoothie bowl", calories: 320, protein: 15, carbs: 45, fat: 12 }
      ],
      lunch: [
        { name: "Mediterranean salad", calories: 350, protein: 18, carbs: 30, fat: 20 },
        { name: "Grilled cheese with soup", calories: 380, protein: 15, carbs: 40, fat: 18 },
        { name: "Pasta primavera", calories: 360, protein: 12, carbs: 55, fat: 12 }
      ],
      dinner: [
        { name: "Baked chicken with vegetables", calories: 400, protein: 30, carbs: 35, fat: 18 },
        { name: "Fish tacos", calories: 380, protein: 25, carbs: 40, fat: 16 },
        { name: "Vegetarian lasagna", calories: 420, protein: 18, carbs: 50, fat: 20 }
      ],
      snacks: [
        { name: "Mixed nuts", calories: 160, protein: 6, carbs: 8, fat: 15 },
        { name: "Fruit with yogurt", calories: 140, protein: 8, carbs: 25, fat: 4 },
        { name: "Popcorn", calories: 120, protein: 3, carbs: 20, fat: 5 }
      ]
    }
  }
};

// Calculate BMI
function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// Calculate BMR using Mifflin-St Jeor Equation
function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

// Calculate daily calorie needs
function calculateDailyCalories(bmr, activityLevel) {
  const activityMultipliers = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    extremelyActive: 1.9
  };
  return Math.round(bmr * activityMultipliers[activityLevel]);
}

// API Routes
app.get('/api/diets', (req, res) => {
  res.json(dietData);
});

app.post('/api/calculate', (req, res) => {
  const { weight, height, age, gender, activityLevel, goal } = req.body;
  
  if (!weight || !height || !age || !gender || !activityLevel || !goal) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, gender);
  const dailyCalories = calculateDailyCalories(bmr, activityLevel);
  
  let recommendedCalories = dailyCalories;
  let dietType = 'maintenance';
  
  if (goal === 'weightLoss') {
    recommendedCalories = dailyCalories - 500; // 500 calorie deficit
    dietType = 'weightLoss';
  } else if (goal === 'muscleGain') {
    recommendedCalories = dailyCalories + 300; // 300 calorie surplus
    dietType = 'muscleGain';
  }

  const recommendation = {
    bmi: parseFloat(bmi),
    bmr: Math.round(bmr),
    dailyCalories: recommendedCalories,
    dietPlan: dietData[dietType],
    macros: {
      protein: Math.round(recommendedCalories * 0.25 / 4), // 25% of calories from protein
      carbs: Math.round(recommendedCalories * 0.45 / 4),   // 45% of calories from carbs
      fat: Math.round(recommendedCalories * 0.30 / 9)      // 30% of calories from fat
    }
  };

  res.json(recommendation);
});

app.get('/api/foods', (req, res) => {
  const foodDatabase = {
    proteins: [
      { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      { name: "Salmon", calories: 208, protein: 25, carbs: 0, fat: 12 },
      { name: "Eggs", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      { name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
      { name: "Tuna", calories: 144, protein: 30, carbs: 0, fat: 1 },
      { name: "Lean Beef", calories: 250, protein: 26, carbs: 0, fat: 15 }
    ],
    carbs: [
      { name: "Brown Rice", calories: 216, protein: 4.5, carbs: 45, fat: 1.8 },
      { name: "Quinoa", calories: 222, protein: 8, carbs: 39, fat: 3.6 },
      { name: "Sweet Potato", calories: 103, protein: 2, carbs: 24, fat: 0.2 },
      { name: "Oats", calories: 307, protein: 13, carbs: 55, fat: 5.3 },
      { name: "Whole Grain Bread", calories: 247, protein: 13, carbs: 41, fat: 4.2 },
      { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 }
    ],
    fats: [
      { name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15 },
      { name: "Almonds", calories: 164, protein: 6, carbs: 6, fat: 14 },
      { name: "Olive Oil", calories: 119, protein: 0, carbs: 0, fat: 14 },
      { name: "Peanut Butter", calories: 188, protein: 8, carbs: 6, fat: 16 },
      { name: "Chia Seeds", calories: 138, protein: 4.7, carbs: 12, fat: 8.7 },
      { name: "Coconut Oil", calories: 121, protein: 0, carbs: 0, fat: 14 }
    ]
  };
  
  res.json(foodDatabase);
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 