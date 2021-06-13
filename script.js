/**** WELCOME, STUDENTS! Read instructions.text before beginning. ****/

/** GLOBAL VARIABLES **/
let categories = [];
let allDrinks = [];
let currentDrinks = [];
let colorClasses = {
    "alcoholic": "alcohol",
    "non alcoholic": "no-alcohol",
    "optional alcohol": "optional"
}

/** WINDOW LOAD LISTENER **/
window.addEventListener("load", function() {
    fetchDrinks();
    // Note: init() is called at the end of fetchCategories() to make sure fetched data has returned from the API before the page is rendered. Each fetch function is chained to another like this.
});

/** MAIN FUNCTION **/
function init() {

    /** CREATE OBJECTS FROM HTML ELEMENTS **/
    // Form
    const searchArea = document.getElementById("search-area");
    const keywordInput = document.getElementById("keyword-input");
    const categoryInput = document.getElementById("category-input");
    const submitButton = document.getElementById("submit-button");
    const resetButton = document.getElementById("reset-button");
    // Below form
    const resultsArea = document.getElementById("results-area");
    const searchResults = document.getElementById("search-results");
    const noResults = document.getElementById("no-results");
    const emptyGlass = document.getElementById("empty-glass");
    const noResultsText = document.getElementById("no-results-text");

    /** POPULATE DROPDOWN INPUT WITH FETCHED DATA **/
    categoryInput.innerHTML = setCategoryOptions();

    /** MAKE SEARCH AREA & RESULTS AREA VISIBLE UPON LOAD **/
    fadeInSearchBox();
    fadeInResultsArea();
    spinGlass("zoom");

    /** LISTEN FOR EVENTS **/
    submitButton.addEventListener("click", (event) => {    
        // Create object for whichever radio button has just been checked  
        const typeInput = document.querySelector("input[name=type-input]:checked");
        // Validate that a radio button has in fact been checked and keyword field has no unallowed characters
        if (typeInput === null) {
            alert("\nPlease select alcoholic, non-alcoholic, or both.");
        } else if (keywordInput.value !== "" && !keywordInput.value.trim().match(/^[A-Za-z0-9\-]+$/)) {
            alert("\nPlease enter a single keyword with only letters and/or numbers.");
        } else {
            // If input is valid, pass type to handler function outside listener
            handleSubmitClick(typeInput);
        }
        // Prevent browser from automatically reloading page
        event.preventDefault();
    });

    resetButton.addEventListener("click", () => {
        // Only trigger full reset if cards are currently on the page
        if (currentDrinks.length > 0) {  
            noResultsText.innerHTML = "Ready for a new search?";     
            handleResetClick();        
        } else {
            // Only change text if a search has already been done
            if (noResultsText.innerHTML !== "Search for recipes above!") {
                noResultsText.innerHTML = "Ready for a new search?";
            } 
            spinGlass("click");
        }    
    });

    emptyGlass.addEventListener("click", () => {
        spinGlass("click");
    });

    /** HANDLE SOME OF THE LOGIC FOR EVENT LISTENERS **/
    function handleSubmitClick(type) {       
        // Temporarily hide everything below form and remove animation
        resetResultsArea();
        // Make copy so allDrinks remains unchanged  
        currentDrinks = allDrinks.slice();         
        // Use results from form to filter data 
        filterDrinks(type.value, categoryInput.value, keywordInput.value);
        // Display any results matching filters
        if (currentDrinks.length > 0) {
            // Alphabetize results by name of drink - see sort function at bottom
            sortByName(currentDrinks, 0, currentDrinks.length-1);
            // Update values
            searchResults.innerHTML = setRecipeCards();
            noResults.style.display = "none";
            // Trigger animations
            setTimeout(() => {         
                fadeInResultsArea();
            }, 150); // Slight delay to accommodate image loading
        } else {
            // Update values
            noResultsText.innerHTML = "No results found. Try again!";
            // Trigger animations
            handleResetClick();
        }
    };
    function handleResetClick() { 
        // Update values
        currentDrinks = [];
        searchResults.innerHTML = "";
        noResults.style.display = "block";
        // Trigger animations
        resetResultsArea(); 
        fadeInResultsArea();
        spinGlass("zoom");
    };

    /** TRIGGER AND RESET ANIMATIONS AS NEEDED **/
    function fadeInSearchBox() {
        searchArea.style.display = "block";
        searchArea.style.animation = "fade-in 3s";
    };
    function resetResultsArea() {
        resultsArea.style.display = "none";
        resultsArea.style.animation = "none";   
    };
    function fadeInResultsArea() {
        resultsArea.style.display = "block";
        resultsArea.style.animation = "fade-in 2s";
    };
    function spinGlass(mode) {
        emptyGlass.style.animation = (mode === "zoom" ? "zoom-spin 2s" : "spin-only 1.5s");
        let spin = emptyGlass.getAnimations()[0];
        spin.finish();
        spin.play();
        emptyGlass.style.animation = "none";
    };

} // End of init()


