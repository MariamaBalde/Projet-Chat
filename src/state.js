export const state = {
  currentUser: null,
  contacts: [],
  groups: [],
  messages: {},
  drafts: {},
  currentGroup: null
};

export function setCurrentUser(userData) {
  state.currentUser = {
    name: userData.name,
    phone: userData.phone,
    isCurrentUser: true,
  };
    // setMessageCurrentUser(currentUser); // Ajoutez cette ligne

}

export function getCurrentUser() {
    return state.currentUser;
}

export function setState(key, value) {
  state[key] = value;
}

export function getState(key) {
  return state[key];
}