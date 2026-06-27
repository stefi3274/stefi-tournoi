import { supabase } from '../supabase.js'

let registrations = []

export function renderRegistrationsPage() {
  return `
  <div>
    <div class="row mb1" style="justify-content:space-between;">
      <div class="stitle">📋 Enskripsyon yo</div>
      <div class="row" style="gap:8px;">
        <span id="reg-count" class="badge bg-g"></span>
        <button class="btn btn-g btn-sm" id="refresh-reg-btn">🔄 Aktualize</button>
      </div>
    </div>

    <!-- FILTRES -->
    <div class="row mb1" style="gap:8px;">
      <button class="reg-filter-btn active" data-filter="all">Tout</button>
      <button class="reg-filter-btn" data-filter="en_attente">⏳ En attente</button>
      <button class="reg-filter-btn" data-filter="confirme">✅ Konfime</button>
      <button class="reg-filter-btn" data-filter="rejete">❌ Rejete</button>
    </div>

    <!-- STATS -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:1.5rem;" id="reg-stats"></div>

    <!-- TABLE -->
    <div class="card">
      <div class="card-bd" style="padding:0;">
        <div id="reg-table-container" style="overflow-x:auto;">
          <div style="text-align:center;padding:3rem;color:var(--muted);">⏳ Chajman...</div>
        </div>
      </div>
    </div>
  </div>

  <style>
    .reg-filter-btn {
      padding:6px 14px;border-radius:8px;border:1px solid var(--bdr);
      background:var(--sur);color:var(--muted);font-family:'Inter',sans-serif;
      font-size:.8rem;font-weight:500;cursor:pointer;transition:all .2s;
    }
    .reg-filter-btn:hover{border-color:var(--green);color:var(--green);}
    .reg-filter-btn.active{background:var(--green);color:#000;border-color:var(--green);font-weight:700;}
    .status-badge{padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:700;}
    .s-attente{background:rgba(255,215,0,.15);color:var(--gold);border:1px solid rgba(255,215,0,.3);}
    .s-confirme{background:rgba(0,255,135,.12);color:var(--green);border:1px solid rgba(0,255,135,.2);}
    .s-rejete{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.2);}
    .level-pill{padding:2px 8px;border-radius:10px;font-size:.68rem;font-weight:600;}
    .l-debutant{background:rgba(34,197,94,.1);color:#22c55e;}
    .l-alaise{background:rgba(168,85,247,.1);color:var(--violet);}
    .l-maestro{background:rgba(255,215,0,.1);color:var(--gold);}
  </style>`
}

export async function initRegistrationsPage() {
  await loadRegistrations()
  attachRegEvents()
}

async function loadRegistrations() {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('registered_at', { ascending: false })
    if (error) throw error
    registrations = data ?? []
    renderStats()
    renderTable('all')
    document.getElementById('reg-count').textContent = `${registrations.length} enskripsyon`
  } catch(e) {
    console.error(e)
  }
}

function renderStats() {
  const total = registrations.length
  const attente = registrations.filter(r => r.status === 'en_attente').length
  const confirme = registrations.filter(r => r.status === 'confirme').length
  const cash = registrations.filter(r => r.payment_method === 'cash').length

  const el = document.getElementById('reg-stats')
  if (!el) return
  const stats = [
    { label: 'Total', value: total, color: 'var(--green)', icon: '👥' },
    { label: 'En attente', value: attente, color: 'var(--gold)', icon: '⏳' },
    { label: 'Konfime', value: confirme, color: 'var(--green)', icon: '✅' },
    { label: 'Cash', value: cash, color: 'var(--violet)', icon: '💵' },
  ]
  el.innerHTML = stats.map(s => `
    <div style="background:var(--sur);border:1px solid var(--bdr);border-radius:12px;padding:1rem;text-align:center;">
      <div style="font-size:1.4rem;">${s.icon}</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:${s.color};letter-spacing:1px;">${s.value}</div>
      <div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">${s.label}</div>
    </div>`).join('')
}

