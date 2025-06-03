import { state } from '../state.js';
import { clearDiscussion } from '../utils.js';
import { getContacts,addContact } from './contact.js';

let groups = [];
let currentGroup = null;
let currentUser = state.currentUser;
let drafts = state.drafts;

export function setGroupCurrentUser(userData) {
    currentUser = userData;
}


export function createGroup(name, members) {
  groups.push({
    name,
    admin: currentUser.name,
    adminPhone: currentUser.phone,
    members: [
      {
        name: currentUser.name,
        role: "admin",
      },
      ...members.map((member) => ({
        name: member,
        role: "member",
      })),
    ],
    messages: [],
    created: new Date().toISOString(),
  });
}

export function showCreateGroupForm() {
    if (!currentUser) {
        currentUser = state.currentUser; 
        if (!currentUser) return; 
    }
  clearDiscussion();
  const discussion = document.querySelector(".discussion");
  if (!discussion) return;

  const oldForm = document.getElementById("create-group-form");
  if (oldForm) oldForm.remove();

  const contactsToAdd = getContacts().filter(
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
        <span class="ml-1">${currentUser.name} (vous)</span>
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
        const contacts = getContacts(); // Ajoutez cette ligne


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

        addContact(uniqueName, phone);

    // contacts.push({ name: uniqueName, phone, archived: false });

    form.querySelector("#new-member-name").value = "";
    form.querySelector("#new-member-phone").value = "";
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    const name = form.querySelector("#group-name").value.trim();
    const nameError = form.querySelector("#group-name-error");

    if (!name) {
      nameError.textContent = "Le nom du groupe est obligatoire";
      nameError.style.display = "block";
      form
        .querySelector("#group-name")
        .classList.add("border-l-4", "border-red-500");
      return;
    } else {
      nameError.style.display = "none";
      form
        .querySelector("#group-name")
        .classList.remove("border-l-4", "border-red-500");
    }

    const checkedBoxes = form.querySelectorAll(".member-checkbox:checked");
    const membersError = form.querySelector("#members-error");
    const selectedMembers = Array.from(checkedBoxes)
      .map((cb) => cb.value)
      .filter((v) => v !== currentUser.name);

    if (selectedMembers.length < 2) {
      membersError.textContent = "Veuillez ajouter au moins deux membres";
      membersError.style.display = "block";
      return;
    } else {
      membersError.style.display = "none";
    }

    createGroup(name, selectedMembers);
    form.remove();
    renderGroups();
  };
}

// export function renderGroups() {
//   const discussion = document.querySelector(".discussion");
//   if (!discussion) return;

//   let list = discussion.querySelector("#groups-list");
//   if (list) list.remove();

//   list = document.createElement("div");
//   list.id = "groups-list";
//   list.className = "mt-4 flex flex-col gap-2";

//   const myGroups = groups.filter((g) =>
//     g.members.some((m) => m.name === currentUser.name)
//   );

//   if (myGroups.length === 0) {
//     list.innerHTML = `<p class="text-gray-500 text-sm">Aucun groupe pour le moment.</p>`;
//   } else {
//     list.innerHTML = myGroups
//       .map(
//         (g, idx) => `
//       <div class="group-item flex items-center gap-3 border p-2 rounded bg-[#f2f0ea] hover:bg-[#e6eaf7] transition cursor-pointer" data-group-index="${idx}">
//         <div class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg font-bold">
//           <i class="fa-solid fa-user-group"></i>
//         </div>
//         <div class="flex-1">
//           <div class="flex justify-between items-center">
//             <span class="font-semibold text-base">${g.name}</span>
//             ${
//               drafts[g.name]
//                 ? '<span class="text-green-600 text-xs">Brouillon</span>'
//                 : ""
//             }
//             ${
//               g.admin === currentUser.name
//                 ? `
//               <button type="button" class="add-member-btn text-xs text-green-600" data-group-index="${idx}">
//                 <i class="fa-solid fa-plus" style="color: #000000;"></i>
//               </button>
//             `
//                 : ""
//             }
//           </div>
//           <div class="flex justify-between items-center">
//             <span class="text-gray-600 text-sm italic block truncate">
//               ${drafts[g.name] || "Aucun message"}
//             </span>
//           </div>
//         </div>
//       </div>
//     `
//       )
//       .join("");
//   }

