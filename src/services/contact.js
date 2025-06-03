let contacts = [];
let messages = state.messages;
let drafts = state.drafts;
let currentUser = null;

import { state, setCurrentUser as setStateCurrentUser } from '../state.js';
import { clearDiscussion } from '../utils.js';
import { setMessageCurrentUser } from "./message.js";

import {
  setupContactMessageSending,
  markMessagesAsRead,
  renderContactMessages,
} from "./message.js";



export function setCurrentUser(userData) {
    setStateCurrentUser(userData);
    currentUser = state.currentUser;
}

export function setupSearch() {
  const searchInput = document.querySelector(".recherche input");
  if (!searchInput) return;

  searchInput.removeEventListener("input", handleSearch);
  searchInput.addEventListener("input", handleSearch);
}

function handleSearch(e) {
  const searchTerm = e.target.value.trim();
  renderContacts(searchTerm);
}

export function getContacts() {
  return contacts;
}

export function initializeContacts() {
  contacts.forEach((c) => {
    if (typeof c.archived === "undefined") c.archived = false;
  });
}


export function addContact(name, phone) {
  function capitalizeWords(str) {
    return str
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  let capitalizedName = capitalizeWords(name);
  let uniqueName = capitalizedName;
  let i = 1;
  while (contacts.some((c) => c.name === uniqueName)) {
    uniqueName = capitalizedName + i;
    i++;
  }
  contacts.push({ name: uniqueName, phone, archived: false });
  renderContactsInMessage();
}

export function showAddContactForm() {
  clearDiscussion();
  const discussion = document.querySelector(".discussion");
  if (!discussion) return;

  const oldForm = document.getElementById("add-contact-form");
  if (oldForm) oldForm.remove();

  const form = document.createElement("form");
  form.id = "add-contact-form";
  form.className =
    "bg-white p-4 rounded shadow flex flex-col gap-2 my-6 w-[100%] mx-auto";

  form.innerHTML = `
    <h2 class="text-lg font-bold mb-2 text-center">Ajouter un contact</h2>
    <input type="text" id="contact-name" class="border p-2 rounded" placeholder="Nom"/>
          <div id="name-error" class="text-red-600 text-xs mt-1 mb-2" style="display:none;"></div>

    <input type="tel" id="contact-phone" class="border p-2 rounded" placeholder="Numéro de téléphone" />
      <div id="phone-error" class="text-red-600 text-xs mt-1 mb-2" style="display:none;"></div>

    <div class="flex gap-2 justify-end">
      <button type="submit" class="bg-[#46cc40] text-white px-4 py-2 rounded">Ajouter</button>
      <button type="button" id="cancel-add-contact"  class="bg-[#efe7d7] px-4 py-2 text-gray-400 rounded">Annuler</button>
    </div>
  `;

  discussion.appendChild(form);

  form.querySelector("#cancel-add-contact").onclick = () => form.remove();

  form.onsubmit = (e) => {
    e.preventDefault();
    const name = form.querySelector("#contact-name").value.trim();
    const phone = form.querySelector("#contact-phone").value.trim();
    const errorDiv = form.querySelector("#phone-error,#name-error");
    const nameInput = form.querySelector("#contact-name");
    if (!name.trim()) {
      errorDiv.textContent = "Le nom est obligatoire.";
      errorDiv.style.display = "block";
      nameInput.style.borderLeft = "3px solid red";
      return;
    }
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
      errorDiv.textContent = "Le nom doit contenir uniquement des lettres.";
      errorDiv.style.display = "block";
      return;
    }

    if (!/^\d+$/.test(phone)) {
      errorDiv.textContent = "Le numéro doit contenir uniquement des chiffres.";
      errorDiv.style.display = "block";
      return;
    }

    if (contacts.some((c) => c.phone === phone)) {
      errorDiv.textContent = "Ce numéro existe déjà !";
      errorDiv.style.display = "block";
      return;
    } else {
      errorDiv.textContent = "";
      errorDiv.style.display = "none";
    }
    if (name && phone) {
      addContact(name, phone);
      form.remove();
    }
  };
}

