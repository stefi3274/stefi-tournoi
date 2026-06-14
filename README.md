# ⚽ SteFi Tournoi FC 26

Gestionnaire de championnats FC 26 avec phases de groupes, élimination directe aller-retour, tirage au sort équilibré par âge, et synchronisation temps réel via Supabase.

---

## 🚀 Installation

### 1. Cloner / ouvrir le projet
```bash
cd SteFi-Tournoi
npm install
```

### 2. Configurer Supabase

#### Créer les tables
1. Va sur [supabase.com](https://supabase.com) → ton projet → **SQL Editor**
2. Copie-colle le contenu de **`supabase-schema.sql`** et exécute-le

#### Variables d'environnement
Renomme `.env` (déjà créé) et remplace les valeurs :
```env
VITE_SUPABASE_URL=https://TONID.supabase.co
VITE_SUPABASE_ANON_KEY=ta_cle_anon_ici
```

Tu trouves ces valeurs dans Supabase → **Settings → API**.

### 3. Lancer en local
```bash
npm run dev
```
Ouvre http://localhost:5173

---

## 🌐 Déploiement sur Vercel

### Option A — Via GitHub (recommandé)
1. Push le projet sur GitHub
2. Va sur [vercel.com](https://vercel.com) → **New Project** → importe le repo
3. Dans **Environment Variables**, ajoute :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clique **Deploy** ✅

### Option B — CLI Vercel
```bash
npm install -g vercel
vercel
# Suivre les instructions, puis ajouter les env vars dans le dashboard Vercel
```

---

## 📁 Structure du projet

```
SteFi-Tournoi/
├── index.html                 ← Point d'entrée HTML
├── package.json
├── vite.config.js
├── vercel.json                ← Config routing SPA
├── .env                       ← Clés Supabase (ne pas committer !)
├── supabase-schema.sql        ← Script création tables Supabase
│
├── public/
│   └── favicon.svg
│
└── src/
    ├── main.js                ← Entrée JS + router
    ├── supabase.js            ← Client Supabase
    │
    ├── pages/
    │   ├── Tournoi.js         ← Page vue tournoi + real-time
    │   └── Admin.js           ← Page admin
    │
    ├── components/
    │   ├── Header.js          ← En-tête + logo
    │   ├── GroupCard.js       ← Classement + matchs d'un groupe
    │   ├── Bracket.js         ← Bracket élimination directe
    │   ├── DrawModal.js       ← Tirage animé
    │   └── Confetti.js        ← Confettis animés
    │
    ├── logic/
    │   ├── standings.js       ← Calcul classements + meilleurs 3es
    │   ├── draw.js            ← Tirage équilibré par âge
    │   ├── bracket.js         ← Génération bracket KO
    │   └── db.js              ← Toutes les opérations Supabase
    │
    └── styles/
        └── main.css           ← Tous les styles
```

---

## ⚙️ Fonctionnalités

| Feature | Status |
|---|---|
| Formats 16 / 24 / 32 / 48 équipes | ✅ |
| Tirage au sort équilibré par âge | ✅ |
| Animation tirage slot-machine | ✅ |
| Phase de groupes (round-robin) | ✅ |
| Classements complets J/G/N/D/BP/BC/+−/Pts | ✅ |
| Meilleurs 3es (48 équipes) | ✅ |
| Élimination directe aller-retour | ✅ |
| Scores manuels sauvegardés en BDD | ✅ |
| Synchronisation temps réel (Supabase) | ✅ |
| Logo personnalisable | ✅ |
| Multi-championnats | ✅ |
| Confettis festifs | ✅ |

---

## 🎨 Pour ajouter ton logo

1. Va dans **Admin → Logo du Tournoi**
2. Clique **Importer un logo** et sélectionne ton fichier
3. Le logo s'affiche immédiatement en en-tête

---

## 🔐 Sécurité

Le schéma SQL inclut des politiques RLS (Row Level Security) en lecture/écriture publiques, adapté pour un usage en groupe de confiance.  
Pour sécuriser davantage (auth obligatoire), active l'authentification Supabase et modifie les policies RLS.
