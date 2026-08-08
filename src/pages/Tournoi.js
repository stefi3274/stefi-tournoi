import { fetchTournaments, fetchFullTournament, saveGroupScore, saveKOScore, subscribeToTournament, unsubscribe } from '../logic/db.js'
import { applyScore, revertScore, getBest3rds } from '../logic/standings.js'
import { renderGroupCard, renderBest3rds } from '../components/GroupCard.js'
import { renderBracket } from '../components/Bracket.js'

let currentTournament = null, tournaments = [], realtimeChannel = null

export function renderTournoiPage() {
  return `
  <div id="tournoi-loading" style="text-align:center;padding:5rem;color:var(--muted);">
    <div style="font-size:3rem;margin-bottom:1rem;">⚽</div>
    <p style="font-size:1rem;">Chargement des compétitions...</p>
  </div>
  <div id="tournoi-content" style="display:none;">
    <div class="row mb1" style="justify-content:space-between;flex-wrap:wrap;gap:10px;">
      <div>
        <div class="stitle" id="tv-title"></div>
        <span class="tmuted" id="tv-info" style="font-size:.9rem;"></span>
      </div>
      <div class="row" style="gap:10px;">
        <span class="badge" id="tv-type-badge"></span>
        <span class="badge bg-g" id="tv-badge"></span>
        <select id="t-selector" style="padding:9px 14px;font-size:.9rem;background:var(--sur2);border:1px solid var(--bdr);border-radius:9px;color:var(--text);outline:none;cursor:pointer;"></select>
      </div>
    </div>
    <div class="ph-tabs" id="phase-tabs-container"></div>
    <div id="phase-groupes"></div>
    <div id="phase-elimination" style="display:none;"></div>
  </div>
  <div id="no-tournoi" class="hero" style="display:none;">
    <div class="hero-ball">⚽</div>
    <h2>Prêt à en découdre ?</h2>
    <p style="font-size:1rem;">Crée ta première compétition dans l'espace Admin !</p>
    <button class="btn btn-g" id="go-admin-btn" style="font-size:1rem;padding:14px 24px;">⚙️ Créer une compétition</button>
  </div>`
}

export async function initTournoiPage() {
  try { tournaments = await fetchTournaments() } catch(e) { tournaments = [] }
  document.getElementById('tournoi-loading').style.display = 'none'
  if (!tournaments.length) {
    document.getElementById('no-tournoi').style.display = 'block'
    document.getElementById('go-admin-btn')?.addEventListener('click', () => window.navigateTo('admin'))
    return
  }
  document.getElementById('tournoi-content').style.display = 'block'
  const idToLoad = (currentTournament && tournaments.find(t => t.id === currentTournament.id))
    ? currentTournament.id : tournaments[0].id
  await loadTournament(idToLoad)
  attachPageEvents()
}

async function loadTournament(id) {
  unsubscribe(realtimeChannel)
  try { currentTournament = await fetchFullTournament(id) } catch(e) { console.error(e); return }
  renderContent()
  realtimeChannel = subscribeToTournament(id, () => reload())
}

async function reload() {
  if (!currentTournament) return
  try { currentTournament = await fetchFullTournament(currentTournament.id); renderContent(); attachScoreEvents(); attachKOEvents() }
  catch(e) { console.error(e) }
}

function renderContent() {
  const t = currentTournament; if (!t) return
  const isCup = t.type === 'coupe'

  document.getElementById('tv-title').textContent = t.name
  document.getElementById('tv-info').textContent =
    `${t.player_count} joueurs · ${t.team_count} max · ${new Date(t.created_at).toLocaleDateString('fr-FR')}`
  document.getElementById('tv-badge').textContent = isCup ? '⚡ Élimination directe' : '⚽ Phase de groupes'
  const typeBadge = document.getElementById('tv-type-badge')
  typeBadge.textContent = isCup ? '🏆 Coupe' : '🏅 Championnat'
  typeBadge.className = `badge ${isCup ? 'bg-gold' : 'bg-v'}`

  const sel = document.getElementById('t-selector')
  if (sel) sel.innerHTML = tournaments.map(x => `<option value="${x.id}" ${x.id===t.id?'selected':''}>${x.type==='coupe'?'🏆':'🏅'} ${x.name}</option>`).join('')

  // Tabs selon le type
  const tabsContainer = document.getElementById('phase-tabs-container')
  if (isCup) {
    tabsContainer.innerHTML = `<button class="ph-tab active" id="ptab-e">⚡ Bracket Coupe</button>`
    document.getElementById('phase-groupes').style.display = 'none'
    document.getElementById('phase-elimination').style.display = 'block'
  } else {
    tabsContainer.innerHTML = `
      <button class="ph-tab active" id="ptab-g">⚽ Phase de Groupes</button>
      <button class="ph-tab" id="ptab-e">⚡ Élimination Directe</button>`
    document.getElementById('phase-groupes').style.display = 'block'
    document.getElementById('phase-elimination').style.display = 'none'
  }

  if (!isCup) renderGroupsPhase(t)
  renderEliminationPhase(t)
  attachPageEvents()
}

