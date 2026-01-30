import { CONFIG, RARES } from './config.js';
import { game, save, resetGame, resetSave } from './state.js';
import * as UI from './ui.js';

export function init() {
    UI.initUI({
        clickMain,
        toggleMode,
        refillWater,
        travel,
        buyPlot,
        buyUpgrade,
        buyCompanion,
        tryPrestige,
        resetSave
    });

    // Restore plots
    document.getElementById('farm-grid').innerHTML = '';
    for(let i=0; i<game.plots; i++) addPlotVisual();

    // Restore Companions
    document.getElementById('drone-layer').innerHTML = '';
    let orbitContainer = document.getElementById('drone-orbit-container');
    if(orbitContainer) orbitContainer.innerHTML = '';

    if(game.companions) {
        for(let key in game.companions) {
            for(let i=0; i<game.companions[key]; i++) UI.spawnCompanionVisual(key);
        }
    }

    // Initial Update
    UI.updateUI();

    // Start Loops
    startLoops();
}

function startLoops() {
    setInterval(() => {
        // Energy
        if(game.energy < game.maxEnergy) {
            game.energy = Math.min(game.maxEnergy, game.energy + (game.energyGen/10));
        }

        // Cycle
        game.cycle = (game.cycle + 0.1) % 100;

        // Drone Auto Click (every 50 ticks = 5s)
        if(game.companions.drone > 0 && Math.floor(game.cycle*10) % 50 === 0) {
             let totalVal = 0;
             for(let i=0; i<game.companions.drone; i++) {
                 let val = getClickVal();
                 totalVal += val;
             }

             if(totalVal > 0) {
                 game.money += totalVal;
                 game.totalMoney += totalVal;

                 // Visual feedback
                 let clicker = document.getElementById('clicker-btn');
                 UI.spawnFloatText({ target: clicker }, `+${Math.floor(totalVal)} 🤖`, '#00f3ff');
             }
             UI.updateUI();
        }

        // Recalc Max Energy logic (moved from UI to here)
        game.maxEnergy = 100 + (game.upgrades.max_energy * CONFIG.upgrades.max_energy.effect);

        UI.updateUI();
    }, 100);

    setInterval(save, 10000);
}

// --- CORE LOGIC ---
function getGlobalMultiplier() {
    let m = 1 + (game.prestige * 0.1);
    // Add Codex Bonuses
    game.codex.forEach(id => {
        let rare = RARES.find(r => r.id === id);
        if(rare) m += rare.bonus;
    });
    return m;
}

function getClickVal() {
    let dim = CONFIG.dims[game.dimIndex];
    let base = dim.click + (game.upgrades.click * CONFIG.upgrades.click.effect);
    return base * getGlobalMultiplier();
}

function getAutoVal() {
    let dim = CONFIG.dims[game.dimIndex];
    let base = dim.auto + (game.upgrades.auto * CONFIG.upgrades.auto.effect);
    // Energy penalty: if 0 energy, 10% efficiency
    let efficiency = game.energy > 0 ? 1 : 0.1;
    return base * getGlobalMultiplier() * efficiency;
}

export function clickMain(e) {
    let val = getClickVal();

    // Crit Logic
    let isCrit = false;
    if (game.upgrades.crit > 0 && Math.random() < game.upgrades.crit * CONFIG.upgrades.crit.effect) {
            val *= 3;
            isCrit = true;
    }

    game.money += val;
    game.totalMoney += val;
    UI.updateUI();

    let txt = isCrit ? `CRIT! +${Math.floor(val)}` : `+${Math.floor(val)}`;
    let color = isCrit ? '#ff0055' : (game.harvestMode === 'money' ? '#ffd700' : '#bc13fe');

    UI.spawnFloatText(e, txt, color);

    // Anim button
    let btn = document.getElementById('clicker-btn');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => btn.style.transform = 'scale(1)', 50);
}

export function buyPlot() {
    if(game.money >= game.plotCost) {
        game.money -= game.plotCost;
        game.plots++;
        game.plotCost = Math.floor(game.plotCost * 1.4);
        addPlotVisual();
        UI.updateUI();
        save();
    }
}

export function buyUpgrade(type) {
    let u = CONFIG.upgrades[type];
    let lvl = game.upgrades[type];
    let cost = Math.floor(u.base * Math.pow(u.mult, lvl));
    let currency = u.currency || 'money';

    if(currency === 'money' && game.money >= cost) {
        game.money -= cost;
        game.upgrades[type]++;
        if(type === 'energy') game.energyGen += u.effect;
        UI.updateUI();
        UI.updateShopState();
        save();
    } else if (currency === 'biomass' && game.biomass >= cost) {
        game.biomass -= cost;
        game.upgrades[type]++;
        UI.updateUI();
        UI.updateShopState();
        save();
    }
}

export function buyCompanion(type) {
    let u = CONFIG.companions[type];
    let lvl = game.companions[type];
    let cost = Math.floor(u.base * Math.pow(u.mult, lvl));
    let currency = u.currency || 'money';

    if(currency === 'money' && game.money >= cost) {
        game.money -= cost;
        game.companions[type]++;
        UI.updateUI();
        UI.updateShopState();
        UI.spawnCompanionVisual(type);
        save();
    } else if (currency === 'biomass' && game.biomass >= cost) {
        game.biomass -= cost;
        game.companions[type]++;
        UI.updateUI();
        UI.updateShopState();
        UI.spawnCompanionVisual(type);
        save();
    }
}

export function toggleMode() {
    game.harvestMode = game.harvestMode === 'money' ? 'biomass' : 'money';
    UI.updateUI();
}

export function refillWater() {
    if(game.energy >= 10) {
        game.energy -= 10;
        game.water = 100;
        UI.updateUI();
    }
}

