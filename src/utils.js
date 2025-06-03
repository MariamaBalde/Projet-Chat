import { renderContacts } from './services/contact.js';
function setupSearch() {
  const searchInput = document.querySelector(".recherche input");
  if (!searchInput) return;

  searchInput.removeEventListener("input", handleSearch);

  searchInput.addEventListener("input", handleSearch);
}

function handleSearch(e) {
  const searchTerm = e.target.value.trim();
  renderContacts(searchTerm);
}

export function clearDiscussion() {
  const discussion = document.querySelector(".discussion");
  if (!discussion) return;

  const searchInput = discussion.querySelector(".recherche input");
  const searchValue = searchInput ? searchInput.value : "";

  discussion.innerHTML = `
    <h2 class="text-2xl">Discussions</h2>
    <p class="border-2 border-[#f2f0ea] rounded-full bg-transparent"></p>
    <div class="recherche w-full">
      <input class="recherche mt-1 border-2 border-[#f2f0ea] w-full h-8 px-2 rounded" 
             placeholder="Recherche" 
             value="${searchValue}">
    </div>
  `;

  setupSearch();
}

export function showMessage(type, text) {
  const messageDiv = document.getElementById("broadcast-message");
  if (!messageDiv) return;

  messageDiv.textContent = text;
  messageDiv.className = `mb-4 text-sm ${
    type === "success" ? "text-green-600" : "text-red-600"
  }`;
}