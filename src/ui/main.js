



import '../css/header.css';
import '../css/favourites.css';
import '../css/slider.css';
import '../css/information.css';
import '../css/searchInput.css';
import '../css/game.css';
import '../css/Loader.css';
import '../css/video.css';
import '../css/theme.css';

import './video.js';
import './darkMode.js';
import { api_random_jokes } from '../api/api.js';
import './favourites.js';
import './slider.js'
import './game.js'
import './searchInput.js'






const jokeButton = document.getElementById('dailyJokeButton');
const jokeOverlay = document.getElementById('dailyJokeOverlay');
const jokeText = document.getElementById('dailyJokeText');
const closeJokeButton = document.getElementById('closeJokeButton');

function closeJoke() {
    jokeOverlay.hidden = true;
    jokeButton.setAttribute('aria-expanded', 'false');
    jokeButton.focus();
}

jokeButton.addEventListener('click', async () => {
    jokeOverlay.hidden = false;
    jokeButton.setAttribute('aria-expanded', 'true');
    jokeText.textContent = 'Finding a fresh joke…';
    closeJokeButton.focus();

    try {
        const data = await api_random_jokes();
        jokeText.textContent = data?.text || 'No joke came back this time. Try again in a moment.';
    } catch (error) {
        console.error('Daily food joke could not be loaded:', error);
        jokeText.textContent = `The joke could not be loaded: ${error.message}`;
    }
});

closeJokeButton.addEventListener('click', closeJoke);
jokeOverlay.addEventListener('click', (event) => {
    if (event.target === jokeOverlay) closeJoke();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !jokeOverlay.hidden) closeJoke();
});




















