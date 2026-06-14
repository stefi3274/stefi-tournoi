-- ============================================
-- STEFI TOURNOI FC26 — Script Supabase SQL
-- Colle ce script dans l'éditeur SQL de Supabase
-- ============================================

-- Tournois
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team_count INTEGER NOT NULL CHECK (team_count IN (16, 24, 32, 48)),
  player_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'groupes' CHECK (status IN ('groupes', 'elimination', 'termine')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Joueurs
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 1 AND 99),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groupes
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  letter TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Joueurs dans les groupes
CREATE TABLE group_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  -- Classement calculé
  pts INTEGER DEFAULT 0,
  j INTEGER DEFAULT 0,
  g INTEGER DEFAULT 0,
  n INTEGER DEFAULT 0,
  d INTEGER DEFAULT 0,
  bp INTEGER DEFAULT 0,
  bc INTEGER DEFAULT 0,
  diff INTEGER DEFAULT 0
);

-- Matchs de groupes
CREATE TABLE group_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  home_player_id UUID REFERENCES players(id),
  away_player_id UUID REFERENCES players(id),
  score_home INTEGER,
  score_away INTEGER,
  played BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matchs d'élimination directe (aller-retour)
CREATE TABLE ko_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_name TEXT NOT NULL,
  round_index INTEGER NOT NULL,
  match_index INTEGER NOT NULL,
  home_name TEXT DEFAULT 'TBD',
  away_name TEXT DEFAULT 'TBD',
  home_player_id UUID REFERENCES players(id),
  away_player_id UUID REFERENCES players(id),
  -- Aller
  score_home_1 INTEGER,
  score_away_1 INTEGER,
  -- Retour
  score_home_2 INTEGER,
  score_away_2 INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REAL-TIME : activer pour les matchs
-- ============================================
ALTER TABLE group_matches REPLICA IDENTITY FULL;
ALTER TABLE ko_matches REPLICA IDENTITY FULL;
ALTER TABLE group_players REPLICA IDENTITY FULL;

-- ============================================
-- RLS : accès public en lecture, authentifié en écriture
-- (adapte selon tes besoins de sécurité)
-- ============================================
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ko_matches ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Lecture publique tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Lecture publique players" ON players FOR SELECT USING (true);
CREATE POLICY "Lecture publique groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Lecture publique group_players" ON group_players FOR SELECT USING (true);
CREATE POLICY "Lecture publique group_matches" ON group_matches FOR SELECT USING (true);
CREATE POLICY "Lecture publique ko_matches" ON ko_matches FOR SELECT USING (true);

-- Écriture publique (pour démo — à sécuriser avec auth si besoin)
CREATE POLICY "Écriture publique tournaments" ON tournaments FOR ALL USING (true);
CREATE POLICY "Écriture publique players" ON players FOR ALL USING (true);
CREATE POLICY "Écriture publique groups" ON groups FOR ALL USING (true);
CREATE POLICY "Écriture publique group_players" ON group_players FOR ALL USING (true);
CREATE POLICY "Écriture publique group_matches" ON group_matches FOR ALL USING (true);
CREATE POLICY "Écriture publique ko_matches" ON ko_matches FOR ALL USING (true);
