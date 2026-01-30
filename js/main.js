import { load } from './state.js';
import * as Game from './game.js';

// Entry Point
document.addEventListener('DOMContentLoaded', () => {
    // Signal that JS modules loaded correctly
    window.gameStarted = true;

    // Load State
    load();

    // Initialize Game Logic and UI binding
    Game.init();
});