function renderGroupsPhase(t) {
  const is48 = t.team_count === 48
  const legend = `<div class="qual-legend">
    <div class="ql-item"><div class="ql-bar" style="background:var(--green);"></div>1er qualifié</div>
    <div class="ql-item"><div class="ql-bar" style="background:#00c96a;"></div>2e qualifié</div>
    ${is48?`<div class="ql-item"><div class="ql-bar" style="background:var(--gold);border-style:dashed;"></div>Meilleur 3e potentiel</div>`:''}
  </div>`
  const groupsHTML = (t.groups??[]).map(g => renderGroupCard(g, t.team_count)).join('')
  const best3HTML = is48 ? renderBest3rds(getBest3rds(t.groups??[])) : ''
  document.getElementById('phase-groupes').innerHTML = legend + `<div class="grp-grid">${groupsHTML}</div>` + best3HTML
  attachScoreEvents()
}

function renderEliminationPhase(t) {
  document.getElementById('phase-elimination').innerHTML = renderBracket(t.knockout?.rounds??[], t.id)
  attachKOEvents()
}

function attachPageEvents() {
  document.getElementById('ptab-g')?.addEventListener('click', function() {
    document.querySelectorAll('.ph-tab').forEach(t=>t.classList.remove('active')); this.classList.add('active')
    document.getElementById('phase-groupes').style.display='block'
    document.getElementById('phase-elimination').style.display='none'
  })
  document.getElementById('ptab-e')?.addEventListener('click', function() {
    document.querySelectorAll('.ph-tab').forEach(t=>t.classList.remove('active')); this.classList.add('active')
    document.getElementById('phase-groupes').style.display='none'
    document.getElementById('phase-elimination').style.display='block'
  })
  document.getElementById('t-selector')?.addEventListener('change', async function() {
    await loadTournament(this.value); attachPageEvents()
  })
}

function attachScoreEvents() {
  document.querySelectorAll('.sv-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const mid=btn.dataset.matchId, gid=btn.dataset.groupId
      const hid=btn.dataset.homeId, aid=btn.dataset.awayId
      const wasPlayed=btn.dataset.wasPlayed==='true'
      const oldSh=parseFloat(btn.dataset.oldSh), oldSa=parseFloat(btn.dataset.oldSa)
      const sh=parseFloat(document.getElementById('sh_'+mid)?.value)
      const sa=parseFloat(document.getElementById('sa_'+mid)?.value)
      if (isNaN(sh)||isNaN(sa)) { showToast('Saisis les deux scores !', true); return }
      const group = currentTournament.groups.find(g=>g.id===gid); if (!group) return
      if (wasPlayed) revertScore(group.standings, hid, oldSh, aid, oldSa)
      applyScore(group.standings, hid, sh, aid, sa)
      try {
        await saveGroupScore(mid, gid, hid, sh, aid, sa, wasPlayed, oldSh, oldSa, group.standings)
        showToast(`✅ ${sh} – ${sa} enregistré`)
        renderGroupsPhase(currentTournament)
      } catch(e) { showToast('Erreur sauvegarde', true); console.error(e) }
    })
  })
}

function attachKOEvents() {
  document.querySelectorAll('.bsi').forEach(input => {
    input.addEventListener('change', async function() {
      const mid=this.dataset.matchId, field=this.dataset.field
      const val=parseInt(this.value); if (isNaN(val)) return
      try {
        await saveKOScore(mid, { [field]: val })
        const round = currentTournament.knockout.rounds.find(r=>r.matches.some(m=>m.id===mid))
        if (round) { const m=round.matches.find(x=>x.id===mid); if(m) m[field]=val }
        renderEliminationPhase(currentTournament)
      } catch(e) { showToast('Erreur sauvegarde KO', true); console.error(e) }
    })
  })
}

function showToast(msg, err=false) {
  const el=document.getElementById('toast'); if(!el) return
  el.textContent=msg; el.className='toast'+(err?' err':'')
  el.classList.add('show'); clearTimeout(window._toastTO)
  window._toastTO=setTimeout(()=>el.classList.remove('show'),2800)
}
