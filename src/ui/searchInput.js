import { api_SearchRecipes, api_RecipeSuggest } from '../api/api.js'
import { showLoader } from './Loader.js'
import {ui} from './setting.js';
import {information} from './information.js';

function appendQueryHighlights(element, text, query) {
    const terms = [...new Set(query.trim().split(/\s+/).filter(Boolean))]
        .sort((a, b) => b.length - a.length);
    const lowerTitle = text.toLowerCase();
    const ranges = [];

    terms.forEach((term) => {
        const lowerTerm = term.toLowerCase();
        let from = 0;
        let index = lowerTitle.indexOf(lowerTerm, from);
        while (index !== -1) {
            ranges.push([index, index + term.length]);
            from = index + Math.max(1, term.length);
            index = lowerTitle.indexOf(lowerTerm, from);
        }
    });

    ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const mergedRanges = [];
    ranges.forEach(([start, end]) => {
        const previous = mergedRanges[mergedRanges.length - 1];
        if (previous && start <= previous[1]) previous[1] = Math.max(previous[1], end);
        else mergedRanges.push([start, end]);
    });

    let cursor = 0;
    mergedRanges.forEach(([start, end]) => {
        if (start > cursor) element.appendChild(document.createTextNode(text.slice(cursor, start)));
        const match = document.createElement('mark');
        match.className = 'search-match';
        match.textContent = text.slice(start, end);
        element.appendChild(match);
        cursor = end;
    });
    if (cursor < text.length) element.appendChild(document.createTextNode(text.slice(cursor)));
}





const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocomplete-list'); 
const searchButton = document.getElementById('searchButton');

// חיפוש בלחיצה על כפתור
searchButton.addEventListener('click', () => {
    search_Recipes();
});

// חיפוש בלחיצת Enter
searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        search_Recipes();
    }
});

// השלמה אוטומטית בזמן הקלדה
searchInput.addEventListener('input', function () {
    if (searchInput.value.trim().length >= 3) {
        RecipeSuggest(searchInput.value, searchInput, autocompleteList);
    }
});

// סגירת רשימת ההשלמה בלחיצה מחוץ לשדה או לרשימה
document.addEventListener('click', function (e) {
    if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
        autocompleteList.innerHTML = '';
    }
});

// הפעולה לביצוע חיפוש סופי
function search_Recipes() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a search term.');
        return;
    }

    SearchRecipes(searchInput.value);
    searchInput.value = '';
    autocompleteList.innerHTML = ''; // לנקות את הרשימה גם אחרי חיפוש מלא
}




//הצגת מתכונים מהחיפוש
export async function SearchRecipes(query) {
    ui.results.innerHTML = '';
    ui.informations.innerHTML = '';
    await showLoader(ui.results,3);
    
    let data;
    try {
        data = await api_SearchRecipes(query);
    } catch (error) {
        const message = document.createElement('div');
        message.className = 'api-error';
        message.textContent = `Recipes could not be loaded: ${error.message}`;
        ui.results.appendChild(message);
        return;
    }
    if (!data.results || data.results.length === 0) {
        ui.results.innerHTML = '<div class="no-results">No recipes found. Try a different search term!</div>';
        return;
    }

    data.results.forEach(recipe => {
        const title = recipe.title;
        const image = recipe.image;
        let calories = '', protein = '', fat = '', carbs = '';
        if (recipe.nutrition && recipe.nutrition.nutrients) {
            const nutrients = recipe.nutrition.nutrients;
            const calInfo = nutrients.find(n => n.name === 'Calories');
            const proteinInfo = nutrients.find(n => n.name === 'Protein');
            const fatInfo = nutrients.find(n => n.name === 'Fat');
            const carbsInfo = nutrients.find(n => n.name === 'Carbohydrates');
            if (calInfo) calories = Math.round(calInfo.amount) + ' ' + calInfo.unit;
            if (proteinInfo) protein = Math.round(proteinInfo.amount) + ' ' + proteinInfo.unit;
            if (fatInfo) fat = Math.round(fatInfo.amount) + ' ' + fatInfo.unit;
            if (carbsInfo) carbs = Math.round(carbsInfo.amount) + ' ' + carbsInfo.unit;
        }
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        const titleElement = document.createElement('h3');
        titleElement.setAttribute('aria-label', title);
        appendQueryHighlights(titleElement, title, query);
        recipeDiv.appendChild(titleElement);
        recipeDiv.insertAdjacentHTML('beforeend', `
            <img src="${image}" alt="${title}" loading="lazy">
            <p><strong>Calories:</strong> ${calories}</p>
            <p><strong>Carbs:</strong> ${carbs}</p>
            <p><strong>Protein:</strong> ${protein}</p>
            <p><strong>Fat:</strong> ${fat}</p>
        `);
        ui.results.appendChild(recipeDiv);
        //console.log(recipe.id);
        recipeDiv.addEventListener('click', async () => {
            information(recipe.id);
        })
    });
}



