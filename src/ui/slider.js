import { api_random } from '../api/api.js';
import { information } from './information.js';

const brandTrack = document.getElementById('brand-track');
const brandTitle = document.getElementById('brand-title');
brandTitle.innerText = 'Most Popular This Month';

const randomRecipeGrid = document.getElementById('random-recipe-grid');

async function printRandomRecipeGrid(numberOfRecipes = 8) {
    try {
        const data = await api_random(numberOfRecipes);
        if (!Array.isArray(data?.recipes) || data.recipes.length === 0) {
            throw new Error('No recipes were returned.');
        }

        data.recipes.forEach((recipe) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'random-recipe-card';
            card.setAttribute('aria-label', `View recipe: ${recipe.title}`);

            const image = document.createElement('img');
            image.src = recipe.image;
            image.alt = recipe.title || 'Recipe';
            image.loading = 'lazy';

            const title = document.createElement('span');
            title.className = 'random-recipe-title';
            title.textContent = recipe.title || 'Untitled recipe';

            card.append(image, title);
            card.addEventListener('click', () => information(recipe.id));
            randomRecipeGrid.appendChild(card);
        });
    } catch (error) {
        const message = document.createElement('p');
        message.className = 'random-grid-message';
        message.textContent = `Recipes could not be loaded: ${error.message}`;
        randomRecipeGrid.appendChild(message);
    }
}

export async function printSlider(numberOfRecipes = 10) {
    const brandGroup = document.createElement('div');
    brandGroup.classList.add('brand-group');
    let arr_recipes;
    try {
        arr_recipes = await api_random(numberOfRecipes);
    } catch (error) {
        const message = document.createElement('p');
        message.classList.add('message');
        message.textContent = `Recipes could not be loaded: ${error.message}`;
        brandGroup.appendChild(message);
        return brandGroup;
    }

    console.log(arr_recipes);

    if (arr_recipes.status === 'failure') {
        const noResults = document.createElement("div");
        noResults.classList.add("no-results");
        noResults.innerHTML = `
        <div class="chase-animation">
            <span class="chef">👨‍🍳</span>
            <span class="food">🍕</span>
        </div>
        <p class="message">We couldn't find that recipe. The kitchen is still looking!</p>`;
        brandGroup.appendChild(noResults);
        return brandGroup;
    }


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
        brandGroup.appendChild(divSliderRecipes);

        divSliderRecipes.addEventListener('click', () => {
            information(divSliderRecipes.id);
        })
    });
    return brandGroup;
}


const arr = await printSlider();
brandTrack.appendChild(arr);
printRandomRecipeGrid();


