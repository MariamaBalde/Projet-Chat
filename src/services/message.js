import { state,getCurrentUser } from '../state.js';
import { renderContacts } from './contact.js';

let messages = state.messages;
let drafts = state.drafts;
let currentUser = null;

export function setMessageCurrentUser(user) {
    currentUser = user;
}

export function setupContactMessageSending(contact) {
  const footerInput = document.querySelector(".footer input");
  const sendBtn = document.querySelector(".footer button");
  if (!footerInput || !sendBtn) return;

  if (drafts[contact.phone]) {
    footerInput.value = drafts[contact.phone];
  }

  const newInput = footerInput.cloneNode(true);
  const newSendBtn = sendBtn.cloneNode(true);
  footerInput.parentNode.replaceChild(newInput, footerInput);
  sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

  document.addEventListener("click", function saveDraft(e) {
    if (!e.target.closest(".message") && !e.target.closest(".footer")) {
      const text = newInput.value.trim();
      if (text) {
        drafts[contact.phone] = text;
        renderContacts();
      }
      document.removeEventListener("click", saveDraft);
    }
  });

  newSendBtn.onclick = (e) => {
    e.preventDefault();
    const text = newInput.value.trim();
    if (text) {
      delete drafts[contact.phone];
      sendContactMessage(contact, newInput);
      renderContacts();
    }
  };

  newInput.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const text = newInput.value.trim();
      if (text) {
        delete drafts[contact.phone];
        sendContactMessage(contact, newInput);
        renderContacts();
      }
    }
  };
}

export function markMessagesAsRead(contact) {
  if (messages[contact.phone]) {
    messages[contact.phone] = messages[contact.phone].map((msg) => ({
      ...msg,
      read: true,
    }));
  }
}

export function renderContactMessages(contact) {
  const messagesDiv = document.getElementById("contact-messages");
  if (!messagesDiv) return;

       // Get current user from state
    const currentUser = getCurrentUser();
    if (!currentUser) return; // Add this guard clause
    
  if (!messages[contact.phone]) messages[contact.phone] = [];

  messagesDiv.innerHTML = messages[contact.phone]
    .map(
      (m) => `
      <div class="flex ${
        m.sender === currentUser.name ? "justify-end" : "justify-start"
      } mb-3">
        <div class="rounded-lg shadow px-3 py-2 mb-1 max-w-xs ${
          m.sender === currentUser.name ? "bg-[#46cc40]" : "bg-white"
        }">
          ${
            m.sender !== currentUser.name
              ? `<div class="text-xs font-bold text-gray-600 mb-1">${m.sender}</div>`
              : ""
          }
          <div class="text-sm ${
            m.sender === currentUser.name ? "text-white" : "text-gray-800"
          }">${m.text}</div>
          <div class="flex items-center justify-end gap-1 mt-1">
            <span class="text-[10px] ${
              m.sender === currentUser.name ? "text-white" : "text-gray-400"
            }">${m.date}</span>
            ${
              m.sender === currentUser.name
                ? `<span class="text-[10px] text-white">
                    ${
                      m.read
                        ? '<i class="fa-solid fa-check-double"></i>'
                        : '<i class="fa-solid fa-check"></i>'
                    }
                  </span>`
                : ""
            }
          </div>
        </div>
      </div>
    `
    )
    .join("");

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

export function sendContactMessage(contact, input) {
      const currentUser = getCurrentUser();
  const text = input.value.trim();
  if (text) {
    if (!messages[contact.phone]) messages[contact.phone] = [];
    messages[contact.phone].push({
      sender: currentUser.name,
      text,
      date: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    });
    input.value = "";
    renderContactMessages(contact);
  }
}