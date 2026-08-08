import { supabase } from '../supabase.js'

export function renderInscriptionPage() {
  return `
  <div style="max-width:580px;margin:0 auto;padding:1rem;">
    <div style="text-align:center;margin-bottom:2rem;">
      <div style="font-size:4rem;margin-bottom:.75rem;filter:drop-shadow(0 0 25px rgba(0,255,135,.5));">⚽</div>
      <h1 style="font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:3px;background:linear-gradient(90deg,var(--green),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.4rem;">ENSKRI OU KOUNYE A</h1>
      <p style="color:var(--muted);font-size:1rem;">SteFi Tournoi Video Game · FC 26</p>
    </div>

    <div style="background:rgba(0,255,135,.06);border:1px solid rgba(0,255,135,.25);border-radius:16px;padding:1.2rem 1.6rem;margin-bottom:1.75rem;text-align:center;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:2.4rem;color:var(--green);letter-spacing:2px;">💳 250 Gourdes</div>
      <div style="color:var(--muted);font-size:.9rem;margin-top:.3rem;">Frais d'inscription · Plas limite ⏰</div>
    </div>

    <div class="card">
      <div class="card-hd"><span style="font-size:1.3rem;">📝</span><h2 style="font-size:1.2rem;">Informasyon ou</h2></div>
      <div class="card-bd" style="display:flex;flex-direction:column;gap:1.2rem;">

        <div class="fg">
          <label style="font-size:.85rem;">Non ou (Nom complet)</label>
          <input type="text" id="reg-name" placeholder="ex: Jean Pierre" style="font-size:1.05rem;padding:13px 16px;">
        </div>

        <div class="fg">
          <label style="font-size:.85rem;">Laj ou (Âge)</label>
          <input type="number" id="reg-age" placeholder="ex: 22" min="5" max="99" style="font-size:1.05rem;padding:13px 16px;">
        </div>

        <div class="fg">
          <label style="font-size:.85rem;">Nivo ou (Niveau de jeu)</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            <div class="level-btn" data-level="debutant" style="padding:16px 8px;">
              <div style="font-size:1.8rem;">🌱</div>
              <div style="font-size:.9rem;font-weight:700;margin-top:6px;">Debutant</div>
            </div>
            <div class="level-btn" data-level="alaise" style="padding:16px 8px;">
              <div style="font-size:1.8rem;">⚡</div>
              <div style="font-size:.9rem;font-weight:700;margin-top:6px;">À l'aise</div>
            </div>
            <div class="level-btn" data-level="maestro" style="padding:16px 8px;">
              <div style="font-size:1.8rem;">👑</div>
              <div style="font-size:.9rem;font-weight:700;margin-top:6px;">Maestro</div>
            </div>
          </div>
          <input type="hidden" id="reg-level" value="">
        </div>

        <div class="fg">
          <label style="font-size:.85rem;">Nimewo telefòn ou</label>
          <input type="tel" id="reg-phone" placeholder="ex: 36281876" style="font-size:1.05rem;padding:13px 16px;">
        </div>

        <div class="fg">
          <label style="font-size:.85rem;">Metòd peman (Mode de paiement)</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            <div class="pay-btn" data-pay="cash" style="padding:16px 8px;">
              <div style="font-size:1.8rem;">💵</div>
              <div style="font-size:.9rem;font-weight:700;margin-top:6px;">Cash</div>
            </div>
            <div class="pay-btn" data-pay="moncash" style="padding:16px 8px;">
              <div style="font-size:1.8rem;">📱</div>
              <div style="font-size:.9rem;font-weight:700;margin-top:6px;">MonCash</div>
            </div>
            <div class="pay-btn" data-pay="natcash" style="padding:16px 8px;">
              <div style="font-size:1.8rem;">📲</div>
              <div style="font-size:.9rem;font-weight:700;margin-top:6px;">NatCash</div>
            </div>
          </div>
          <input type="hidden" id="reg-payment" value="">
        </div>

        <div id="online-payment-info" style="display:none;background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.25);border-radius:14px;padding:1.2rem;">
          <div style="font-size:.85rem;color:var(--muted);margin-bottom:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">📲 Voye lajan an bay :</div>
          <div id="payment-details"></div>
          <div style="margin-top:.75rem;font-size:.88rem;color:var(--muted);">Apre ou fin peye, mete foto resi a anba a.</div>
        </div>

        <div id="photo-upload-section" style="display:none;">
          <div class="fg" style="margin:0;">
            <label style="font-size:.85rem;">📸 Foto resi peman an</label>
            <label style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--sur2);border:2px dashed var(--bdr);border-radius:10px;cursor:pointer;transition:border-color .2s;" id="photo-label">
              <span style="font-size:1.8rem;">📷</span>
              <span id="photo-label-text" style="color:var(--muted);font-size:.95rem;">Klike pou chwazi yon foto</span>
              <input type="file" id="reg-photo" accept="image/*" style="display:none;">
            </label>
            <div id="photo-preview" style="margin-top:10px;display:none;">
              <img id="photo-preview-img" style="width:100%;border-radius:10px;max-height:220px;object-fit:cover;">
            </div>
          </div>
        </div>

        <button class="btn btn-g btn-blk" id="reg-submit-btn" style="font-size:1.1rem;padding:16px;margin-top:.5rem;">
          🚀 Enskri kounye a!
        </button>

        <div id="reg-error" style="display:none;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:12px 16px;color:#f87171;font-size:.9rem;text-align:center;"></div>
      </div>
    </div>

    <div style="text-align:center;margin-top:1.75rem;padding:1.2rem 1.5rem;background:var(--sur);border:1px solid var(--bdr);border-radius:14px;">
      <div style="color:var(--green);font-size:.85rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem;">📍 Ki kote?</div>
      <div style="font-weight:700;font-size:1.15rem;">Nan Vilaj Caonabo</div>
      <div style="color:var(--muted);font-size:.9rem;margin-top:3px;">Bò Boulanje a · ⏰ Vin Bonè!</div>
    </div>
  </div>

  <div class="modal-ov" id="reg-success-modal">
    <div class="modal" style="text-align:center;max-width:420px;">
      <div style="font-size:4.5rem;margin-bottom:1rem;">🎉</div>
      <div class="modal-title">Ou Enskri!</div>
      <p style="color:var(--muted);margin:1rem 0;font-size:1rem;line-height:1.6;">Enskripsyon ou an resevwa.<br>Nou pral konfime li avan touwa a.<br><br>📍 Vin Bonè nan Vilaj Caonabo,<br>Bò Boulanje a!</p>
      <button class="btn btn-g btn-blk" style="font-size:1rem;padding:14px;" onclick="document.getElementById('reg-success-modal').classList.remove('open')">✅ OK, Mèsi!</button>
    </div>
  </div>

  <style>
    .level-btn,.pay-btn{border-radius:12px;border:2px solid var(--bdr);background:var(--sur);color:var(--muted);text-align:center;cursor:pointer;transition:all .2s;}
    .level-btn:hover,.pay-btn:hover{border-color:var(--green);color:var(--text);}
    .level-btn.selected{border-color:var(--green);background:rgba(0,255,135,.1);color:var(--green);}
    .pay-btn.selected{border-color:var(--violet);background:rgba(168,85,247,.1);color:var(--violet);}
  </style>`
}

