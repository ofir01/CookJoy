import { api_getTaste, api_random, api_tasteWidget_png, api_guessNutrition } from '../api/api.js'
import { getScore, getAttempts, SetScore, SetAttempts } from './favourites.js';


/*המשחקים*/
const tasteWidget = document.getElementById('tasteWidget');
const guessNutrition = document.getElementById('guessNutrition');
//טעם שולט
tasteWidget.addEventListener('click', () => {
    game_tasteWidget();
});


//ניחוש הקלוריות
guessNutrition.addEventListener('click', () => {
    game_guessNutrition();
});


// פונקציה ליצירת overlay ולוח משחק
function createGameOverlay(gameType) {
    // אם כבר קיים overlay – לנקות אותו
    let oldOverlay = document.querySelector(".overlay");
    let oldPanel = document.querySelector(".panel");
    if (oldOverlay) oldOverlay.remove();
    if (oldPanel) oldPanel.remove();

    // יצירת Overlay
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    // יצירת חלונית המשחק
    const panel = document.createElement("section");
    panel.classList.add("panel");
    panel.classList.add(`panel--${gameType}`);
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'panel-heading-title');

    // תוכן פנימי
    const inner = document.createElement("div");
    inner.classList.add("panel__inner");

    // כפתור סגירה
    const closeBtn = document.createElement("button");
    closeBtn.classList.add("close-x");
    closeBtn.type = "button";
    closeBtn.setAttribute('aria-label', 'Close game');

    const heading = document.createElement('div');
    heading.classList.add('panel-heading');
    heading.innerHTML = gameType === 'taste'
        ? '<span class="panel-eyebrow">TASTE DETECTIVE</span><h2 id="panel-heading-title">Guess the dominant flavor</h2><p>Study the dish, make your guess, and reveal its flavor profile.</p>'
        : '<span class="panel-eyebrow">NUTRITION CHALLENGE</span><h2 id="panel-heading-title">How nutritious is this recipe?</h2><p>Estimate the nutrition values, then check how close you got.</p>';


    inner.appendChild(closeBtn);
    inner.appendChild(heading);
    panel.appendChild(inner);


    document.body.appendChild(overlay);
    overlay.appendChild(panel);


    const open = () => {
        overlay.classList.add("show");
    };


    const close = () => {
        overlay.classList.remove("show");
        overlay.remove();
    };

    // מניעת סגירה בלחיצה על התיבה עצמה (panel)
    panel.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);


    open();


    return { overlay, panel, inner, close };
}

function showGameError(container, error) {
    const message = document.createElement('p');
    message.classList.add('api-error');
    message.setAttribute('role', 'alert');
    message.textContent = `Game data could not be loaded: ${error.message}`;
    container.appendChild(message);
}





// משחק הטעם השולט==========================================================================================================
//אובייקט הגדרות המשחק
const gameData = {
    options: ['bitterness', 'fattiness', 'saltiness', 'savoriness', 'sourness', 'spiciness', 'sweetness'],
    title: 'Who is the dominant taste?',
    score: getScore(),
    attempts: getAttempts(),
};

//מחזיר את הטעם השולט
function getMaxKeyValue(obj) {
    let maxKey = null;
    let maxValue = 0;

    for (const [key, value] of Object.entries(obj)) {
        if (value > maxValue) {
            maxValue = value;
            maxKey = key;
        }
    }
    return { key: maxKey, value: maxValue };
}

