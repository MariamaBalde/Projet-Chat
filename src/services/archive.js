import { getContacts } from './contact.js';
import { clearDiscussion } from '../utils.js';

export function renderArchivedContacts() {
  const contacts = getContacts(); // Ajoutez cette ligne


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