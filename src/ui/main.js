



import '../css/header.css';
import '../css/favourites.css';
import '../css/slider.css';
import '../css/information.css';
import '../css/searchInput.css';
import '../css/game.css';
import '../css/Loader.css';



import { api_random_jokes } from '../api/api.js';
import { initCookbookData,setDarkMode,loadRecipes, loadIngredients } from './favourites.js';
import { printSlider } from './slider.js'
import { game_tasteWidget, game_guessNutrition } from './game.js'
import { SearchRecipes, RecipeSuggest } from './searchInput.js'



//האלמנטים
const but_cookbook = document.getElementById('but_cookbook');
const result_cookbook = document.getElementById('result_cookbook');
const close_btn = document.getElementById('close-btn');
const but_Ingredients = document.getElementById('but_Ingredients');

const darkModeIcon = document.getElementById('darkModeIcon');

const jokes = document.getElementById('jokes');

const informations = document.getElementById('information');

const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocomplete-list');
const searchButton = document.getElementById('searchButton');
const results = document.getElementById('results');

const sliderContainer = document.getElementById('sliderContainer');
const h1slider = document.getElementById('h1slider');

const tasteWidget = document.getElementById('tasteWidget');
const guessNutrition = document.getElementById('guessNutrition');


export const div_cookbook = document.getElementById('div_cookbook');


export const ui = {
    results,
    informations,
    sliderContainer,
    h1slider
}

//===============================================================================================================================================
// ============  מצב מוחשך============
const FavoriteData = initCookbookData();
darkModeIcon.addEventListener('click', () => {
    darkMode()
    // שמירת מצב הדארק מוד ב-localStorage
    if (document.body.classList.contains('dark-mode')) {
        setDarkMode(true);
    } else {
        setDarkMode(false);
    }
});

darkModeIcon.innerText = document.body.classList.contains("dark-mode") ? '🌞' : '🌙';
// בדיקה של מצב הדארק מוד בטעינת הדף
if (FavoriteData.settings.darkMode) {
    darkMode(FavoriteData.settings.darkMode);
}

//מצב מוחשך
function darkMode() {
    document.body.classList.toggle('dark-mode');
    darkModeIcon.innerText = document.body.classList.contains("dark-mode") ? '🌞' : '🌙';

}

//==============================================================================================================================================
//בדיחה
/*
const data =  await api_random_jokes()
jokes.innerText = data.text
*/


//==============================================================================================================================================
//המועדפים
let currentOpener = null; // שומר מי פתח את החלון

but_cookbook.addEventListener('click', () => {
    if (result_cookbook.classList.contains('open')) {
        if (currentOpener === 'cookbook') {
            // אם אותו כפתור לחץ – סוגר את החלון
            result_cookbook.classList.remove('open');
            currentOpener = null;
        } else {
            // אם כפתור אחר לחץ – רק מעדכן תוכן
            loadRecipes();
            currentOpener = 'cookbook';
        }
    } else {
        // אם החלון סגור – פותח אותו עם תוכן מתאים
        loadRecipes();
        result_cookbook.classList.add('open');
        currentOpener = 'cookbook';
    }
});

but_Ingredients.addEventListener('click', () => {
    if (result_cookbook.classList.contains('open')) {
        if (currentOpener === 'ingredients') {
            // אם אותו כפתור לחץ – סוגר את החלון
            result_cookbook.classList.remove('open');
            currentOpener = null;
        } else {
            // אם כפתור אחר לחץ – רק מעדכן תוכן
            loadIngredients();
            currentOpener = 'ingredients';
        }
    } else {
        // אם החלון סגור – פותח אותו עם תוכן מתאים
        loadIngredients();
        result_cookbook.classList.add('open');
        currentOpener = 'ingredients';
    }
});


close_btn.addEventListener('click', () => {
    result_cookbook.classList.toggle('open');
})



//=================================================================================================================================================
//חיפוש
searchButton.addEventListener('click', () => {
    search_Recipes();
});
searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        search_Recipes();
    }
});


//השלמה אוטומטית
searchInput.addEventListener('input', function () {
    if (searchInput.value.trim().length >= 3) {
        RecipeSuggest(searchInput.value, searchInput, autocompleteList);
    }
});

//הפעולה לביצוע חיפוש
function search_Recipes() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a search term.');
        return;
    }

    SearchRecipes(searchInput.value);
    searchInput.value = '';
}





/*המשחקים*/
//ניחוש הטעם השולט

tasteWidget.addEventListener('click', () => {
    game_tasteWidget();
});


//ניחוש הקלוריות
guessNutrition.addEventListener('click', () => {
    game_guessNutrition();
});


printSlider()







