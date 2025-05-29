let contacts = [];

let groups = [];
let currentUser = "Moi";

function clearDiscussion() {
  const discussion = document.querySelector(".discussion");
  if (discussion) {
    discussion.innerHTML = `
      <h2 class="text-2xl">Discussions</h2>
      <p class="border-2 border-[#f2f0ea] rounded-full bg-transparent"></p>
      <div class="recherche w-full">
        <input class="recherche mt-1 border-2 border-[#f2f0ea] w-full h-8 px-2 rounded" placeholder="Recherche">
      </div>
    `;
  }
}

export function initializeContacts() {
  contacts.forEach((c) => {
    if (typeof c.archived === "undefined") c.archived = false;
  });
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

export function addContact(name, phone) {
  let baseName = name.trim();
  let uniqueName = baseName;
  let i = 1;
  while (contacts.some((c) => c.name === uniqueName)) {
    uniqueName = baseName + i;
    i++;
  }

  contacts.push({ name: uniqueName, phone, archived: false });
  // renderContacts();
  renderContactsInMessage();
}

export function renderContacts() {
  clearDiscussion();
  const discussion = document.querySelector(".discussion");
  if (!discussion) return;

  let list = discussion.querySelector("#contacts-list");
  if (list) list.remove();

  list = document.createElement("div");
  list.id = "contacts-list";
  list.className = "mt-4 flex flex-col gap-2";

  const sortedContacts = [...contacts]
    .filter((c) => !c.archived)
    .sort((a, b) =>
      a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
    );

  if (sortedContacts.length === 0) {
    list.innerHTML = `<p class="text-gray-500 text-sm">Aucun contact pour le moment.</p>`;
  } else {
    list.innerHTML = sortedContacts
      .map(
        (c, idx) => `
        <div class="contact-item flex items-center gap-2 border p-2 rounded bg-[#f2f0ea]" data-contact-index="${contacts.indexOf(
          c
        )}">
          <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold uppercase">
            ${c.name[0]}
          </div>
          <div>
            <span class="font-semibold">${c.name}</span><br>
            <span class="text-gray-600 text-sm">${c.phone}</span>
          </div>
        </div>
      `
      )
      .join("");
  }

  discussion.appendChild(list);

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

export function showCreateGroupForm() {
  clearDiscussion();
  const discussion = document.querySelector(".discussion");
  if (!discussion) return;

  const oldForm = document.getElementById("create-group-form");
  if (oldForm) oldForm.remove();

  const contactsToAdd = contacts.filter(
    (c) => c.name !== currentUser && c.archived !== true
  );

  const form = document.createElement("form");
  form.id = "create-group-form";
  form.className =
    "bg-white p-4 rounded shadow flex flex-col gap-2 my-6 w-80 mx-auto";

  form.innerHTML = `
    <h2 class="text-lg font-bold mb-2 text-center">Créer un groupe</h2>
    <input type="text" id="group-name" class="border p-2 rounded" placeholder="Nom du groupe"/>
    <div id="group-name-error" class="text-red-600 text-xs mt-1" style="display: none;"></div>
    <label class="font-semibold mt-2">Membres du groupe (min 2):</label>
    <div id="members-list" class="flex flex-col gap-1 mb-2">
      <label>
        <input type="checkbox" checked disabled />
        <span class="ml-1">${currentUser} (vous)</span>
      </label>
      ${contactsToAdd
        .map(
          (c) => `
        <label>
          <input type="checkbox" class="member-checkbox" value="${c.name}" />
          <span class="ml-1">${c.name} (${c.phone})</span>
        </label>
      `
        )
        .join("")}
    </div>
    <div class="flex flex-col gap-1 mb-2">
      <label class="font-semibold">Ajouter un nouveau membre :</label>
      <input type="text" id="new-member-name" class="border p-1 rounded" placeholder="Nom" />
      <input type="tel" id="new-member-phone" class="border p-1 rounded" placeholder="Numéro" />
      <div id="new-member-error" class="text-red-600 text-xs" style="display:none;"></div>
      <button type="button" id="add-new-member" class="bg-green-500 text-white px-2 py-1 rounded text-xs mt-1">Ajouter à la liste</button>
    </div>
    <div id="members-error" class="text-red-600 text-sm font-semibold text-left" style="display: none;"></div>

    <div class="flex gap-2 justify-end">
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Créer</button>
      <button type="button" id="cancel-create-group" class="bg-gray-300 px-4 py-2 rounded">Annuler</button>
    </div>
  `;

  discussion.appendChild(form);

  form.querySelector("#cancel-create-group").onclick = () => form.remove();

  form.querySelector("#add-new-member").onclick = () => {
    const name = form.querySelector("#new-member-name").value.trim();
    const phone = form.querySelector("#new-member-phone").value.trim();
    const errorDiv = form.querySelector("#new-member-error");

    const nameInput = form.querySelector("#group-name");
    const nameI = nameInput.value.trim();
    const nameError = form.querySelector("#group-name-error");

    if (!nameI) {
      nameError.textContent = "Le nom du groupe est obligatoire";
      nameError.style.display = "block";
      nameInput.classList.add("border-l-4", "border-red-500");
      return;
    } else {
      nameError.style.display = "none";
      nameInput.classList.remove("border-l-4", "border-red-500");
    }

    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
      errorDiv.textContent = "Nom invalide (lettres uniquement)";
      errorDiv.style.display = "block";
      return;
    }
    if (!/^\d+$/.test(phone)) {
      errorDiv.textContent = "Numéro invalide (chiffres uniquement)";
      errorDiv.style.display = "block";
      return;
    }
    if (contacts.some((c) => c.phone === phone)) {
      errorDiv.textContent = "Ce numéro existe déjà !";
      errorDiv.style.display = "block";
      return;
    }
    errorDiv.style.display = "none";

    const membersList = form.querySelector("#members-list");
    let baseName = name.trim();
    let uniqueName = baseName;
    let i = 2;
    while (contacts.some((c) => c.name === uniqueName)) {
      uniqueName = baseName + i;
      i++;
    }
    const label = document.createElement("label");
    label.innerHTML = `
    <input type="checkbox" class="member-checkbox" value="${uniqueName}" checked />
    <span class="ml-1">${uniqueName} (${phone})</span>
  `;
    membersList.appendChild(label);

    contacts.push({ name: uniqueName, phone, archived: false });

    form.querySelector("#new-member-name").value = "";
    form.querySelector("#new-member-phone").value = "";
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    const name = form.querySelector("#group-name").value.trim();
    const checkedBoxes = form.querySelectorAll(".member-checkbox:checked");
    const membersError = form.querySelector("#members-error");
    const selectedMembers = Array.from(checkedBoxes)
      .map((cb) => cb.value)
      .filter((v) => v !== currentUser);

    if (selectedMembers.length < 2) {
      membersError.textContent =
        "Veuillez ajouter au moins deux membres";
      membersError.style.display = "block";
      return;
    } else {
      membersError.style.display = "none";
    }


    const members = [currentUser, ...selectedMembers];
    const uniqueMembers = [...new Set(members)];

    createGroup(name, uniqueMembers);
    form.remove();
    renderGroups();
  };
}

export function createGroup(name, members) {
  groups.push({
    name,
    admin: currentUser,
    adminPhone: contacts.find((c) => c.name === currentUser)?.phone || "",
    members,
    messages: [],
  });
}

export function renderGroups() {
  const discussion = document.querySelector(".discussion");
  if (!discussion) return;

  let list = discussion.querySelector("#groups-list");
  if (list) list.remove();

  list = document.createElement("div");
  list.id = "groups-list";
  list.className = "mt-4 flex flex-col gap-2";

  const myGroups = groups.filter((g) => g.members.includes(currentUser));
  if (myGroups.length === 0) {
    list.innerHTML = `<p class="text-gray-500 text-sm">Aucun groupe pour le moment.</p>`;
  } else {
    list.innerHTML = myGroups
      .map(
        (g, idx) => `
          <div class="group-item flex items-center gap-3 border p-2 rounded bg-[#f2f0ea] hover:bg-[#e6eaf7] transition cursor-pointer" data-group-index="${idx}">
        <div class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg font-bold">
          <i class="fa-solid fa-user-group"></i>
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-base">${g.name}</span>
            <button type="button" class="add-member-btn text-xs text-green-600" data-group-index="${idx}">
              <i class="fa-solid fa-plus" style="color: #000000;"></i>
            </button>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">Lepp nice</span>
            <span class="w-2 h-2 rounded-full bg-green-500 inline-block ml-2"></span>
          </div>
          <div class="add-member-form" id="add-member-form-${idx}" style="display:none;"></div>
        </div>
      </div>
      `
      )
      .join("");
  }

  discussion.appendChild(list);
  list.querySelectorAll(".add-member-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = btn.getAttribute("data-group-index");
      const group = myGroups[idx];
      const formDiv = document.getElementById(`add-member-form-${idx}`);

      const contactsToAdd = contacts.filter(
        (c) => !group.members.includes(c.name) && !c.archived
      );

      formDiv.innerHTML = `
      <div class="flex items-center gap-2 mt-2">
        <select class="border rounded px-2 py-1 flex-1 add-member-select">
          <option value="">Sélectionner un contact</option>
          ${contactsToAdd
            .map(
              (c) => `<option value="${c.name}">${c.name} (${c.phone})</option>`
            )
            .join("")}
        </select>
        <button class="bg-blue-500 text-white px-2 py-1 rounded text-xs add-member-validate">Ajouter</button>
      </div>
      
    `;

      formDiv.querySelector(".add-member-validate").onclick = () => {
        const select = formDiv.querySelector(".add-member-select");
        const name = select.value;
        if (name) {
          group.members.push(name);
          renderGroups();
        }
      };
         formDiv.style.display = "block";
    };
  });

  list.querySelectorAll(".group-item").forEach((item) => {
    item.onclick = () => {
      const idx = item.getAttribute("data-group-index");
      showGroupMessages(myGroups[idx]);
    };
  });
}

