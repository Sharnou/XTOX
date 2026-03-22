// Unified XTOX client: tries real API first, falls back to local mock.
// Keeps the original mock data but layers REST calls on top so the UI works in both modes.

// API base; leave empty on static GitHub Pages to force mock usage.
const API_URL = import.meta.env.VITE_API_URL || "";
const tokenKey = "xtox_token";

const getToken = () => (typeof localStorage !== "undefined" ? localStorage.getItem(tokenKey) : null);
const setToken = (val) => {
  if (typeof localStorage === "undefined") return;
  if (val) localStorage.setItem(tokenKey, val);
  else localStorage.removeItem(tokenKey);
};

async function api(path, { method = "GET", body } = {}) {
  if (!API_URL) throw new Error("API_URL not set");
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

const safe = async (fn, fallback) => {
  if (!API_URL) return typeof fallback === "function" ? fallback() : fallback;
  try {
    return await fn();
  } catch (err) {
    console.warn("[XTOXClient] falling back to mock:", err.message);
    return typeof fallback === "function" ? fallback() : fallback;
  }
};

const uuid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

// Seed demo data
const demoUsers = [
  { id: uuid(), email: "demo@xtox.app", full_name: "Demo Seller", role: "user" },
  { id: uuid(), email: "buyer@xtox.app", full_name: "Buyer One", role: "user" },
  { id: uuid(), email: "admin@xtox.app", full_name: "Super Admin", role: "admin" }
];

const demoAds = [
  {
    id: uuid(),
    title: "iPhone 15 Pro Max 256GB",
    price: 1199,
    currency: "USD",
    country: "USA",
    city: "New York",
    category: "electronics",
    subcategory: "phones",
    description: "Lightly used, great condition. Includes box and charger.",
    images: ["https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=1200&auto=format&fit=crop"],
    is_featured: true,
    ai_generated: false,
    status: "active",
    created_by: demoUsers[0].email,
    views_count: 128,
    contact_phone: "+1-212-555-0100"
  },
  {
    id: uuid(),
    title: "Model 3 Long Range 2023",
    price: 38900,
    currency: "USD",
    country: "USA",
    city: "San Francisco",
    category: "vehicles",
    description: "Single owner, 12k miles, white/black interior, FSD included.",
    images: ["https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1200&auto=format&fit=crop"],
    is_featured: false,
    ai_generated: true,
    status: "active",
    created_by: demoUsers[0].email,
    views_count: 86,
    contact_phone: "+1-415-555-0111"
  },
  {
    id: uuid(),
    title: "Downtown Loft for Rent",
    price: 2200,
    currency: "USD",
    country: "USA",
    city: "Chicago",
    category: "real_estate",
    description: "1BR/1BA, high ceilings, furnished, pets ok, near L train.",
    images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop"],
    is_featured: false,
    ai_generated: false,
    status: "active",
    created_by: demoUsers[0].email,
    views_count: 54,
    contact_phone: "+1-773-555-0123"
  }
];

const demoFavorites = [];
const demoMessages = [];
const demoReviews = [];
const demoNotifications = [
  { id: uuid(), title: "Welcome to XTOX", created_date: new Date().toISOString() },
  { id: uuid(), title: "New message from Demo Seller", created_date: new Date().toISOString() },
];
const demoAdminChat = [];

const matchFilter = (item, filter = {}) =>
  Object.entries(filter).every(([k, v]) => item?.[k] === v);

const sortBy = (arr, sortField = "created_date") => {
  if (!sortField) return arr;
  const desc = sortField.startsWith("-");
  const field = desc ? sortField.slice(1) : sortField;
  return [...arr].sort((a, b) => {
    if (a?.[field] === b?.[field]) return 0;
    return (a?.[field] > b?.[field] ? 1 : -1) * (desc ? -1 : 1);
  });
};

const makeEntity = (store) => ({
  list: async (sort, limit = store.length) => sortBy(store, sort).slice(0, limit),
  filter: async (filterObj, sort, limit = store.length) =>
    sortBy(store.filter((i) => matchFilter(i, filterObj)), sort).slice(0, limit),
  create: async (data) => {
    const item = { ...data, id: uuid(), created_date: new Date().toISOString() };
    store.push(item);
    return item;
  },
  update: async (id, patch) => {
    const idx = store.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    store[idx] = { ...store[idx], ...patch };
    return store[idx];
  },
  delete: async (id) => {
    const idx = store.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    store.splice(idx, 1);
    return true;
  },
  subscribe: (cb) => {
    const interval = setInterval(() => cb({}), 30000);
    return () => clearInterval(interval);
  },
});

const noop = async () => {};

// Mock client used when API is unreachable
const mock = {
  entities: {
    Ad: makeEntity(demoAds),
    Favorite: makeEntity(demoFavorites),
    Message: makeEntity(demoMessages),
    SellerReview: makeEntity(demoReviews),
    Notification: makeEntity(demoNotifications),
    AdminChat: makeEntity(demoAdminChat),
    User: makeEntity(demoUsers),
  },
  auth: {
    me: async () => null,
    updateMe: noop,
    login: async () => ({ token: null, user: null }),
    register: async () => ({ token: null, user: null }),
    logout: () => { setToken(null); return Promise.resolve(); },
    redirectToLogin: () => {},
  },
  integrations: {
    Core: {
      // Provide structured mock responses so UI flows behave realistically.
      InvokeLLM: async ({ prompt, response_json_schema }) => {
        if (response_json_schema?.properties?.approved) return { approved: true, reason: "" };
        if (response_json_schema?.properties?.keywords) return { keywords: "classifieds, listing, buy, sell, marketplace" };
        return { text: `Mocked response for: ${prompt?.slice(0, 60) ?? "N/A"}` };
      },
      UploadFile: async () => ({
        file_url: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800",
      }),
      SendEmail: async () => ({ status: "sent" }),
    },
  },
};

// Unified client with API-first, mock fallback
export const XTOX = {
  entities: {
    Ad: {
      list: (sort, limit) => safe(() => api(`/ads?status=active&limit=${limit || 100}`), () => mock.entities.Ad.list(sort, limit)),
      filter: (filter = {}, sort, limit) => {
        const qs = new URLSearchParams({ ...filter, limit: limit || 100 }).toString();
        return safe(() => api(`/ads?${qs}`), () => mock.entities.Ad.filter(filter, sort, limit));
      },
      create: (data) => safe(() => api("/ads", { method: "POST", body: data }), () => mock.entities.Ad.create(data)),
      update: (id, patch) => safe(() => api(`/ads/${id}`, { method: "PATCH", body: patch }), () => mock.entities.Ad.update(id, patch)),
      delete: (id) => safe(() => api(`/ads/${id}`, { method: "DELETE" }), () => mock.entities.Ad.delete(id)),
    },
    Favorite: {
      list: () => safe(() => api("/favorites"), () => mock.entities.Favorite.list()),
      filter: (filter) =>
        safe(
          async () => {
            const favs = await api("/favorites");
            return filter ? favs.filter((f) => Object.entries(filter).every(([k, v]) => f[k] === v)) : favs;
          },
          () => mock.entities.Favorite.filter(filter)
        ),
      create: (data) => safe(() => api("/favorites", { method: "POST", body: data }), () => mock.entities.Favorite.create(data)),
      delete: (id) => safe(() => api(`/favorites/${id}`, { method: "DELETE" }), () => mock.entities.Favorite.delete(id)),
    },
    Message: {
      filter: (filter) => {
        const conversation = filter?.ad_id || filter?.conversation;
        if (!conversation) return Promise.resolve([]);
        return safe(() => api(`/Chat/${conversation}`), () => mock.entities.Message.filter(filter));
      },
      create: (data) => {
        const body = {
          conversation: data.ad_id || data.conversation,
          to: data.receiver_email,
          body: data.content,
          image: data.type === "image" ? data.content : undefined,
        };
        return safe(() => api("/Chat", { method: "POST", body }), () => mock.entities.Message.create(data));
      },
    },
    Notification: {
      list: (sort, limit) => safe(() => api(`/notifications?limit=${limit || 10}`), () => mock.entities.Notification.list(sort, limit)),
    },
    User: {
      list: () => safe(() => api("/auth/users"), () => mock.entities.User.list()),
    },
  },
  auth: {
    me: () => safe(() => api("/auth/me"), () => mock.auth.me()),
    updateMe: () => Promise.resolve(),
    login: (email, password) =>
      safe(
        async () => {
          const { token, user } = await api("/auth/login", { method: "POST", body: { email, password } });
          setToken(token);
          return { token, user };
        },
        async () => {
          const demo = (await mock.entities.User.list())[0];
          return { token: null, user: demo };
        }
      ),
    register: (email, password, full_name) =>
      safe(async () => api("/auth/register", { method: "POST", body: { email, password, full_name } }), async () => {
        const demo = (await mock.entities.User.list())[0];
        return { token: null, user: demo };
      }),
    logout: () => {
      setToken(null);
      return Promise.resolve();
    },
    redirectToLogin: () => {},
    setToken,
  },
  integrations: {
    Core: {
      InvokeLLM: async (payload) => {
        if (payload?.task === "translate") {
          return safe(
            () =>
              api("/ai/translate", {
                method: "POST",
                body: {
                  title: payload.title,
                  description: payload.description,
                  target_lang: payload.target_lang || "ar",
                },
              }),
            () => ({
              translated_title: `[${payload.target_lang || "ar"}] ${payload.title || ""}`,
              translated_description: `[${payload.target_lang || "ar"}] ${payload.description || ""}`,
            })
          );
        }
        if (payload?.response_json_schema?.properties?.approved) {
          return safe(
            () => api("/ai/moderate", { method: "POST", body: { title: payload.title, description: payload.description } }),
            () => ({ approved: true, reason: "" })
          );
        }
        // AI self-healer: return structured defaults to avoid hangs in static mode
        const props = payload?.response_json_schema?.properties || {};
        if (props.is_fixable || props.needs_web_search || props.fix_description) {
          return {
            is_fixable: true,
            needs_web_search: false,
            fix_description: "Mock: restart component to clear transient error",
            severity: "low",
            root_cause: "Mock environment (no backend) triggered a benign error",
          };
        }
        if (props.root_cause || props.solution || props.code_example) {
          return {
            root_cause: "Mock: placeholder root cause",
            solution: "Mock: no-op fix in static mode",
            code_example: "// mock code example",
            prevention: "Handle errors gracefully in UI when API is offline.",
          };
        }
        if (props.patterns || props.improvement_suggestions || props.health_score) {
          return {
            patterns: ["Mock pattern: missing API_URL"],
            improvement_suggestions: ["Use mock client when API unavailable"],
            health_score: 85,
          };
        }
        return mock.integrations.Core.InvokeLLM(payload);
      },
      UploadFile: (args) => mock.integrations.Core.UploadFile(args),
      SendEmail: (args) => mock.integrations.Core.SendEmail(args),
    },
  },
};

// Legacy alias for older imports
export const base44 = XTOX;
export default XTOX;
