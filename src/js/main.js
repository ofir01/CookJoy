// Import our custom CSS
import '../css/styles.css'



// Import all of Bootstrap’s JS
import * as bootstrap from 'bootstrap'

import { API_people } from './api.js';
import { people, films } from "./card.js";


const resulte = document.getElementById('resulte');
people(resulte);



//חיפש
const Search = document.getElementById('Search');
const formSearch = document.getElementById('formSearch');
formSearch.addEventListener("submit", async (e) => {
    e.preventDefault(); // מונע ריענון
    //אם החיפוש מתקדם פתוח, נסגור אותו
    if (resulte.classList.contains('d-none')) {
        divAdvancedSearch.classList.toggle('d-none');
        resulte.classList.toggle('d-none');
    }
    const query = Search.value.trim();
    //console.log(Search.value.trim());

    const data = await API_people();
    formSearch.reset();//איפוס הטופס

    for (const element of data) {
        //console.log(element);
        if (element.name === query) {
            films(element, resulte);
            return; // זה באמת יעצור את פונקציית ה-submit
        }
    }
    resulte.innerHTML = `
  <div class="alert alert-danger" role="alert">
    לא נמצא דמות בשם: <strong>${query}</strong>
  </div>
`;
});



//חיפוש מתקדם
const AdvancedSearch = document.getElementById('AdvancedSearch');
const divAdvancedSearch = document.getElementById('divAdvancedSearch');
AdvancedSearch.addEventListener('click', () => {
    resulte.classList.toggle('d-none');
    divAdvancedSearch.classList.toggle('d-none');
})

const formAdvancedSearch = document.getElementById('formAdvancedSearch');
formAdvancedSearch.addEventListener('submit', async (e) => {
    e.preventDefault(); // מונע ריענון
    const formData = new FormData(formAdvancedSearch);
    // הפוך ל־object רגיל
    const filters = Object.fromEntries(formData.entries());

    const data = await API_people();

    // מסיר שדות ריקים
    const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
    );

    const filteredData = data.filter(character => {
        return Object.entries(activeFilters).every(([key, value]) => {
            return String(character[key]).toLowerCase() === value.toLowerCase();
        });
    });

    resulte.classList.toggle('d-none');
    divAdvancedSearch.classList.toggle('d-none');
    formAdvancedSearch.reset();//איפוס הטופס

    if (filteredData.length === 0) {
        resulte.innerHTML = `
  <div class="alert alert-danger" role="alert">
    לא נמצא דמות : <strong></strong>
  </div>
`;
        return;
    }

    people(resulte, filteredData);
})


