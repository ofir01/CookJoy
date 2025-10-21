import { api_random } from '../api/api.js';
import { information } from './information.js';
import { ui } from './main.js';


export async function printSlider() {
    ui.h1slider.innerHTML = '';
    ui.sliderContainer.innerHTML = '';
    ui.h1slider.innerText = 'מה נכין היום ?';//בשביל מתכונים דומים שיהיה אפשר לשנות לכן זה פה

    const arr_recipes = await api_random(10);

    console.log(arr_recipes.recipes);
    const slider = document.createElement('div');
    slider.classList.add('slider');

    /*if (!recipes || recipes.length === 0) {
        ui.h1slider.innerText = '';
        const noResults = document.createElement("div");
        noResults.classList.add("no-results");
        noResults.innerHTML = `
        <div class="chase-animation">
            <span class="chef">👨‍🍳</span>
            <span class="food">🍕</span>
        </div>
        <p class="message">לא מצאנו את מה שחיפשת... הטבח עדיין מחפש אותו!</p>`;
        slider.appendChild(noResults);
        return;
    }*/


    arr_recipes.recipes.forEach(recipe => {
        const divSliderRecipes = document.createElement("div");
        divSliderRecipes.classList.add('buttonSliderRecipes');
        divSliderRecipes.id = recipe.id;

        const img = document.createElement("img");
        img.src = recipe.image;
        img.alt = recipe.title;
        img.classList.add('slider-recipe-img');

        const h3 = document.createElement("h3");
        h3.textContent = recipe.title;
        h3.classList.add('slider-recipe-title');

        divSliderRecipes.appendChild(img);
        divSliderRecipes.appendChild(h3);
        slider.appendChild(divSliderRecipes);

        divSliderRecipes.addEventListener('click', () => {
            information(divSliderRecipes.id);
        })
    });
    ui.sliderContainer.appendChild(slider);
}