function renderTable(filter) {
  const filtered = filter === 'all' ? registrations : registrations.filter(r => r.status === filter)
  const el = document.getElementById('reg-table-container')
  if (!el) return

  if (!filtered.length) {
    el.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted);">Okenn enskripsyon pou filtre sa a.</div>'
    return
  }

  const levelLabel = { debutant: '🌱 Debutant', alaise: '⚡ À l\'aise', maestro: '👑 Maestro' }
  const payLabel = { cash: '💵 Cash', moncash: '📱 MonCash', natcash: '📲 NatCash' }

  el.innerHTML = `
  <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
    <thead>
      <tr style="background:rgba(255,255,255,.03);">
        <th style="padding:10px 12px;text-align:left;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr);">Non</th>
        <th style="padding:10px 8px;text-align:center;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr);">Laj</th>
        <th style="padding:10px 8px;text-align:center;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr);">Nivo</th>
        <th style="padding:10px 8px;text-align:left;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr);">Telefòn</th>
        <th style="padding:10px 8px;text-align:center;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr);">Peman</th>
        <th style="padding:10px 8px;text-align:center;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr);">Resi</th>
        <th style="padding:10px 8px;text-align:center;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr);">Estati</th>
        <th style="padding:10px 8px;text-align:center;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr);">Aksyon</th>
      </tr>
    </thead>
    <tbody>
      ${filtered.map(r => `
      <tr style="border-bottom:1px solid var(--bdr);transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background='transparent'">
        <td style="padding:10px 12px;font-weight:600;">${r.name}</td>
        <td style="padding:10px 8px;text-align:center;">${r.age}</td>
        <td style="padding:10px 8px;text-align:center;">
          <span class="level-pill l-${r.level}">${levelLabel[r.level] ?? r.level}</span>
        </td>
        <td style="padding:10px 8px;">${r.phone}</td>
        <td style="padding:10px 8px;text-align:center;font-size:.8rem;">${payLabel[r.payment_method] ?? r.payment_method}</td>
        <td style="padding:10px 8px;text-align:center;">
          ${r.transaction_photo_url
            ? `<a href="${r.transaction_photo_url}" target="_blank" style="color:var(--violet);font-size:.75rem;text-decoration:none;">📸 Wè foto</a>`
            : `<span style="color:var(--muted);font-size:.75rem;">—</span>`}
        </td>
        <td style="padding:10px 8px;text-align:center;">
          <span class="status-badge ${r.status === 'en_attente' ? 's-attente' : r.status === 'confirme' ? 's-confirme' : 's-rejete'}">
            ${r.status === 'en_attente' ? '⏳ Attente' : r.status === 'confirme' ? '✅ Konfime' : '❌ Rejete'}
          </span>
        </td>
        <td style="padding:10px 8px;text-align:center;">
          <div style="display:flex;gap:4px;justify-content:center;">
            ${r.status !== 'confirme' ? `<button class="btn btn-sm" style="background:rgba(0,255,135,.1);color:var(--green);padding:4px 8px;font-size:.7rem;" onclick="updateStatus('${r.id}','confirme')">✅</button>` : ''}
            ${r.status !== 'rejete' ? `<button class="btn btn-sm btn-danger" style="padding:4px 8px;font-size:.7rem;" onclick="updateStatus('${r.id}','rejete')">❌</button>` : ''}
          </div>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`
}

function attachRegEvents() {
  document.getElementById('refresh-reg-btn')?.addEventListener('click', loadRegistrations)
  document.querySelectorAll('.reg-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.reg-filter-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      renderTable(btn.dataset.filter)
    })
  })
}

window.updateStatus = async function(id, status) {
  try {
    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id)
    if (error) throw error
    await loadRegistrations()
    showToast(status === 'confirme' ? '✅ Enskripsyon konfime!' : '❌ Enskripsyon rejete.')
  } catch(e) {
    showToast('Erè aktualizasyon', true)
    console.error(e)
  }
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