let currentGroup = null;

export function showGroupMessages(group) {
  currentGroup = group;
  const messagePart = document.querySelector(".last-part .message");
  if (!messagePart) return;

  const membersDisplay = group.members
    .map((member) => {
      const contact = contacts.find((c) => c.name === member && !c.archived);
      if (contact) {
        return `${contact.name} 
        `;
      }
      return null;
    })
    .filter(Boolean)
    .join(", ");

  messagePart.innerHTML = `
    <div class="cercle flex flex-row justify-between p-1">
      <div>
        <div class="flex flex-row items-center gap-2 px-4 pt-2">
          <div class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg font-bold">
            <i class="fa-solid fa-user-group"></i>
          </div>
          <span class="font-semibold text-lg">${group.name}</span>
        </div>
        <div class="text-sm text-blue-900 font-medium px-16 pb-2">
          ${membersDisplay}
        </div>
      </div>
      <div class="other-cercle flex flex-row gap-2">
        <p class="rounded-full border border-orange-600 w-[33px] h-[33px] flex flex-row justify-center text-center">
          <i class="fa-solid fa-delete-left mt-2 px-2" style="color: #ff4d00;"></i>
        </p>
        <p class="rounded-full border border-[#978f83] w-[33px] h-[33px] flex flex-row justify-center text-center">
          <i class="fa-solid fa-box-archive mt-2 px-2" style="color: #7c7d7e;"></i>
        </p>
        <p class="rounded-full border border-[#252024] w-[33px] h-[33px] flex flex-row justify-center text-center">
          <i class="fa-solid fa-square mt-2 px-2" style="color: #19191a;"></i>
        </p>
        <p class="rounded-full border border-[#9a0609] w-[33px] h-[33px] flex flex-row justify-center text-center">
          <i class="fa-solid fa-trash mt-2 px-2" style="color: #db0a1f;"></i>
        </p>
      </div>
    </div>
    <div class="trait">
      <p class="border-2 border-[#f2f0ea] rounded-full bg-transparent"></p>
    </div>
    <div id="group-messages" class="flex flex-col gap-2 p-4 h-[70vh] overflow-y-auto"></div>
  `;
  renderGroupMessages(group);
  setupMessageSending();

  const addBtn = document.getElementById("add-member-btn");
  const select = document.getElementById("add-member-select");
  if (addBtn && select) {
    addBtn.onclick = () => {
      const name = select.value;
      if (name) {
        group.members.push(name);
        showGroupMessages(group);
      }
    };
  }
}

