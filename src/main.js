import {
  showAddContactForm,
  renderContacts,
  showCreateGroupForm,
  renderGroups,
  renderArchivedContacts,
  showContactInMessage,
  showBroadcastForm,
  initializeContacts,
  setCurrentUser,
} from "./component.js";

import {
  checkAuth,
  showLoginPage,
  showApp,
} from "./connexion.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) {
    showLoginPage();
  } else {
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    showApp(userData);
  }
});

document.addEventListener("appReady", (e) => {
  const userData = e.detail;
  setCurrentUser(userData);
  initializeContacts();
  renderContacts();
  setupSidebarButtons(); 
});

function setupSidebarButtons() {
  const sidebarBtns = document.querySelectorAll(".sidebar .sms");

  function setActiveSidebarBtn(clickedBtn) {
    sidebarBtns.forEach((btn) => btn.classList.remove("active-sidebar-btn"));
    clickedBtn.classList.add("active-sidebar-btn");
  }

  const messagesBtn = sidebarBtns[0];
  if (messagesBtn) {
    messagesBtn.addEventListener("click", function () {
      setActiveSidebarBtn(this);
      renderContacts();
    });
  }

  const groupesBtn = sidebarBtns[1];
  if (groupesBtn) {
    groupesBtn.addEventListener("click", function () {
      setActiveSidebarBtn(this);
      showCreateGroupForm();
      renderGroups();
    });
  }

  const diffusionBtn = sidebarBtns[2];
  if (diffusionBtn) {
    diffusionBtn.addEventListener("click", function () {
      setActiveSidebarBtn(this);
      showBroadcastForm();
    });
  }

  const archivesBtn = sidebarBtns[3];
  if (archivesBtn) {
    archivesBtn.addEventListener("click", function () {
      setActiveSidebarBtn(this);
      renderArchivedContacts();
    });
  }

  const nouveauBtn = sidebarBtns[4];
  if (nouveauBtn) {
    nouveauBtn.addEventListener("click", function () {
      setActiveSidebarBtn(this);
      showAddContactForm();
    });
  }

  const logoutBtn = sidebarBtns[5];
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        localStorage.removeItem("currentUser");
        showLoginPage();
      }
    });
  }
}
