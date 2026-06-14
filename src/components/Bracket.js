import { getTotal, hasTotal } from '../logic/bracket.js'

export function renderBracket(rounds, tournamentId) {
  if (!rounds?.length) return '<p class="tmuted">Phase éliminatoire non disponible.</p>'

  return `
  <div class="brk-scroll">
    <div class="brk">
      ${rounds.map(round => `
        <div class="brk-round">
          <div class="brk-rtitle">${round.name}</div>
          ${round.matches.map(m => renderKOMatch(m, tournamentId)).join('')}
        </div>
      `).join('')}
    </div>
  </div>`
}

function renderKOMatch(m, tournamentId) {
  const tot = getTotal(m)
  const showTotal = hasTotal(m)

  return `
  <div class="brk-match">
    <div class="ko-leg">⚽ Aller</div>
    <div class="brk-team ${showTotal && tot.home > tot.away ? 'winner' : ''}">
      <span>${m.home_name}</span>
      <input class="bsi" type="number" min="0" max="99"
        value="${m.score_home_1 ?? ''}"
        data-match-id="${m.id}" data-field="score_home_1"
        data-tournament-id="${tournamentId}" placeholder="-">
    </div>
    <div class="brk-team ${showTotal && tot.away > tot.home ? 'winner' : ''}">
      <span>${m.away_name}</span>
      <input class="bsi" type="number" min="0" max="99"
        value="${m.score_away_1 ?? ''}"
        data-match-id="${m.id}" data-field="score_away_1"
        data-tournament-id="${tournamentId}" placeholder="-">
    </div>
    <div class="ko-leg">🔄 Retour</div>
    <div class="brk-team">
      <span>${m.away_name}</span>
      <input class="bsi" type="number" min="0" max="99"
        value="${m.score_home_2 ?? ''}"
        data-match-id="${m.id}" data-field="score_home_2"
        data-tournament-id="${tournamentId}" placeholder="-">
    </div>
    <div class="brk-team">
      <span>${m.home_name}</span>
      <input class="bsi" type="number" min="0" max="99"
        value="${m.score_away_2 ?? ''}"
        data-match-id="${m.id}" data-field="score_away_2"
        data-tournament-id="${tournamentId}" placeholder="-">
    </div>
    ${showTotal ? `
    <div class="ko-total">
      Total · ${m.home_name} <strong>${tot.home}</strong> – <strong>${tot.away}</strong> ${m.away_name}
    </div>` : ''}
  </div>`
}
