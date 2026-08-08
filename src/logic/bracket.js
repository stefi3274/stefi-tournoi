export function getKOSize(n) {
  const sizes = [2, 4, 8, 16, 32, 64]
  return sizes.find(s => s >= n) ?? 8
}

export function getRoundNames(koSize) {
  const names = []
  let r = koSize
  while (r >= 2) {
    if (r === 2)  names.push('🏆 Finale')
    else if (r === 4)  names.push('🥊 Demi-finales')
    else if (r === 8)  names.push('⚔️ Quarts de finale')
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
    name, round_index: ri,
    matches: Array.from({ length: koSize / Math.pow(2, roundNames.length - ri) }, (_, mi) => ({
      round_name: name, round_index: ri, match_index: mi,
      home_name: ri === 0 ? `Joueur ${mi * 2 + 1}` : 'TBD',
      away_name: ri === 0 ? `Joueur ${mi * 2 + 2}` : 'TBD',
      score_home_1: null, score_away_1: null,
      score_home_2: null, score_away_2: null,
    }))
  }))
}

export function getTotal(m) {
  return {
    home: (m.score_home_1 ?? 0) + (m.score_away_2 ?? 0),
    away: (m.score_away_1 ?? 0) + (m.score_home_2 ?? 0),
  }
}
export function hasTotal(m) {
  return m.score_home_1 !== null && m.score_away_2 !== null
}
