window.addEventListener("load", function() {
    fetchDrinks();
    // Note: init() is called from fetchCategories() to make sure fetched data has returned from the API before the page is rendered. All fetch functions are chained this way.
});

let categories = [];
let allDrinks = [];
let currentDrinks = [];

let colorClasses = {
    "alcoholic": "alcohol",
    "non alcoholic": "no-alcohol",
    "optional alcohol": "optional"
}

function init() {

    /** CREATE OBJECTS FROM HTML ELEMENTS **/
    const searchArea = document.getElementById("search-area");
    const keywordInput = document.getElementById("keyword-input");
    const categoryInput = document.getElementById("category-input");
    const submitButton = document.getElementById("submit-button");
    const resetButton = document.getElementById("reset-button");
    const resultsArea = document.getElementById("results-area");
    const cardsArea = document.getElementById("cards-area");
    const noResults = document.getElementById("no-results");
    const emptyGlass = document.getElementById("empty-glass");
    const noResultsText = document.getElementById("no-results-text");

    /** POPULATE DROPDOWN INPUT **/
    categoryInput.innerHTML = setCategoryOptions();

    

    
    /** MAKE SEARCH AREA & RESULTS AREA VISIBLE UPON LOAD **/
    fadeInSearchBox();
    fadeInResultsArea();
    spinGlass("zoom");

    /** LISTEN FOR EVENTS **/
    submitButton.addEventListener("click", (event) => {      
        const typeInput = document.querySelector("input[name=type]:checked");
        if (typeInput === null) {
            alert("\nPlease select alcoholic, non-alcoholic, or both.");
            // return;
        } else if (keywordInput.value !== "" && !keywordInput.value.match(/^[A-Za-z0-9]+$/)) {
            alert("\nPlease enter a single keyword with only letters and/or numbers.");
            // return;
        } else {
            handleSubmitClick(typeInput);
        }
        event.preventDefault();
    });
    resetButton.addEventListener("click", () => {
        if (currentDrinks.length === 0) {
            spinGlass("click");
            noResultsText.innerHTML = "Ready for a new search?";
            return;
        } else {
            handleResetClick();
        }    
    });
    emptyGlass.addEventListener("click", () => {
        spinGlass("click");
    });

    // HANDLE SOME OF THE LOGIC FOR EVENT LISTENERS
    function handleSubmitClick(type) {
        resetResultsArea();
        currentDrinks = allDrinks.slice(); // Make a copy       
        filterDrinks(type.value, categoryInput.value, keywordInput.value);
        if (currentDrinks.length > 0) {
            setTimeout(() => {
                cardsArea.innerHTML = displayResults();
                noResults.style.display = "none";
                fadeInResultsArea();
            }, 250); // Slight delay to accommodate image loading
        } else {
            noResultsText.innerHTML = "No results found. Try again!";
        }
    };
    function handleResetClick() {
        currentDrinks = [];
        cardsArea.innerHTML = "";
        noResultsText.innerHTML = "Ready for a new search?";
        resetResultsArea(); 
        noResults.style.display = "block";
        fadeInResultsArea();
        spinGlass("zoom");
    };

    /** FILTER DRINKS ACCORDING TO USER INPUT **/
    function filterDrinks(type, category, keyword) {
        if (type === "alcoholic") {
            currentDrinks = currentDrinks.filter(drink => {
                return (drink.type.toLowerCase() !== "non alcoholic");     
            });
        } else if (type === "non-alcoholic") {
            currentDrinks = currentDrinks.filter(drink => {
                return (drink.type.toLowerCase() !== "alcoholic");     
            });
        }
        if (category !== "" && category !== "category") {
            currentDrinks = currentDrinks.filter(drink => {
                return drink.category.toLowerCase() === category.toLowerCase();     
            });
        }
        if (keyword !== "") {
            currentDrinks = currentDrinks.filter(drink => {
                let nameAndIngredients = (drink.name + drink.ingredients.join(" ")).toLowerCase();
                return nameAndIngredients.indexOf(keyword.toLowerCase()) !== -1;     
            });
        }
        if (currentDrinks.length === 0) {
            handleResetClick();
        } else {
            sortDrinks(currentDrinks, 0, currentDrinks.length-1);
        }
    }

    /** CREATE HTML TO DISPLAY RESULTS OF SEARCH **/
    function displayResults() {
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
                    <div class="recipe-card-left">
                        <img class="drink" src="${drink.image}" />
                    </div>
                    <div class="color-bar-1"></div>
                    <div class="recipe-card-right">
                        <div class="recipe-info">
                            <p class="drink-name">${drink.name}</p>
                            <p class="info">${drink.category} &bull; ${drink.type}</p>
                            
                            <p class="subheader">Ingredients</p>
                            <ul class="ingredients-list">${listItems}</ul>
                            <p class="subheader">Directions</p>
                            <p class="directions">${drink.directions}</p>
                            <p class="glass">Enjoy your ${drink.name} in a <span class="capitalize">${drink.glass}</span>.</p>
                        </div>
                    </div>
                    <div class="color-bar-2 ${color}"></div>
                    <div class="color-bar-3"></div>
                </div>
            `;
        });
        return results;
    }  
    
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
        <option value="category">Category (Optional)</option>
    `;
    for (let i=0; i < categories.length; i++) {
        options += `
            <option value="${categories[i].toLowerCase()}">${categories[i]}</option>
        `;
    }
    return options;
}

// Alphabetize drinks quickly with partition sort
function sortDrinks(objArray, start, end) {
    if ( start < end ) {
        let pivot = clone(objArray[end]);
        let i = start;
        let current;
        for (let j = start; j < end; j++) {
            current = clone(objArray[j]);
            if (current.name < pivot.name) {
                objArray[j] = clone(objArray[i]);
                objArray[i] = clone(current);
                i++;
            }
        }
        objArray[end] = clone(objArray[i]);
        objArray[i] = clone(pivot); 
        sortDrinks(objArray, start, i-1); // recursive left side
        sortDrinks(objArray, i+1, end) // recursive right side
    }
}

// Makes a true copy instead of a reference
function clone(obj) {
    return Object.assign({}, obj);
}