export function renderContacts(searchTerm = "") {
  clearDiscussion();
  const discussion = document.querySelector(".discussion");
  if (!discussion) return;

  let list = discussion.querySelector("#contacts-list");
  if (list) list.remove();

  list = document.createElement("div");
  list.id = "contacts-list";
  list.className = "mt-4 flex flex-col gap-2";

  let contactsToDisplay = [...contacts].filter((c) => !c.archived);

  if (searchTerm) {
    if (searchTerm === "*") {
      contactsToDisplay = contactsToDisplay.sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
      );
    } else {
      contactsToDisplay = contactsToDisplay.filter((contact) => {
        const nameMatch = contact.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const phoneMatch = contact.phone.includes(searchTerm);
        return nameMatch || phoneMatch;
      });
    }
  }

  contactsToDisplay = contactsToDisplay.sort((a, b) =>
    a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
  );

  if (contactsToDisplay.length === 0) {
    list.innerHTML = `<p class="text-gray-500 text-sm">Aucun contact trouvé.</p>`;
  } else {
    list.innerHTML = contactsToDisplay
      .map((c) => {
        const contactMessages = messages[c.phone] || [];
        const lastMessage =
          contactMessages.length > 0
            ? contactMessages[contactMessages.length - 1]
            : null;
        const hasDraft = drafts[c.phone];

        const messageStatus = lastMessage
          ? lastMessage.read
            ? '<i class="fa-solid fa-check-double text-blue-500"></i>'
            : '<i class="fa-solid fa-check text-gray-500"></i>'
          : "";

        return `
      <div class="contact-item flex items-center gap-2 border p-2 rounded bg-[#f2f0ea]" data-contact-index="${contacts.indexOf(
        c
      )}">
        <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold uppercase">
          ${c.name[0]}
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-center">
            <span class="font-semibold">${c.name}</span>
            <div class="flex items-center gap-1">
              ${
                hasDraft
                  ? '<span class="text-green-600 text-xs">Brouillon</span>'
                  : ""
              }
              <span class="text-xs">${messageStatus}</span>
              <span class="text-xs text-gray-500">${
                lastMessage ? lastMessage.date : ""
              }</span>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 text-sm italic block truncate">
              ${
                hasDraft
                  ? drafts[c.phone]
                  : lastMessage
                  ? lastMessage.text.length > 30
                    ? lastMessage.text.substring(0, 30) + "..."
                    : lastMessage.text
                  : "Aucun message"
              }
            </span>
            ${
              lastMessage && !lastMessage.read
                ? '<span class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">1</span>'
                : ""
            }
          </div>
        </div>
      </div>
    `;
      })
      .join("");
  }

  discussion.appendChild(list);

  setupSearch();

  list.querySelectorAll(".contact-item").forEach((item) => {
    item.onclick = () => {
      const idx = item.getAttribute("data-contact-index");
      showContactInMessage(contacts[idx]);
    };
  });
}

export function renderContactsInMessage() {
  const messagePart = document.querySelector(".discussion .message");
  if (!messagePart) return;

  let list = messagePart.querySelector("#contacts-list-message");
  if (list) list.remove();

  list = document.createElement("div");
  list.id = "contacts-list-message";
  list.className = "mt-4 flex flex-col gap-2";

  if (contacts.length === 0) {
    list.innerHTML = `<p class="text-gray-500 text-sm">Aucun contact pour le moment.</p>`;
  } else {
    list.innerHTML = contacts
      .map(
        (c) => `<div class="border p-2 rounded bg-[#f2f0ea]">
              <span class="font-semibold">${c.name}</span> <span class="text-gray-600">(${c.phone})</span>
            </div>`
      )
      .join("");
  }

  messagePart.appendChild(list);
}

