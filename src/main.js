import './styles/main.css'
import { renderHeader } from './components/Header.js'
import { renderTournoiPage, initTournoiPage } from './pages/Tournoi.js'
import { renderAdminPage, initAdminPage } from './pages/Admin.js'
import { initConfetti } from './components/Confetti.js'

export const appState = {
  currentPage: 'tournoi',
  logoData: null,
}

export function navigateTo(page) {
  appState.currentPage = page
  const app = document.getElementById('app')

  app.innerHTML =
    renderHeader(page, appState.logoData) +
    `<main class="main">${page === 'tournoi' ? renderTournoiPage() : renderAdminPage()}</main>`

  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page))
  })

  if (page === 'tournoi') initTournoiPage()
  else initAdminPage()
}

window.navigateTo = navigateTo
initConfetti()
navigateTo('tournoi')
