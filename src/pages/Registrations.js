import { supabase } from '../supabase.js'

let registrations = []

export function renderRegistrationsPage() {
  return `
  <div>
    <div class="row mb1" style="justify-content:space-between;flex-wrap:wrap;gap:10px;">
      <div class="stitle">📋 Enskripsyon yo</div>
      <div class="row" style="gap:8px;">
        <span id="reg-count" class="badge bg-g" style="font-size:.85rem;"></span>
        <button class="btn btn-o btn-sm" id="refresh-reg-btn" style="font-size:.85rem;">🔄 Aktualize</button>
        <button class="btn btn-o btn-sm" onclick="window.navigateTo('admin')" style="font-size:.85rem;">← Admin</button>
      </div>
    </div>
    <div class="row mb1" style="gap:8px;">
      <button class="reg-filter-btn active" data-filter="all">Tout</button>
      <button class="reg-filter-btn" data-filter="en_attente">⏳ En attente</button>
      <button class="reg-filter-btn" data-filter="confirme">✅ Konfime</button>
      <button class="reg-filter-btn" data-filter="rejete">❌ Rejete</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:1.5rem;" id="reg-stats"></div>
    <div class="card"><div class="card-bd" style="padding:0;overflow-x:auto;" id="reg-table-container">
      <div style="text-align:center;padding:3rem;color:var(--muted);font-size:1rem;">⏳ Chajman...</div>
    </div></div>
  </div>
  <style>
    .reg-filter-btn{padding:8px 16px;border-radius:9px;border:1px solid var(--bdr);background:var(--sur);color:var(--muted);font-family:'Inter',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s;}
    .reg-filter-btn:hover{border-color:var(--green);color:var(--green);}
    .reg-filter-btn.active{background:var(--green);color:#000;border-color:var(--green);font-weight:700;}
    .level-pill{padding:3px 10px;border-radius:10px;font-size:.75rem;font-weight:600;}
    .l-debutant{background:rgba(34,197,94,.1);color:#22c55e;}
    .l-alaise{background:rgba(168,85,247,.1);color:var(--violet);}
    .l-maestro{background:rgba(255,215,0,.1);color:var(--gold);}
    .s-attente{background:rgba(255,215,0,.15);color:var(--gold);border:1px solid rgba(255,215,0,.3);padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:700;}
    .s-confirme{background:rgba(0,255,135,.12);color:var(--green);border:1px solid rgba(0,255,135,.2);padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:700;}
    .s-rejete{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.2);padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:700;}
  </style>`
}

export async function initRegistrationsPage() {
  await loadRegistrations()
  attachRegEvents()
}

async function loadRegistrations() {
  try {
    const { data, error } = await supabase.from('registrations').select('*').order('registered_at', { ascending: false })
    if (error) throw error
    registrations = data ?? []
    renderStats(); renderTable('all')
    document.getElementById('reg-count').textContent = `${registrations.length} enskripsyon`
  } catch(e) { console.error(e) }
}

function renderStats() {
  const el = document.getElementById('reg-stats'); if (!el) return
  const stats = [
    { label:'Total', value: registrations.length, color:'var(--green)', icon:'👥' },
    { label:'En attente', value: registrations.filter(r=>r.status==='en_attente').length, color:'var(--gold)', icon:'⏳' },
    { label:'Konfime', value: registrations.filter(r=>r.status==='confirme').length, color:'var(--green)', icon:'✅' },
    { label:'Cash', value: registrations.filter(r=>r.payment_method==='cash').length, color:'var(--violet)', icon:'💵' },
  ]
  el.innerHTML = stats.map(s => `
    <div style="background:var(--sur);border:1px solid var(--bdr);border-radius:14px;padding:1.2rem;text-align:center;">
      <div style="font-size:1.8rem;">${s.icon}</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:2.2rem;color:${s.color};letter-spacing:1px;">${s.value}</div>
      <div style="font-size:.8rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">${s.label}</div>
    </div>`).join('')
}

function renderTable(filter) {
  const filtered = filter==='all' ? registrations : registrations.filter(r=>r.status===filter)
  const el = document.getElementById('reg-table-container'); if (!el) return
  if (!filtered.length) { el.innerHTML='<div style="text-align:center;padding:3rem;color:var(--muted);font-size:.95rem;">Okenn enskripsyon pou filtre sa a.</div>'; return }
  const lvl = { debutant:'🌱 Debutant', alaise:"⚡ À l'aise", maestro:'👑 Maestro' }
  const pay = { cash:'💵 Cash', moncash:'📱 MonCash', natcash:'📲 NatCash' }
  el.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:.9rem;">
    <thead><tr style="background:rgba(255,255,255,.03);">
      ${['Non','Laj','Nivo','Telefòn','Peman','Resi','Estati','Aksyon'].map(h=>
        `<th style="padding:12px 10px;text-align:left;color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr);">${h}</th>`
      ).join('')}
    </tr></thead>
    <tbody>${filtered.map(r=>`
      <tr style="border-bottom:1px solid var(--bdr);" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background='transparent'">
        <td style="padding:11px 10px;font-weight:700;font-size:.95rem;">${r.name}</td>
        <td style="padding:11px 10px;text-align:center;">${r.age}</td>
        <td style="padding:11px 10px;"><span class="level-pill l-${r.level}">${lvl[r.level]??r.level}</span></td>
        <td style="padding:11px 10px;">${r.phone}</td>
        <td style="padding:11px 10px;">${pay[r.payment_method]??r.payment_method}</td>
        <td style="padding:11px 10px;text-align:center;">${r.transaction_photo_url
          ?`<a href="${r.transaction_photo_url}" target="_blank" style="color:var(--violet);font-size:.85rem;">📸 Wè</a>`
          :`<span style="color:var(--muted);">—</span>`}</td>
        <td style="padding:11px 10px;">
          <span class="${r.status==='en_attente'?'s-attente':r.status==='confirme'?'s-confirme':'s-rejete'}">
            ${r.status==='en_attente'?'⏳ Attente':r.status==='confirme'?'✅ Konfime':'❌ Rejete'}
          </span>
        </td>
        <td style="padding:11px 10px;">
          <div style="display:flex;gap:4px;">
            ${r.status!=='confirme'?`<button class="btn btn-sm" style="background:rgba(0,255,135,.1);color:var(--green);font-size:.8rem;padding:5px 10px;" onclick="window.updateStatus('${r.id}','confirme')">✅</button>`:''}
            ${r.status!=='rejete'?`<button class="btn btn-sm btn-danger" style="font-size:.8rem;padding:5px 10px;" onclick="window.updateStatus('${r.id}','rejete')">❌</button>`:''}
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
      document.querySelectorAll('.reg-filter-btn').forEach(b=>b.classList.remove('active'))
      btn.classList.add('active'); renderTable(btn.dataset.filter)
    })
  })
}

window.updateStatus = async function(id, status) {
  try {
    const { error } = await supabase.from('registrations').update({ status }).eq('id', id)
    if (error) throw error
    await loadRegistrations()
    showToast(status==='confirme'?'✅ Konfime!':'❌ Rejete.')
  } catch(e) { showToast('Erè', true); console.error(e) }
}

function showToast(msg, err=false) {
  const el=document.getElementById('toast'); if(!el) return
  el.textContent=msg; el.className='toast'+(err?' err':'')
  el.classList.add('show'); clearTimeout(window._toastTO)
  window._toastTO=setTimeout(()=>el.classList.remove('show'),2800)
}
