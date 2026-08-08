import { sortStandings } from '../logic/standings.js'
import { ageCat } from '../logic/draw.js'

export function renderGroupCard(group, teamCount) {
  const is48 = teamCount === 48
  const sorted = sortStandings(group.standings)
  const rows = sorted.map((s, i) => {
    const ac = ageCat(s.age)
    const qcls = i===0?'q1':i===1?'q2':i===2&&is48?'q3':''
    const diff = s.diff > 0 ? `<span class="diff-pos">+${s.diff}</span>`
               : s.diff < 0 ? `<span class="diff-neg">${s.diff}</span>`
               : `<span class="diff-0">0</span>`
    return `<tr class="${qcls}">
      <td><span class="rpip ${['r1','r2','r3','rn'][Math.min(i,3)]}">${i+1}</span></td>
      <td><div style="display:flex;align-items:center;gap:6px;">
        <div class="acat" style="background:${ac.color};width:10px;height:10px;border-radius:50%;flex-shrink:0;"></div>
        <strong style="font-size:.95rem;">${s.name}</strong>
        <span class="age-chip">${s.age}a</span>
      </div></td>
      <td class="c">${s.j}</td><td class="c">${s.g}</td><td class="c">${s.n}</td>
      <td class="c">${s.d}</td><td class="c">${s.bp}</td><td class="c">${s.bc}</td>
      <td class="c">${diff}</td>
      <td class="c"><strong class="pts-cell">${s.pts}</strong></td>
    </tr>`
  }).join('')

  const matchRows = group.matches.map(m => {
    const homeName = m.home?.name ?? '?'
    const awayName = m.away?.name ?? '?'
    const homeId = m.home?.id ?? m.home_player_id
    const awayId = m.away?.id ?? m.away_player_id
    return `<div class="match-row ${m.played?'match-played':''}">
      <div class="mt home">${homeName}</div>
      <div class="mscore">
        <input class="si" type="number" min="0" max="99"
          value="${m.score_home!==null&&m.score_home!==undefined?m.score_home:''}" id="sh_${m.id}" placeholder="-">
        <span class="sep">–</span>
        <input class="si" type="number" min="0" max="99"
          value="${m.score_away!==null&&m.score_away!==undefined?m.score_away:''}" id="sa_${m.id}" placeholder="-">
      </div>
      <div class="mt">${awayName}</div>
      <button class="sv-btn" data-match-id="${m.id}" data-group-id="${group.id}"
        data-home-id="${homeId}" data-away-id="${awayId}"
        data-was-played="${m.played}" data-old-sh="${m.score_home??''}" data-old-sa="${m.score_away??''}">💾</button>
    </div>`
  }).join('')

  return `<div class="grp-card">
    <div class="grp-hd">
      <span class="ltr">⚽ GROUPE ${group.letter}</span>
      <span class="sub">${group.players?.length ?? group.standings?.length ?? 0} joueurs</span>
    </div>
    <table class="stbl">
      <thead><tr>
        <th>#</th><th>Joueur</th>
        <th class="c" title="Matchs joués">J</th><th class="c" title="Victoires">G</th>
        <th class="c" title="Nuls">N</th><th class="c" title="Défaites">D</th>
        <th class="c" title="Buts pour">BP</th><th class="c" title="Buts contre">BC</th>
        <th class="c" title="Différence">+/−</th><th class="c" title="Points">Pts</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="match-lbl">Matchs — Groupe ${group.letter}</div>
    ${matchRows}
  </div>`
}

export function renderBest3rds(best3) {
  if (!best3.length) return ''
  return `<div class="best3-panel">
    <div class="best3-hd">⭐ <span>Meilleurs 3es — Qualifiés supplémentaires</span></div>
    <table class="stbl">
      <thead><tr><th>#</th><th>Joueur</th><th>Groupe</th>
        <th class="c">J</th><th class="c">G</th><th class="c">N</th><th class="c">D</th>
        <th class="c">BP</th><th class="c">BC</th><th class="c">+/−</th><th class="c">Pts</th>
      </tr></thead>
      <tbody>${best3.map((s,i)=>{
        const ac=ageCat(s.age); const d=s.diff>0?`+${s.diff}`:s.diff
        return `<tr class="q3">
          <td><span class="rpip ${['r1','r2','r3','rn'][Math.min(i,3)]}">${i+1}</span></td>
          <td><div style="display:flex;align-items:center;gap:5px;">
            <div class="acat" style="background:${ac.color};width:10px;height:10px;border-radius:50%;"></div>
            <strong>${s.name}</strong></div></td>
          <td><span class="badge bg-v">Gr. ${s.groupLetter}</span></td>
          <td class="c">${s.j}</td><td class="c">${s.g}</td><td class="c">${s.n}</td><td class="c">${s.d}</td>
          <td class="c">${s.bp}</td><td class="c">${s.bc}</td>
          <td class="c">${d}</td><td class="c"><strong class="pts-cell">${s.pts}</strong></td>
        </tr>`
      }).join('')}</tbody>
    </table>
  </div>`
}
