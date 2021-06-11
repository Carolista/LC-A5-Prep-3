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

    /** CREATE OBJECTS FROM HTML ELEMENTS **/
    const searchArea = document.getElementById("search-area");
    const keywordInput = document.getElementById("keyword-input");
    const typeInput = document.querySelector("input[name=type-input]")
    const categorySelect = document.getElementById("category-input");
    const ingredientSelect = document.getElementById("ingredient-input");
    const submitButton = document.getElementById("submit-button");
    const resetButton = document.getElementById("reset-button");
    const resultsArea = document.getElementById("results-area");
    const cardsArea = document.getElementById("cards-area");
    const emptyGlass = document.getElementById("empty-glass");
    const noResults = document.getElementById("no-results-text");

    /** POPULATE DROPDOWN INPUTS **/
    categorySelect.innerHTML = setCategoryOptions();
    ingredientSelect.innerHTML = setIngredientOptions();

    /** TRIGGER AND RESET ANIMATIONS AS NEEDED **/
    const fadeInSearchBox = () => {
        searchArea.style.display = "block";
        searchArea.style.animation = "fade-in 3.5s";
    };
    const resetResultsArea = () => {
        resultsArea.style.display = "none";
        resultsArea.style.animation = "none";   
    };
    const fadeInResults = () => {
        resultsArea.style.display = "block";
        resultsArea.style.animation = "fade-in 2s";
    };
    const spinGlass = () => {
        emptyGlass.style.animation = "zoom-spin 2s";
        let spin = emptyGlass.getAnimations()[0];
        spin.finish();
        spin.play();
        emptyGlass.style.animation = "none";
    };
    const clickGlass = () => {
        emptyGlass.style.animation = "spin-only 1.5s";
        let spin = emptyGlass.getAnimations()[0];
        spin.finish();
        spin.play();
        emptyGlass.style.animation = "none";
    };

    /** MAKE SEARCH AREA & RESULTS AREA VISIBLE **/
    fadeInSearchBox();
    fadeInResults();
    emptyGlass.style.animation = "zoom-spin 2s";

    /** LISTEN FOR EVENTS **/
    submitButton.addEventListener("click", (event) => {
        // TODO: add logic to filter drinks acc to settings
        // TODO: Consider randomizing instead of sorting?
        // FIXME: Need a better sorting algorithm, maybe recursive quicksort?

        resetResultsArea();
        currentDrinks = allDrinks.slice(); // Make a copy       
        currentDrinks.sort((a, b) => {return a.name - b.name});

        setTimeout(() => {
            cardsArea.innerHTML = displayResults();
            fadeInResults();
        }, 200); // Slight delay to accommodate image loading
        event.preventDefault();
    });
    resetButton.addEventListener("click", () => {
        if (currentDrinks.length === 0) {
            clickGlass();
            return;
        }
        currentDrinks = [];
        cardsArea.innerHTML = "";
        noResults.innerHTML = "Ready for a new search?";
        resetResultsArea(); 
        fadeInResults();
        spinGlass();
    });
    emptyGlass.addEventListener("click", () => {
        clickGlass();
    });


    /** USE FORM INPUT CRITERIA TO GET AND DISPLAY RESULTS **/
    function displayResults() {
        if (currentDrinks.length === 0) {
            noResults.innerHTML = "No results found. Try again!";
            return;
        }
        let results = `
            <h4 id="num-results">${currentDrinks.length} results found.</h4>
        `;
        let color, listItems;
        currentDrinks.forEach(drink => {
            color = (drink.type.toLowerCase() === "alcoholic" ? "alcohol" : "no-alcohol");
            listItems = "";
            drink.ingredients.map(ingredient => listItems += `<li>${ingredient.replace(ingredient[0], ingredient[0].toUpperCase())}</li>`);
            results += `
                <div class="recipe-card">
                    <div class="recipe-card-left">
                        <img class="drink" src="${drink.image}" />
                    </div>
                    <div class="color-bar-1 ${color}"></div>
                    <div class="recipe-card-right">
                        <h3>${drink.name}</h3>
                        <p class="info">${drink.category} &bull; ${drink.type}</p>
                        
                        <h5>Ingredients</h5>
                        <ul class="ingredients-list">${listItems}</ul>
                        <h5>Directions</h5>
                        <p class="directions">${drink.directions}</p>
                        <p class="glass">Enjoy your ${drink.name} in a <span class="capitalize">${drink.glass}</span>.</p>
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
            }, 300);
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
