// Global variables
let currentFoodData = {};
let currentRecommendation = {};

// DOM elements
const dietForm = document.getElementById('dietForm');
const inputSection = document.getElementById('inputSection');
const resultsSection = document.getElementById('resultsSection');
const loadingSpinner = document.getElementById('loadingSpinner');

// Form submission handler
dietForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(dietForm);
    const data = {
        weight: parseFloat(formData.get('weight')),
        height: parseFloat(formData.get('height')),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        activityLevel: formData.get('activityLevel'),
        goal: formData.get('goal')
    };

    // Validate form data
    if (!validateFormData(data)) {
        return;
    }

    // Show loading spinner
    showLoading(true);

    try {
        // Get diet recommendation
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to calculate diet plan');
        }

        const recommendation = await response.json();
        currentRecommendation = recommendation;

        // Load food database
        await loadFoodDatabase();

        // Display results
        displayResults(recommendation);
        
        // Hide loading spinner
        showLoading(false);
        
        // Show results section
        showResultsSection();

    } catch (error) {
        console.error('Error:', error);
        showLoading(false);
        alert('Error calculating diet plan. Please try again.');
    }
});

// Validate form data
function validateFormData(data) {
    if (!data.weight || data.weight <= 0) {
        alert('Please enter a valid weight.');
        return false;
    }
    if (!data.height || data.height <= 0) {
        alert('Please enter a valid height.');
        return false;
    }
    if (!data.age || data.age <= 0) {
        alert('Please enter a valid age.');
        return false;
    }
    if (!data.gender) {
        alert('Please select your gender.');
        return false;
    }
    if (!data.activityLevel) {
        alert('Please select your activity level.');
        return false;
    }
    if (!data.goal) {
        alert('Please select your goal.');
        return false;
    }
    return true;
}

// Load food database
async function loadFoodDatabase() {
    try {
        const response = await fetch('/api/foods');
        if (!response.ok) {
            throw new Error('Failed to load food database');
        }
        currentFoodData = await response.json();
    } catch (error) {
        console.error('Error loading food database:', error);
    }
}

// Display results
function displayResults(recommendation) {
    // Update health metrics
    document.getElementById('bmiValue').textContent = recommendation.bmi;
    document.getElementById('bmrValue').textContent = recommendation.bmr;
    document.getElementById('dailyCalories').textContent = recommendation.dailyCalories;
    
    // Update BMI category
    const bmiCategory = getBMICategory(recommendation.bmi);
    document.getElementById('bmiCategory').textContent = bmiCategory;
    document.getElementById('bmiCategory').className = `metric-category ${getBMICategoryClass(recommendation.bmi)}`;

    // Update macro distribution
    updateMacroDistribution(recommendation.macros);

    // Update diet plan
    updateDietPlan(recommendation.dietPlan);

    // Load initial food database
    displayFoodDatabase('proteins');
}

// Get BMI category
function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

// Get BMI category class for styling
function getBMICategoryClass(bmi) {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
}

// Update macro distribution
function updateMacroDistribution(macros) {
    const totalMacros = macros.protein + macros.carbs + macros.fat;
    
    document.getElementById('proteinAmount').textContent = `${macros.protein}g`;
    document.getElementById('carbsAmount').textContent = `${macros.carbs}g`;
    document.getElementById('fatAmount').textContent = `${macros.fat}g`;

    // Update progress bars
    document.getElementById('proteinBar').style.width = `${(macros.protein / totalMacros) * 100}%`;
    document.getElementById('carbsBar').style.width = `${(macros.carbs / totalMacros) * 100}%`;
    document.getElementById('fatBar').style.width = `${(macros.fat / totalMacros) * 100}%`;
}

// Update diet plan
function updateDietPlan(dietPlan) {
    document.getElementById('dietPlanName').textContent = dietPlan.name;
    document.getElementById('dietPlanDescription').textContent = dietPlan.description;

    // Update meal options
    updateMealOptions('breakfastOptions', dietPlan.meals.breakfast);
    updateMealOptions('lunchOptions', dietPlan.meals.lunch);
    updateMealOptions('dinnerOptions', dietPlan.meals.dinner);
    updateMealOptions('snacksOptions', dietPlan.meals.snacks);
}

// Update meal options
function updateMealOptions(containerId, meals) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    meals.forEach(meal => {
        const mealElement = document.createElement('div');
        mealElement.className = 'meal-option';
        mealElement.innerHTML = `
            <h5>${meal.name}</h5>
            <div class="nutrition-info">
                <span><i class="fas fa-fire"></i> ${meal.calories} cal</span>
                <span><i class="fas fa-drumstick-bite"></i> ${meal.protein}g protein</span>
                <span><i class="fas fa-bread-slice"></i> ${meal.carbs}g carbs</span>
                <span><i class="fas fa-oil-can"></i> ${meal.fat}g fat</span>
            </div>
        `;
        container.appendChild(mealElement);
    });
}

// Display food database
function displayFoodDatabase(category) {
    const foodList = document.getElementById('foodList');
    foodList.innerHTML = '';

    if (!currentFoodData[category]) return;

    currentFoodData[category].forEach(food => {
        const foodElement = document.createElement('div');
        foodElement.className = 'food-item';
        foodElement.innerHTML = `
            <h5>${food.name}</h5>
            <div class="nutrition-details">
                <span>${food.calories} cal</span>
                <span>${food.protein}g protein</span>
                <span>${food.carbs}g carbs</span>
                <span>${food.fat}g fat</span>
            </div>
        `;
        foodList.appendChild(foodElement);
    });
}

// Food tabs functionality
document.addEventListener('DOMContentLoaded', function() {
    const foodTabs = document.querySelectorAll('.food-tab');
    
    foodTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            foodTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Display food database for selected category
            const category = this.getAttribute('data-category');
            displayFoodDatabase(category);
        });
    });
});

// Show/hide sections
function showResultsSection() {
    inputSection.style.display = 'none';
    resultsSection.style.display = 'block';
}

function showInputSection() {
    resultsSection.style.display = 'none';
    inputSection.style.display = 'block';
}

// Show/hide loading spinner
function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
}

// Add CSS for BMI categories
const style = document.createElement('style');
style.textContent = `
    .metric-category.underweight { color: #ffc107; }
    .metric-category.normal { color: #28a745; }
    .metric-category.overweight { color: #fd7e14; }
    .metric-category.obese { color: #dc3545; }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Add some sample data for testing
    console.log('Diet Recommendation System loaded successfully!');
    
    // Add form validation feedback
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value) {
                this.style.borderColor = '#667eea';
            }
        });
    });
}); 