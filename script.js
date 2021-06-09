window.addEventListener("load", function() {
    fetchCategories();
    // Note: init() is called from fetchIngredients() to make sure the data needed to populate the form inputs has already arrived before the page is rendered.
});

let categories = [];
let ingredients = [];
let drinks = [];

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

const baseURL = "https://www.thecocktaildb.com/api/json/v1/1/";

const endpoints = {
    name: baseURL + "search.php?s=",
    ingredient: baseURL + "filter.php?i=",
    type: baseURL + "filter.php?a=",
    category: baseURL + "filter.php?c=",
}

function fetchDrinks(searchType, keyword) {
    let fullURL = endpoints[searchType] + keyword;
    fetch(fullURL).then( function(response) {
        response.json().then( function(json) {
            let drinkObjects = json.drinks;
            drinks = drinkObjects.map(drink => {
                console.log(drink.strDrink);
                let ingredientList = [];
                for (let i=0; i < 15; i++) {
                    let ing = drink["strIngredient" + (i+1)];
                    let msr = drink["strMeasure" + (i+1)];
                    if (ing) {
                        if (msr) {
                            ingredientList.push(`${ing}, ${msr.trim()}`);
                        } else {
                            ingredientList.push(`${ing}`);
                        }
                    } else {
                        break;
                    }
                }
                return {
                    name: drink.strDrink,
                    altName: drink.strDrinkAlternate,
                    category: drink.strCategory,
                    type: drink.strAlcoholic,
                    glass: drink.strGlass,
                    directions: drink.strInstructions,
                    ingreds: ingredientList,
                    photo: drink.strDrinkThumb
                }
            });
            console.log("Drinks loaded.");
        });
    });
}



function init() {
    
    // CREATE OBJECTS FROM HTML ELEMENTS
    const categorySelect = document.getElementById("category");
    const ingredientSelect = document.getElementById("ingredient");
    const submitButton = document.getElementById("submit");
    const resultsArea = document.getElementById("results-area");

    function setCategoryOptions() {
        let options = `
            <option value="any">Any</option>
        `;
        for (let i=0; i < categories.length; i++) {
            options += `
                <option value="${categories[i].toLowerCase()}">${categories[i]}</option>
            `
        }
        return options;
    }

    function setIngredientOptions() {
        let options = `
            <option value="any">Any</option>
        `;
        for (let i=0; i < ingredients.length; i++) {
            options += `
                <option value="${ingredients[i].toLowerCase()}">${ingredients[i]}</option>
            `
        }
        return options;
    }

    categorySelect.innerHTML = setCategoryOptions();
    ingredientSelect.innerHTML = setIngredientOptions();

    submitButton.addEventListener("click", (event) => {
        // fetchDrinks("ingredient", "gin");
        event.preventDefault();
    });

}