export function showContactInMessage(contact) {
  const messagePart = document.querySelector(".last-part .message");
  if (!messagePart) return;

  messagePart.innerHTML = `
    <div class="cercle flex flex-row justify-between p-1">
      <div class="flex flex-row items-center gap-2 px-4 pt-2">
        <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold uppercase">
          ${contact.name[0]}
        </div>
        <span class="font-semibold text-lg">${contact.name}</span>
      </div>
      <div class="other-cercle flex flex-row gap-2">
       <p
                class="rounded-full border border-orange-600 w-[33px] h-[33px] flex flex-row justify-center text-center">
                <i class="fa-solid fa-delete-left mt-2 px-2" style="color: #ff4d00;"></i>
              </p>
        <p class="rounded-full border border-[#978f83] w-[33px] h-[33px] flex flex-row justify-center text-center">
          <i class="fa-solid fa-box-archive mt-2 px-2" style="color: #7c7d7e;"></i>
        </p>
            <p
                class="rounded-full border border-[#252024] w-[33px] h-[33px] flex flex-row justify-center text-center">
                <i class="fa-solid fa-square mt-2 px-2" style="color: #19191a;"></i>
              </p>

              <p
                class="rounded-full border border-[#9a0609] w-[33px] h-[33px] flex flex-row justify-center text-center">
                <i class="fa-solid fa-trash mt-2 px-2" style="color: #db0a1f;"></i>
              </p>
      </div>
    </div>
    <div class="trait">
      <p class="border-2 border-[#f2f0ea] rounded-full bg-transparent"></p>
    </div>
    <div id="contact-messages" class="flex flex-col gap-2 p-4 h-[70vh] overflow-y-auto"></div>
  `;

  const archiveBtn = messagePart.querySelector(".fa-box-archive");
  if (archiveBtn) {
    archiveBtn.parentElement.style.cursor = "pointer";
    archiveBtn.parentElement.onclick = () => {
      contact.archived = true;
      renderContacts();
    };
  }
  markMessagesAsRead(contact);
  renderContactMessages(contact);
  setupContactMessageSending(contact);
}

export function setContacts(newContacts) {
  contacts = newContacts;
}

export function showBroadcastForm() {
  const discussion = document.querySelector(".discussion");
  if (!discussion) return;
  
  discussion.innerHTML = `
    <div class="cercle flex flex-row justify-between p-1">
      <div class="flex flex-row items-center gap-2 px-4 pt-2">
        <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
          <i class="fa-solid fa-arrows-turn-to-dots" style="color: #ffffff;"></i>
        </div>
        <span class="font-semibold text-lg">Diffusion</span>
      </div>
    </div>
    <div class="trait">
      <p class="border-2 border-[#f2f0ea] rounded-full bg-transparent"></p>
    </div>
    <div class="p-4">
      <div class="mb-4">
        <div id="broadcast-message" class="mb-2 text-sm"></div>
        <h3 class="font-semibold mb-2">Sélectionner les destinataires :</h3>
        <div id="broadcast-contacts" class="space-y-2">
          ${contacts
            .filter((c) => !c.archived)
            .map(
              (c) => `
              <label class="flex items-center gap-2 p-2 hover:bg-gray-100 border-2 rounded-b-xl rounded-r-xl border-b-3 border-[#f2e7d0]">
                <input type="checkbox" value="${c.phone}" class="broadcast-contact">
                <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase">
                  ${c.name[0]}
                </div>
                <span>${c.name} (${c.phone})</span>
              </label>
            `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  setupBroadcastMessageHandling();
}

function setupBroadcastMessageHandling() {
  const footerInput = document.querySelector(".footer input");
  const sendBtn = document.querySelector(".footer button");
  
  if (!footerInput || !sendBtn) return;

  const newInput = footerInput.cloneNode(true);
  const newSendBtn = sendBtn.cloneNode(true);
  footerInput.parentNode.replaceChild(newInput, footerInput);
  sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

  const handleSendBroadcast = () => {
    const message = newInput.value.trim();
    const selectedContacts = Array.from(
      document.querySelectorAll(".broadcast-contact:checked")
    )
      .map((cb) => contacts.find((c) => c.phone === cb.value))
      .filter(Boolean);

    if (message && selectedContacts.length > 0) {
      selectedContacts.forEach((contact) => {
        if (!messages[contact.phone]) messages[contact.phone] = [];
        messages[contact.phone].push({
          sender: currentUser.name,
          text: message,
          date: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          read: false,
        });
      });

      showMessage(
        "success",
        `Message envoyé à ${selectedContacts.length} contact(s)`
      );
      newInput.value = "";
    }
  };

  newSendBtn.onclick = (e) => {
    e.preventDefault();
    handleSendBroadcast();
  };

  newInput.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendBroadcast();
    }
  };
}
