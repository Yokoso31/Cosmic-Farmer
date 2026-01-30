import { CONFIG, RARES } from './config.js';
import { game } from './state.js';

let actions = {};

export function initUI(gameActions) {
    actions = gameActions;
    initStars();
    bindGlobalEvents();
    switchTab('farm');
}

function bindGlobalEvents() {
    // Bind static elements
    const btnMode = document.getElementById('btn-mode');
    if (btnMode) btnMode.addEventListener('click', actions.toggleMode);

    const btnClicker = document.getElementById('clicker-btn');
    if (btnClicker) btnClicker.addEventListener('click', actions.clickMain);

    // I added ID 'btn-refill-water' in the previous step to be safe, but querySelector works too
    const btnRefill = document.getElementById('btn-refill-water');
    if (btnRefill) btnRefill.addEventListener('click', actions.refillWater);

    const btnTravel = document.getElementById('btn-travel');
    if (btnTravel) btnTravel.addEventListener('click', actions.travel);

    const btnReset = document.getElementById('btn-reset-save');
    if (btnReset) {
        btnReset.addEventListener('click', actions.resetSave);
    }

    // Bind tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        const tabName = btn.getAttribute('data-tab');
        if (tabName) {
            btn.addEventListener('click', () => switchTab(tabName));
        }
    });
}

// --- GRAPHICS ---
export function initStars() {
    const bg = document.getElementById('star-bg');
    for(let i=0; i<150; i++) {
        let s = document.createElement('div');
        s.className = 'star';
        s.style.left = Math.random()*100 + '%';
        s.style.top = Math.random()*100 + '%';
        s.style.width = s.style.height = (Math.random()*2 + 1) + 'px';
        s.style.setProperty('--duration', (Math.random()*3 + 2)+'s');
        s.style.animationDelay = Math.random()*5 + 's';
        bg.appendChild(s);
    }
}

