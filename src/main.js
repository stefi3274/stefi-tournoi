import './styles/main.css'
import { renderHeader } from './components/Header.js'
import { renderTournoiPage, initTournoiPage } from './pages/Tournoi.js'
import { renderAdminPage, initAdminPage } from './pages/Admin.js'
import { renderInscriptionPage, initInscriptionPage } from './pages/Inscription.js'
import { renderRegistrationsPage, initRegistrationsPage } from './pages/Registrations.js'
import { initConfetti } from './components/Confetti.js'

export const appState = {
  currentPage: 'tournoi',
  logoData: null,
}

export function navigateTo(page) {
  appState.currentPage = page
  const app = document.getElementById('app')

  let pageHTML = ''
  if (page === 'tournoi') pageHTML = renderTournoiPage()
  else if (page === 'admin') pageHTML = renderAdminPage()
  else if (page === 'inscription') pageHTML = renderInscriptionPage()
  else if (page === 'registrations') pageHTML = renderRegistrationsPage()

  app.innerHTML =
    renderHeader(page, appState.logoData) +
    `<main class="main">${pageHTML}</main>`

  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page))
  })

  if (page === 'tournoi') initTournoiPage()
  else if (page === 'admin') initAdminPage()
  else if (page === 'inscription') initInscriptionPage()
  else if (page === 'registrations') initRegistrationsPage()
}

window.navigateTo = navigateTo
initConfetti()
navigateTo('tournoi')
