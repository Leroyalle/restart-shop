type Listener = () => void;

type AuthState = {
  accessToken: string | null;
  isRefreshing: boolean;
};

let state: AuthState = {
  accessToken: null,
  isRefreshing: false,
};

const listeners = new Set<Listener>();

export const tokenStore = {
  get: () => state,

  setToken: (token: string | null) => {
    state = { ...state, accessToken: token };
    listeners.forEach(l => l());
  },

  setRefreshing: (value: boolean) => {
    state = { ...state, isRefreshing: value };
    listeners.forEach(l => l());
  },

  clear: () => {
    state = { accessToken: null, isRefreshing: false };
    listeners.forEach(l => l());
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
