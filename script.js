window.addEventListener("load", function() {
    fetchCategories();
    // Note: init() is called from fetchIngredients() to make sure the data needed to populate the form inputs has already arrived before the page is rendered.
});

let categories = [];
let ingredients = [];
let allDrinks = [];

const baseURL = "https://www.thecocktaildb.com/api/json/v1/1/";

const endpoints = {
    letter: baseURL + "search.php?f=",
    name: baseURL + "search.php?s=",
    ingredient: baseURL + "filter.php?i=",
    type: baseURL + "filter.php?a=",
    category: baseURL + "filter.php?c=",
}

function init() {
    
    /** CREATE OBJECTS FROM HTML ELEMENTS **/
    const categorySelect = document.getElementById("category");
    const ingredientSelect = document.getElementById("ingredient");
    const submitButton = document.getElementById("submit");
    const resetButton = document.getElementById("reset");
    const resultsArea = document.getElementById("results-area");

    /** POPULATE DROPDOWN INPUTS **/
    categorySelect.innerHTML = setCategoryOptions();
    ingredientSelect.innerHTML = setIngredientOptions();

    /** LISTEN FOR EVENTS **/
    submitButton.addEventListener("click", (event) => {
        fetchDrinks(); // temp
        setTimeout(() => {
            // console.log(drinks);
            resultsArea.innerHTML = displayResults(); 
            // console.log(drinks);
        }, 1000);
        event.preventDefault();
    });
    resetButton.addEventListener("click", (event) => {
        drinks = [];
        resultsArea.innerHTML = `
            <p id="no-results">No results to display.</p>
        `;
    });

    /** USE FORM INPUT CRITERIA TO GET AND DISPLAY RESULTS **/

    // Do a single search to a specific endpoint depending on criterion
    function fetchDrinks() {
        let alpha = "abcdefghijklmnopqrstuvwxyz";
        allDrinks = [];
        for (let a=0; a < alpha.length; a++) {
            let fullURL = endpoints["letter"] + alpha[a];
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
                                if (ing !== null) {
                                    // console.log("ing is " + ing);
                                    if (msr !== null) {
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
                                photo: drink.strDrinkThumb,
                            }
                        });
                    }
                    allDrinks = [...allDrinks, ...drinksByLetter];
                    // console.log(drinksByLetter.length + " drinks added for letter " + alpha[a]);
                });
            });
        }
    }

    function displayResults() {
        let results = "";
        allDrinks.forEach(drink => {
            results += `
                <div class="recipe-block">
                    <h3>${drink.name}</h3>
                    <p>${drink.category} | ${drink.type}</p>
                    <p>Enjoy your ${drink.name} in a ${drink.glass}</p>
                    <p></p>
                </div>
            `;
        });
        console.log(allDrinks.length + " drinks total");
        return results;
    }
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
            init(); 
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
