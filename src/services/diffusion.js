import { getContacts } from './contact.js';
import { getMessages, setMessages } from './message.js';

function showMessage(type, text) {
  const messageDiv = document.getElementById("broadcast-message");
  if (!messageDiv) return;

  messageDiv.textContent = text;
  messageDiv.className = `mb-4 text-sm ${
    type === "success" ? "text-green-600" : "text-red-600"
  }`;
}

export function showBroadcastForm() {
  const discussion = document.querySelector(".discussion");
  if (!discussion) return;
  if (discussion) {
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
                <label class="flex items-center gap-2 p-2 hover:bg-gray-100  border-2 rounded-b-xl rounded-r-xl border-b-3 border-[#f2e7d0]">
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
  }

  const footerInput = document.querySelector(".footer input");
  const sendBtn = document.querySelector(".footer button");

  if (!footerInput || !sendBtn) return;

  footerInput.value = "";

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
    } else if (!message) {
      showMessage("error", "Veuillez saisir un message");
    } else if (selectedContacts.length === 0) {
      showMessage("error", "Veuillez sélectionner au moins un destinataire");
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