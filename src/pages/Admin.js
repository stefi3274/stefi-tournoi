import { fetchTournaments, saveTournamentWithGroups, deleteTournament } from '../logic/db.js'
import { ageCat, getGroupCount } from '../logic/draw.js'
import { renderDrawModal, openDrawModal, closeDrawModal, attachDrawEvents } from '../components/DrawModal.js'
import { burstConfetti } from '../components/Confetti.js'

let players = []
let teamCount = 24
let tournaments = []
let logoData = null

export function renderAdminPage() {
  return `
  <div class="admin-grid">
    <div style="display:flex;flex-direction:column;gap:1.2rem;">

      <!-- Logo -->
      <div class="card">
        <div class="card-hd"><span>🖼️</span><h2>Logo du Tournoi</h2></div>
        <div class="card-bd">
          <div style="display:flex;align-items:center;gap:12px;">
            <div id="logo-preview" style="width:60px;height:60px;border-radius:12px;background:linear-gradient(135deg,var(--green-dark),var(--green));display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;box-shadow:0 0 15px var(--gglow);">
              ${logoData ? `<img src="${logoData}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">` : '⚽'}
            </div>
            <div>
              <label class="btn btn-o btn-sm" style="cursor:pointer;">
                📁 Importer un logo
                <input type="file" id="logo-input" accept="image/*" style="display:none;">
              </label>
              ${logoData ? `<button class="btn btn-d btn-sm" id="logo-reset" style="margin-left:6px;">✕</button>` : ''}
              <div class="tmuted" style="margin-top:6px;font-size:.72rem;">PNG · JPG · SVG · Carré idéal</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nouveau tournoi -->
      <div class="card">
        <div class="card-hd"><span>🏆</span><h2>Nouveau Tournoi</h2></div>
        <div class="card-bd">
          <div class="fg"><label>Nom du tournoi</label>
            <input type="text" id="new-name" placeholder="ex: Saison Hiver 2025">
          </div>
          <div class="fg">
            <label>Format</label>
            <div class="tc-sel">
              ${[16,24,32,48].map(n =>
                `<div class="tc-btn ${n===teamCount?'sel':''}" data-tc="${n}">${n}<span>équipes</span></div>`
              ).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Joueurs -->
      <div class="card">
        <div class="card-hd">
          <span>👥</span>
          <h2>Joueurs <span id="pc-label" style="font-size:.8rem;color:var(--muted);font-weight:400;">(${players.length}/${teamCount})</span></h2>
        </div>
        <div class="card-bd">
          <div class="age-legend">
            <div class="age-leg-item"><div class="acat" style="background:#FFD700;"></div>Junior (&lt;18)</div>
            <div class="age-leg-item"><div class="acat" style="background:#00FF87;"></div>Adulte (18-30)</div>
            <div class="age-leg-item"><div class="acat" style="background:#A855F7;"></div>Senior (31-45)</div>
            <div class="age-leg-item"><div class="acat" style="background:#60A5FA;"></div>Vétéran (&gt;45)</div>
          </div>
          <div class="p-add-row">
            <input type="text" id="pname" placeholder="Nom du joueur">
            <input type="number" id="page" placeholder="Âge" min="1" max="99">
            <button class="btn btn-g btn-sm" id="add-player-btn">+ Ajouter</button>
          </div>
          <div class="p-list" id="p-list">${renderPlayersList()}</div>
          <div class="divider"></div>
          <button class="btn btn-v btn-blk" id="draw-btn">🎲 Lancer le Tirage au Sort</button>
        </div>
      </div>
    </div>

    <!-- RIGHT -->
    <div style="display:flex;flex-direction:column;gap:1.2rem;">

      <!-- Bouton voir inscriptions -->
      <div class="card">
        <div class="card-hd"><span>📝</span><h2>Enskripsyon yo</h2></div>
        <div class="card-bd">
          <p class="tmuted mb1">Wè tout moun ki deja enskri pou touwa a.</p>
          <button class="btn btn-v btn-blk" onclick="window.navigateTo('registrations')">📋 Wè tout Enskripsyon yo</button>
        </div>
      </div>

      <!-- Championnats -->
      <div class="card" style="flex:1;">
        <div class="card-hd"><span>📋</span><h2>Championnats</h2></div>
        <div class="card-bd" id="t-list-container">
          <div style="text-align:center;padding:1rem;color:var(--muted);">Chargement...</div>
        </div>
      </div>

    </div>
  </div>

  ${renderDrawModal(getGroupCount(teamCount), players.length)}`
}

function renderPlayersList() {
  if (!players.length) return '<div class="tmuted" style="text-align:center;padding:10px;">Aucun joueur</div>'
  return players.map((p,i) => {
    const ac = ageCat(p.age)
    return `<div class="p-item" data-id="${p.id}">
      <div style="display:flex;align-items:center;gap:7px;">
        <div class="p-num">${i+1}</div>
        <div class="acat" style="background:${ac.color};"></div>
        <span style="font-size:.88rem;font-weight:600;">${p.name}</span>
        <span class="age-chip">${p.age}a · ${ac.label}</span>
      </div>
      <button class="btn btn-d btn-sm rm-player-btn" data-id="${p.id}">✕</button>
    </div>`
  }).join('')
}

