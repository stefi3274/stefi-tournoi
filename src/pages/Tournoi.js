import { fetchTournaments, fetchFullTournament, saveGroupScore, saveKOScore, subscribeToTournament, unsubscribe } from '../logic/db.js'
import { applyScore, revertScore, getBest3rds } from '../logic/standings.js'
import { renderGroupCard, renderBest3rds } from '../components/GroupCard.js'
import { renderBracket } from '../components/Bracket.js'

let currentTournament = null
let tournaments = []
let realtimeChannel = null

// ── HTML statique de la page ──
export function renderTournoiPage() {
  return `
  <div id="tournoi-loading" style="text-align:center;padding:4rem;color:var(--muted);">
    <div style="font-size:2rem;margin-bottom:1rem;">⚽</div>
    <p>Chargement des championnats...</p>
  </div>
  <div id="tournoi-content" style="display:none;">
    <div class="row mb1" style="justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <div>
        <div class="stitle" id="tv-title"></div>
        <span class="tmuted" id="tv-info"></span>
      </div>
      <div class="row" style="gap:8px;">
        <span class="badge bg-g" id="tv-badge"></span>
        <select id="t-selector" style="padding:7px 12px;font-size:.82rem;background:var(--sur2);border:1px solid var(--bdr);border-radius:9px;color:var(--text);outline:none;cursor:pointer;"></select>
      </div>
    </div>
    <div class="ph-tabs">
      <button class="ph-tab active" id="ptab-g">⚽ Phase de Groupes</button>
      <button class="ph-tab" id="ptab-e">⚡ Élimination Directe</button>
    </div>
    <div id="phase-groupes"></div>
    <div id="phase-elimination" style="display:none;"></div>
  </div>
  <div id="no-tournoi" class="hero" style="display:none;">
    <div class="hero-ball">⚽</div>
    <h2>Prêt à en découdre ?</h2>
    <p>Crée ton premier championnat dans l'espace Admin !</p>
    <button class="btn btn-g" id="go-admin-btn">⚙️ Créer un tournoi</button>
  </div>`
}

// ── Init appelé après injection HTML ──
export async function initTournoiPage() {
  try {
    tournaments = await fetchTournaments()
  } catch (e) {
    console.error('Erreur fetch tournaments', e)
    tournaments = []
  }

  document.getElementById('tournoi-loading').style.display = 'none'

  if (!tournaments.length) {
    document.getElementById('no-tournoi').style.display = 'block'
    document.getElementById('go-admin-btn')?.addEventListener('click', () => window.navigateTo('admin'))
    return
  }

  document.getElementById('tournoi-content').style.display = 'block'

  const idToLoad = (currentTournament && tournaments.find(t => t.id === currentTournament.id))
    ? currentTournament.id
    : tournaments[0].id

  await loadTournament(idToLoad)
  attachPageEvents()
}

async function loadTournament(id) {
  unsubscribe(realtimeChannel)
  try {
    currentTournament = await fetchFullTournament(id)
  } catch (e) {
    console.error('Erreur fetch full tournament', e)
    return
  }
  renderContent()
  realtimeChannel = subscribeToTournament(id,
    () => reload(), () => reload(), () => reload()
  )
}

async function reload() {
  if (!currentTournament) return
  try {
    currentTournament = await fetchFullTournament(currentTournament.id)
    renderContent()
    attachScoreEvents()
  } catch (e) { console.error(e) }
}

function renderContent() {
  const t = currentTournament
  if (!t) return

  document.getElementById('tv-title').textContent = t.name
  document.getElementById('tv-info').textContent =
    `${t.player_count} joueurs · ${t.team_count} équipes · ${t.groups?.length ?? 0} groupes · ${new Date(t.created_at).toLocaleDateString('fr-FR')}`
  document.getElementById('tv-badge').textContent = '⚽ Phase de groupes'

  const sel = document.getElementById('t-selector')
  if (sel) {
    sel.innerHTML = tournaments.map(x =>
      `<option value="${x.id}" ${x.id === t.id ? 'selected' : ''}>${x.name}</option>`
    ).join('')
  }

  renderGroupsPhase(t)
  renderEliminationPhase(t)
}

