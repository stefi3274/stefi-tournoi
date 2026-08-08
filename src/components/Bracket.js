import { getTotal, hasTotal } from '../logic/bracket.js'

export function renderBracket(rounds, tournamentId) {
  if (!rounds?.length) return '<p class="tmuted" style="padding:2rem;text-align:center;">Phase éliminatoire non disponible.</p>'
  return `<div class="brk-scroll"><div class="brk">
    ${rounds.map(round => `
      <div class="brk-round">
        <div class="brk-rtitle">${round.name}</div>
        ${round.matches.map(m => renderKOMatch(m, tournamentId)).join('')}
      </div>`).join('')}
  </div></div>`
}

function renderKOMatch(m, tournamentId) {
  const tot = getTotal(m)
  const showTotal = hasTotal(m)
  const homeWins = showTotal && tot.home > tot.away
  const awayWins = showTotal && tot.away > tot.home

  return `<div class="brk-match">
    <div class="ko-leg">⚽ Match Aller</div>
    <div class="brk-team ${homeWins?'winner':''}">
      <span class="brk-team-name">${m.home_name}</span>
      <div class="brk-score-wrap">
        <input class="bsi" type="number" min="0" max="99"
          value="${m.score_home_1??''}" placeholder="–"
          data-match-id="${m.id}" data-field="score_home_1" data-tournament-id="${tournamentId}">
      </div>
    </div>
    <div class="brk-team ${awayWins?'winner':''}">
      <span class="brk-team-name">${m.away_name}</span>
      <div class="brk-score-wrap">
        <input class="bsi" type="number" min="0" max="99"
          value="${m.score_away_1??''}" placeholder="–"
          data-match-id="${m.id}" data-field="score_away_1" data-tournament-id="${tournamentId}">
      </div>
    </div>
    <div class="ko-leg" style="border-top:1px solid var(--bdr);">🔄 Match Retour</div>
    <div class="brk-team">
      <span class="brk-team-name">${m.away_name}</span>
      <div class="brk-score-wrap">
        <input class="bsi" type="number" min="0" max="99"
          value="${m.score_home_2??''}" placeholder="–"
          data-match-id="${m.id}" data-field="score_home_2" data-tournament-id="${tournamentId}">
      </div>
    </div>
    <div class="brk-team">
      <span class="brk-team-name">${m.home_name}</span>
      <div class="brk-score-wrap">
        <input class="bsi" type="number" min="0" max="99"
          value="${m.score_away_2??''}" placeholder="–"
          data-match-id="${m.id}" data-field="score_away_2" data-tournament-id="${tournamentId}">
      </div>
    </div>
    ${showTotal ? `<div class="ko-total">
      Total · <strong>${m.home_name}</strong> ${tot.home} – ${tot.away} <strong>${m.away_name}</strong>
      ${tot.home > tot.away ? `<span style="color:var(--green);margin-left:6px;">✅ ${m.home_name}</span>`
        : tot.away > tot.home ? `<span style="color:var(--green);margin-left:6px;">✅ ${m.away_name}</span>`
        : `<span style="color:var(--gold);margin-left:6px;">⚖️ Égalité</span>`}
    </div>` : ''}
  </div>`
}