/** FETCH DATA FROM PUBLIC API **/

function fetchDrinks() {
    /* 
        The API lets us retrieve drinks in bulk by first letter of the name, so we need to loop over the alphabet and send the requests separately.
    */
    let alpha = "abcdefghijklmnopqrstuvwxyz";
    let baseURL = "https://www.thecocktaildb.com/api/json/v1/1/search.php?f=";
    for (let a=0; a < alpha.length; a++) {
        let fullURL = baseURL + alpha[a];
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
                                if (msr !== null && msr !== "") {
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
                // Merge new info from this loop into global allDrinks array
                allDrinks = allDrinks.concat(drinksByLetter);
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

/** SET HTML **/

// Create HTML for all <option> tags in the Category dropdown
function setCategoryOptions() {
    let options = `
        <option value="category">Category (Optional)</option>
    `;
    for (let i=0; i < categories.length; i++) {
        options += `
            <option value="${categories[i].toLowerCase()}">${categories[i]}</option>
        `;
    }
    return options;
}

// Create HTML for displaying recipe cards
function setRecipeCards() {
    let numDrinks = currentDrinks.length;
    let results = `
        <h4 id="num-results">${numDrinks} result${numDrinks === 1 ? "" : "s"} found.</h4>
    `;
    let color, listItems;
    currentDrinks.forEach(drink => {
        color = colorClasses[drink.type.toLowerCase()];
        listItems = "";
        drink.ingredients.map(ingredient => listItems += `<li>${ingredient.replace(ingredient[0], ingredient[0].toUpperCase())}</li>`);
        results += `
            <div class="recipe-card">
                <div class="recipe-card-photo">
                    <img class="drink" src="${drink.image}" />
                </div>
                <div class="color-bar-1"></div>
                <div class="recipe-card-info-area">
                    <div class="recipe-info">
                        <p class="drink-name">${drink.name}</p>
                        <p class="info">${drink.category} &bull; ${drink.type}</p>
                        
                        <p class="subheader">Ingredients</p>
                        <ul class="ingredients-list">${listItems}</ul>
                        <p class="subheader">Directions</p>
                        <p class="directions">${drink.directions}</p>
                        <p class="glass-type">Enjoy your ${drink.name} in a <span class="capitalize">${drink.glass}</span>.</p>
                    </div>
                </div>
                <div class="color-bar-2 ${color}"></div>
                <div class="color-bar-3"></div>
            </div>
        `;
    });
    return results;
} 


/** FILTER DRINKS ACCORDING TO USER INPUT **/

function filterDrinks(type, category, keyword) {
    // Include drinks with type 'optional alcohol' either way
    if (type === "alcoholic") {
        currentDrinks = currentDrinks.filter(drink => {
            return (drink.type.toLowerCase() !== "non alcoholic");     
        });
    } else if (type === "non-alcoholic") {
        currentDrinks = currentDrinks.filter(drink => {
            return (drink.type.toLowerCase() !== "alcoholic");     
        });
    } 
    // Make sure not to include first option
    if (category !== "" && category !== "category") {
        currentDrinks = currentDrinks.filter(drink => {
            return drink.category.toLowerCase() === category.toLowerCase();     
        });
    }
    // Check both name and ingredients for match
    if (keyword !== "") {
        currentDrinks = currentDrinks.filter(drink => {
            let nameAndIngredients = (drink.name + drink.ingredients.join(" ")).toLowerCase();
            return nameAndIngredients.indexOf(keyword.toLowerCase()) !== -1;     
        });
    }
}

/** SORT RESULTS **/

// Alphabetize drinks quickly with partition sort
function sortByName(array, start, end) {
    if ( start < end ) {
        let pivot = clone(array[end]);
        let i = start;
        let current;
        for (let j = start; j < end; j++) {
            current = clone(array[j]);
            if (current.name < pivot.name) {
                array[j] = clone(array[i]);
                array[i] = clone(current);
                i++;
            }
        }
        array[end] = clone(array[i]);
        array[i] = clone(pivot); 
        sortByName(array, start, i-1); // recursive left side
        sortByName(array, i+1, end) // recursive right side
    }
}

// Make a true copy instead of a reference
function clone(obj) {
    return Object.assign({}, obj);
}
