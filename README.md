# Cosmic Farmer

Un jeu de clicker incrémental sur le thème de l'agriculture spatiale. Commencez sur Terre, cultivez des plantes, améliorez votre équipement et voyagez à travers le système solaire et au-delà !

## Fonctionnalités

*   **Système de Progression :** Voyagez de la Terre à la Lune, Mars, Jupiter, et plus encore.
*   **Améliorations (Tech) :** Améliorez vos clics, l'automatisation, la vitesse de pousse, et les coups critiques.
*   **Upgrades Spatiaux :** Gérez votre énergie et débloquez le prestige.
*   **Compagnons (Robots) :** Achetez des drones et des fées pour vous aider.
*   **Génétique (ADN) :** Utilisez la biomasse pour des améliorations biologiques avancées.
*   **Plantes Rares :** Découvrez et collectionnez des plantes rares dans le Codex.

## Structure du Projet

Le projet a été refactorisé pour être modulaire :

*   `index.html` : Point d'entrée principal.
*   `style.css` : Styles globaux et animations.
*   `js/` : Contient la logique du jeu.
    *   `main.js` : Initialisation du jeu.
    *   `config.js` : Configuration des planètes, améliorations et plantes rares.
    *   `state.js` : Gestion de la sauvegarde et de l'état du jeu.
    *   `game.js` : Boucle de jeu principale et logique métier.
    *   `ui.js` : Gestion de l'interface utilisateur et des événements.

## Comment Jouer

1.  Ouvrez `index.html` dans votre navigateur.
2.  Cliquez sur le bouton principal pour gagner des crédits.
3.  Achetez des parcelles dans l'onglet "Ferme".
4.  Achetez des améliorations dans les onglets "Tech" et "Espace".
5.  Voyagez vers de nouvelles dimensions une fois que vous avez assez d'argent !

## Installation / Développement

Aucune installation npm n'est requise. C'est un projet vanilla JS / HTML / CSS.
Servez simplement le dossier racine avec un serveur statique (ex: Live Server, `python3 -m http.server`, etc.).

---
*Créé avec ❤️ par Jules.*
