# FocusForge Desktop App - Cahier de cadrage

## 1. Vision du projet

L’objectif est de créer une application desktop de productivité inspirée des apps Pomodoro modernes, mais orientée **deep work**, **développement**, **apprentissage** et **suivi personnel du temps**.

L’application doit permettre de travailler par blocs de concentration, de suivre les sessions réalisées, de comprendre où part le temps, et de créer une routine de travail durable.

## 2. Positionnement

### Nom provisoire

**FocusForge**

### Promesse

Une application desktop minimaliste pour planifier, lancer et analyser ses sessions de deep work.

### Différenciation

Contrairement à un simple timer Pomodoro, l’application doit aider l’utilisateur à :

- suivre ses vraies sessions de travail ;
- catégoriser son temps par projet ou activité ;
- mesurer sa discipline avec des statistiques simples ;
- garder un historique exploitable ;
- construire une routine de travail stable.

## 3. Pourquoi une application desktop ?

Une application desktop est plus adaptée qu’une web app pour ce projet car elle permet :

- une meilleure intégration avec le système ;
- des notifications natives ;
- un usage hors ligne ;
- une expérience plus fluide sur Mac ou Windows ;
- une future possibilité de bloquer des applications ou sites ;
- une meilleure sensation d’application premium.

## 4. Stack technique recommandée

### Option recommandée : Tauri + React + TypeScript

| Élément | Choix |
|---|---|
| Framework desktop | Tauri |
| Frontend | React |
| Langage | TypeScript |
| Style | Tailwind CSS |
| Stockage local | SQLite |
| Notifications | API native Tauri |
| Charts | Recharts |
| Packaging | Tauri Bundler |

### Pourquoi Tauri ?

Tauri est plus léger qu’Electron, utilise le moteur web du système, et permet de créer des applications desktop performantes avec un frontend moderne.

### Alternative possible

| Option | Avantage | Inconvénient |
|---|---|---|
| Electron | Très mature, beaucoup de ressources | Plus lourd |
| SwiftUI | Très propre sur Mac | Moins portable Windows/Linux |
| Tauri | Léger, moderne, portable | Courbe d’apprentissage Rust légère |

Pour ce projet, **Tauri est le meilleur compromis**.

## 5. Fonctionnalités MVP

Le MVP doit être simple, utile et terminé rapidement.

### Fonctionnalités essentielles

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Timer Pomodoro | Lancer des sessions focus / pause | Haute |
| Durées personnalisées | 25/5, 50/10, 90/15 | Haute |
| Pause courte / pause longue | Gestion des cycles | Haute |
| Start / Pause / Reset | Contrôle du timer | Haute |
| Notifications natives | Alerte fin de session | Haute |
| Historique local | Sauvegarder les sessions terminées | Haute |
| Tags | Associer une session à un projet ou une activité | Haute |
| Dashboard | Voir le temps de focus quotidien et hebdomadaire | Moyenne |
| Mode sombre | Interface agréable | Moyenne |
| Paramètres | Modifier durées, sons, notifications | Moyenne |

## 6. Fonctionnalités à éviter en V1

Ces fonctionnalités sont intéressantes, mais doivent être gardées pour plus tard :

- blocage d’applications ;
- blocage de sites web ;
- synchronisation cloud ;
- compte utilisateur ;
- application mobile ;
- Apple Watch ;
- gamification avancée ;
- abonnement payant.

La priorité est de créer une application stable et utilisable au quotidien.

## 7. Fonctionnalités V2

Après le MVP, ajouter progressivement :

| Fonctionnalité | Description |
|---|---|
| Web blocker | Bloquer YouTube, Twitter, LinkedIn, etc. |
| App blocker | Bloquer certaines apps desktop |
| Objectifs quotidiens | Définir un nombre de blocs par jour |
| Journal de session | Écrire ce qui a été accompli |
| Export CSV | Exporter les données |
| Templates de routine | Code, lecture, sport, prospection |
| Streaks | Suivre les jours consécutifs productifs |
| Mini calendrier | Visualiser les jours travaillés |

