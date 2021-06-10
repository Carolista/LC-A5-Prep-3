window.addEventListener("load", function() {
    fetchDrinks();
    // Note: init() is called from fetchIngredients() to make sure fetched data has returned from the API before the page is rendered. All fetch functions are chained this way.
});

let categories = [];
let ingredients = [];
let allDrinks = [];
let currentDrinks = [];

// TODO: Create splash screen effect to fade to white while data is loading ?
// TODO: Consider nixing ingredients dropdown and just make it part of keyword search

function init() {

    /** ALPHABETIZE DRINKS BY NAME **/
    // FIXME: Consider randomizing instead if still not working, or sort each time submit is clicked
    allDrinks.sort((a,b) => {return a.name - b.name});
    console.log("All drinks sorted.");
    
    /** CREATE OBJECTS FROM HTML ELEMENTS **/
    const keywordInput = document.getElementById("keyword-input");
    const typeInput = document.querySelector("input[name=type-input]")
    const categorySelect = document.getElementById("category-input");
    const ingredientSelect = document.getElementById("ingredient-input");
    const submitButton = document.getElementById("submit-button");
    const resetButton = document.getElementById("reset-button");
    const resultsArea = document.getElementById("results-area");

    /** POPULATE DROPDOWN INPUTS **/
    categorySelect.innerHTML = setCategoryOptions();
    ingredientSelect.innerHTML = setIngredientOptions();

    /** LISTEN FOR EVENTS **/
    submitButton.addEventListener("click", (event) => {
        // FIXME: temporarily set currentDrinks to allDrinks
        currentDrinks = allDrinks.slice();  
        // TODO: add logic to filter drinks acc to settings
        resultsArea.innerHTML = displayResults(); 
        event.preventDefault();
    });
    resetButton.addEventListener("click", (event) => {
        currentDrinks = [];
        resultsArea.innerHTML = `
            <div id="no-results">
                <img id="empty-glass" src="images/empty-glass.png" />
                <p class="no-results">No results to display.</p>
                <p class="no-results">Try a new search!</p>
            </div>
        `;
    });

    /** USE FORM INPUT CRITERIA TO GET AND DISPLAY RESULTS **/

    

    function displayResults() {
        let results = "";
        let color, listItems;
        currentDrinks.forEach(drink => {
            color = (drink.type.toLowerCase() === "alcoholic" ? "alcohol" : "no-alcohol");
            listItems = "";
            drink.ingredients.map(ingredient => listItems += `<li>${ingredient}</li>`);
            results += `
                <div class="recipe-card">
                    <div class="recipe-card-left">
                        <img class="drink" src="${drink.image}" />
                    </div>
                    <div class="color-bar-1 ${color}"></div>
                    <div class="recipe-card-right">
                        <h3>${drink.name}</h3>
                        <p class="info">${drink.category} &bull; ${drink.type}</p>
                        <p class="glass">Enjoy your ${drink.name} in a <span class="capitalize">${drink.glass}</span>.</p>
                        <h5>Ingredients</h5>
                        <ul>${listItems}</ul>
                        <h5>Directions</h5>
                        <p class="directions">${drink.directions}</p>
                    </div>
                    <div class="color-bar-2 ${color}"></div>
                </div>
            `;
        });
        return results;
    }
}

function fetchDrinks() {
    let alpha = "abcdefghijklmnopqrstuvwxyz";
    allDrinks = [];
    for (let a=0; a < alpha.length; a++) {
        let fullURL = "https://www.thecocktaildb.com/api/json/v1/1/search.php?f=" + alpha[a];
        fetch(fullURL).then( function(response) {
            response.json().then( function(json) {
                let drinkObjects = json.drinks;
                let drinksByLetter = [];
                if (drinkObjects !== null) {
                    drinksByLetter = drinkObjects.map(drink => {
                        // First handle the 30 separate properties for ingredients and measures
                        let ingredientList = [];
                        for (let i=0; i < 15; i++) {
                            let num = String(i+1);
                            let ing = drink["strIngredient" + num];
                            let msr = drink["strMeasure" + num];
                            if (ing !== null && ing !== "") {
                                // console.log("ing is " + ing);
                                if (msr !== null && msr !== "") {
                                    // console.log("msr is " + msr)
                                    ingredientList.push(`${ing}, ${msr.trim()}`);
                                } else {
                                    ingredientList.push(`${ing}`);
                                }
                            } else {
                                break;
                            }
                        }
                        // Then create the new object to be mapped to the drinks array
                        return {
                            name: drink.strDrink,
                            category: drink.strCategory,
                            type: drink.strAlcoholic,
                            glass: drink.strGlass,
                            ingredients: ingredientList,
                            directions: drink.strInstructions,
                            image: drink.strDrinkThumb,
                        }
                    });
                }
                allDrinks = [...allDrinks, ...drinksByLetter];
            });
        });
    }
    console.log("Drinks loaded.");
    fetchCategories();
}

// Get all possible categories from API, needed for Category dropdown input
function fetchCategories() {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list").then( function(response) {
        response.json().then( function(json) {
            let categoryObjects = json.drinks;
            categories = categoryObjects.map(category => category.strCategory.split(" / ").join("/"));
            categories.sort();
            console.log("Categories loaded.");
            fetchIngredients();       
        });
    });
}

// Get all possible ingredients from API, needed for Ingredient dropdown input
function fetchIngredients() {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list").then( function(response) {
        response.json().then( function(json) {
            let ingredientsObjects = json.drinks;
            ingredients = ingredientsObjects.map(ingredient => ingredient.strIngredient1);
            ingredients.sort();
            console.log("Ingredients loaded.");
            setTimeout(() => {
                init(); 
            }, 500);
        });
    });
}

// Create HTML for all <option> tags in the Category dropdown
function setCategoryOptions() {
    let options = `
        <option value="any">Any</option>
    `;
    for (let i=0; i < categories.length; i++) {
        options += `
            <option value="${categories[i].toLowerCase()}">${categories[i]}</option>
        `;
    }
    return options;
}

// Create HTML for all <option> tags in the Ingredient dropdown
function setIngredientOptions() {
    let options = `
        <option value="any">Any</option>
    `;
    for (let i=0; i < ingredients.length; i++) {
        options += `
            <option value="${ingredients[i].toLowerCase()}">${ingredients[i]}</option>
        `;
    }
    return options;
}
