import { initCookbookData, saveRecipe, deleteRecipe, saveIngredients } from './favourites.js';
import { api_addInformation, apiSubstitutes, api_getIngredients, api_getTaste } from '../api/api.js'

import { ui } from './main.js';

//האנימציה
import { showLoader } from './Loader.js'

//התמונות
import readyInMinutes from '../image/readyInMinutes.png';
import calories from '../image/calories.png';
import likes from '../image/likes.png';
import dollar from '../image/dollar.png';
import score from '../image/score.png';
import category from '../image/category.png';
import reset from '../image/reset.png';
import Ingredients from '../image/Ingredients.png';
import V from '../image/V.png';
import X from '../image/X.png';
import HealthyHeart from '../image/Healthy-Heart.png';
import NeutralHeart from '../image/Neutral-Heart.png';






export async function information(id) {
    ui.results.innerHTML = '';
    ui.informations.innerHTML = '';
    console.log(ui.informations, 12312);

    await showLoader(ui.results, 3);
    const recipe = await api_addInformation(id);

    console.log(recipe);
    //עטיפת הכל
    const modal = document.createElement('div');
    modal.classList.add('information-modal');

    const card = document.createElement('div');
    card.classList.add('information-card');

    // אזור מידע עליון עם אייקונים
    const topInfo = document.createElement('div');
    topInfo.classList.add('information-topInfo');

    const dataPoints = [
        { icon: readyInMinutes, text: recipe.readyInMinutes + ' דקות' },
        { icon: calories, text: (recipe.summary.match(/(\d+)\s*calories/i)?.[1] || 'לא ידוע') + ' קלוריות למנה' },
        { icon: likes, text: recipe.aggregateLikes + ' לייקים' },
        { icon: dollar, text: (recipe.pricePerServing / 100).toFixed(2) + ' $  למנה' },
        { icon: score, text: (recipe.summary.match(/\d+\s*%/g)?.at(-1)?.match(/\d+/)?.input || 'לא ידוע') },
    ];
    console.log(recipe.summary.match(/(\d+)\s*calories/i));

    dataPoints.forEach(data => {
        const item = document.createElement('div');
        const img = document.createElement('img');
        item.classList.add('information-item');
        img.src = data.icon;
        img.classList.add('information-img');
        img.alt = 'readyInMinutes.png';
        item.appendChild(img);

        const span = document.createElement('span');
        span.textContent = data.text;
        span.classList.add('information-span');
        item.appendChild(span);

        topInfo.appendChild(item);
    });


    //קופסא לתמונה ולמידע אלרגיה
    const imageInfoBox = document.createElement('div');
    imageInfoBox.classList.add('imageInfoBox');


    //מידע על אלרגיות
    const divInfoBox = document.createElement('div');
    divInfoBox.classList.add('infoBox-wrapper');


    const columnTrue = document.createElement('div');//עמודה לימין
    const columnFalse = document.createElement('div');//עמודה לשמאל
    columnTrue.classList.add('column');
    columnFalse.classList.add('column');

    divInfoBox.appendChild(columnTrue);
    divInfoBox.appendChild(columnFalse);

    createInfoBox('glutenFree', recipe.glutenFree, columnTrue, columnFalse);
    createInfoBox('dairyFree', recipe.dairyFree, columnTrue, columnFalse);
    createInfoBox('ketogenic', recipe.ketogenic, columnTrue, columnFalse);
    createInfoBox('vegan', recipe.vegan, columnTrue, columnFalse);
    createInfoBox('vegetarian', recipe.vegetarian, columnTrue, columnFalse);
    createInfoBox('veryHealthy', recipe.veryHealthy, columnTrue, columnFalse);
    createInfoBox('veryPopular', recipe.veryPopular, columnTrue, columnFalse);

    imageInfoBox.appendChild(divInfoBox);


    // עטיפת תמונה והמידע בריחוף
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('information-imageWrapper');

    const img = document.createElement('img');
    img.src = recipe.image;
    img.alt = recipe.title;
    img.classList.add('information-image');

    //הוספה למועדופים
    const favorite = document.createElement('button');
    favorite.classList.add('favorite');
    favorite.innerHTML = '&#10084;'; // לב

    //תמונה של בריאות המנה
    const healthScore = document.createElement('img');
    healthScore.classList.add('healthScore');
    healthScore.src = recipe_healthScore(recipe.healthScore);//פעולה שמחזירה את התמונה המתאימה

    //מועדפים מתכון===============================================================================================================
    // בדיקה בטעינה — אם כבר במועדפים, לשים כצבוע
    let dataRecipe = initCookbookData();
    console.log(dataRecipe);
    if (dataRecipe.user.recipes[recipe.id]) {
        favorite.classList.add('liked');
    }

    imageWrapper.appendChild(healthScore);
    imageWrapper.appendChild(favorite);

    // מאזין ללחיצה
    favorite.addEventListener('click', () => {
        if (dataRecipe.user.recipes[recipe.id]) {
            // אם כבר במועדפים — להסיר
            deleteRecipe(recipe.id);
            favorite.classList.remove('liked');
        } else {
            // אם לא במועדפים — להוסיף (עם תמונה וכותרת)
            saveRecipe({
                id: recipe.id,
                title: recipe.title,   // הכותרת
                image: recipe.image    // התמונה
            });
            favorite.classList.add('liked');
        }
        // אפקט ניצוץ וסיבוב
        favorite.classList.add('sparkle');
        setTimeout(() => favorite.classList.remove('sparkle'), 500);
    });


    // ==========================================================================================================================

    // בתוך התמונה סיכום
    const overlay = document.createElement('div');
    overlay.classList.add('information-overlay');

    const overlayGrid = document.createElement('div');
    overlayGrid.classList.add('information-overlayGrid');
    overlayGrid.innerHTML = recipe.summary || '';


    overlay.appendChild(overlayGrid);
    imageWrapper.appendChild(img);
    imageWrapper.appendChild(overlay);
    imageInfoBox.appendChild(imageWrapper);



    // ==========================================================================================================================
    //המידע על בריאות וטעם
    const taste = await api_getTaste(recipe.id);
    const tasteBar = document.createElement('div');
    tasteBar.classList.add('taste-bar');
    const icons = {
        sweetness: '🍯',     // מתיקות
        saltiness: '🧂',     // מליחות
        sourness: '🍋',     // חמיצות
        bitterness: '🍫',     // מרירות
        savoriness: '🍲',     // אומאמי
        fattiness: '🧈',     // שומניות
        spiciness: '🌶️'     // חריפות
    };


    for (const [key, value] of Object.entries(taste)) {
        const item = document.createElement('span');
        item.classList.add('taste-item');
        item.textContent = `${icons[key] || ''} ${Math.round(value)}`;
        tasteBar.appendChild(item);
    }

    imageWrapper.appendChild(tasteBar);






    // ==========================================================================================================================
    //  כותרת
    const title = document.createElement('h2');
    title.classList.add('information-title');
    title.textContent = recipe.title;

    //סוג הארוחה
    const DishTypes = document.createElement('div');
    DishTypes.classList.add('DishTypes');

    const divDishTypes = document.createElement('div');
    divDishTypes.classList.add('information-divDishTypes')
    const dish = recipe.dishTypes;
    dish.forEach(dishs => {
        const p = document.createElement('p');
        p.innerText = dishs + ',';
        divDishTypes.appendChild(p);
    })
    const imgDishTypes = document.createElement('img');
    imgDishTypes.src = category;
    imgDishTypes.alt = 'category.png';
    imgDishTypes.classList.add('imgDishTypes');

    DishTypes.appendChild(imgDishTypes);
    DishTypes.appendChild(divDishTypes);


    // ==========================================================================================================================
    //האופציות האחרות
    const result_substitutes = document.createElement('div');
    result_substitutes.classList.add('result_substitutes');


    //המצרכים
    const tableExtendedIngredients = document.createElement('table');
    tableExtendedIngredients.classList.add('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    //כותרת הטבלה
    const nameHeader = document.createElement('th');
    nameHeader.innerText = 'רכיב';

    const descHeader = document.createElement('th');
    descHeader.innerText = 'כמות / תיאור';


    headerRow.appendChild(nameHeader);
    headerRow.appendChild(descHeader);
    thead.appendChild(headerRow);
    tableExtendedIngredients.appendChild(thead);
    // יצירת גוף הטבלה
    const tbody = document.createElement('tbody');



    //כפתור לשינוי הטבלה לפי כמות המנות
    const div_servings = document.createElement('div');
    div_servings.classList.add('servings-container');

    const but_servings = document.createElement('button');
    const img_servings = document.createElement('img');
    img_servings.src = reset;
    img_servings.alt = ' מנות';
    img_servings.classList.add('servings-icon');
    but_servings.appendChild(img_servings);


    const input_servings = document.createElement('input');
    input_servings.classList.add('input_servings');
    input_servings.type = 'number';
    input_servings.value = recipe.servings;
    input_servings.min = 1;
    input_servings.max = 100;

    //כפתור איפוס הכמות
    but_servings.addEventListener('click', () => {
        extended_Ingredients(tbody, recipe, input_servings, result_substitutes);
    });

    extended_Ingredients(tbody, recipe, input_servings, result_substitutes);
    tableExtendedIngredients.appendChild(tbody);

    // שמירת המצרכים================================================================================================================
    //כפתור לשמירת המצרכים
    const but_Ingredients = document.createElement('button');
    const img_Ingredients = document.createElement('img');
    img_Ingredients.src = Ingredients;
    img_Ingredients.alt = 'מצרכים';
    img_Ingredients.classList.add('servings-icon');
    but_Ingredients.appendChild(img_Ingredients);
    but_Ingredients.addEventListener('click', () => {
        const inputs = tbody.querySelectorAll('.amountInput');//הערכים
        const nameTds = tbody.querySelectorAll('.nameTd');//המפתחות

        //חיבור בין שני האובייקטים לאובייקט
        const ingredients = {};
        inputs.forEach((input, index) => {
            const name = nameTds[index]?.textContent.trim(); // שם המצרך
            const value = input.value;                       // הכמות
            if (name) {
                ingredients[name] = value;
            }
        });
        console.log(ingredients);
        //but_Ingredients; // נעילת הכפתור
        saveIngredients(ingredients);
    });




    div_servings.appendChild(but_Ingredients);
    div_servings.appendChild(but_servings);
    div_servings.appendChild(input_servings);







    // השלבים בסליידר
    const instructionsContainer = createInstructionsSlider(recipe);

    //מעבר לאתר המקורי
    const link = document.createElement('a');
    link.id = 'recipe-link';
    link.href = recipe.sourceUrl;
    link.target = '_blank';
    link.textContent = 'לצפייה במתכון באתר המקורי';

    // הרכבת הכרטיס
    card.appendChild(topInfo);
    card.appendChild(imageInfoBox);
    card.appendChild(title);
    card.appendChild(DishTypes);
    card.appendChild(tableExtendedIngredients);
    card.appendChild(div_servings);
    card.appendChild(result_substitutes);
    card.appendChild(instructionsContainer);
    card.appendChild(link);

    modal.appendChild(card);
    ui.informations.appendChild(modal);
}


//==================================================================================================================================
//יצירת הנתונים לעמודות של מידע על אלרגיות
function createInfoBox(text, value, columnTrue, columnFalse) {
    const container = document.createElement('div');
    container.classList.add('createInfoBox');

    const label = document.createElement('span');
    label.innerText = text;

    const img = document.createElement('img');
    img.src = value ? V : X;
    img.classList.add('createInfoBox-img');

    container.appendChild(img);
    container.appendChild(label);

    if (value) {
        columnTrue.appendChild(container);
    } else {
        columnFalse.appendChild(container);
        container.classList.add('createInfoBox-no');
    }
}

//יצירת גוף הטבלה
function createTd(text) {
    const td = document.createElement('td');
    td.innerText = text;
    return td;
}

//==================================================================================================================================
//אופציה לחומרים אחרים למתכון
function Substitutes(data, result_substitutes) {
    //console.log(data);
    result_substitutes.innerHTML = '';

    const div_substitutes = document.createElement('div');
    div_substitutes.classList.add('div_substitutes');

    if (data.status === 'success') {
        // יצירת טבלה
        const table = document.createElement('table');
        table.classList.add('table');

        const tbody = document.createElement('tbody');
        const substitutes = data.substitutes;

        if (substitutes.length > 0) {
            // שורה ראשונה עם שם הרכיב בעמודה הראשונה + המחליף הראשון
            const firstRow = document.createElement('tr');

            const tdIngredient = createTd(data.ingredient);
            tdIngredient.rowSpan = substitutes.length; // תופס את כל השורות של המחליפים
            firstRow.appendChild(tdIngredient);
            firstRow.appendChild(createTd(substitutes[0]));

            tbody.appendChild(firstRow);

            // שאר המחליפים
            for (let i = 1; i < substitutes.length; i++) {
                const tr = document.createElement('tr');
                tr.appendChild(createTd(substitutes[i]));
                tbody.appendChild(tr);
            }
        } else {
            // אם אין מחליפים
            const tr = document.createElement('tr');
            td.colSpan = 2;
            tr.appendChild(createTd("אין מחליפים זמינים"));
            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        div_substitutes.appendChild(table);
    } else {
        div_substitutes.classList.add('div_substitutes-error');
        div_substitutes.innerText = data.message;
    }
    result_substitutes.appendChild(div_substitutes);
}


//==================================================================================================================================
/*יצירת הטבלה עם הכמות*/
async function extended_Ingredients(tbody, recipe, input_servings, result_substitutes) {
    const extendedIngredients = await api_getIngredients(recipe.id);
    //console.log(extendedIngredients);   
    const extendedIngredientsID = recipe.extendedIngredients;
    tbody.innerHTML = '';

    extendedIngredients.forEach((extended, index) => {
        const baseAmount = extended.amount.us.value / recipe.servings; // כמות למנה אחת

        const tr = document.createElement('tr');
        const nameTd = createTd(extended.name);
        nameTd.classList.add('nameTd');
        //אופציות אחרות למצרכים
        nameTd.addEventListener('click', async () => {
            const data = await apiSubstitutes(extendedIngredientsID[index].id);
            Substitutes(data, result_substitutes);
        })
        tr.appendChild(nameTd);



        const amountTd = document.createElement('td');

        // יצירת אינפוט כמות
        const amountInput = document.createElement('input');
        amountInput.classList.add('amountInput');
        amountInput.type = 'number';
        amountInput.step = '0.01';
        amountInput.value = (baseAmount * input_servings.value).toFixed(2);
        amountInput.dataset.baseAmount = baseAmount;

        // שמירת lastValue לכל שורה
        let lastValue = parseFloat(amountInput.value);

        // מאזין לשינוי ידני של הכמות
        amountInput.addEventListener('input', () => {
            let currentValue = parseFloat(amountInput.value) || 0;
            const delta = currentValue - lastValue;

            // עדכון בכמות לפי קפיצות של baseAmount
            if (delta > 0) {
                amountInput.value = (lastValue + baseAmount).toFixed(2);
            } else if (delta < 0) {
                amountInput.value = Math.max(0, lastValue - baseAmount).toFixed(2);
            }

            lastValue = parseFloat(amountInput.value);
        });

        const unitSpan = document.createElement('span');
        unitSpan.textContent = ` ${extended.amount.us.unit}`;

        amountTd.appendChild(amountInput);
        amountTd.appendChild(unitSpan);
        tr.appendChild(amountTd);

        //tr.appendChild(createTd(`${extendedIngredientsID[index].id}`));

        // כפתור מחיקה
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => tr.remove());
        tr.appendChild(deleteBtn);

        tbody.appendChild(tr);
    });

    // מאזין לשינוי מספר המנות
    input_servings.addEventListener('input', () => {
        const servings = parseFloat(input_servings.value) || 1;
        tbody.querySelectorAll('.amountInput').forEach((input, index) => {
            const baseAmount = extendedIngredients[index].amount.us.value / recipe.servings;
            input.value = (baseAmount * servings).toFixed(2);
        });
    });
}




//==================================================================================================================================
//החזרת תמונה לבריאות המנה
function recipe_healthScore(healthScore) {
    if (healthScore < 30)
        return HealthyHeart;
    else if (healthScore > 70)
        return NeutralHeart;
    else
        return HealthyHeart;
}


//==================================================================================================================================
//פעולה שיוצרת את השלבים במתכון
function step(recipe) {
    const instructionsContainer = document.createElement('div');
    instructionsContainer.classList.add('recipe-instructions');

    const instructionSteps = recipe.analyzedInstructions?.[0]?.steps || [];

    instructionSteps.forEach(instruction => {
        const stepContainer = document.createElement('div');
        stepContainer.classList.add('instruction-step');

        const stepNumber = document.createElement('h4');
        stepNumber.innerText = `שלב ${instruction.number}:`;

        const stepDescription = document.createElement('p');
        stepDescription.innerText = instruction.step;

        if (instruction.length && instruction.length.number && instruction.length.unit) {
            stepNumber.innerText += ` ⏱ ${instruction.length.number} ${instruction.length.unit}`;
        }

        stepContainer.appendChild(stepNumber);
        stepContainer.appendChild(stepDescription);

        instructionsContainer.appendChild(stepContainer);
    });
    return instructionsContainer;
}

//==================================================================================================================================
//פעולה שיוצרת את הסליידר של ההוראות
function createInstructionsSlider(recipe) {
    // הקונטיינר הראשי של הסליידר
    const sliderContainer = document.createElement('div');
    sliderContainer.classList.add('recipe-slider-container');


    // כפתורי חצים
    const leftBtn = document.createElement('button');
    leftBtn.classList.add('slider-btn', 'left-btn');
    leftBtn.innerHTML = '&#10094;';

    const rightBtn = document.createElement('button');
    rightBtn.classList.add('slider-btn', 'right-btn');
    rightBtn.innerHTML = '&#10095;';


    // בניית הסליידר
    const instructionsContainer = step(recipe);
    sliderContainer.appendChild(instructionsContainer);// הקונטיינר של ההוראות בתוך הסליידר
    sliderContainer.appendChild(leftBtn);
    sliderContainer.appendChild(rightBtn);
    //console.log(instructionsContainer);
    // סקריפט לחצים
    let sliderIndex = 0;
    const sliders = instructionsContainer.querySelectorAll('.instruction-step');
    //console.log(sliders);
    showSlide(sliderIndex);

    function showSlide(index) {
        if (index == 0) leftBtn.style.visibility = 'hidden';
        else if (index == sliders.length - 1) rightBtn.style.visibility = 'hidden';
        else { leftBtn.style.visibility = 'visible'; rightBtn.style.visibility = 'visible'; }

        /*
        if (index < 0) sliderIndex = sliders.length - 1;
        else if(index >= sliders.length) sliderIndex = 0;
        */
        sliders.forEach(slide => slide.classList.remove('displaySlide'));
        sliders[sliderIndex].classList.add('displaySlide');
    }

    leftBtn.addEventListener('click', () => {
        sliderIndex--;
        showSlide(sliderIndex);
    });

    rightBtn.addEventListener('click', () => {
        sliderIndex++;
        showSlide(sliderIndex);
    });


    // מחזיר את הקונטיינר הראשי של הסליידר
    return sliderContainer;
}







