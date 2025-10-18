import {API_people, API_films, API_peoples, API_people_url } from './api.js';



//תפריט חזרה
function updateBreadcrumb(steps) {
    const breadcrumb = document.querySelector('.breadcrumb');
    breadcrumb.innerHTML = ''; // מנקה קודם

    steps.forEach((step, index) => {
        const li = document.createElement('li');
        li.classList.add('breadcrumb-item');

        if (index === steps.length - 1) {
            // האחרון (העמוד הנוכחי)
            li.classList.add('active');
            li.setAttribute('aria-current', 'page');
            li.textContent = step.label;
        } else {
            // לינק של שלב קודם
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = step.label;
            a.addEventListener('click', step.onClick); // מחזיר לפעולה הרלוונטית
            li.appendChild(a);
        }

        breadcrumb.appendChild(li);
    });
}







//שמות השחקנים
export async function people(resulte,data = '') {
    resulte.innerHTML = '';
    if (!data) {
        data = await API_people();
    }

    const row = document.createElement('div');
    row.className = 'row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4'; // רספונסיבי

    //console.log(data);
    // breadcrumb
    updateBreadcrumb([
        { label: 'Home', onClick: () => location.reload() }
    ]);


    data.forEach(element => {
        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('div');
        card.className = 'card h-100 shadow-sm border-0';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body text-center';

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.textContent = element.name;

        cardBody.appendChild(cardTitle);
        card.appendChild(cardBody);
        col.appendChild(card);
        row.appendChild(col);
        
        card.addEventListener('click', () => {
            films(element, resulte);
        });
    });

    resulte.appendChild(row);
}



//כל הפרטים על השחקן והסרטים ששיחק
export async function films(data,resulte) {
    resulte.innerHTML = '';
    const url = await API_people_url(data.url);
     updateBreadcrumb([
        { label: 'Home', onClick: () => location.reload() },
        { label: data.name, onClick: () => films( url, resulte) },
    ]);


    const card = document.createElement('div');
    card.className = 'card shadow-lg p-3 mb-5 bg-white rounded';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const name = document.createElement('h4');
    name.className = 'card-title';
    name.innerText = data.name;

    const details = document.createElement('p');
    details.className = 'card-text';
    details.innerHTML = `
        <strong>Height:</strong> ${data.height}<br>
        <strong>Mass:</strong> ${data.mass}<br>
        <strong>Hair:</strong> ${data.hair_color}<br>
        <strong>Skin:</strong> ${data.skin_color}<br>
        <strong>Eyes:</strong> ${data.eye_color}<br>
        <strong>Birth Year:</strong> ${data.birth_year}<br>
        <strong>Gender:</strong> ${data.gender}
    `;

    const movieDiv = document.createElement('div');
    movieDiv.className = 'mt-3';
    movieDiv.innerHTML = `<h5>Movies:</h5>`;

    for (const element of data.films) {
        const movie = await API_films(element);
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-primary btn-sm m-1';
        btn.innerText = movie.title;
        btn.addEventListener('click', () => {
            characters(movie, resulte, url,data.name);
        });
        movieDiv.appendChild(btn);
    }

    cardBody.appendChild(name);
    cardBody.appendChild(details);
    cardBody.appendChild(movieDiv);
    card.appendChild(cardBody);

    resulte.appendChild(card);
}


// שחקנים בסרט
async function characters(data, resulte, url,name) {
    resulte.innerHTML = '';

    // breadcrumb -> Home > שחקנים > לוק סקייווקר > סרט מסוים
     updateBreadcrumb([
        { label: 'Home', onClick: () => location.reload() },
        { label: name, onClick: () => films( url, resulte) },
        { label: data.title }
    ]);


    const card = document.createElement('div');
    card.className = 'card shadow-lg p-3 mb-5 bg-light rounded';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const title = document.createElement('h3');
    title.className = 'card-title mb-3';
    title.innerText = data.title;

    const crawl = document.createElement('p');
    crawl.className = 'card-text fst-italic';
    crawl.innerText = data.opening_crawl;

    const details = document.createElement('p');
    details.className = 'card-text';
    details.innerHTML = `
        <strong>Director:</strong> ${data.director}<br>
        <strong>Release:</strong> ${data.release_date}
    `;

    const charactersDiv = document.createElement('div');
    charactersDiv.className = 'mt-3';
    charactersDiv.innerHTML = `<h5>Characters:</h5>`;

    for (const element of data.characters) {
        const person = await API_peoples(element);
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-secondary btn-sm m-1';
        btn.innerText = person.name;
        btn.addEventListener('click', () => {
            films(person, resulte, movies, movie_characters);
        });
        charactersDiv.appendChild(btn);
    }

    cardBody.appendChild(title);
    cardBody.appendChild(crawl);
    cardBody.appendChild(details);
    cardBody.appendChild(charactersDiv);
    card.appendChild(cardBody);

    resulte.appendChild(card);
}

