import { balancedDraw, ageCat } from '../logic/draw.js'
import { burstConfetti } from './Confetti.js'

let drawResult = null
let drawTO = null

export function renderDrawModal(nGroups, playerCount) {
  return `
  <div class="modal-ov" id="draw-modal">
    <div class="modal">
      <div class="modal-title">🎲 Tirage au Sort</div>
      <div class="modal-sub">${playerCount} joueurs · ${nGroups} groupes · Répartition équilibrée par âge</div>
      <div class="slot-stage" id="slot-stage">
        <span style="color:var(--muted);font-size:.9rem;">Clique sur "Tirer !" ✨</span>
      </div>
      <div id="drw-result-wrap" style="display:none;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:.78rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:1px;">Résultat</span>
          <button class="btn btn-o btn-sm" id="redraw-btn">🔄 Retirer</button>
        </div>
        <div class="drw-grid" id="drw-grid"></div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-o" id="draw-cancel-btn">Annuler</button>
        <button class="btn btn-g" id="draw-start-btn">🎲 Tirer !</button>
        <button class="btn btn-v" id="draw-confirm-btn" style="display:none;">✅ Confirmer & Créer</button>
      </div>
    </div>
  </div>`
}

export function openDrawModal() {
  document.getElementById('draw-modal').classList.add('open')
}

export function closeDrawModal() {
  clearTimeout(drawTO)
  document.getElementById('draw-modal').classList.remove('open')
}

export function getDrawResult() {
  return drawResult
}

export function attachDrawEvents(players, nGroups, onConfirm) {
  document.getElementById('draw-start-btn')?.addEventListener('click', () => triggerDraw(players, nGroups))
  document.getElementById('redraw-btn')?.addEventListener('click', () => triggerDraw(players, nGroups))
  document.getElementById('draw-cancel-btn')?.addEventListener('click', closeDrawModal)
  document.getElementById('draw-confirm-btn')?.addEventListener('click', () => {
    if (drawResult) onConfirm(drawResult)
  })
}

function triggerDraw(players, nGroups) {
  clearTimeout(drawTO)
  drawResult = balancedDraw(players, nGroups)

  const assigns = []
  drawResult.forEach(g => g.players.forEach(p => assigns.push({ player: p, group: g.letter })))
  // Mélanger l'ordre d'affichage
  for (let i = assigns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [assigns[i], assigns[j]] = [assigns[j], assigns[i]]
  }

  document.getElementById('drw-result-wrap').style.display = 'none'
  document.getElementById('draw-confirm-btn').style.display = 'none'
  document.getElementById('draw-start-btn').style.display = 'none'

  let i = 0
  function next() {
    if (i >= assigns.length) {
      renderResult(drawResult)
      document.getElementById('drw-result-wrap').style.display = 'block'
      document.getElementById('draw-confirm-btn').style.display = 'inline-flex'
      burstConfetti()
      return
    }
    const a = assigns[i]
    document.getElementById('slot-stage').innerHTML = `
      <span class="slot-p">${a.player.name}</span>
      <span class="slot-arr">→</span>
      <span class="slot-g">Groupe ${a.group}</span>`
    i++
    drawTO = setTimeout(next, Math.max(90, 400 - i * 9))
  }
  next()
}

function renderResult(result) {
  document.getElementById('drw-grid').innerHTML = result.map((g, gi) => `
    <div class="drw-card" style="animation-delay:${gi * .05}s">
      <div class="drw-hd">⚽ GROUPE ${g.letter}</div>
      <div class="drw-body">
        ${g.players.map(p => {
          const ac = ageCat(p.age)
          return `<div class="drw-p">
            <div class="acat" style="background:${ac.color};"></div>
            ${p.name}
            <span class="age-chip">${p.age}a</span>
          </div>`
        }).join('')}
      </div>
    </div>`).join('')
}
