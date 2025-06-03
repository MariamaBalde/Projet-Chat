import { state,setState } from './state.js';
import { LOCAL_STORAGE_KEYS } from './constants.js';
import {clearDiscussion} from './utils.js';
import {
  showAddContactForm,
  renderContacts,
  showContactInMessage,
  showBroadcastForm,
  initializeContacts,
  setCurrentUser,
} from "./services/contact.js";

import {
  renderArchivedContacts,

} from "./services/archive.js";



import {
  showCreateGroupForm,
  renderGroups,
  setGroupCurrentUser,
} from "./services/groupe.js";





import {
  checkAuth,
  showLoginPage,
  showApp,
} from "./connexion.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded fired");
  if (!checkAuth()) {
        console.log("No auth, showing login page");
    showLoginPage();
  } else {
        console.log("Auth found, showing app");

    const userData = JSON.parse(localStorage.getItem("currentUser"));
    showApp(userData);
  }
});

document.addEventListener("appReady", (e) => {
    console.log("appReady event fired", e.detail);
  const userData = e.detail;
  setCurrentUser(userData);
  setGroupCurrentUser(userData); // Add this line
  initializeContacts();
  renderContacts();
  setupSidebarButtons(); 
});



function setupSidebarButtons() {
  const sidebarBtns = document.querySelectorAll(".sidebar .sms");
  const titleElement = document.querySelector(".discussion h2");
  let currentTitle = "Messages"; // Ajout du titre par défaut

  function setActiveSidebarBtn(clickedBtn, title) {
    // Retirer la classe active de tous les boutons
    sidebarBtns.forEach((btn) => {
      btn.classList.remove("active-sidebar-btn");
      btn.style.backgroundColor = "";
    });
    
    // Ajouter la classe active au bouton cliqué
    clickedBtn.classList.add("active-sidebar-btn");
    clickedBtn.style.backgroundColor = "#e1b44a";
    
    // Mettre à jour le titre
    currentTitle = title;
    if (titleElement) {
      titleElement.textContent = currentTitle;
    }
  }

  // Messages
  const messagesBtn = sidebarBtns[0];
  if (messagesBtn) {
    messagesBtn.addEventListener("click", function() {
      setActiveSidebarBtn(this, "Messages");
      renderContacts();
    });
  }

  // Groupes
  const groupesBtn = sidebarBtns[1];
  if (groupesBtn) {
    groupesBtn.addEventListener("click", function() {
      setActiveSidebarBtn(this, "Groupes");
      showCreateGroupForm();
      renderGroups();
    });
  }

  // Diffusions
  const diffusionBtn = sidebarBtns[2];
  if (diffusionBtn) {
    diffusionBtn.addEventListener("click", function() {
      setActiveSidebarBtn(this, "Diffusions");
      showBroadcastForm();
    });
  }

  // Archives 
  const archivesBtn = sidebarBtns[3];
  if (archivesBtn) {
    archivesBtn.addEventListener("click", function() {
      setActiveSidebarBtn(this, "Archives");
      renderArchivedContacts();
    });
  }

  // Nouveau contact
  const nouveauBtn = sidebarBtns[4];
  if (nouveauBtn) {
    nouveauBtn.addEventListener("click", function() {
      setActiveSidebarBtn(this, "Nouveau contact");
      showAddContactForm();
    });
  }

  // Bouton déconnexion
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
      if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        localStorage.removeItem("currentUser");
        document.getElementById('app').style.display = 'none';
        showLoginPage();
      }
    });
  }

  // Définir le bouton Messages comme actif par défaut
  if (messagesBtn) {
    messagesBtn.click();
  }

  // Observer les changements de DOM pour restaurer le titre
  const observer = new MutationObserver(() => {
    const titleEl = document.querySelector(".discussion h2");
    if (titleEl && titleEl.textContent !== currentTitle) {
      titleEl.textContent = currentTitle;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}