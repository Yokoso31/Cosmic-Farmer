export const CONFIG = {
    dims: [
        { name: "Terre", click: 1, auto: 5, color: '#2ecc71', icon: '🌿', cost: 0, trait: null },
        { name: "Lune", click: 3, auto: 15, color: '#bdc3c7', icon: '🌑', cost: 500, trait: 'night_bloom' },
        { name: "Mars", click: 5, auto: 25, color: '#e67e22', icon: '🌵', cost: 1000, trait: 'water' },
        { name: "Jupiter", click: 20, auto: 100, color: '#e74c3c', icon: '🍄', cost: 50000, trait: 'gravity' },
        { name: "Saturne", click: 100, auto: 500, color: '#f1c40f', icon: '💍', cost: 1000000, trait: 'asteroids' },
        { name: "Nébuleuse", click: 500, auto: 2500, color: '#9b59b6', icon: '🌫️', cost: 5000000, trait: 'energy_link' },
        { name: "Trou Noir", click: 10000, auto: 50000, color: '#2c3e50', icon: '🕳️', cost: 100000000, trait: 'time_dilation' }
    ],
    upgrades: {
        click: { name: "Outils Laser", desc: "+1 Crédit/Clic", base: 50, mult: 1.5, effect: 1 },
        auto: { name: "Bio-Drones", desc: "+2 Crédit/Auto", base: 100, mult: 1.5, effect: 2 },
        energy: { name: "Panneaux Solaires", desc: "+1 Énergie/sec", base: 300, mult: 1.4, effect: 1 },
        speed: { name: "Nano-Engrais", desc: "-5% Temps de pousse", base: 500, mult: 1.6, effect: 0.95 },
        crit: { name: "Trèfle Quantique", desc: "+5% Chance Critique (x3)", base: 750, mult: 1.7, effect: 0.05 },
        efficiency: { name: "Gestion Énergie", desc: "-10% Conso Énergie", base: 1000, mult: 1.8, effect: 0.9 },
        max_energy: { name: "Batterie Plasma", desc: "+50 Max Énergie", base: 2000, mult: 1.5, effect: 50 },
        // DNA Upgrades (Cost Biomass)
        mycelium: { name: "Réseau Mycélium", desc: "+10% Prod / Voisin", base: 10, mult: 1.5, effect: 0.1, currency: 'biomass' },
        terraforming: { name: "Terraformation", desc: "+20% Prod Global", base: 50, mult: 1.8, effect: 0.2, currency: 'biomass' },
        gmo: { name: "Super OGM", desc: "x2 Prod Base", base: 100, mult: 2, effect: 1, currency: 'biomass' }
    },
    companions: {
        drone: { name: "Drone-X", desc: "Clic Auto (5s)", base: 2000, mult: 1.5, icon: '🤖', type: 'auto_click' },
        fairy: { name: "Fée Cosmique", desc: "-2% Temps Pousse", base: 200, mult: 1.5, icon: '🧚', currency: 'biomass', type: 'growth_aura' },
        probe: { name: "Sonde Rare", desc: "+0.5% Chance Rare", base: 5000, mult: 1.8, icon: '🛰️', type: 'luck_aura' }
    }
};

export const RARES = [
    { id: 'gold_leaf', name: 'Feuille Dorée', chance: 0.01, bonus: 0.1, desc: '+10% Production', icon: '🍂' },
    { id: 'crystal_root', name: 'Racine de Cristal', chance: 0.005, bonus: 0.2, desc: '+20% Production', icon: '💎' },
    { id: 'void_fruit', name: 'Fruit du Néant', chance: 0.001, bonus: 0.5, desc: '+50% Production', icon: '🌚' }
];