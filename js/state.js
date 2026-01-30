import { CONFIG, RARES } from './config.js';

export let game = {
    money: 0,
    biomass: 0,
    harvestMode: 'money', // 'money' or 'biomass'
    totalMoney: 0,
    prestige: 0,
    plots: 0,
    plotCost: 15,
    energy: 100,
    maxEnergy: 100,
    energyGen: 1,
    dimIndex: 0,
    water: 100, // Mars trait
    cycle: 0, // 0-100 (0-50 Day, 51-100 Night)
    upgrades: { click: 0, auto: 0, energy: 0, speed: 0, crit: 0, efficiency: 0, max_energy: 0, mycelium: 0, terraforming: 0, gmo: 0 },
    companions: { drone: 0, fairy: 0, probe: 0 },
    codex: [] // List of collected rare IDs
};

export function save() {
    localStorage.setItem('cosmicSave', JSON.stringify(game));
}

export function load() {
    let s = localStorage.getItem('cosmicSave');
    if(s) {
        let d = JSON.parse(s);
        // Careful with replacing the object reference, we need to mutate the exported object
        Object.assign(game, d);
        // Deep merge fix for nested objects if they were completely replaced
        if(d.upgrades) game.upgrades = { ...game.upgrades, ...d.upgrades };
        if(d.companions) game.companions = { ...game.companions, ...d.companions };
        if(!game.codex) game.codex = [];
    }
    return game;
}

export function resetSave() {
    localStorage.removeItem('cosmicSave');
    location.reload();
}

export function resetGame(gain) {
    game.prestige += gain;
    game.money = 0;
    game.totalMoney = 0;
    game.plots = 0;
    game.plotCost = 15;
    game.energy = 100;
    game.dimIndex = 0;

    // Reset Upgrades dynamically
    game.upgrades = {};
    for(let key in CONFIG.upgrades) {
        game.upgrades[key] = 0;
    }
    game.companions = {};
    for(let key in CONFIG.companions) {
        game.companions[key] = 0;
    }

    // Keep Codex
    save();
}