function renderTournoisList() {
  const el = document.getElementById('t-list-container')
  if (!el) return
  if (!tournaments.length) {
    el.innerHTML = '<div class="empty-st"><div class="ei">🏟️</div><p>Lance un tirage pour créer ton premier championnat !</p></div>'
    return
  }
  el.innerHTML = `<div class="t-list">${tournaments.map(t => `
    <div class="t-item" data-id="${t.id}">
      <div>
        <div class="t-name">${t.name}</div>
        <div class="t-info">${t.player_count} joueurs · ${t.team_count} équipes · ${new Date(t.created_at).toLocaleDateString('fr-FR')}</div>
      </div>
      <div class="row" style="gap:6px;flex-shrink:0;">
        <button class="btn btn-d btn-sm del-t-btn" data-id="${t.id}">✕ Supprimer</button>
      </div>
    </div>`).join('')}</div>`
  document.querySelectorAll('.del-t-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      if (!confirm('Supprimer ce tournoi ?')) return
      try {
        await deleteTournament(btn.dataset.id)
        tournaments = await fetchTournaments()
        renderTournoisList()
        showToast('Tournoi supprimé.')
      } catch(e) { showToast('Erreur suppression', true) }
    })
  })
}

export async function initAdminPage() {
  try { tournaments = await fetchTournaments() } catch(e) { tournaments = [] }
  renderTournoisList()
  attachAdminEvents()
}

export function attachAdminEvents() {
  document.getElementById('logo-input')?.addEventListener('change', function() {
    const file = this.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      logoData = e.target.result
      document.getElementById('logo-preview').innerHTML =
        `<img src="${logoData}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
      const hdrLogo = document.querySelector('.logo-icon')
      if (hdrLogo) hdrLogo.outerHTML = `<img src="${logoData}" class="logo-img" alt="Logo">`
      showToast('Logo importé !')
    }
    reader.readAsDataURL(file)
  })

  document.getElementById('logo-reset')?.addEventListener('click', () => {
    logoData = null
    showToast('Logo supprimé.')
  })

  document.querySelectorAll('.tc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      teamCount = parseInt(btn.dataset.tc)
      document.querySelectorAll('.tc-btn').forEach(b => b.classList.remove('sel'))
      btn.classList.add('sel')
      document.getElementById('pc-label').textContent = `(${players.length}/${teamCount})`
    })
  })

  document.getElementById('add-player-btn')?.addEventListener('click', addPlayer)
  document.getElementById('pname')?.addEventListener('keydown', e => { if(e.key==='Enter') addPlayer() })
  document.getElementById('page')?.addEventListener('keydown', e => { if(e.key==='Enter') addPlayer() })

  document.querySelectorAll('.rm-player-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      players = players.filter(p => p.id !== +btn.dataset.id)
      refreshPlayersList()
    })
  })

  document.getElementById('draw-btn')?.addEventListener('click', () => {
    if (players.length < 2) { showToast('Ajoute au moins 2 joueurs !', true); return }
    if (!document.getElementById('new-name')?.value.trim()) { showToast('Donne un nom au tournoi !', true); return }
    openDrawModal()
    attachDrawEvents(players, getGroupCount(teamCount), async (result) => {
      await handleConfirmDraw(result)
    })
  })
}

function addPlayer() {
  const name = document.getElementById('pname')?.value.trim()
  const age = parseInt(document.getElementById('page')?.value)
  if (!name) { showToast('Saisis le nom !', true); return }
  if (isNaN(age)||age<1||age>99) { showToast('Âge invalide !', true); return }
  if (players.length>=teamCount) { showToast(`Max ${teamCount} joueurs !`, true); return }
  players.push({id:Date.now()+Math.random(),name,age})
  document.getElementById('pname').value=''
  document.getElementById('page').value=''
  document.getElementById('pname')?.focus()
  refreshPlayersList()
}

function refreshPlayersList() {
  const el = document.getElementById('p-list')
  if (el) el.innerHTML = renderPlayersList()
  const lbl = document.getElementById('pc-label')
  if (lbl) lbl.textContent = `(${players.length}/${teamCount})`
  document.querySelectorAll('.rm-player-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      players = players.filter(p => p.id !== +btn.dataset.id)
      refreshPlayersList()
    })
  })
}

async function handleConfirmDraw(drawResult) {
  const name = document.getElementById('new-name')?.value.trim()
  try {
    await saveTournamentWithGroups(name, teamCount, drawResult, players)
    tournaments = await fetchTournaments()
    closeDrawModal()
    burstConfetti()
    showToast(`🎉 "${name}" créé !`)
    renderTournoisList()
    players = []
    if (document.getElementById('new-name')) document.getElementById('new-name').value = ''
    refreshPlayersList()
    setTimeout(() => window.navigateTo('tournoi'), 800)
  } catch(e) {
    showToast('Erreur création tournoi', true)
    console.error(e)
  }
}

function showToast(msg, err=false) {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = msg
  el.className = 'toast'+(err?' err':'')
  el.classList.add('show')
  clearTimeout(window._toastTO)
  window._toastTO = setTimeout(()=>el.classList.remove('show'), 2800)
}
