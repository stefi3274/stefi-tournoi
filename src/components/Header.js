export function renderHeader(currentPage, logoData) {
  const logoHTML = logoData
    ? `<img src="${logoData}" class="logo-img" id="logo-click" alt="Logo SteFi Tournoi" style="cursor:pointer;">`
    : `<div class="logo-icon" id="logo-click" style="cursor:pointer;">⚽</div>`

  return `
  <header class="hdr">
    <div class="logo">
      ${logoHTML}
      <div class="logo-txt">
        <h1>SteFi Tournoi</h1>
        <p>FC 26 · Champion's Edition</p>
      </div>
    </div>
    <nav class="nav-tabs">
      <button class="nav-tab ${currentPage === 'tournoi' ? 'active' : ''}" data-page="tournoi">🏆 Tournoi</button>
      <button class="nav-tab ${currentPage === 'inscription' ? 'active' : ''}" data-page="inscription">📝 Enskri</button>
    </nav>
  </header>

  <!-- MODAL MOT DE PASSE ADMIN -->
  <div class="modal-ov" id="admin-pwd-modal">
    <div class="modal" style="max-width:360px;text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:.5rem;">🔐</div>
      <div class="modal-title" style="font-size:1.6rem;">Accès Admin</div>
      <p style="color:var(--muted);font-size:.85rem;margin:.75rem 0 1.25rem;">Antre mo de pase a pou kontinye.</p>
      <div class="fg" style="text-align:left;">
        <label>Mot de passe</label>
        <input type="password" id="admin-pwd-input" placeholder="••••••••••••"
          onkeydown="if(event.key==='Enter') window.checkAdminPwd()">
      </div>
      <div id="admin-pwd-error" style="display:none;color:#f87171;font-size:.82rem;margin-bottom:.75rem;">
        ❌ Mo de pase a pa bon. Eseye ankò.
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:1rem;">
        <button class="btn btn-o" onclick="document.getElementById('admin-pwd-modal').classList.remove('open');document.getElementById('admin-pwd-input').value='';document.getElementById('admin-pwd-error').style.display='none';">Anile</button>
        <button class="btn btn-v" onclick="window.checkAdminPwd()">🔓 Antre</button>
      </div>
    </div>
  </div>`
}

export function initHeaderEvents() {
  let clickCount = 0
  let clickTimer = null

  const logo = document.getElementById('logo-click')
  if (!logo) return

  logo.addEventListener('click', () => {
    clickCount++

    // Feedback visuel à chaque clic
    logo.style.transform = 'scale(1.2) rotate(15deg)'
    setTimeout(() => { logo.style.transform = '' }, 200)

    clearTimeout(clickTimer)

    if (clickCount >= 4) {
      clickCount = 0
      // Ouvrir modal mot de passe
      setTimeout(() => {
        document.getElementById('admin-pwd-modal').classList.add('open')
        setTimeout(() => document.getElementById('admin-pwd-input')?.focus(), 100)
      }, 250)
    } else {
      // Reset si pas 4 clics dans les 2 secondes
      clickTimer = setTimeout(() => { clickCount = 0 }, 2000)
    }
  })

  window.checkAdminPwd = function() {
    const input = document.getElementById('admin-pwd-input')
    const errEl = document.getElementById('admin-pwd-error')
    if (input.value === '15Jointures15') {
      document.getElementById('admin-pwd-modal').classList.remove('open')
      input.value = ''
      errEl.style.display = 'none'
      window.navigateTo('admin')
    } else {
      errEl.style.display = 'block'
      input.value = ''
      input.focus()
      // Shake effect
      const modal = document.querySelector('#admin-pwd-modal .modal')
      modal.style.animation = 'none'
      modal.offsetHeight
      modal.style.animation = 'shake .4s ease'
    }
  }
}
