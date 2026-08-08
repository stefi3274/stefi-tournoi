import { fetchTournaments, saveTournamentWithGroups, deleteTournament } from '../logic/db.js'
import { ageCat, getGroupCount } from '../logic/draw.js'
import { renderDrawModal, openDrawModal, closeDrawModal, attachDrawEvents } from '../components/DrawModal.js'
import { burstConfetti } from '../components/Confetti.js'

let players = [], teamCount = 16, tournaments = [], logoData = null
let competitionType = 'championnat'

export function renderAdminPage() {
  return `
  <div class="admin-grid">
    <div style="display:flex;flex-direction:column;gap:1.2rem;">

      <!-- Logo -->
      <div class="card">
        <div class="card-hd"><span style="font-size:1.3rem;">🖼️</span><h2>Logo du Tournoi</h2></div>
        <div class="card-bd">
          <div style="display:flex;align-items:center;gap:14px;">
            <div id="logo-preview" style="width:70px;height:70px;border-radius:14px;background:linear-gradient(135deg,var(--green-dark),var(--green));display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;box-shadow:0 0 20px var(--gglow);">
              ${logoData?`<img src="${logoData}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">`:'⚽'}
            </div>
            <div>
              <label class="btn btn-o btn-sm" style="cursor:pointer;font-size:.9rem;">
                📁 Importer un logo
                <input type="file" id="logo-input" accept="image/*" style="display:none;">
              </label>
              ${logoData?`<button class="btn btn-d btn-sm" id="logo-reset" style="margin-left:6px;">✕</button>`:''}
              <div class="tmuted" style="margin-top:8px;font-size:.78rem;">PNG · JPG · SVG · Format carré idéal</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Type de compétition -->
      <div class="card">
        <div class="card-hd"><span style="font-size:1.3rem;">🏆</span><h2>Nouvelle Compétition</h2></div>
        <div class="card-bd">
          <div class="fg">
            <label>Nom de la compétition</label>
            <input type="text" id="new-name" placeholder="ex: Coupe de Vilaj Caonabo" style="font-size:1rem;padding:12px 14px;">
          </div>

          <!-- TYPE -->
          <div class="fg">
            <label>Type de compétition</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:.5rem;">
              <div class="type-btn ${competitionType==='championnat'?'sel-type':''}" data-type="championnat">
                <div style="font-size:1.8rem;">🏅</div>
                <div style="font-size:1rem;font-weight:700;margin-top:6px;">Championnat</div>
                <div style="font-size:.75rem;color:var(--muted);margin-top:3px;">Poules + Élimination</div>
              </div>
              <div class="type-btn ${competitionType==='coupe'?'sel-type':''}" data-type="coupe">
                <div style="font-size:1.8rem;">🏆</div>
                <div style="font-size:1rem;font-weight:700;margin-top:6px;">Coupe</div>
                <div style="font-size:.75rem;color:var(--muted);margin-top:3px;">Élimination directe</div>
              </div>
            </div>
          </div>

          <!-- FORMAT -->
          <div class="fg" id="format-section">
            <label>Nombre de joueurs</label>
            <div class="tc-sel" id="tc-selector">
              ${[8,16,24,32,48].map(n =>
                `<div class="tc-btn ${n===teamCount?'sel':''}" data-tc="${n}">${n}<span>joueurs</span></div>`
              ).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Joueurs -->
      <div class="card">
        <div class="card-hd">
          <span style="font-size:1.3rem;">👥</span>
          <h2>Joueurs <span id="pc-label" style="font-size:.85rem;color:var(--muted);font-weight:400;">(${players.length}/${teamCount})</span></h2>
        </div>
        <div class="card-bd">
          <div class="age-legend">
            <div class="age-leg-item"><div class="acat" style="background:#FFD700;width:10px;height:10px;border-radius:50%;"></div>Junior (&lt;18)</div>
            <div class="age-leg-item"><div class="acat" style="background:#00FF87;width:10px;height:10px;border-radius:50%;"></div>Adulte (18-30)</div>
            <div class="age-leg-item"><div class="acat" style="background:#A855F7;width:10px;height:10px;border-radius:50%;"></div>Senior (31-45)</div>
            <div class="age-leg-item"><div class="acat" style="background:#60A5FA;width:10px;height:10px;border-radius:50%;"></div>Vétéran (&gt;45)</div>
          </div>
          <div class="p-add-row">
            <input type="text" id="pname" placeholder="Nom du joueur" style="font-size:1rem;padding:11px 14px;">
            <input type="number" id="page" placeholder="Âge" min="1" max="99" style="font-size:1rem;padding:11px 14px;">
            <button class="btn btn-g btn-sm" id="add-player-btn" style="font-size:.9rem;padding:11px 14px;">+ Ajouter</button>
          </div>
          <div class="p-list" id="p-list">${renderPlayersList()}</div>
          <div class="divider"></div>
          <button class="btn btn-v btn-blk" id="draw-btn" style="font-size:1rem;padding:14px;">🎲 Lancer le Tirage au Sort</button>
        </div>
      </div>
    </div>

    <!-- RIGHT -->
    <div style="display:flex;flex-direction:column;gap:1.2rem;">
      <div class="card">
        <div class="card-hd"><span style="font-size:1.3rem;">📝</span><h2>Enskripsyon yo</h2></div>
        <div class="card-bd">
          <p class="tmuted mb1" style="font-size:.9rem;">Wè tout moun ki deja enskri pou touwa a.</p>
          <button class="btn btn-v btn-blk" onclick="window.navigateTo('registrations')" style="font-size:.95rem;padding:12px;">📋 Wè tout Enskripsyon yo</button>
        </div>
      </div>
      <div class="card" style="flex:1;">
        <div class="card-hd"><span style="font-size:1.3rem;">📋</span><h2>Compétitions</h2></div>
        <div class="card-bd" id="t-list-container">
          <div style="text-align:center;padding:1rem;color:var(--muted);">Chargement...</div>
        </div>
      </div>
    </div>
  </div>

  ${renderDrawModal(getGroupCount(teamCount), players.length, competitionType)}

  <style>
    .type-btn {
      padding:16px 12px;border-radius:12px;border:2px solid var(--bdr);
      background:var(--sur);color:var(--text);text-align:center;
      cursor:pointer;transition:all .2s;
    }
    .type-btn:hover{border-color:var(--green);}
    .type-btn.sel-type{border-color:var(--violet);background:rgba(168,85,247,.1);box-shadow:0 0 20px var(--vglow);}
  </style>`
}