export function travel() {
    let next = CONFIG.dims[game.dimIndex+1];
    if(next && game.money >= next.cost) {
        game.money -= next.cost;
        game.dimIndex++;
        UI.updateUI();

        // Visual feedback for travel
        let ol = document.createElement('div');
        ol.style.position = 'fixed'; ol.style.top=0; ol.style.left=0; ol.style.width='100%'; ol.style.height='100%';
        ol.style.background = 'white'; ol.style.zIndex = 1000; ol.style.transition = 'opacity 1s';
        document.body.appendChild(ol);

        setTimeout(() => { ol.style.opacity = 0; setTimeout(() => ol.remove(), 1000); }, 100);

        save();
    }
}

function addPlotVisual() {
    let grid = document.getElementById('farm-grid');
    let p = document.createElement('div');
    p.className = 'plot';

    let bar = document.createElement('div');
    bar.className = 'plant-bar';
    let dim = CONFIG.dims[game.dimIndex];
    p.style.setProperty('--plant-color', dim.color);

    let icon = document.createElement('div');
    icon.className = 'plant-icon';
    icon.innerText = dim.icon;

    p.appendChild(bar);
    p.appendChild(icon);
    grid.appendChild(p);

    runPlot(p, bar, icon);
}

function runPlot(plot, bar, icon) {
    // Trait Checks
    let dim = CONFIG.dims[game.dimIndex];

    // Mars Water Check
    if(dim.trait === 'water') {
        if(game.water <= 0) {
                setTimeout(() => runPlot(plot, bar, icon), 1000); // Wait for water
                return;
        }
        game.water = Math.max(0, game.water - 0.5); // Consume water
    }

    // Night Bloom Check (Lune)
    if(dim.trait === 'night_bloom') {
        if(game.cycle <= 50) { // If Day
                setTimeout(() => runPlot(plot, bar, icon), 1000); // Wait for night
                return;
        }
    }

    // Reset
    bar.style.transition = 'none';
    bar.style.height = '0%';
    plot.classList.remove('ready');
    plot.classList.remove('blocked');
    plot.onclick = null;

    // Force reflow
    void bar.offsetWidth;

    // Grow Speed Calculation
    let duration = 3000 * Math.pow(CONFIG.upgrades.speed.effect, game.upgrades.speed);

    // Fairy Bonus
    if(game.companions.fairy > 0) duration *= (1 - Math.min(0.5, game.companions.fairy * 0.02));

    if(dim.trait === 'gravity') duration *= 2; // Jupiter Slower

    // Nebula: Energy Link (Slow if low energy)
    if(dim.trait === 'energy_link') {
        let energyPct = game.energy / Math.max(1, game.maxEnergy);
        duration = duration / (0.2 + 0.8 * energyPct);
    }

    // Black Hole: Time Dilation (Super slow)
    if(dim.trait === 'time_dilation') {
        duration *= 5;
    }

    bar.style.transition = `height ${duration}ms linear`;
    bar.style.height = '100%';

    setTimeout(() => {
        if(document.body.contains(plot)) {

            // Saturn Asteroid Event
            if(dim.trait === 'asteroids' && Math.random() < 0.1) {
                plot.classList.add('blocked');
                plot.innerHTML = '<div style="font-size:30px; text-align:center; padding-top:10px;">☄️</div>';
                plot.onclick = () => {
                    plot.innerHTML = '';
                    plot.appendChild(bar);
                    plot.appendChild(icon);
                    runPlot(plot, bar, icon);
                };
                return; // Stop loop until clicked
            }

            // Harvest Logic
            let baseProd = getAutoVal();

            // Black Hole Bonus (High Reward)
            if(dim.trait === 'time_dilation') baseProd *= 20;

            // GMO Bonus
            if(game.upgrades.gmo > 0) baseProd *= (1 + game.upgrades.gmo * CONFIG.upgrades.gmo.effect);

            // Neighbor Bonus (Mycelium)
            if(game.upgrades.mycelium > 0) {
                    let networkMult = 1 + (game.plots * CONFIG.upgrades.mycelium.effect * game.upgrades.mycelium);
                    baseProd *= networkMult;
            }

            if(game.harvestMode === 'money') {
                game.money += baseProd;
                game.totalMoney += baseProd;
            } else {
                // Biomass Formula
                let bioGain = 1 * (1 + (game.upgrades.terraforming||0) * 0.2);
                game.biomass += bioGain;
            }

            // Check Rare Drop
            checkRareDrop();

            UI.updateUI();

            // Visual harvest
            plot.classList.add('ready');

            // Consume Energy (Efficiency Calculation)
            let energyCost = 0.5 * Math.pow(CONFIG.upgrades.efficiency.effect, game.upgrades.efficiency);
            game.energy = Math.max(0, game.energy - energyCost);

            // Loop
            setTimeout(() => runPlot(plot, bar, icon), 500); // 0.5s pause at full
        }
    }, duration);
}

function checkRareDrop() {
    RARES.forEach(rare => {
        if(!game.codex.includes(rare.id)) {
            let chance = rare.chance + (game.companions.probe * 0.005);
            if(Math.random() < chance) {
                game.codex.push(rare.id);
                alert(`RARE TROUVÉ ! ${rare.icon} ${rare.name}\n${rare.desc}`);
                save();
            }
        }
    });
}

export function tryPrestige() {
    // Calculate gain locally to verify
    let potential = Math.floor(game.totalMoney / 50000);
    let gain = Math.max(0, potential - game.prestige);

    if(gain > 0 && confirm("Reset complet pour prestige ?")) {
        resetGame(gain);
        location.reload();
    }
}
