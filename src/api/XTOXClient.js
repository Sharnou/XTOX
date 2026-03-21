// Lightweight local mock of the Base44 client so the app can run entirely static
// without calling Base44 services or requiring sign-in. Data is kept in-memory.

const uuid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

// Seed demo data
const demoUsers = [
  { id: uuid(), email: "demo@xtox.app", full_name: "Demo Seller", role: "admin" },
  { id: uuid(), email: "buyer@xtox.app", full_name: "Buyer One", role: "user" }
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
const demoNotifications = [];
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

export const base44 = {
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
    logout: noop,
    redirectToLogin: () => {},
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt }) => ({
        text: `Mocked response for: ${prompt?.slice(0, 60) ?? "N/A"}`,
      }),
      UploadFile: async () => ({
        file_url: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800",
      }),
      SendEmail: async () => ({ status: "sent" }),
    },
  },
};
