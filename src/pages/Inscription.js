import { supabase } from '../supabase.js'

export function renderInscriptionPage() {
  return `
  <div style="max-width:560px;margin:0 auto;padding:1rem;">

    <!-- HERO -->
    <div style="text-align:center;margin-bottom:2rem;">
      <div style="font-size:3rem;margin-bottom:.5rem;filter:drop-shadow(0 0 20px rgba(0,255,135,.4));">⚽</div>
      <h1 style="font-family:'Bebas Neue',sans-serif;font-size:2.4rem;letter-spacing:3px;background:linear-gradient(90deg,var(--green),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.25rem;">ENSKRI OU KOUNYE A</h1>
      <p style="color:var(--muted);font-size:.9rem;">SteFi Tournoi Video Game · FC 26</p>
    </div>

    <!-- FRAIS -->
    <div style="background:rgba(0,255,135,.06);border:1px solid rgba(0,255,135,.2);border-radius:14px;padding:1rem 1.4rem;margin-bottom:1.5rem;text-align:center;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--green);letter-spacing:2px;">💳 250 Gourdes</div>
      <div style="color:var(--muted);font-size:.82rem;margin-top:.25rem;">Frais d'inscription · Plas limite!</div>
    </div>

    <!-- FORM -->
    <div class="card">
      <div class="card-hd"><span>📝</span><h2>Informasyon ou</h2></div>
      <div class="card-bd" style="display:flex;flex-direction:column;gap:1rem;">

        <div class="fg">
          <label>Non ou (Nom complet)</label>
          <input type="text" id="reg-name" placeholder="ex: Jean Pierre">
        </div>

        <div class="fg">
          <label>Laj ou (Âge)</label>
          <input type="number" id="reg-age" placeholder="ex: 22" min="5" max="99">
        </div>

        <div class="fg">
          <label>Nivo ou (Niveau)</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            <div class="level-btn" data-level="debutant">
              <div style="font-size:1.4rem;">🌱</div>
              <div style="font-size:.78rem;font-weight:600;margin-top:4px;">Debutant</div>
            </div>
            <div class="level-btn" data-level="alaise">
              <div style="font-size:1.4rem;">⚡</div>
              <div style="font-size:.78rem;font-weight:600;margin-top:4px;">À l'aise</div>
            </div>
            <div class="level-btn" data-level="maestro">
              <div style="font-size:1.4rem;">👑</div>
              <div style="font-size:.78rem;font-weight:600;margin-top:4px;">Maestro</div>
            </div>
          </div>
          <input type="hidden" id="reg-level" value="">
        </div>

        <div class="fg">
          <label>Nimewo telefòn ou</label>
          <input type="tel" id="reg-phone" placeholder="ex: 36281876">
        </div>

        <!-- PAIEMENT -->
        <div class="fg">
          <label>Metòd peman (Mode de paiement)</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;" id="payment-selector">
            <div class="pay-btn" data-pay="cash">
              <div style="font-size:1.4rem;">💵</div>
              <div style="font-size:.75rem;font-weight:600;margin-top:4px;">Cash</div>
            </div>
            <div class="pay-btn" data-pay="moncash">
              <div style="font-size:1.4rem;">📱</div>
              <div style="font-size:.75rem;font-weight:600;margin-top:4px;">MonCash</div>
            </div>
            <div class="pay-btn" data-pay="natcash">
              <div style="font-size:1.4rem;">📲</div>
              <div style="font-size:.75rem;font-weight:600;margin-top:4px;">NatCash</div>
            </div>
          </div>
          <input type="hidden" id="reg-payment" value="">
        </div>

        <!-- INFOS PAIEMENT EN LIGNE -->
        <div id="online-payment-info" style="display:none;background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.25);border-radius:12px;padding:1rem;">
          <div style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">📲 Voye lajan an bay :</div>
          <div id="payment-details"></div>
          <div style="margin-top:.75rem;font-size:.8rem;color:var(--muted);">Apre ou fin peye, mete foto resi a anba a.</div>
        </div>

        <!-- UPLOAD PHOTO -->
        <div id="photo-upload-section" style="display:none;">
          <div class="fg" style="margin:0;">
            <label>📸 Foto resi peman an</label>
            <label style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--sur2);border:1.5px dashed var(--bdr);border-radius:9px;cursor:pointer;transition:border-color .2s;" id="photo-label">
              <span style="font-size:1.5rem;">📷</span>
              <span id="photo-label-text" style="color:var(--muted);font-size:.85rem;">Klike pou chwazi yon foto</span>
              <input type="file" id="reg-photo" accept="image/*" style="display:none;">
            </label>
            <div id="photo-preview" style="margin-top:8px;display:none;">
              <img id="photo-preview-img" style="width:100%;border-radius:8px;max-height:200px;object-fit:cover;">
            </div>
          </div>
        </div>

        <!-- SUBMIT -->
        <button class="btn btn-g btn-blk" id="reg-submit-btn" style="margin-top:.5rem;font-size:1rem;padding:14px;">
          🚀 Enskri kounye a!
        </button>

        <div id="reg-error" style="display:none;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px 14px;color:#f87171;font-size:.85rem;text-align:center;"></div>

      </div>
    </div>

    <!-- LIEU -->
    <div style="text-align:center;margin-top:1.5rem;padding:1rem;background:var(--sur);border:1px solid var(--bdr);border-radius:12px;">
      <div style="color:var(--green);font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:.4rem;">📍 Ki kote?</div>
      <div style="font-weight:700;font-size:1rem;">Nan Vilaj Caonabo</div>
      <div style="color:var(--muted);font-size:.85rem;">Bò Boulanje a · ⏰ Vin Bonè!</div>
    </div>

  </div>

  <!-- SUCCESS MODAL -->
  <div class="modal-ov" id="reg-success-modal">
    <div class="modal" style="text-align:center;max-width:400px;">
      <div style="font-size:4rem;margin-bottom:1rem;">🎉</div>
      <div class="modal-title">Ou Enskri!</div>
      <p style="color:var(--muted);margin:1rem 0;">Enskripsyon ou an resevwa. Nou pral konfime li avan touwa a.<br><br>Vin Bonè nan Vilaj Caonabo, Bò Boulanje a!</p>
      <button class="btn btn-g btn-blk" onclick="document.getElementById('reg-success-modal').classList.remove('open');document.getElementById('reg-form-wrap').scrollIntoView()">✅ OK</button>
    </div>
  </div>

  <style>
    .level-btn, .pay-btn {
      padding:12px 8px;
      border-radius:10px;
      border:2px solid var(--bdr);
      background:var(--sur);
      color:var(--muted);
      text-align:center;
      cursor:pointer;
      transition:all .2s;
    }
    .level-btn:hover,.pay-btn:hover { border-color:var(--green);color:var(--text); }
    .level-btn.selected { border-color:var(--green);background:rgba(0,255,135,.1);color:var(--green); }
    .pay-btn.selected { border-color:var(--violet);background:rgba(168,85,247,.1);color:var(--violet); }
  </style>`
}

