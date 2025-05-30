import {
  showAddContactForm,
  renderContacts,
  showCreateGroupForm,
  renderGroups,
  renderArchivedContacts,
  showContactInMessage,
  showBroadcastForm,
  initializeContacts,
} from "./component.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeContacts();
  renderContacts();

  const sidebarBtns = document.querySelectorAll(".sidebar .sms");

  function setActiveSidebarBtn(clickedBtn) {
    sidebarBtns.forEach((btn) => btn.classList.remove("active-sidebar-btn"));
    clickedBtn.classList.add("active-sidebar-btn");
  }

  const nouveauBtn = sidebarBtns[sidebarBtns.length - 1];
  if (nouveauBtn) {
    nouveauBtn.addEventListener("click", function () {
      setActiveSidebarBtn(this);
      showAddContactForm();
    });
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


});