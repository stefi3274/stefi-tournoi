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

export function balancedDraw(players, nGroups) {
  const cats = [[], [], [], []]
  players.forEach(p => {
    if (p.age < 18) cats[0].push(p)
    else if (p.age <= 30) cats[1].push(p)
    else if (p.age <= 45) cats[2].push(p)
    else cats[3].push(p)
  })
  cats.forEach((c, i) => { cats[i] = shuffle(c) })
  const groups = Array.from({ length: nGroups }, (_, i) => ({
    letter: String.fromCharCode(65 + i), players: [],
  }))
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

// Pour la coupe : tirage aléatoire équilibré par âge ET niveau
export function cupDraw(players) {
  const shuffled = [...players]
  // Trier par niveau puis âge pour équilibrer
  const levelOrder = { maestro: 0, alaise: 1, debutant: 2 }
  shuffled.sort((a, b) => (levelOrder[a.level] ?? 1) - (levelOrder[b.level] ?? 1))
  // Serpentine pour éviter que tous les maestros soient dans le même bracket
  const result = []
  let dir = 1, pos = 0
  shuffled.forEach((p, i) => {
    result[pos] = p
    pos += dir
    if (pos >= shuffled.length || pos < 0) { dir *= -1; pos += dir }
  })
  return shuffle(result)
}

export function getGroupCount(teamCount) {
  return { 8: 2, 16: 4, 24: 6, 32: 8, 48: 12 }[teamCount] ?? 4
}