export function initInscriptionPage() {
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      document.getElementById('reg-level').value = btn.dataset.level
    })
  })
  document.querySelectorAll('.pay-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      document.getElementById('reg-payment').value = btn.dataset.pay
      const info = document.getElementById('online-payment-info')
      const photo = document.getElementById('photo-upload-section')
      const details = document.getElementById('payment-details')
      if (btn.dataset.pay === 'moncash') {
        info.style.display='block'; photo.style.display='block'
        details.innerHTML=`<div style="font-family:'Rajdhani',sans-serif;font-size:1.8rem;font-weight:700;color:var(--violet);">📱 MonCash</div>
          <div style="font-size:1.5rem;font-weight:700;color:white;letter-spacing:3px;margin-top:4px;">3628 - 1876</div>
          <div style="font-size:.88rem;color:var(--muted);margin-top:4px;">Voye 250 Gourdes</div>`
      } else if (btn.dataset.pay === 'natcash') {
        info.style.display='block'; photo.style.display='block'
        details.innerHTML=`<div style="font-family:'Rajdhani',sans-serif;font-size:1.8rem;font-weight:700;color:var(--violet);">📲 NatCash</div>
          <div style="font-size:1.5rem;font-weight:700;color:white;letter-spacing:3px;margin-top:4px;">5539 - 5932</div>
          <div style="font-size:.88rem;color:var(--muted);margin-top:4px;">Voye 250 Gourdes</div>`
      } else { info.style.display='none'; photo.style.display='none' }
    })
  })
  document.getElementById('reg-photo')?.addEventListener('change', function() {
    const file = this.files[0]; if (!file) return
    document.getElementById('photo-label-text').textContent = file.name
    document.getElementById('photo-label').style.borderColor = 'var(--green)'
    const reader = new FileReader()
    reader.onload = e => {
      document.getElementById('photo-preview').style.display='block'
      document.getElementById('photo-preview-img').src=e.target.result
    }
    reader.readAsDataURL(file)
  })
  document.getElementById('reg-submit-btn')?.addEventListener('click', handleSubmit)
}

