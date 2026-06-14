// ── Génération du bracket d'élimination directe ──

/**
 * Retourne la taille du tableau KO selon le format
 * 16 éq → 8 qualifiés (2/groupe × 4 groupes)
 * 24 éq → 16 qualifiés (2/groupe × 6 groupes + meilleurs 3es si besoin)
 * 32 éq → 16 qualifiés (2/groupe × 8 groupes)
 * 48 éq → 32 qualifiés (2/groupe × 12 groupes + 8 meilleurs 3es)
 */
export function getKOSize(teamCount) {
  return { 16: 8, 24: 16, 32: 16, 48: 32 }[teamCount] ?? 16
}

export function getRoundNames(koSize) {
  const names = []
  let r = koSize
  while (r >= 2) {
    if (r === 2) names.push('🏆 Finale')
    else if (r === 4) names.push('🥊 Demi-finales')
    else if (r === 8) names.push('⚔️ Quarts de finale')
    else if (r === 16) names.push('🔥 Huitièmes de finale')
    else names.push('⚡ Seizièmes de finale')
    r = Math.floor(r / 2)
  }
  return names.reverse()
}

export function buildKnockoutRounds(teamCount) {
  const koSize = getKOSize(teamCount)
  const roundNames = getRoundNames(koSize)

  return roundNames.map((name, ri) => ({
    name,
    round_index: ri,
    matches: Array.from(
      { length: koSize / Math.pow(2, roundNames.length - ri) },
      (_, mi) => ({
        round_name: name,
        round_index: ri,
        match_index: mi,
        home_name: ri === 0 ? `Qualifié ${mi * 2 + 1}` : 'TBD',
        away_name: ri === 0 ? `Qualifié ${mi * 2 + 2}` : 'TBD',
        score_home_1: null,
        score_away_1: null,
        score_home_2: null,
        score_away_2: null,
      })
    ),
  }))
}

/**
 * Calcule le total cumulé aller-retour
 */
export function getTotal(match) {
  const t1 = (match.score_home_1 ?? 0) + (match.score_away_2 ?? 0)
  const t2 = (match.score_away_1 ?? 0) + (match.score_home_2 ?? 0)
  return { home: t1, away: t2 }
}

export function hasTotal(match) {
  return match.score_home_1 !== null && match.score_away_2 !== null
}
