/**** WELCOME, STUDENTS! Read instructions.text before beginning. ****/

/** GLOBAL VARIABLES **/
// TODO: initialize three empty arrays (see Part A, 2)

let colorClasses = {
    // TODO: add properties relating drink type with CSS class (see Part B, 6)
}

/** WINDOW LOAD LISTENER **/
window.addEventListener("load", function() {
    // TODO: call fetch function for drinks (see Part A, 3)
    // Note: init() should be called at the end of fetchCategories() to make sure fetched data has returned from the API before the page is rendered. Each fetch function is chained to another this way.
});

/** MAIN FUNCTION **/
function init() {

    /** CREATE OBJECTS FROM HTML ELEMENTS **/
    // FORM
    // TODO: Add searchArea object (see Part D, 2a)
    // TODO: Add keywordInput, categoryInput, submitButton, and resetButton (see Part B, 1a)
    // BELOW FORM
    // TODO: Add resultsArea object (see Part D, 2a)
    // TODO: Add searchResults, noResults, and noResultsText (see Part B, 1b)
    // TODO: Add emptyGlass object (see Part D, 2a)

    /** POPULATE DROPDOWN INPUT WITH FETCHED DATA **/
    // TODO: Set innerHTML of dropdown box (see Part B, 2)

    // TODO: Copy in initial triggers for animations (see Part D, 2c)

    /** LISTEN FOR EVENTS **/
    submitButton.addEventListener("click", (event) => {    
        // TODO: Add typeInput object to get the clicked radio button (see Part B, 3a)
        // TODO: Validate the type and keyword inputs (see Part B, 5)
        // TODO: Call the handler function (see Part B, 3c)
        // TODO: Prevent the default page reload (see Part B, 3d)
    });

    resetButton.addEventListener("click", () => {
        // TODO: Replace the single line of code below (see Part D, 2d)
        // TODO: Call the handler for the reset button (see Part B, 4b) 
    });

    // TODO: Add listener for empty glass image (see Part D, 2e)

    /** HANDLE SOME OF THE LOGIC FOR EVENT LISTENERS **/
    function handleSubmitClick(type) {       
        // TODO: Call the resetResultsArea() function (see Part D, 2f)
        // TODO: Give currentDrinks all of the objects from allDrinks (see Part B, 3b-1)
        // TODO: Call filterDrinks and pass in the three input values (see Part B, 3b-2)
        // TODO: If there are results, sort them and set new values for searchResults innerHTML and noResults display - otherwise change the value of noResultsText.innerHTML (see Part B, 3b-3)
        
        if (currentDrinks.length > 0) {
            // Alphabetize results by name of drink - see sort function at bottom
            
            // Update values
            
            // Trigger animations
            // TODO: Add setTimeout function with fadeInResultsArea() (see Part D, 2f)
        } else {
            // Update values
            
            // Trigger animations
            // TODO: Call handleResetClick() (see Part D, 2f)         
        }
    };
    function handleResetClick() { 
        // Update values
        // TODO: Reset currentDrinks, searchResults, noResultsText, and noResults (see Part B, 4a, 2-5) 

        // Trigger animations
        // TODO: Call three functions (see Part D, 2g)
        
    };

    // TODO: Add animation trigger functions (see Part D, 2b)

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
    fetchCategories();
}

// Get all possible categories from API, needed for Category dropdown input
function fetchCategories() {
    // TODO: fetch the list of categories from the API, put each string into our global categories array, then call init() (see Part A, 4-6)
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