export function spawnFloatText(e, txt, color) {
    let el = document.createElement('div');
    el.className = 'float-text';
    el.innerText = txt;
    if(color) el.style.color = color;
    else el.style.color = '#fff';

    let rect = e.target.getBoundingClientRect();
    // Random scatter
    let x = e.clientX || (rect.left + rect.width/2);
    let y = e.clientY || (rect.top + rect.height/2);
    x += (Math.random()-0.5)*50;

    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

export function spawnCompanionVisual(type) {
    if(type === 'drone') {
        let container = document.getElementById('drone-orbit-container');
        if(!container) return;

        let sat = document.createElement('div');
        sat.className = 'drone-satellite';
        // Random start pos
        sat.style.animationDelay = `-${Math.random() * 10}s`;
        sat.style.animationDuration = `${5 + Math.random() * 5}s`; // Vary speed

        let body = document.createElement('div');
        body.className = 'drone-body';
        body.innerText = CONFIG.companions[type].icon;
        // Sync counter-rotation speed
        body.style.animationDuration = sat.style.animationDuration;

        sat.appendChild(body);
        container.appendChild(sat);
        return;
    }

    let l = document.getElementById('drone-layer');
    let el = document.createElement('div');
    el.className = 'companion-unit';
    el.innerText = CONFIG.companions[type].icon;

    el.style.left = Math.random() * 90 + '%';
    el.style.top = Math.random() * 90 + '%';

    l.appendChild(el);
    animateCompanion(el);
}

function animateCompanion(el) {
    let x = Math.random() * 90;
    let y = Math.random() * 90;
    el.style.left = x + '%';
    el.style.top = y + '%';

    setTimeout(() => {
        if(document.body.contains(el)) animateCompanion(el);
    }, 5000 + Math.random()*2000);
}

// --- TAB SYSTEM ---
let currentTab = 'farm';
export function switchTab(t) {
    currentTab = t;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${t}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    renderShopStructure();
    updateShopState();
}

function renderShopStructure() {
    const c = document.getElementById('shop-content');
    c.innerHTML = '';

    if(currentTab === 'farm') {
        // Plot
        c.appendChild(createShopItem('plot', 'Acheter Parcelle', 'Augmente la production passive', () => actions.buyPlot()));
    }
    else if (currentTab === 'tech') {
        // Upgrades
        ['click', 'auto', 'speed', 'crit'].forEach(type => {
            c.appendChild(createShopItem(`upg-${type}`, '', '', () => actions.buyUpgrade(type)));
        });
    }
    else if (currentTab === 'space') {
         ['energy', 'efficiency', 'max_energy'].forEach(type => {
             c.appendChild(createShopItem(`upg-${type}`, '', '', () => actions.buyUpgrade(type)));
         });

        // Prestige (Special case, custom HTML)
        let pDiv = document.createElement('div');
        pDiv.id = 'prestige-item';
        pDiv.style.marginTop = "20px";
        // Initial content
        pDiv.innerHTML = `<div class="shop-item" id="btn-prestige" style="border-color:#e74c3c">
            <div class="item-info">
                <span class="item-name" style="color:#e74c3c">Ascension (Reset)</span>
                <span class="item-desc" id="prestige-desc">...</span>
            </div>
        </div>`;
        c.appendChild(pDiv);
    }
    else if (currentTab === 'companions') {
        ['drone', 'fairy', 'probe'].forEach(type => {
            c.appendChild(createShopItem(`comp-${type}`, '', '', () => actions.buyCompanion(type)));
        });
    }
    else if (currentTab === 'dna') {
        ['mycelium', 'terraforming', 'gmo'].forEach(type => {
            c.appendChild(createShopItem(`upg-${type}`, '', '', () => actions.buyUpgrade(type)));
        });
    }
    else if (currentTab === 'codex') {
        c.innerHTML = '<h3 style="text-align:center; font-size:1rem;">Collection Galactique</h3>';
        c.innerHTML += '<div id="codex-list"></div>';
        renderCodex(); // Static list based on unlocked items
    }
}

function createShopItem(id, name, desc, action) {
    let d = document.createElement('div');
    d.className = 'shop-item';
    d.id = `shop-item-${id}`;
    d.addEventListener('click', action);
    d.innerHTML = `
        <div class="item-info">
            <span class="item-name">${name}</span>
            <span class="item-desc">${desc}</span>
        </div>
        <div class="item-cost">...</div>
    `;
    return d;
}

export function updateShopState() {
    if(currentTab === 'farm') {
        updateShopItem('plot', 'Acheter Parcelle', 'Augmente la production passive', game.plotCost, game.money >= game.plotCost);
    }
    else if (currentTab === 'tech') {
        ['click', 'auto', 'speed', 'crit'].forEach(type => {
            let u = CONFIG.upgrades[type];
            let lvl = game.upgrades[type];
            let cost = Math.floor(u.base * Math.pow(u.mult, lvl));
            updateShopItem(`upg-${type}`, `${u.name} (Nv.${lvl})`, u.desc, cost, game.money >= cost);
        });
    }
    else if (currentTab === 'space') {
         ['energy', 'efficiency', 'max_energy'].forEach(type => {
             let u = CONFIG.upgrades[type];
             let lvl = game.upgrades[type];
             let cost = Math.floor(u.base * Math.pow(u.mult, lvl));
             updateShopItem(`upg-${type}`, `${u.name} (Nv.${lvl})`, u.desc, cost, game.money >= cost);
         });

         // Prestige Update
         let potential = Math.floor(game.totalMoney / 50000);
         let gain = Math.max(0, potential - game.prestige);

         let btn = document.getElementById('btn-prestige');
         if(btn) {
             document.getElementById('prestige-desc').innerText = `Gagner ${gain} ⭐ (+${gain*10}%)`;
             btn.onclick = () => actions.tryPrestige();
             if(gain > 0) btn.classList.remove('disabled');
             else btn.classList.add('disabled');
         }
    }
    else if (currentTab === 'companions') {
        ['drone', 'fairy', 'probe'].forEach(type => {
            let u = CONFIG.companions[type];
            let lvl = game.companions[type];
            let cost = Math.floor(u.base * Math.pow(u.mult, lvl));
            let currency = u.currency || 'money';
            let suffix = currency === 'biomass' ? '🧬' : '💰';
            let canBuy = currency === 'biomass' ? game.biomass >= cost : game.money >= cost;

            updateShopItem(`comp-${type}`, `${u.name} (Nv.${lvl})`, u.desc, cost + suffix, canBuy);
        });
    }
    else if (currentTab === 'dna') {
        ['mycelium', 'terraforming', 'gmo'].forEach(type => {
            let u = CONFIG.upgrades[type];
            let lvl = game.upgrades[type];
            let cost = Math.floor(u.base * Math.pow(u.mult, lvl));
            // Check Biomass
            let canBuy = game.biomass >= cost;
            updateShopItem(`upg-${type}`, `${u.name} (Nv.${lvl})`, u.desc, cost + '🧬', canBuy);
        });
    }
    else if (currentTab === 'codex') {
         renderCodex();
    }
}

function updateShopItem(id, name, desc, cost, enabled) {
    let d = document.getElementById(`shop-item-${id}`);
    if(!d) return;

    // Update Text
    d.querySelector('.item-name').innerText = name;
    d.querySelector('.item-desc').innerText = desc;
    // Handle custom currency display
    if(typeof cost === 'string' && (cost.includes('🧬') || cost.includes('💰'))) {
        d.querySelector('.item-cost').innerText = cost;
    } else {
        d.querySelector('.item-cost').innerText = cost + '💰';
    }

    // Update State
    if(enabled) {
        d.classList.remove('disabled');
        d.style.pointerEvents = 'auto';
    } else {
        d.classList.add('disabled');
        d.style.pointerEvents = 'none';
    }
}

function renderCodex() {
    const list = document.getElementById('codex-list');
    if(!list) return;

    list.innerHTML = '';
    if(game.codex.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:#7f8c8d; padding:20px;">Aucune plante rare découverte... pour l\'instant.</div>';
    } else {
        RARES.forEach(rare => {
            if(game.codex.includes(rare.id)) {
                 let d = document.createElement('div');
                 d.className = 'shop-item';
                 d.style.borderColor = '#f1c40f';
                 d.innerHTML = `
                    <div style="font-size:2rem; margin-right:10px;">${rare.icon}</div>
                    <div class="item-info">
                        <span class="item-name" style="color:#f1c40f">${rare.name}</span>
                        <span class="item-desc">${rare.desc}</span>
                    </div>
                 `;
                 list.appendChild(d);
            }
        });
    }
}

export function updateUI() {
    document.getElementById('money').innerText = Math.floor(game.money);
    document.getElementById('biomass').innerText = Math.floor(game.biomass);
    document.getElementById('energy').innerText = Math.floor(game.energy);
    document.getElementById('max-energy').innerText = game.maxEnergy;
    document.getElementById('prestige').innerText = game.prestige;
    document.getElementById('plot-count').innerText = game.plots;

    // Mars Water Trait
    let waterPanel = document.getElementById('water-panel');
    if(CONFIG.dims[game.dimIndex].trait === 'water') {
        waterPanel.style.display = 'block';
        document.getElementById('water-level').style.width = game.water + '%';
    } else {
        waterPanel.style.display = 'none';
    }

    // Cycle UI
    let isNight = game.cycle > 50;
    document.getElementById('cycle-bar').style.width = game.cycle + '%';
    document.getElementById('cycle-icon').innerText = isNight ? '🌙' : '☀️';
    document.getElementById('cycle-text').innerText = isNight ? 'Nuit' : 'Jour';
    document.getElementById('cycle-text').style.color = isNight ? '#bdc3c7' : '#f1c40f';
    // Subtle background shift
    document.getElementById('star-bg').style.opacity = isNight ? 1 : 0.5;

    // Toggle Harvest Mode Visual
    let modeBtn = document.getElementById('btn-mode');
    if(modeBtn) {
        modeBtn.innerText = game.harvestMode === 'money' ? 'Mode: 💰 Crédits' : 'Mode: 🧬 Biomasse';
        modeBtn.style.borderColor = game.harvestMode === 'money' ? '#f1c40f' : '#8e44ad';
    }

    // Dim
    let curDim = CONFIG.dims[game.dimIndex];
    document.getElementById('dim-name').innerText = `(${curDim.name})`;
    document.getElementById('dim-name').style.color = curDim.color;
    document.getElementById('current-icon').innerText = curDim.icon;

    let next = CONFIG.dims[game.dimIndex+1];
    if(next) {
        document.getElementById('next-dim').innerText = next.name;
        document.getElementById('dim-cost').innerText = next.cost + '💰';
        let pct = Math.min(100, (game.money/next.cost)*100);
        document.getElementById('dim-bar').style.width = pct + '%';

        let btn = document.getElementById('btn-travel');
        if(game.money >= next.cost) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    } else {
        document.getElementById('next-dim').innerText = "Univers Conquis";
        document.getElementById('dim-cost').innerText = "";
        document.getElementById('dim-bar').style.width = '100%';
    }

    // Refresh Shop State
    updateShopState();
}