## 8. Modèle de données initial

### Table `sessions`

| Champ | Type | Description |
|---|---|---|
| id | string | Identifiant unique |
| tag | string | Projet ou activité |
| mode | string | focus, short_break, long_break |
| duration_minutes | number | Durée prévue |
| completed | boolean | Session terminée ou abandonnée |
| started_at | datetime | Date de début |
| ended_at | datetime | Date de fin |
| notes | string | Notes optionnelles |

### Table `settings`

| Champ | Type | Description |
|---|---|---|
| focus_duration | number | Durée focus par défaut |
| short_break_duration | number | Durée pause courte |
| long_break_duration | number | Durée pause longue |
| cycles_before_long_break | number | Nombre de cycles avant pause longue |
| notifications_enabled | boolean | Notifications activées |
| sound_enabled | boolean | Son activé |
| theme | string | light, dark, system |

### Table `tags`

| Champ | Type | Description |
|---|---|---|
| id | string | Identifiant unique |
| name | string | Nom du tag |
| color | string | Couleur optionnelle |
| created_at | datetime | Date de création |

## 9. Architecture du projet

Structure recommandée :

```text
focusforge/
├── src/
│   ├── components/
│   │   ├── Timer/
│   │   ├── Dashboard/
│   │   ├── Settings/
│   │   └── Layout/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── History.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useTimer.ts
│   │   ├── useSessions.ts
│   │   └── useSettings.ts
│   ├── services/
│   │   ├── database.ts
│   │   ├── notifications.ts
│   │   └── statistics.ts
│   ├── types/
│   │   └── index.ts
│   └── App.tsx
├── src-tauri/
│   ├── src/
│   ├── tauri.conf.json
│   └── Cargo.toml
├── package.json
├── tailwind.config.js
└── README.md
```

## 10. Pages principales

### Page Home

Objectif : lancer une session rapidement.

Contenu :

- timer central ;
- tag sélectionné ;
- mode actuel ;
- boutons start / pause / reset ;
- nombre de cycles terminés ;
- prochaine pause.

### Page Dashboard

Objectif : comprendre son activité.

Contenu :

- temps de focus aujourd’hui ;
- nombre de sessions terminées ;
- taux de complétion ;
- temps par tag ;
- graphique hebdomadaire ;
- meilleur jour de la semaine.

### Page History

Objectif : consulter les sessions passées.

Contenu :

- liste des sessions ;
- filtre par date ;
- filtre par tag ;
- durée ;
- statut terminé / abandonné ;
- notes éventuelles.

### Page Settings

Objectif : personnaliser l’application.

Contenu :

- durées des sessions ;
- durée des pauses ;
- cycles avant longue pause ;
- notifications ;
- son ;
- thème.

## 11. Design souhaité

Style global :

- minimaliste ;
- moderne ;
- calme ;
- premium ;
- peu de couleurs ;
- typographie claire ;
- cartes arrondies ;
- interface très lisible.

Inspiration :

- Flow ;
- Raycast ;
- Linear ;
- Things 3 ;
- Notion Calendar.

## 12. Roadmap de développement

### Sprint 1 : base de l’application

Objectif : créer l’app desktop fonctionnelle.

Tâches :

- initialiser Tauri + React + TypeScript ;
- ajouter Tailwind CSS ;
- créer layout principal ;
- créer timer simple ;
- ajouter start / pause / reset ;
- gérer focus / pause.

### Sprint 2 : paramètres

Objectif : rendre le timer personnalisable.

Tâches :

- créer page Settings ;
- sauvegarder les durées ;
- ajouter localStorage ou SQLite ;
- charger les paramètres au démarrage ;
- ajouter mode sombre.

### Sprint 3 : sessions et historique

Objectif : sauvegarder les sessions.

Tâches :