function renderPlayersList() {
  if (!players.length) return '<div class="tmuted" style="text-align:center;padding:12px;font-size:.9rem;">Aucun joueur pour l\'instant</div>'
  return players.map((p, i) => {
    const ac = ageCat(p.age)
    return `<div class="p-item">
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="p-num" style="font-size:.85rem;">${i+1}</div>
        <div style="width:10px;height:10px;border-radius:50%;background:${ac.color};flex-shrink:0;"></div>
        <span style="font-size:.95rem;font-weight:600;">${p.name}</span>
        <span class="age-chip" style="font-size:.78rem;">${p.age}a · ${ac.label}</span>
      </div>
      <button class="btn btn-d btn-sm rm-player-btn" data-id="${p.id}" style="font-size:.8rem;">✕</button>
    </div>`
  }).join('')
}

function renderTournoisList() {
  const el = document.getElementById('t-list-container')
  if (!el) return
  if (!tournaments.length) {
    el.innerHTML = '<div class="empty-st"><div class="ei">🏟️</div><p style="font-size:.95rem;">Lance un tirage pour créer ta première compétition !</p></div>'
    return
  }
  el.innerHTML = `<div class="t-list">${tournaments.map(t => `
    <div class="t-item" data-id="${t.id}">
      <div>
        <div class="t-name" style="font-size:1.05rem;">${t.type==='coupe'?'🏆':'🏅'} ${t.name}</div>
        <div class="t-info">${t.player_count} joueurs · ${t.team_count} max · ${new Date(t.created_at).toLocaleDateString('fr-FR')}</div>
      </div>
      <div class="row" style="gap:6px;flex-shrink:0;">
        <span class="badge ${t.type==='coupe'?'bg-gold':'bg-g'}">${t.type==='coupe'?'Coupe':'Championnat'}</span>
        <button class="btn btn-d btn-sm del-t-btn" data-id="${t.id}">✕</button>
      </div>
    </div>`).join('')}</div>`
  document.querySelectorAll('.del-t-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation()
      if (!confirm('Supprimer cette compétition ?')) return
      try {
        await deleteTournament(btn.dataset.id)
        tournaments = await fetchTournaments()
        renderTournoisList()
        showToast('Compétition supprimée.')
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
  // Logo
  document.getElementById('logo-input')?.addEventListener('change', function() {
    const file = this.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      logoData = e.target.result
      document.getElementById('logo-preview').innerHTML = `<img src="${logoData}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">`
      const hdrLogo = document.querySelector('.logo-icon')
      if (hdrLogo) { hdrLogo.style.backgroundImage = `url(${logoData})`; hdrLogo.textContent = '' }
      showToast('Logo importé !')
    }
    reader.readAsDataURL(file)
  })
  document.getElementById('logo-reset')?.addEventListener('click', () => { logoData = null; showToast('Logo supprimé.') })

  // Type compétition
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      competitionType = btn.dataset.type
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('sel-type'))
      btn.classList.add('sel-type')
    })
  })

  // Format joueurs
  document.querySelectorAll('.tc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      teamCount = parseInt(btn.dataset.tc)
      document.querySelectorAll('.tc-btn').forEach(b => b.classList.remove('sel'))
      btn.classList.add('sel')
      document.getElementById('pc-label').textContent = `(${players.length}/${teamCount})`
    })
  })

  // Ajouter joueur
  document.getElementById('add-player-btn')?.addEventListener('click', addPlayer)
  document.getElementById('pname')?.addEventListener('keydown', e => { if(e.key==='Enter') addPlayer() })
  document.getElementById('page')?.addEventListener('keydown', e => { if(e.key==='Enter') addPlayer() })

  // Supprimer joueurs
  document.querySelectorAll('.rm-player-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      players = players.filter(p => p.id !== +btn.dataset.id)
      refreshPlayersList()
    })
  })

  // Tirage
  document.getElementById('draw-btn')?.addEventListener('click', () => {
    if (players.length < 8) { showToast('Minimum 8 joueurs requis !', true); return }
    if (!document.getElementById('new-name')?.value.trim()) { showToast('Donne un nom à la compétition !', true); return }
    openDrawModal()
    attachDrawEvents(players, getGroupCount(teamCount), async result => {
      await handleConfirmDraw(result)
    }, competitionType)
  })
}

