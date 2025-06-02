
export function checkAuth() {
  const user = localStorage.getItem('currentUser');
  return !!user; 
}
export function showLoginPage() {

  document.getElementById('app').style.display = 'none';
  const loginDiv = document.getElementById('login');

    loginDiv.innerHTML = `
    <div class="min-h-screen  bg-[#f0efe8] flex items-center justify-center">
      <div class="bg-[#efe7d9] p-8 rounded-lg shadow-lg max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-800">Connectez-vous pour continuer</h1>
        </div>

        <form id="login-form" class="space-y-6">
          <div>
            <label class="block text-gray-700 text-sm font-semibold mb-2">
              Nom d'utilisateur
            </label>
            <input type="text" id="username" 
              class="w-full px-4 py-2 border border-[#dfb449] rounded-lg focus:outline-none focus:border-[#46cc40]"
              required 
            />
            <p id="username-error" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-semibold mb-2">
              Numéro de téléphone
            </label>
            <input type="tel" id="phone" 
              class="w-full px-4 py-2 border border-[#dfb449] rounded-lg focus:outline-none focus:border-[#46cc40]"
              required 
            />
            <p id="phone-error" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>

          <button type="submit" 
            class="w-full bg-[#dfb449] text-white py-2 px-4 rounded-lg hover:bg-[#f2e7d0] hover:font-bold hover:text-black transition duration-200">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');


  form.addEventListener('submit', handleLogin);
}

function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const phone = document.getElementById('phone').value.trim();
  
  console.log('Tentative de connexion avec:', { username, phone });
  
  document.getElementById('username-error').classList.add('hidden');
  document.getElementById('phone-error').classList.add('hidden');
  
  if (!/^[A-Za-zÀ-ÿ\s]{3,}$/.test(username)) {
    const error = document.getElementById('username-error');
    error.textContent = "Le nom doit contenir au moins 3 lettres";
    error.classList.remove('hidden');
    console.log('Erreur: nom invalide');
    return;
  }

  if (!/^\d{9,}$/.test(phone)) {
    const error = document.getElementById('phone-error');
    error.textContent = "Entrez un numéro de téléphone valide (minimum 9 chiffres)";
    error.classList.remove('hidden');
    console.log('Erreur: numéro de téléphone invalide');
    return;
  }

  const userData = { 
    name: username, 
    phone, 
    isCurrentUser: true 
  };

  try {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log('Utilisateur enregistré dans localStorage:', userData);
    showApp(userData);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
  }
}



 export function showApp(userData) {
  document.getElementById('login').innerHTML = '';
  const app = document.getElementById('app');
   app.style.display = 'block';
  
  app.innerHTML = `
    <div class="container mx-auto mt-5 h-[920px] shadow-[0_0_20px_rgba(0,0,0,0.15)] overflow-hidden bg-white rounded flex flex-row">
      <div class="sidebar basis-28 bg-[#f0efe8] font-medium px-2 flex flex-col justify-center gap-4">
        <button type="submit" class="sms flex flex-col justify-center text-center border-2 border-yellow-500 rounded-lg p-5">
          <p><i class="fa-solid fa-message" style="color: #000000;"></i></p>
          <p>Messages</p>
        </button>
        <button class="sms flex flex-col justify-center text-center border-2 border-yellow-500 rounded-lg p-5">
          <i class="fa-solid fa-user-group" style="color: #000000;"></i>
          <p>Groupes</p>
        </button>
        <button class="sms flex flex-col justify-center text-center border-2 border-yellow-500 rounded-lg p-5">
          <i class="fa-solid fa-arrows-turn-to-dots" style="color: #000000;"></i>
          <p>Diffusions</p>
        </button>
        <button class="sms flex flex-col justify-center text-center border-2 border-yellow-500 rounded-lg p-5">
          <i class="fa-solid fa-box-archive" style="color: #000000;"></i>
          <p>Archives</p>
        </button>
        <button class="sms flex flex-col justify-center text-center border-2 border-yellow-500 rounded-lg p-5">
          <i class="fa-solid fa-plus" style="color: #000000;"></i>
          <p>Nouveau</p>
        </button>
        <button class="sms flex flex-col justify-center text-center border-2 border-yellow-500 rounded-lg p-5" id="logout-btn">
          <i class="fa-solid fa-sign-out-alt" style="color: #000000;"></i>
          <p>Déconnexion</p>
        </button>
      </div>
      <div class="discussion basis-2/4 bg-[#f9f7f5] p-2">
        <h2 class="text-2xl">Discussions</h2>
        <p class="border-2 border-[#f2f0ea] rounded-full bg-transparent"></p>
        <div class="recherche w-full">
          <input class="recherche mt-1 border-2 border-[#f2f0ea] w-full h-8 px-2 rounded" placeholder="Recherche">
        </div>
      </div>
      <div class="last-part basis-full">
        <div class="message h-[92%] bg-[#efe7d7]">
          <div class="cercle flex flex-row justify-between p-1">
            <div class="big-cercle">
              <p class="rounded-full bg-[#737572] w-[35px] h-[35px]"></p>
            </div>
            <div class="other-cercle flex flex-row gap-2">
              <!-- ... les autres boutons ... -->
            </div>
          </div>
          <div class="trait">
            <p class="border-2 border-[#f2f0ea] rounded-full bg-transparent"></p>
          </div>
        </div>
        <div class="footer h-[5%] basis-full my-5 mx-2 flex flex-row gap-2">
          <div class="basis-full flex items-center">
            <input type="text" class="w-full bg-[#f2eff0] py-2 px-4 rounded-lg border border-gray-200 outline-none" placeholder="Votre message...">
          </div>
          <div class="basis-2 flex items-center">
            <button type="submit" class="rounded-full bg-[#46cc40] w-[35px] h-[35px] flex flex-row justify-center items-center">
              <i class="fa-solid fa-arrow-right" style="color: #ffffff;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;


 setTimeout(() => {
    const event = new CustomEvent('appReady', { detail: userData });
    document.dispatchEvent(event);
  }, 0);
}
