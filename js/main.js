import { load } from './state.js';
import * as Game from './game.js';

// Entry Point
document.addEventListener('DOMContentLoaded', () => {
    // Load State
    load();

    // Initialize Game Logic and UI binding
    Game.init();
});
