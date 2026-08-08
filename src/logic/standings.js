export function applyScore(standings, homeId, sh, awayId, sa) {
  const H = standings.find(s => s.player_id === homeId)
  const A = standings.find(s => s.player_id === awayId)
  if (!H || !A) return
  H.j++; A.j++
  H.bp += sh; H.bc += sa; H.diff = H.bp - H.bc
  A.bp += sa; A.bc += sh; A.diff = A.bp - A.bc
  if (sh > sa) { H.g++; H.pts += 3; A.d++ }
  else if (sh < sa) { A.g++; A.pts += 3; H.d++ }
  else { H.n++; H.pts++; A.n++; A.pts++ }
}

export function revertScore(standings, homeId, sh, awayId, sa) {
  const H = standings.find(s => s.player_id === homeId)
  const A = standings.find(s => s.player_id === awayId)
  if (!H || !A) return
  H.j--; A.j--
  H.bp -= sh; H.bc -= sa; H.diff = H.bp - H.bc
  A.bp -= sa; A.bc -= sh; A.diff = A.bp - A.bc
  if (sh > sa) { H.g--; H.pts -= 3; A.d-- }
  else if (sh < sa) { A.g--; A.pts -= 3; H.d-- }
  else { H.n--; H.pts--; A.n--; A.pts-- }
}

export function sortStandings(standings) {
  return [...standings].sort((a, b) =>
    b.pts - a.pts || b.diff - a.diff || b.bp - a.bp ||
    (a.name || '').localeCompare(b.name || '')
  )
}

export function getBest3rds(groups) {
  const thirds = []
  groups.forEach(g => {
    const sorted = sortStandings(g.standings)
    if (sorted.length >= 3) thirds.push({ ...sorted[2], groupLetter: g.letter })
  })
  return thirds.sort((a, b) => b.pts - a.pts || b.diff - a.diff || b.bp - a.bp).slice(0, 4)
}
