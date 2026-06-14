// ── Tirage au sort équilibré par tranches d'âge ──

export function ageCat(age) {
  if (age < 18) return { color: '#FFD700', label: 'Junior' }
  if (age <= 30) return { color: '#00FF87', label: 'Adulte' }
  if (age <= 45) return { color: '#A855F7', label: 'Senior' }
  return { color: '#60A5FA', label: 'Vétéran' }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Répartit les joueurs équitablement par tranche d'âge (chapeaux).
 * Distribution en serpentine pour garantir un mix dans chaque groupe.
 */
export function balancedDraw(players, nGroups) {
  // Trier en 4 chapeaux d'âge
  const cats = [[], [], [], []]
  players.forEach(p => {
    if (p.age < 18) cats[0].push(p)
    else if (p.age <= 30) cats[1].push(p)
    else if (p.age <= 45) cats[2].push(p)
    else cats[3].push(p)
  })

  // Mélanger chaque chapeau
  cats.forEach((c, i) => { cats[i] = shuffle(c) })

  const groups = Array.from({ length: nGroups }, (_, i) => ({
    letter: String.fromCharCode(65 + i),
    players: [],
  }))

  // Distribution serpentine chapeau par chapeau
  let gi = 0, dir = 1
  cats.forEach(cat => {
    cat.forEach(p => {
      groups[gi].players.push(p)
      gi += dir
      if (gi >= nGroups) { gi = nGroups - 1; dir = -1 }
      else if (gi < 0) { gi = 0; dir = 1 }
    })
  })

  return groups
}

export function getGroupCount(teamCount) {
  return { 16: 4, 24: 6, 32: 8, 48: 12 }[teamCount] ?? 6
}
