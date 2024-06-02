// Recipes array to hold recipe objects
let recipes = [];

// Selecting DOM elements
const recipeList = document.getElementById("recipe-list");
const recipeDetails = document.getElementById("recipe-details");
const addRecipeForm = document.getElementById("add-recipe-form");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");

// Function to render recipes
function renderRecipes() {
  // Clear previous list
  recipeList.innerHTML = "";

  // Check if recipes array is empty
  if (recipes.length === 0) {
    recipeList.innerHTML = "<li>No recipes found.</li>";
    return;
  }

  // Sort recipes based on selected option
  const sortBy = sortSelect.value;
  let sortedRecipes = [...recipes];
  if (sortBy === "title") {
    sortedRecipes.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "date") {
    sortedRecipes.sort((a, b) => b.id - a.id); // Assuming higher id means more recent
  }

  // Filter recipes based on search input
  const searchValue = searchInput.value.trim().toLowerCase();
  sortedRecipes = sortedRecipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchValue) ||
      recipe.ingredients.toLowerCase().includes(searchValue)
  );

  // Create recipe list items
  sortedRecipes.forEach((recipe) => {
    const li = document.createElement("li");
    li.textContent = recipe.title;
    li.addEventListener("click", () => showRecipeDetails(recipe.id));
    recipeList.appendChild(li);
  });
}

// Function to show recipe details
async function showRecipeDetails(recipeId) {
  const recipe = recipes.find((r) => r.id === recipeId);
  if (!recipe) return;

  // Fetch additional details from TheMealDB API
  const details = await fetchRecipeDetails(recipe.title);
  const detailsHTML = `
        <h3>${recipe.title}</h3>
        <img src="${details.strMealThumb}" alt="${
    recipe.title
  }" style="max-width: 100%;">
        <p><strong>Category:</strong> ${details.strCategory}</p>
        <p><strong>Area:</strong> ${details.strArea}</p>
        <p><strong>Ingredients:</strong><br>${recipe.ingredients}</p>
        <p><strong>Steps:</strong><br>${recipe.steps}</p>
        <p><strong>Tags:</strong> ${recipe.tags}</p>
        <button onclick="toggleFavorite(${recipe.id})">
            ${recipe.favorite ? "Unfavorite" : "Favorite"}
        </button>
        <button onclick="deleteRecipe(${recipe.id})">Delete</button>
    `;
  recipeDetails.innerHTML = detailsHTML;
}

// Function to fetch recipe details from TheMealDB API
async function fetchRecipeDetails(recipeTitle) {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${recipeTitle}`
  );
  const data = await response.json();
  return data.meals[0]; // Assuming the first result is the correct one
}

// Function to add a new recipe
function addRecipe(title, ingredients, steps, tags) {
  const newRecipe = {
    id: recipes.length + 1,
    title,
    ingredients,
    steps,
    tags,
    favorite: false,
  };
  recipes.push(newRecipe);
  renderRecipes();
  saveRecipes();
}

// Function to delete a recipe
function deleteRecipe(recipeId) {
  if (confirm("Are you sure you want to delete this recipe?")) {
    recipes = recipes.filter((recipe) => recipe.id !== recipeId);
    renderRecipes();
    recipeDetails.innerHTML = "";
    saveRecipes();
  }
}

// Function to toggle favorite status
function toggleFavorite(recipeId) {
  const recipe = recipes.find((r) => r.id === recipeId);
  if (recipe) {
    recipe.favorite = !recipe.favorite;
    renderRecipes();
    showRecipeDetails(recipeId);
    saveRecipes();
  }
}

// Event listener for form submission
addRecipeForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const title = this.title.value.trim();
  const ingredients = this.ingredients.value.trim();
  const steps = this.steps.value.trim();
  const tags = this.tags.value.trim();

  if (!title || !ingredients || !steps) {
    alert("Please fill in all fields.");
    return;
  }

  addRecipe(title, ingredients, steps, tags);
  this.reset();
});

// Event listener for search input
searchInput.addEventListener("input", function () {
  renderRecipes();
});

// Event listener for sort select
sortSelect.addEventListener("change", function () {
  renderRecipes();
});

// Function to save recipes to local storage
function saveRecipes() {
  localStorage.setItem("recipes", JSON.stringify(recipes));
}

// Function to load recipes from local storage
function loadRecipes() {
  const recipesJSON = localStorage.getItem("recipes");
  recipes = recipesJSON ? JSON.parse(recipesJSON) : [];
  renderRecipes();
}

// Initial rendering
loadRecipes();