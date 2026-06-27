export function renderHeader(currentPage, logoData) {
  const logoHTML = logoData
    ? `<img src="${logoData}" class="logo-img" alt="Logo SteFi Tournoi">`
    : `<div class="logo-icon">⚽</div>`

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
      <button class="nav-tab admin-tab ${currentPage === 'admin' || currentPage === 'registrations' ? 'active' : ''}" data-page="admin">⚙️ Admin</button>
    </nav>
  </header>`
}