// משחק הטעם השולט
export async function game_tasteWidget() {
    const { inner, overlay } = createGameOverlay('taste');

    let recipe;
    let data;
    let taste;
    let img;
    try {
        recipe = await api_random(1);
        data = recipe?.recipes?.[0];
        if (!data) throw new Error('No recipe was returned.');
        taste = await api_getTaste(data.id);
        if (!taste || typeof taste !== 'object' || !Object.keys(taste).length) {
            throw new Error('The flavor profile is missing from the service response.');
        }
        try {
            img = await api_tasteWidget_png(data);
        } catch (error) {
            console.error('Taste chart image could not be loaded:', error);
            img = data.image;
        }
    } catch (error) {
        console.error('Taste game could not be loaded:', error);
        showGameError(inner, error);
        return;
    }
    const maxTaste = getMaxKeyValue(taste); // מחזיר את הטעם השולט באובייקט
    //console.log(taste);
    //console.log(maxTaste);

    gameData.attempts += 1;
    let experience = 0;
    let Maximum_attempts = 4;

    // יצירת אלמנטים
    const scoreWrap = document.createElement('div');
    scoreWrap.classList.add('score');
    scoreWrap.textContent = 'score: ' + gameData.score + '/' + gameData.attempts;  // הצגת הניקוד
    const title = document.createElement('h2');
    title.classList.add('title-game');
    title.textContent = data.title;
    //
    //מפצל את התמונה לשני חלקים
    const imagesRow = document.createElement('div');
    imagesRow.classList.add('images-row');

    const hero = document.createElement('div');
    hero.classList.add('hero');
    const heroImg = document.createElement('img');
    heroImg.alt = 'Main image';
    heroImg.src = data.image;
    hero.appendChild(heroImg);

    const subtitle = document.createElement('div');
    subtitle.classList.add('subtitle');
    subtitle.textContent = 'Every dish has a unique flavor profile. Which taste stands out most?';

    const row = document.createElement('div');
    row.classList.add('row');

    // הוספת האופציות לתפריט
    const select = document.createElement('select');
    const options = gameData.options;
    options.forEach((opt) => {
        const o = document.createElement('option');
        o.textContent = opt;
        o.value = opt;
        select.appendChild(o);
    });


    // מדפיס את הערך של הטעם שהמשתמש בחר
    const selectedValue_Text = document.createElement('p');
    selectedValue_Text.classList.add('message_Text');

    // כפתור הבדיקה
    const actionBtn = document.createElement('button');
    actionBtn.classList.add('action-btn');
    actionBtn.type = 'button';
    actionBtn.textContent = 'Choose Taste';
    actionBtn.addEventListener('click', () => {
        const selectedValue = select.value;
        experience++;
        inlineExperience.textContent = 'experience: ' + experience;
        if (selectedValue === maxTaste.key) {
            gameData.score += Maximum_attempts - experience;
            scoreWrap.textContent = 'score: ' + gameData.score + '/' + gameData.attempts;  // עדכון הניקוד
            actionBtn.disabled = true; // השבתת הכפתור
            extraImg.classList.add('visible');// גילוי התמונה
            message_Text.textContent = 'That’s right: ' + selectedValue;
            SetScore(gameData.score); // שמירת הניקוד ב-localStorage
            SetAttempts(gameData.attempts); // שמירת הניסיונות ב-localStorage
        } else if (experience === Maximum_attempts) {
            extraImg.classList.add('visible');// גילוי התמונה
            actionBtn.disabled = true; // השבתת הכפתור
            message_Text.textContent = 'Out of guesses. The answer was: ' + maxTaste.key;
            SetAttempts(gameData.attempts); // שמירת הניסיונות ב-localStorage
        }
        //console.log("נבחר:", selectedValue);
        const selectedTaste = Number(taste[selectedValue]);
        selectedValue_Text.textContent = `You selected: ${selectedValue}: ${Number.isFinite(selectedTaste) ? `${Math.round(selectedTaste)}%` : 'N/A'}`;
    });

    // שחק שוב
    const resetBtn = document.createElement('button');
    resetBtn.classList.add('reset-btn');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Play again';
    resetBtn.addEventListener('click', async () => {
        overlay.classList.remove("show");
        overlay.remove();
        game_tasteWidget();//חוזר על המשחק שוב
    });




    // ניקוד 
    const inlineExperience = document.createElement('span');
    inlineExperience.classList.add('inline-experience');
    inlineExperience.textContent = 'experience: ' + experience;


    //התמונה הנכונה של הטעמים
    const extra = document.createElement('div');
    extra.classList.add('extra');
    const extraImg = document.createElement('img');
    extraImg.alt = 'Extra image';
    extraImg.src = img;
    extra.appendChild(extraImg);


    //הדפסת המצרכים והכמות
    const ingredientsList = document.createElement('ul');
    ingredientsList.classList.add('ingredients-list');
    data.extendedIngredients.forEach(ingredient => {
        const listItem = document.createElement('li');
        listItem.textContent = `${ingredient.original}`;
        ingredientsList.appendChild(listItem);
    });
    //console.log(data.extendedIngredients.map(i => `${i.amount} ${i.name}`));

    const br = document.createElement('br');
    ingredientsList.appendChild(br);









    //הדפסת התוצאה 
    const message_Text = document.createElement('p');
    message_Text.classList.add('message_Text');



    // הוספת כל האלמנטים לשכבת המשחק
    row.appendChild(actionBtn);
    row.appendChild(select);
    row.appendChild(resetBtn);
    row.appendChild(inlineExperience);


    imagesRow.appendChild(hero);
    imagesRow.appendChild(extra);


    inner.appendChild(title);
    inner.appendChild(scoreWrap);
    inner.appendChild(imagesRow);
    inner.appendChild(subtitle);
    inner.appendChild(row);
    inner.appendChild(selectedValue_Text);
    inner.appendChild(message_Text);
    inner.appendChild(ingredientsList);
}





