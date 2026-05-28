import { calcSaju, lunarToSolar } from './sajuCalculator.js';

const STORE_KEY = "starflow_profiles_v4";

export const loadProfiles = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return list.map(p => ({
      ...p,
      saju: calcSaju(p.y, p.m, p.d, p.h != null ? p.h : null)
    }));
  } catch { return []; }
};

export const saveProfiles = (list) => {
  try {
    const recalc = list.map(p => ({
      ...p,
      saju: calcSaju(p.y, p.m, p.d, p.h != null ? p.h : null)
    }));
    localStorage.setItem(STORE_KEY, JSON.stringify(recalc));
  } catch {}
};

export const buildProfile = (f) => {
  const y=parseInt(f.birthY), m=parseInt(f.birthM), d=parseInt(f.birthD);
  let sy=y, sm=m, sd=d;
  if(f.lunar){ const r=lunarToSolar(y,m,d); sy=r.y; sm=r.m; sd=r.d; }
  const h = f.hour!=null && f.hour!=="" ? parseInt(f.hour) : null;
  const saju = calcSaju(sy,sm,sd,h);
  const dateStr = String(f.birthY).padStart(4,"0")+String(f.birthM).padStart(2,"0")+String(f.birthD).padStart(2,"0");
  return { ...f, date:dateStr, y:sy, m:sm, d:sd, h, saju, id: f.id || Date.now().toString() };
};