async function handleSubmit() {
  const btn = document.getElementById('reg-submit-btn')
  const errEl = document.getElementById('reg-error')
  errEl.style.display = 'none'
  const name=document.getElementById('reg-name').value.trim()
  const age=parseInt(document.getElementById('reg-age').value)
  const level=document.getElementById('reg-level').value
  const phone=document.getElementById('reg-phone').value.trim()
  const payment=document.getElementById('reg-payment').value
  const photoFile=document.getElementById('reg-photo')?.files[0]
  if (!name){showErr('Tanpri antre non ou.');return}
  if (!age||age<5||age>99){showErr('Tanpri antre laj ou.');return}
  if (!level){showErr('Chwazi nivo ou.');return}
  if (!phone){showErr('Tanpri antre nimewo telefòn ou.');return}
  if (!payment){showErr('Chwazi metòd peman ou.');return}
  if ((payment==='moncash'||payment==='natcash')&&!photoFile){showErr('Tanpri mete foto resi peman ou a.');return}
  btn.textContent='⏳ Ap trete...'; btn.disabled=true
  try {
    let photoUrl = null
    if (photoFile) {
      const ext=photoFile.name.split('.').pop()
      const fileName=`${Date.now()}-${name.replace(/\s+/g,'-')}.${ext}`
      const { error: upErr } = await supabase.storage.from('transaction-proofs').upload(fileName, photoFile, { contentType: photoFile.type })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('transaction-proofs').getPublicUrl(fileName)
      photoUrl = urlData.publicUrl
    }
    const { error } = await supabase.from('registrations').insert({ name, age, level, phone, payment_method: payment, transaction_photo_url: photoUrl })
    if (error) throw error
    document.getElementById('reg-success-modal').classList.add('open')
    document.getElementById('reg-name').value=''
    document.getElementById('reg-age').value=''
    document.getElementById('reg-phone').value=''
    document.getElementById('reg-level').value=''
    document.getElementById('reg-payment').value=''
    document.querySelectorAll('.level-btn,.pay-btn').forEach(b=>b.classList.remove('selected'))
    document.getElementById('online-payment-info').style.display='none'
    document.getElementById('photo-upload-section').style.display='none'
    document.getElementById('photo-preview').style.display='none'
  } catch(e) { showErr('Yon erè te pase. Eseye ankò.'); console.error(e) }
  finally { btn.textContent='🚀 Enskri kounye a!'; btn.disabled=false }
}

function showErr(msg) {
  const el=document.getElementById('reg-error')
  el.textContent=msg; el.style.display='block'
}