- créer modèle Session ;
- sauvegarder les sessions terminées ;
- afficher l’historique ;
- filtrer par date ;
- filtrer par tag.

### Sprint 4 : dashboard

Objectif : ajouter la partie analytics.

Tâches :

- total focus aujourd’hui ;
- sessions terminées aujourd’hui ;
- focus time par tag ;
- graphique hebdomadaire ;
- taux de complétion.

### Sprint 5 : notifications natives

Objectif : rendre l’expérience desktop complète.

Tâches :

- notification fin focus ;
- notification fin pause ;
- réglage activation / désactivation ;
- son optionnel.

### Sprint 6 : polish

Objectif : rendre l’app propre et agréable.

Tâches :

- améliorer UI ;
- corriger bugs ;
- ajouter animations légères ;
- préparer README ;
- créer release desktop.

## 13. Prompts Codex prêts à utiliser

### Prompt 1 : création du projet

```text
Create a desktop Pomodoro app using Tauri, React, TypeScript and Tailwind CSS.

Requirements:
- Clean project structure
- Minimal premium UI
- Home page with a Pomodoro timer
- Start, pause and reset buttons
- Focus, short break and long break modes
- Dark mode support
- Code should be clean and modular
```

### Prompt 2 : logique du timer

```text
Implement a robust Pomodoro timer hook in React.

Requirements:
- useTimer hook
- Start, pause, resume and reset
- Support focus, short break and long break modes
- Support custom durations
- Track completed cycles
- Automatically switch from focus to break
- Automatically switch from break to focus
- Keep the logic separated from the UI
```

### Prompt 3 : paramètres

```text
Add a Settings page to the app.

Requirements:
- User can edit focus duration, short break duration, long break duration
- User can edit number of cycles before long break
- User can enable or disable notifications
- User can enable or disable sound
- Settings should be persisted locally
- Use TypeScript types for settings
```

### Prompt 4 : historique

```text
Add session history.

Requirements:
- Save each completed focus session
- Store id, tag, duration, started_at, ended_at and completed
- Add a History page
- Show sessions in a clean table or card list
- Add filters by date and tag
- Store the data locally
```

### Prompt 5 : dashboard

```text
Create a dashboard page for focus analytics.

Requirements:
- Show total focus time today
- Show number of completed sessions today
- Show completion rate
- Show focus time by tag
- Show weekly focus trend
- Use Recharts for charts
- Keep the UI minimal and clean
```

### Prompt 6 : notifications Tauri

```text
Add native desktop notifications with Tauri.

Requirements:
- Notify when a focus session ends
- Notify when a break ends
- Respect the notifications_enabled setting
- Keep notification logic in a separate service file
- Handle permission errors gracefully
```

### Prompt 7 : README

```text
Write a professional README for this desktop Pomodoro app.

Include:
- Project overview
- Features
- Tech stack
- Installation
- Development commands
- Roadmap
- Screenshots section placeholder
- License section
```

## 14. Première version idéale

La première version publiable doit contenir :

- app desktop installable ;
- timer stable ;
- durées personnalisables ;
- tags ;
- historique ;
- dashboard simple ;
- notifications ;
- dark mode ;
- README propre.

## 15. Critère de réussite

Le projet est réussi si l’application peut être utilisée tous les jours pendant une semaine sans bug bloquant et si elle permet de répondre à ces questions :

- Combien de temps ai-je travaillé aujourd’hui ?
- Sur quels projets ai-je passé mon temps ?
- Combien de sessions ai-je terminées ?
- Est-ce que ma concentration progresse ?
- Quels jours suis-je le plus productif ?

## 16. Idée de branding

### Nom

FocusForge

### Slogan

Build better focus, one session at a time.

### Ton visuel

- noir / blanc / gris ;
- une couleur accent discrète ;
- interface calme ;
- inspiration premium desktop app.

## 17. Prochaine étape

Commencer par créer le projet Tauri + React + TypeScript, puis construire uniquement le timer principal avant d’ajouter les autres fonctionnalités.
