
export function showLoader(container, seconds = 2) {
    return new Promise((resolve) => {
        const loader = document.createElement('div');
        loader.id = 'pageLoader';
        loader.classList.add('show');
        loader.setAttribute('role', 'status');
        loader.setAttribute('aria-live', 'polite');
        loader.innerHTML = `
            <div class="loader-card">
                <div class="cooking-loader" aria-hidden="true">
                    <span class="steam steam-one"></span>
                    <span class="steam steam-two"></span>
                    <span class="steam steam-three"></span>
                    <div class="pot-scene">
                        <span class="pot-handle pot-handle-left"></span>
                        <span class="pot-handle pot-handle-right"></span>
                        <div class="lid"><span></span></div>
                        <div class="pot"><span class="pot-soup"><i></i><i></i><i></i></span></div>
                        <span class="pot-base"></span>
                    </div>
                </div>
                <div class="loader-copy">
                    <span class="loader-kicker">FRESH FROM THE KITCHEN</span>
                    <span class="loader-message">Finding something delicious…</span>
                    <span class="loader-progress" aria-hidden="true"><i></i></span>
                </div>
            </div>
        `;

        container.appendChild(loader);

        setTimeout(() => {
            loader.classList.remove('show');
            loader.remove();
            resolve();
        }, seconds * 1000);
    });
}