export function initInscriptionPage() {
  // Niveau selector
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      document.getElementById('reg-level').value = btn.dataset.level
    })
  })

  // Paiement selector
  document.querySelectorAll('.pay-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      document.getElementById('reg-payment').value = btn.dataset.pay

      const infoEl = document.getElementById('online-payment-info')
      const photoEl = document.getElementById('photo-upload-section')
      const detailsEl = document.getElementById('payment-details')

      if (btn.dataset.pay === 'moncash') {
        infoEl.style.display = 'block'
        photoEl.style.display = 'block'
        detailsEl.innerHTML = `
          <div style="font-family:'Rajdhani',sans-serif;font-size:1.6rem;font-weight:700;color:var(--violet);">📱 MonCash</div>
          <div style="font-size:1.3rem;font-weight:700;color:white;letter-spacing:2px;margin-top:4px;">3628 - 1876</div>
          <div style="font-size:.8rem;color:var(--muted);">Voye 250 Gourdes</div>`
      } else if (btn.dataset.pay === 'natcash') {
        infoEl.style.display = 'block'
        photoEl.style.display = 'block'
        detailsEl.innerHTML = `
          <div style="font-family:'Rajdhani',sans-serif;font-size:1.6rem;font-weight:700;color:var(--violet);">📲 NatCash</div>
          <div style="font-size:1.3rem;font-weight:700;color:white;letter-spacing:2px;margin-top:4px;">5539 - 5932</div>
          <div style="font-size:.8rem;color:var(--muted);">Voye 250 Gourdes</div>`
      } else {
        infoEl.style.display = 'none'
        photoEl.style.display = 'none'
      }
    })
  })

  // Photo preview
  document.getElementById('reg-photo')?.addEventListener('change', function() {
    const file = this.files[0]
    if (!file) return
    document.getElementById('photo-label-text').textContent = file.name
    document.getElementById('photo-label').style.borderColor = 'var(--green)'
    const reader = new FileReader()
    reader.onload = e => {
      document.getElementById('photo-preview').style.display = 'block'
      document.getElementById('photo-preview-img').src = e.target.result
    }
    reader.readAsDataURL(file)
  })

  // Submit
  document.getElementById('reg-submit-btn')?.addEventListener('click', handleSubmit)
}