//==================================================================================================================================
//השלמה אוטומטית בחיפוש
/*
export async function RecipeSuggest(query, searchInput, autocompleteList) {
    autocompleteList.innerHTML = ''; // לנקות קודם
    let data;
    try {
        data = await api_RecipeSuggest(query);
    } catch (error) {
        const li = document.createElement('li');
        li.classList.add('No-results');
        li.textContent = `Suggestions unavailable: ${error.message}`;
        autocompleteList.appendChild(li);
        return;
    }

    if (!data || data.length === 0) {
        const li = document.createElement("li");
        li.classList.add('No-results');
        li.textContent = "No results found";
        autocompleteList.appendChild(li);
        return;
    }

    // מה שהמשתמש חיפש
    query = searchInput.value.trim().toLowerCase();

    data.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("autocomplete-item");

        // הדגשת המילה המתאימה
        const title = item.title;
        const regex = new RegExp(`(${query})`, "gi");//i = לא רגיש לאותיות גדולות וקטנות וגלובלי
        li.innerHTML = title.replace(regex, `<span class="highlight">$1</span>`);


        // בלחיצה על הצעה – למלא את שורת החיפוש ולסגור את הרשימה
        li.addEventListener("click", () => {
            searchInput.value = item.title;
            autocompleteList.innerHTML = '';
        });

        autocompleteList.appendChild(li);
    });

    // מאזין ללחיצה בכל הדף
    document.addEventListener('click', function (e) {
        // אם הלחיצה לא הייתה על שדה החיפוש ולא בתוך הרשימה  ,הרשימה תיסגר
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            autocompleteList.innerHTML = '';
        }
    });

}
*/

// פונקציית עזר לניקוי תווים מיוחדים כדי למנוע קריסות ב-RegExp
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function RecipeSuggest(query, searchInput, autocompleteList) {
    autocompleteList.innerHTML = ''; // לנקות קודם
    let data;
    try {
        data = await api_RecipeSuggest(query);
    } catch (error) {
        const li = document.createElement('li');
        li.classList.add('No-results');
        li.textContent = `Suggestions unavailable: ${error.message}`;
        autocompleteList.appendChild(li);
        return;
    }

    if (!data || data.length === 0) {
        const li = document.createElement("li");
        li.classList.add('No-results');
        li.textContent = "No results found";
        autocompleteList.appendChild(li);
        return;
    }

    // מה שהמשתמש חיפש
    const rawQuery = searchInput.value.trim();
    
    // הגנה על תווים מיוחדים בחיפוש (למשל סוגריים או כוכביות)
    const safeQuery = escapeRegExp(rawQuery);

    data.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("autocomplete-item");

        // הדגשת המילה המתאימה עם תמיכה בסינון תווים מיוחדים
        const title = item.title;
        if (safeQuery) {
            const regex = new RegExp(`(${safeQuery})`, "gi"); // i = לא רגיש לאותיות גדולות/קטנות
            li.innerHTML = title.replace(regex, `<span class="highlight">$1</span>`);
        } else {
            li.textContent = title;
        }

        // בלחיצה על הצעה – למלא את שורת החיפוש ולסגור את הרשימה
        li.addEventListener("click", () => {
            searchInput.value = item.title;
            autocompleteList.innerHTML = '';
        });

        autocompleteList.appendChild(li);
    });
}





