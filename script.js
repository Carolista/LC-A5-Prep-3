window.addEventListener("load", function() {
    fetchDrinks();
    // Note: init() is called from fetchCategories() to make sure fetched data has returned from the API before the page is rendered. All fetch functions are chained this way.
});

let categories = [];
let allDrinks = [];
let currentDrinks = [];

function init() {

    /** CREATE OBJECTS FROM HTML ELEMENTS **/
    const searchArea = document.getElementById("search-area");
    const keywordInput = document.getElementById("keyword-input");
    const typeInput = document.querySelector("input[name=type-input]")
    const categorySelect = document.getElementById("category-input");
    const submitButton = document.getElementById("submit-button");
    const resetButton = document.getElementById("reset-button");
    const resultsArea = document.getElementById("results-area");
    const cardsArea = document.getElementById("cards-area");
    const emptyGlass = document.getElementById("empty-glass");
    const noResults = document.getElementById("no-results-text");

    /** POPULATE DROPDOWN INPUT **/
    categorySelect.innerHTML = setCategoryOptions();

    /** TRIGGER AND RESET ANIMATIONS AS NEEDED **/
    const fadeInSearchBox = () => {
        searchArea.style.display = "block";
        searchArea.style.animation = "fade-in 3s";
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

    /** MAKE SEARCH AREA & RESULTS AREA VISIBLE UPON LOAD **/
    fadeInSearchBox();
    fadeInResults();
    spinGlass();

    /** LISTEN FOR EVENTS **/
    submitButton.addEventListener("click", (event) => {
        // TODO: add logic to filter drinks acc to settings
        // TODO: Consider randomizing instead of sorting?
        // FIXME: Need a better sorting algorithm, maybe recursive quicksort?
        resetResultsArea();
        currentDrinks = allDrinks.slice(); // Make a copy       
        // currentDrinks.sort((a, b) => {return a.name - b.name});
        // filterDrinks();
        setTimeout(() => {
            cardsArea.innerHTML = displayResults();
            fadeInResults();
        }, 250); // Slight delay to accommodate image loading
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

    /** FILTER DRINKS ACCORDING TO USER INPUT **/
    function filterDrinks() {

    }

    /** ONCE DRINKS ARE FILTERED, DISPLAY RESULTS **/
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
} // end of init()

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
                            category: drink.strCategory.split(" / ").join("/"),
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
            init();       
        });
    });
}

// Create HTML for all <option> tags in the Category dropdown
function setCategoryOptions() {
    let options = `
        <option value="any">Category</option>
    `;
    for (let i=0; i < categories.length; i++) {
        options += `
            <option value="${categories[i].toLowerCase()}">${categories[i]}</option>
        `;
    }
    return options;
}