function renderGroupsPhase(t) {
  const is48 = t.team_count === 48
  const legend = `
  <div class="qual-legend">
    <div class="ql-item"><div class="ql-bar" style="background:var(--green);"></div>1er qualifié</div>
    <div class="ql-item"><div class="ql-bar" style="background:#00c96a;"></div>2e qualifié</div>
    ${is48 ? `<div class="ql-item"><div class="ql-bar" style="background:var(--gold);border-style:dashed;"></div>Meilleur 3e potentiel</div>` : ''}
  </div>`

  const groupsHTML = (t.groups ?? []).map(g => renderGroupCard(g, t.team_count)).join('')
  const best3HTML = is48 ? renderBest3rds(getBest3rds(t.groups ?? [])) : ''

  document.getElementById('phase-groupes').innerHTML =
    legend + `<div class="grp-grid">${groupsHTML}</div>` + best3HTML

  attachScoreEvents()
}

function renderEliminationPhase(t) {
  document.getElementById('phase-elimination').innerHTML =
    renderBracket(t.knockout?.rounds ?? [], t.id)
  attachKOEvents()
}

// ── Attacher les events de la page (tabs, selector) ──
function attachPageEvents() {
  document.getElementById('ptab-g')?.addEventListener('click', function () {
    document.querySelectorAll('.ph-tab').forEach(t => t.classList.remove('active'))
    this.classList.add('active')
    document.getElementById('phase-groupes').style.display = 'block'
    document.getElementById('phase-elimination').style.display = 'none'
  })

  document.getElementById('ptab-e')?.addEventListener('click', function () {
    document.querySelectorAll('.ph-tab').forEach(t => t.classList.remove('active'))
    this.classList.add('active')
    document.getElementById('phase-groupes').style.display = 'none'
    document.getElementById('phase-elimination').style.display = 'block'
  })

  document.getElementById('t-selector')?.addEventListener('change', async function () {
    await loadTournament(this.value)
    attachPageEvents()
  })
}

// ── Scores groupes ──
function attachScoreEvents() {
  document.querySelectorAll('.sv-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const mid = btn.dataset.matchId
      const gid = btn.dataset.groupId
      const hid = btn.dataset.homeId
      const aid = btn.dataset.awayId
      const wasPlayed = btn.dataset.wasPlayed === 'true'
      const oldSh = parseFloat(btn.dataset.oldSh)
      const oldSa = parseFloat(btn.dataset.oldSa)

      const sh = parseFloat(document.getElementById('sh_' + mid)?.value)
      const sa = parseFloat(document.getElementById('sa_' + mid)?.value)

      if (isNaN(sh) || isNaN(sa)) { showToast('Saisis les deux scores !', true); return }

      const group = currentTournament.groups.find(g => g.id === gid)
      if (!group) return

      if (wasPlayed) revertScore(group.standings, hid, oldSh, aid, oldSa)
      applyScore(group.standings, hid, sh, aid, sa)

      try {
        await saveGroupScore(mid, gid, hid, sh, aid, sa, wasPlayed, oldSh, oldSa, group.standings)
        showToast(`✅ Score enregistré`)
        renderGroupsPhase(currentTournament)
      } catch (e) {
        showToast('Erreur sauvegarde', true)
        console.error(e)
      }
    })
  })
}

// ── Scores KO ──
function attachKOEvents() {
  document.querySelectorAll('.bsi').forEach(input => {
    input.addEventListener('change', async function () {
      const mid = this.dataset.matchId
      const field = this.dataset.field
      const val = parseInt(this.value)
      if (isNaN(val)) return
      try {
        await saveKOScore(mid, { [field]: val })
        const round = currentTournament.knockout.rounds.find(r =>
          r.matches.some(m => m.id === mid))
        if (round) {
          const m = round.matches.find(x => x.id === mid)
          if (m) m[field] = val
        }
        renderEliminationPhase(currentTournament)
      } catch (e) {
        showToast('Erreur sauvegarde KO', true)
        console.error(e)
      }
    })
  })
}

function showToast(msg, err = false) {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = msg
  el.className = 'toast' + (err ? ' err' : '')
  el.classList.add('show')
  clearTimeout(window._toastTO)
  window._toastTO = setTimeout(() => el.classList.remove('show'), 2800)
}