//   discussion.appendChild(list);

//   list.querySelectorAll(".group-item").forEach((item) => {
//     item.onclick = () => {
//       const idx = item.getAttribute("data-group-index");
//       showGroupMessages(myGroups[idx]);
//     };
//   });

//   list.querySelectorAll(".add-member-btn").forEach((btn) => {
//     btn.onclick = (e) => {
//       e.stopPropagation();
//       const idx = btn.getAttribute("data-group-index");
//       const group = myGroups[idx];
//       const formDiv = document.getElementById(`add-member-form-${idx}`);

//       const contactsToAdd = contacts.filter(
//         (c) => !group.members.some((m) => m.name === c.name) && !c.archived
//       );

//       formDiv.innerHTML = `
//       <div class="flex items-center gap-2 mt-2">
//         <select class="border rounded px-2 py-1 flex-1 add-member-select">
//           <option value="">Sélectionner un contact</option>
//           ${contactsToAdd
//             .map(
//               (c) => `<option value="${c.name}">${c.name} (${c.phone})</option>`
//             )
//             .join("")}
//         </select>
//         <button class="bg-blue-500 text-white px-2 py-1 rounded text-xs add-member-validate">
//           Ajouter
//         </button>
//       </div>
//     `;

//       formDiv.querySelector(".add-member-validate").onclick = () => {
//         const select = formDiv.querySelector(".add-member-select");
//         const memberName = select.value;
//         if (memberName) {
//           group.members.push({
//             name: memberName,
//             role: "member",
//           });
//           renderGroups();
//         }
//       };
//       formDiv.style.display = "block";
//     };
//   });
// }
export function renderGroups() {
  const discussion = document.querySelector(".discussion");
  if (!discussion) return;

  let list = discussion.querySelector("#groups-list");
  if (list) list.remove();

  list = document.createElement("div");
  list.id = "groups-list";
  list.className = "mt-4 flex flex-col gap-2";

  const myGroups = groups.filter((g) =>
    g.members.some((m) => m.name === currentUser.name)
  );

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
            ${
              g.admin === currentUser.name
                ? `
              <button type="button" class="add-member-btn text-xs text-green-600" data-group-index="${idx}">
                <i class="fa-solid fa-plus" style="color: #000000;"></i>
              </button>
            `
                : ""
            }
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 text-sm italic block truncate">
              ${drafts[g.name] || "Aucun message"}
            </span>
          </div>
          <div class="add-member-form" id="add-member-form-${idx}" style="display:none;"></div>
        </div>
      </div>
    `
      )
      .join("");
  }

  discussion.appendChild(list);

  // Gestionnaire d'événements pour les boutons d'ajout de membre
  list.querySelectorAll(".add-member-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = btn.getAttribute("data-group-index");
      const group = myGroups[idx];
      const formDiv = document.getElementById(`add-member-form-${idx}`);
      const contacts = getContacts();

      const contactsToAdd = contacts.filter(
        (c) => !group.members.some((m) => m.name === c.name) && !c.archived
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
        <button class="bg-blue-500 text-white px-2 py-1 rounded text-xs add-member-validate">
          Ajouter
        </button>
      </div>
      `;

      formDiv.querySelector(".add-member-validate").onclick = () => {
        const select = formDiv.querySelector(".add-member-select");
        const memberName = select.value;
        if (memberName) {
          group.members.push({
            name: memberName,
            role: "member"
          });
          renderGroups();
        }
      };
      formDiv.style.display = formDiv.style.display === "none" ? "block" : "none";
    };
  });

  // Gestionnaire d'événements pour les items de groupe
  list.querySelectorAll(".group-item").forEach((item) => {
    item.onclick = () => {
      const idx = item.getAttribute("data-group-index");
      showGroupMessages(myGroups[idx]);
    };
  });
}