function setupMessageSending() {
  const footerInput = document.querySelector(".footer input");
  const sendBtn = document.querySelector(".footer button");

  if (!footerInput || !sendBtn) return;

  footerInput.value = "";

  const newInput = footerInput.cloneNode(true);
  const newSendBtn = sendBtn.cloneNode(true);
  footerInput.parentNode.replaceChild(newInput, footerInput);
  sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

  newSendBtn.onclick = (e) => {
    e.preventDefault();
    sendGroupMessage(newInput);
  };

  newInput.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendGroupMessage(newInput);
    }
  };
}

function sendGroupMessage(input) {
  if (!currentGroup) return;
  const text = input.value.trim();
  if (text) {
    currentGroup.messages.push({
      sender: currentUser,
      text,
      date: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    input.value = "";
    renderGroupMessages(currentGroup);

    const messagesDiv = document.getElementById("group-messages");
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }
}

function renderGroupMessages(group) {
  const messagesDiv = document.getElementById("group-messages");
  if (!messagesDiv) return;

  messagesDiv.innerHTML = group.messages
    .map(
      (m) => `
      <div class="flex ${
        m.sender === currentUser ? "justify-end" : "justify-start"
      }">
        <div class="rounded-lg shadow px-3 py-2 mb-1 max-w-xs ${
          m.sender === currentUser ? "bg-green-200" : "bg-white"
        }">
          ${
            m.sender !== currentUser
              ? `<div class="text-xs font-bold text-gray-600 mb-1">${m.sender}</div>`
              : ""
          }
          <div class="text-sm">${m.text}</div>
          <div class="text-[10px] text-right text-gray-400 mt-1">${m.date}</div>
        </div>
      </div>
    `
    )
    .join("");

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

export function renderArchivedContacts() {
  contacts.forEach((c) => {
    if (typeof c.archived === "undefined") c.archived = false;
  });
  console.log(contacts);

  clearDiscussion();

  const messagePart = document.querySelector(".last-part .message");
  if (messagePart) {
    messagePart.innerHTML = `
      <div class="cercle flex flex-row justify-between p-1">
        <div class="big-cercle">
          <p class="rounded-full bg-[#737572] w-[35px] h-[35px]"></p>
        </div>
        <div class="other-cercle flex flex-row gap-2">
          <p class="rounded-full border border-orange-600 w-[33px] h-[33px] flex flex-row justify-center text-center">
            <i class="fa-solid fa-delete-left mt-2 px-2" style="color: #ff4d00;"></i>
          </p>
          <p class="rounded-full border border-[#978f83] w-[33px] h-[33px] flex flex-row justify-center text-center">
            <i class="fa-solid fa-box-archive mt-2 px-2" style="color: #7c7d7e;"></i>
          </p>
          <p class="rounded-full border border-[#252024] w-[33px] h-[33px] flex flex-row justify-center text-center">
            <i class="fa-solid fa-square mt-2 px-2" style="color: #19191a;"></i>
          </p>
          <p class="rounded-full border border-[#9a0609] w-[33px] h-[33px] flex flex-row justify-center text-center">
            <i class="fa-solid fa-trash mt-2 px-2" style="color: #db0a1f;"></i>
          </p>
        </div>
      </div>
      <div class="trait">
        <p class="border-2 border-[#f2f0ea] rounded-full bg-transparent"></p>
      </div>
    `;
  }

  const discussion = document.querySelector(".discussion");
  if (!discussion) return;

  let list = document.createElement("div");
  list.id = "archived-contacts-list";
  list.className = "mt-4 flex flex-col gap-2";

  const archivedContacts = contacts.filter((c) => c.archived === true);
  console.log("ARCHIVED ONLY:", archivedContacts);

  if (archivedContacts.length === 0) {
    list.innerHTML = `<p class="text-gray-500 text-sm">Aucun contact archivé.</p>`;
  } else {
    list.innerHTML = archivedContacts
      .map(
        (c) => `
        <div class="flex items-center justify-between gap-2 border p-2 rounded bg-[#f2f0ea]">
  <div class="flex items-center gap-2">
    <div class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg font-bold uppercase">
      ${c.name[0]}
    </div>
    <div>
      <span class="font-semibold">${c.name}</span><br>
      <span class="text-gray-600 text-sm">${c.phone}</span>
    </div>
  </div>
  <button class="unarchive-btn bg-yellow-300 px-2 py-1 rounded text-xs" data-phone="${c.phone}">
    Désarchiver
  </button>
</div>
      `
      )
      .join("");
  }

  discussion.appendChild(list);

  list.querySelectorAll(".unarchive-btn").forEach((btn) => {
    btn.onclick = () => {
      const phone = btn.getAttribute("data-phone");
      const contact = contacts.find((c) => c.phone === phone);
      if (contact) {
        contact.archived = false;
        renderArchivedContacts();
      }
    };
  });
}

export function showContactInMessage(contact) {
  const messagePart = document.querySelector(".last-part .message");
  if (!messagePart) return;

  const bigCercle = messagePart.querySelector(".big-cercle");
  if (bigCercle) {
    bigCercle.innerHTML = `
      <div class="flex flex-row items-center gap-2 px-4 pt-2">
        <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold uppercase">
          ${contact.name[0]}
        </div>
        <span class="font-semibold text-lg">${contact.name}</span>
      </div>
    `;
  }
  const archiveBtn = messagePart.querySelector(".fa-box-archive");
  if (archiveBtn) {
    archiveBtn.parentElement.style.cursor = "pointer";
    archiveBtn.parentElement.onclick = () => {
      contact.archived = true;
      renderContacts();
    };
  }
}