//================================================================================================================================================
//ניחוש מידע תזונתי לפי כותרת
export async function game_guessNutrition() {
    const { inner } = createGameOverlay('nutrition');

    let recipe;
    let data;
    try {
        recipe = await api_random(1);
        const recipeTitle = recipe?.recipes?.[0]?.title;
        if (!recipeTitle) throw new Error('No recipe was returned.');
        data = await api_guessNutrition(recipeTitle);
    } catch (error) {
        console.error('Nutrition game could not be loaded:', error);
        showGameError(inner, error);
        return;
    }
    const recipeTitle = document.createElement('h3');
    recipeTitle.classList.add('title-game');
    recipeTitle.textContent = recipe.recipes[0].title;
    inner.appendChild(recipeTitle);
    //console.log(data);


    Object.keys(data).forEach((key) => {
        if (key === "recipesUsed") return;


        const item = data[key];
        if (!item?.confidenceRange95Percent) return;
        const min = item.confidenceRange95Percent.min;
        const max = item.confidenceRange95Percent.max;
        if (!Number.isFinite(min) || !Number.isFinite(max)) return;
        const mid = (min + max) / 2;


        const wrapper = document.createElement("div");
        wrapper.classList.add("guess-item");


        const label = document.createElement("label");
        label.classList.add("guess-label");

        label.textContent = `${key.toUpperCase()} (${item.unit})`;



        const rangeInput = document.createElement("input");
        rangeInput.classList.add("guess-rangeInput");

        rangeInput.type = "range";
        rangeInput.min = min;
        rangeInput.max = max;
        rangeInput.step = 0.01;


        const numberInput = document.createElement("input");
        numberInput.classList.add("guess-numberInput");
        numberInput.type = "number";
        numberInput.min = min;
        numberInput.max = max;
        numberInput.step = 0.01;
        numberInput.value = ((min + max) / 2).toFixed(2);


        rangeInput.value = numberInput.value;


        // sync inputs
        rangeInput.addEventListener("input", () => {
            numberInput.value = rangeInput.value;
        });
        numberInput.addEventListener("input", () => {
            rangeInput.value = numberInput.value;
        });


        // feedback button
        const checkBtn = document.createElement("button");
        checkBtn.classList.add("guess-checkBtn");
        checkBtn.textContent = "Check";


        const result = document.createElement("span");
        result.classList.add("guess-result");


        checkBtn.addEventListener("click", () => {
            const guess = parseFloat(numberInput.value);
            const diff = Math.abs(guess - mid).toFixed(2);
            result.textContent = ` Mid: ${mid.toFixed(2)} → Your guess is off by ${diff}`;
        });





        wrapper.appendChild(label);
        wrapper.appendChild(rangeInput);
        wrapper.appendChild(numberInput);
        wrapper.appendChild(checkBtn);
        wrapper.appendChild(result);
        inner.appendChild(wrapper);
    });


    const resetBtn = document.createElement('button');
    resetBtn.classList.add('reset-btn');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Play again';
    resetBtn.addEventListener('click', async () => {
        game_guessNutrition();//מתחיל משחק חדש
    });

    inner.appendChild(resetBtn);

}











/*
<div class="overlay">
  <div class="panel">
    <div class="panel__inner">
      <h2 class="title">בחר אפשרות</h2>
      <p class="subtitle">כפתורים </p>
      <div class="row">
        <button class="action-btn">Action 1</button>
        <button class="action-btn">Action 2</button>
        <button class="reset-btn">Reset</button>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </select>
      </div>
      <div class="extra">
        <p>תיבה אחורית לכל הכפתורים</p>
      </div>
      <button class="close-x"></button>
    </div>
  </div>
</div>
*/









//עזרה בקבלת תשובה
/*
    const ingredientFlavorMap = {
        // חלבונים / בשר
        "chicken": "savoriness",
        "beef": "savoriness",
        "pork": "savoriness",
        "bacon": "fattiness",
        "ham": "fattiness",
        "salmon": "savoriness",

        // שומנים / שמנים
        "butter": "fattiness",
        "oil": "fattiness",
        "cream": "fattiness",
        "cheese": "fattiness",

        // פירות / מתוק
        "sugar": "sweetness",
        "honey": "sweetness",
        "maple syrup": "sweetness",
        "pineapple": "sweetness",
        "apple": "sweetness",
        "banana": "sweetness",

        // ירקות / ירוקים
        "garlic": "spiciness",
        "onion": "savoriness",
        "scallions": "savoriness",
        "ginger": "spiciness",
        "cauliflower": "savoriness",
        "pepper": "spiciness",

        // תבלינים / מלח
        "salt": "saltiness",
        "soy sauce": "saltiness",
        "cinnamon": "sweetness",
        "red pepper flakes": "spiciness",

        // אגוזים / שקדים
        "walnuts": "fattiness",
        "almonds": "fattiness",
        "pecans": "fattiness",

        // חמצמץ / חומצי
        "lemon": "sourness",
        "lime": "sourness",
        "vinegar": "sourness"
    };

    // דוגמה לשימוש:
    const recipeIngredients = data.extendedIngredients.map(i => i.name);
    //console.log(recipeIngredients);
    const flavorCount = {};

    recipeIngredients.forEach(i => {
        const flavor = ingredientFlavorMap[i.toLowerCase()];
        if (flavor) {
            flavorCount[flavor] = (flavorCount[flavor] || 0) + 1;
        }
    });

    // מציאת הטעם השולט
    const flavors = Object.keys(flavorCount);
    let dominantFlavor = null;
    if (flavors.length > 0) {
        dominantFlavor = flavors.reduce((a, b) => flavorCount[a] > flavorCount[b] ? a : b);
    }
    console.log(dominantFlavor); // תחזיר 'fattiness'

*/