function addPlayer() {
  const name = document.getElementById('pname')?.value.trim()
  const age = parseInt(document.getElementById('page')?.value)
  if (!name) { showToast('Saisis le nom !', true); return }
  if (isNaN(age)||age<1||age>99) { showToast('Âge invalide !', true); return }
  if (players.length >= teamCount) { showToast(`Max ${teamCount} joueurs !`, true); return }
  players.push({ id: Date.now()+Math.random(), name, age })
  document.getElementById('pname').value = ''
  document.getElementById('page').value = ''
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
    await saveTournamentWithGroups(name, teamCount, drawResult, players, competitionType)
    tournaments = await fetchTournaments()
    closeDrawModal(); burstConfetti()
    showToast(`🎉 "${name}" créé !`)
    renderTournoisList()
    players = []
    if (document.getElementById('new-name')) document.getElementById('new-name').value = ''
    refreshPlayersList()
    setTimeout(() => window.navigateTo('tournoi'), 800)
  } catch(e) { showToast('Erreur création', true); console.error(e) }
}

function showToast(msg, err=false) {
  const el = document.getElementById('toast'); if (!el) return
  el.textContent = msg; el.className = 'toast'+(err?' err':'')
  el.classList.add('show'); clearTimeout(window._toastTO)
  window._toastTO = setTimeout(()=>el.classList.remove('show'), 2800)
}