export function showGroupMessages(group) {
    const contacts = getContacts(); // Ajoutez cette ligne où contacts est utilisé
  currentGroup = group;
  const messagePart = document.querySelector(".last-part .message");
  if (!messagePart) return;

  const isAdmin = group.admin === currentUser.name;
  const membersDisplay = group.members
    .map((member) => {
      const contact = contacts.find(
        (c) => c.name === member.name && !c.archived
      );
      if (contact) {
        if (isAdmin && member.name !== currentUser.name) {
          return `
          <div class="flex items-center justify-between bg-gray-100 rounded p-1 mb-1">
            <div class="flex items-center gap-2">
              <span>${contact.name}</span>
              <span class="text-xs px-2 py-1 rounded ${
                member.role === "admin" ? "bg-yellow-200" : "bg-gray-200"
              }">
                ${member.role}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button class="change-role-btn text-blue-500 text-xs px-2 relative group" 
                      data-member="${contact.name}" 
                      data-current-role="${member.role}">
                <i class="fa-solid fa-user-shield"></i>
                <span class="tooltip invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 
                           bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  ${
                    member.role === "admin"
                      ? "Rétrograder en membre"
                      : "Promouvoir comme admin"
                  }
                </span>
              </button>
              <button class="remove-member-btn text-red-500 text-xs px-2 relative group" 
                      data-member="${contact.name}">
                <i class="fa-solid fa-user-minus"></i>
                <span class="tooltip invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 
                           bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  Retirer du groupe
                </span>
              </button>
            </div>
          </div>
        `;
        }
        return `
        <div class="flex items-center gap-2 bg-gray-100 rounded p-1 mb-1">
          <span>${contact.name}</span>
          <span class="text-xs px-2 py-1 rounded ${
            member.role === "admin" ? "bg-yellow-200" : "bg-gray-200"
          } relative group">
            ${member.role}
            <span class="tooltip invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 
                       bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              ${
                member.role === "admin"
                  ? "Administrateur du groupe"
                  : "Membre simple"
              }
            </span>
          </span>
        </div>
      `;
      }
      return null;
    })

    .filter(Boolean)
    .join(" ");

  messagePart.innerHTML = `
    <div class="cercle flex flex-row justify-between p-1">
      <div>
        <div class="flex flex-row items-center gap-2 px-4 pt-2">
          <div class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg font-bold">
            <i class="fa-solid fa-user-group"></i>
          </div>
          <div>
            <span class="font-semibold text-lg">${group.name}</span>
            ${
              isAdmin
                ? '<span class="text-xs bg-yellow-200 px-2 py-1 rounded ml-2">Admin</span>'
                : ""
            }
          </div>
        </div>
        <div class="text-sm text-gray-600 px-16 pb-2 flex flex-wrap gap-1">
          ${membersDisplay}
        </div>
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
    <div id="group-messages" class="flex flex-col gap-2 p-4 h-[70vh] overflow-y-auto"></div>
  `;

  if (isAdmin) {
    messagePart.querySelectorAll(".remove-member-btn").forEach((btn) => {
      btn.onclick = () => {
        const memberName = btn.getAttribute("data-member");
        if (confirm(`Voulez-vous vraiment retirer ${memberName} du groupe ?`)) {
          group.members = group.members.filter((m) => m !== memberName);
          showGroupMessages(group);
        }
      };
    });
  }

  if (isAdmin) {
    messagePart.querySelectorAll(".change-role-btn").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const memberName = btn.getAttribute("data-member");
        const currentRole = btn.getAttribute("data-current-role");
        const newRole = currentRole === "admin" ? "member" : "admin";

        if (
          confirm(
            `Voulez-vous ${
              newRole === "admin" ? "promouvoir" : "rétrograder"
            } ${memberName} ?`
          )
        ) {
          const member = group.members.find((m) => m.name === memberName);
          if (member) {
            member.role = newRole;
            showGroupMessages(group);
          }
        }
      };
    });
  }
  renderGroupMessages(group);
  setupMessageSending();
}

export function getGroups() {
  return groups;
}

export function setGroups(newGroups) {
  groups = newGroups;
}

export function getCurrentGroup() {
  return currentGroup;
}

export function setCurrentGroup(group) {
  currentGroup = group;
}