async function handleSubmit() {
  const btn = document.getElementById('reg-submit-btn')
  const errEl = document.getElementById('reg-error')
  errEl.style.display = 'none'

  const name = document.getElementById('reg-name').value.trim()
  const age = parseInt(document.getElementById('reg-age').value)
  const level = document.getElementById('reg-level').value
  const phone = document.getElementById('reg-phone').value.trim()
  const payment = document.getElementById('reg-payment').value
  const photoFile = document.getElementById('reg-photo')?.files[0]

  // Validation
  if (!name) { showError('Tanpri antre non ou.'); return }
  if (!age || age < 5 || age > 99) { showError('Tanpri antre laj ou.'); return }
  if (!level) { showError('Chwazi nivo ou.'); return }
  if (!phone) { showError('Tanpri antre nimewo telefòn ou.'); return }
  if (!payment) { showError('Chwazi metòd peman ou.'); return }
  if ((payment === 'moncash' || payment === 'natcash') && !photoFile) {
    showError('Tanpri mete foto resi peman ou a.'); return
  }

  btn.textContent = '⏳ Ap trete...'
  btn.disabled = true

  try {
    let photoUrl = null

    // Upload photo si paiement en ligne
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}-${name.replace(/\s+/g,'-')}.${ext}`
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('transaction-proofs')
        .upload(fileName, photoFile, { contentType: photoFile.type })
      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage
        .from('transaction-proofs')
        .getPublicUrl(fileName)
      photoUrl = urlData.publicUrl
    }

    // Insérer dans la table
    const { error } = await supabase.from('registrations').insert({
      name, age, level, phone,
      payment_method: payment,
      transaction_photo_url: photoUrl,
      status: payment === 'cash' ? 'en_attente' : 'en_attente'
    })
    if (error) throw error

    // Succès
    document.getElementById('reg-success-modal').classList.add('open')
    // Reset form
    document.getElementById('reg-name').value = ''
    document.getElementById('reg-age').value = ''
    document.getElementById('reg-phone').value = ''
    document.getElementById('reg-level').value = ''
    document.getElementById('reg-payment').value = ''
    document.querySelectorAll('.level-btn,.pay-btn').forEach(b => b.classList.remove('selected'))
    document.getElementById('online-payment-info').style.display = 'none'
    document.getElementById('photo-upload-section').style.display = 'none'
    document.getElementById('photo-preview').style.display = 'none'

  } catch(e) {
    showError('Yon erè te pase. Eseye ankò.')
    console.error(e)
  } finally {
    btn.textContent = '🚀 Enskri kounye a!'
    btn.disabled = false
  }
}

function showError(msg) {
  const el = document.getElementById('reg-error')
  el.textContent = msg
  el.style.display = 'block'
}
