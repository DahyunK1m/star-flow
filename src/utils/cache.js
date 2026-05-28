const CACHE_KEY = "starflow_daily_cache";

const today = () => new Date().toISOString().slice(0,10);

const cleanOld = (cache) => {
  const t = today();
  Object.keys(cache).forEach(k => { if(!k.includes(t)) delete cache[k]; });
  return cache;
};

export const getCached = (profileId, type) => {
  try {
    const cache = cleanOld(JSON.parse(localStorage.getItem(CACHE_KEY)||"{}"));
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    return cache[`${profileId}_${type}_${today()}`] || null;
  } catch { return null; }
};

export const setCached = (profileId, type, data) => {
  try {
    const cache = cleanOld(JSON.parse(localStorage.getItem(CACHE_KEY)||"{}"));
    cache[`${profileId}_${type}_${today()}`] = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

const CHAT_KEY = "starflow_chats_v1";

export const loadChats = () => {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY)||"[]"); } catch { return []; }
};

export const saveChats = (list) => {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(list)); } catch {}
};

export const upsertChat = (chat) => {
  const list = loadChats();
  const idx = list.findIndex(c=>c.id===chat.id);
  if(idx>=0) list[idx]=chat; else list.unshift(chat);
  saveChats(list);
};
