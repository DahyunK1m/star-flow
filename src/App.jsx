import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════
// 1. 상수 & 데이터
// ═══════════════════════════════════════════════

const FONT = "'Nanum Myeongjo', serif";
const C = {
  bg:      "#080614",
  card:    "rgba(18,12,45,0.92)",
  border:  "rgba(160,130,220,0.18)",
  glow:    "rgba(160,130,220,0.35)",
  purple:  "#a67cdc",
  cyan:    "#7ecfcf",
  gold:    "#d4a84b",
  text:    "#e8dff5",
  sub:     "#9b8ab0",
  rose:    "#d47c9b",
};

// ─── 사주 계산 (manseryeok 라이브러리 포팅) ────────
// 출처: https://github.com/yhj1024/manseryeok (MIT)
// 기준일: 1992.10.24 = 계유일(9번) / 절기 기반 월주 / 한국천문연구원 음력 데이터

const CHEONGAN = ["갑","을","병","정","무","기","경","신","임","계"];
const JIJI     = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
const OHAENG   = {갑:"목",을:"목",병:"화",정:"화",무:"토",기:"토",경:"금",신:"금",임:"수",계:"수"};
const JIJI_OHE = {자:"수",축:"토",인:"목",묘:"목",진:"토",사:"화",오:"화",미:"토",신:"금",유:"금",술:"토",해:"수"};

// 음력 데이터 (1900~2100, 출처: 한국천문연구원)
const LUNAR_DATA = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,0x04ae0,
  0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,0x04970,0x0a4b0,
  0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,0x06566,0x0d4a0,0x0ea50,
  0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,0x0d4a0,0x1d8a6,0x0b550,0x056a0,
  0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,
  0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,
  0x0f263,0x0d950,0x05b57,0x056a0,0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,
  0x0b540,0x0b6a0,0x195a6,0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,
  0x0ab60,0x09570,0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,
  0x092e0,0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,0x07954,
  0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,0x076a3,
  0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,0x0b5a0,0x056d0,0x055b2,
  0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,0x14b63,0x09370,0x049f8,0x04970,
  0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,
  0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,
  0x055a0,0x0aba4,0x0a5b0,0x052b0,0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,
  0x0a570,0x054e4,0x0d160,0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,
  0x0d150,0x0f252,0x0d520,
];

// 음력 관련
const getLunarYearDays = (y) => {
  let s=348; for(let i=0x8000;i>0x8;i>>=1) s+=LUNAR_DATA[y-1900]&i?1:0;
  return s+getLeapMonthDays(y);
};
const getLeapMonth = (y) => LUNAR_DATA[y-1900]&0xf;
const getLeapMonthDays = (y) => { const lm=getLeapMonth(y); return lm?(LUNAR_DATA[y-1900]&0x10000?30:29):0; };
const getLunarMonthDays = (y,m) => LUNAR_DATA[y-1900]&(0x10000>>m)?30:29;

// 음력→양력 변환 (한국천문연구원 데이터 기반)
const lunarToSolar = (year,month,day,isLeapMonth=false) => {
  const baseDate = new Date(1900,0,31);
  let offset=0;
  for(let i=1900;i<year;i++) offset+=getLunarYearDays(i);
  const leapMonth=getLeapMonth(year);
  let isLeap=false;
  for(let i=1;i<month;i++){
    if(leapMonth>0&&i===leapMonth&&!isLeap){offset+=getLeapMonthDays(year);isLeap=true;i--;}
    else offset+=getLunarMonthDays(year,i);
  }
  if(isLeapMonth&&leapMonth===month) offset+=getLunarMonthDays(year,month);
  offset+=day-1;
  const d=new Date(baseDate.getTime()+offset*86400000);
  return {y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate()};
};

// 절기 계산 (천문학적 근사)
const SOLAR_TERM_BASE = [
  5.4055,20.12,3.87,18.73,5.63,20.646,4.81,20.1,5.52,21.04,5.678,21.37,
  7.108,22.83,7.5,23.13,7.646,23.042,8.318,23.438,7.438,22.36,7.18,21.94
];
const getSolarTermDate = (year,idx) => {
  const c=Math.floor(year/100), yc=year%100;
  const day=Math.floor(SOLAR_TERM_BASE[idx]+0.2422*yc+Math.floor(yc/4)-Math.floor(c/4));
  return new Date(year,Math.floor(idx/2),day);
};

// 년주
const getYearPillar = (year) => ({
  hs: CHEONGAN[(year-4)%10],
  eb: JIJI[(year-4)%12],
  str: CHEONGAN[(year-4)%10]+JIJI[(year-4)%12]
});

// 월주 (절기 기반)
const getMonthPillar = (year,month,day) => {
  const date=new Date(year,month-1,day);
  const lichun=getSolarTermDate(year,2);
  const adjYear=date<lichun?year-1:year;
  let stMonth=0;
  for(let i=0;i<24;i+=2){
    if(date>=getSolarTermDate(adjYear,i)) stMonth=Math.floor(i/2)+1; else break;
  }
  const yStem=(adjYear-4)%10;
  const mStemIdx=(yStem%5*2+stMonth+1)%10;
  const MB={1:'인',2:'묘',3:'진',4:'사',5:'오',6:'미',7:'신',8:'유',9:'술',10:'해',11:'자',12:'축'};
  return {hs:CHEONGAN[mStemIdx],eb:MB[stMonth]||'인',str:CHEONGAN[mStemIdx]+(MB[stMonth]||'인')};
};

// 일주 (기준: 1992.10.24 = 계유, 60갑자 9번)
const getDayPillar = (year,month,day) => {
  const base=new Date(1992,9,24), target=new Date(year,month-1,day);
  const diff=Math.floor((target-base)/86400000);
  const idx=((9+diff)%60+60)%60;
  return {hs:CHEONGAN[idx%10],eb:JIJI[idx%12],str:CHEONGAN[idx%10]+JIJI[idx%12]};
};

// 시주
const getHourPillar = (dayHs,hour,minute=0) => {
  let h=hour===23?0:hour;
  const total=h*60+minute;
  const shichen=Math.floor((total+60)/120)%12;
  const dIdx=CHEONGAN.indexOf(dayHs);
  const hStemIdx=((dIdx%5)*2+shichen)%10;
  return {hs:CHEONGAN[hStemIdx],eb:JIJI[shichen],str:CHEONGAN[hStemIdx]+JIJI[shichen]};
};

// 오행 계산
const getDominant = (pillars) => {
  const c={}; pillars.filter(Boolean).forEach(p=>{if(p&&p.hs){const e=OHAENG[p.hs];if(e)c[e]=(c[e]||0)+1;}});
  return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0]||"목";
};

const calcSaju = (y,m,d,h,min=0) => {
  const yp=getYearPillar(y), mp=getMonthPillar(y,m,d), dp=getDayPillar(y,m,d);
  const tp=h!=null?getHourPillar(dp.hs,h,min):null;
  return {yp:yp.str,mp:mp.str,dp:dp.str,tp:tp?.str||null,el:getDominant([yp,mp,dp,tp])};
};


// ─── 78장 타로 ───────────────────────────────
const MAJOR = [
  {n:"The Fool",kr:"광대",emoji:"🃏",up:"새출발·순수·모험",rev:"무모·충동·도피"},
  {n:"The Magician",kr:"마법사",emoji:"✨",up:"의지·창조·능력",rev:"기만·미숙"},
  {n:"The High Priestess",kr:"여사제",emoji:"🌙",up:"직관·신비·내면",rev:"억압·비밀"},
  {n:"The Empress",kr:"여황제",emoji:"🌸",up:"풍요·모성·창조",rev:"의존·불임"},
  {n:"The Emperor",kr:"황제",emoji:"👑",up:"권위·안정·리더십",rev:"통제·경직"},
  {n:"The Hierophant",kr:"교황",emoji:"⛩️",up:"전통·교육·영적지도",rev:"반항·독단"},
  {n:"The Lovers",kr:"연인",emoji:"💕",up:"사랑·선택·조화",rev:"불화·선택실패"},
  {n:"The Chariot",kr:"전차",emoji:"🏆",up:"승리·의지·전진",rev:"방향상실·충돌"},
  {n:"Strength",kr:"힘",emoji:"🦁",up:"용기·인내·내적강인함",rev:"의심·에너지고갈"},
  {n:"The Hermit",kr:"은자",emoji:"🕯️",up:"내면탐구·고독·지혜",rev:"고립·거절"},
  {n:"Wheel of Fortune",kr:"운명의 수레바퀴",emoji:"☯️",up:"변화·행운·순환",rev:"불운·저항"},
  {n:"Justice",kr:"정의",emoji:"⚖️",up:"공정·진실·인과",rev:"불공정·편견"},
  {n:"The Hanged Man",kr:"매달린 남자",emoji:"🌀",up:"희생·새관점·기다림",rev:"정체·무의미한희생"},
  {n:"Death",kr:"죽음",emoji:"🌑",up:"변환·끝과시작",rev:"변화두려움·집착"},
  {n:"Temperance",kr:"절제",emoji:"🌊",up:"균형·조화·인내",rev:"과잉·불균형"},
  {n:"The Devil",kr:"악마",emoji:"🔗",up:"속박·집착·물질",rev:"해방·각성"},
  {n:"The Tower",kr:"탑",emoji:"⚡",up:"급변·혁신·계시",rev:"재앙회피·지연"},
  {n:"The Star",kr:"별",emoji:"⭐",up:"희망·영감·재생",rev:"절망·믿음상실"},
  {n:"The Moon",kr:"달",emoji:"🌕",up:"환상·무의식·혼란",rev:"혼란해소·진실"},
  {n:"The Sun",kr:"태양",emoji:"☀️",up:"성공·기쁨·활력",rev:"낙관과잉·자만"},
  {n:"Judgement",kr:"심판",emoji:"🎺",up:"재탄생·용서·결산",rev:"자기의심·회한"},
  {n:"The World",kr:"세계",emoji:"🌍",up:"완성·달성·통합",rev:"미완성·지름길"},
];
const SUITS = ["완드","컵","소드","펜타클"];
const SUIT_E = ["🔥","💧","💨","🌱"];
const COURT = ["페이지","나이트","퀸","킹"];
const MINOR = SUITS.flatMap((s,si) => [
  ...Array.from({length:10},(_,i)=>({n:`${i+1}of${s}`,kr:`${s} ${i+1}`,emoji:SUIT_E[si],
    up:`${s} ${i+1}번의 에너지와 흐름`,rev:`${s} ${i+1}번의 막힘과 역류`})),
  ...COURT.map(c=>({n:`${c}of${s}`,kr:`${s} ${c}`,emoji:SUIT_E[si],
    up:`${s} ${c}의 특성과 행동`,rev:`${s} ${c}의 부정적 측면`}))
]);
const ALL_TAROT = [...MAJOR,...MINOR];

const shuffleDeck = () => [...ALL_TAROT]
  .sort(()=>Math.random()-0.5)
  .map(c=>({...c,rev:Math.random()>0.65}));

// ─── 스토리지 ────────────────────────────────
const STORE_KEY = "starflow_profiles_v4";
const loadProfiles = async () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return list.map(p => ({...p, saju: calcSaju(p.y, p.m, p.d, p.h != null ? p.h : null)}));
  } catch { return []; }
};
const saveProfiles = async (list) => {
  try {
    const recalc = list.map(p => ({...p, saju: calcSaju(p.y, p.m, p.d, p.h != null ? p.h : null)}));
    localStorage.setItem(STORE_KEY, JSON.stringify(recalc));
  } catch {}
};

// ─── API 호출 ─────────────────────────────────
const API_URL = "/.netlify/functions/claude";

const callAI = async (prompt, maxTokens=1200) => {
  const res = await fetch(API_URL,{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,
      messages:[{role:"user",content:prompt}]})
  });
  const data = await res.json();
  const txt = data.content[0].text.replace(/```json|```/g,"").trim();
  return JSON.parse(txt);
};

// ═══════════════════════════════════════════════
// 2. 공통 UI
// ═══════════════════════════════════════════════

const Stars = () => {
  const stars = useRef(Array.from({length:60},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    s:Math.random()*2+0.4, delay:Math.random()*5, dur:Math.random()*3+2
  }))).current;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
      {stars.map(s=>(
        <div key={s.id} style={{
          position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
          width:s.s,height:s.s,borderRadius:"50%",background:"white",
          animation:`tw ${s.dur}s ${s.delay}s infinite ease-in-out`
        }}/>
      ))}
    </div>
  );
};

const Spinner = ({msg="별의 기운을 읽는 중…"}) => (
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:40}}>
    <div style={{display:"flex",gap:8}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{
          width:10,height:10,borderRadius:"50%",
          background:`radial-gradient(circle,${C.purple},#4a2080)`,
          animation:`bounce 1.2s ${i*0.2}s infinite ease-in-out`
        }}/>
      ))}
    </div>
    <p style={{color:C.sub,fontFamily:FONT,fontSize:13,margin:0}}>{msg}</p>
  </div>
);

const GlassCard = ({children,glow,style={}}) => (
  <div style={{
    background:C.card, border:`1px solid ${glow?C.glow:C.border}`,
    borderRadius:20, padding:20, backdropFilter:"blur(20px)",
    boxShadow:glow?`0 0 24px ${C.glow},inset 0 0 24px rgba(160,130,220,0.04)`:"none",
    ...style
  }}>
    {children}
  </div>
);

const Btn = ({children,onClick,disabled,variant="primary",style={}}) => {
  const bg = {
    primary:`linear-gradient(135deg,#6d28d9,#4338ca)`,
    rose:`linear-gradient(135deg,#9d174d,#6d28d9)`,
    ghost:`transparent`,
    gold:`linear-gradient(135deg,#92400e,#d97706)`,
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:"12px 0",borderRadius:12,border:variant==="ghost"?`1px solid ${C.border}`:"none",
      cursor:disabled?"not-allowed":"pointer",background:bg,
      color:variant==="ghost"?C.sub:"white",fontFamily:FONT,fontSize:14,
      width:"100%",opacity:disabled?0.45:1,transition:"all 0.2s",
      boxShadow:variant!=="ghost"?"0 4px 16px rgba(109,40,217,0.4)":"none",
      ...style
    }}>{children}</button>
  );
};

const inp = {
  background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`,
  borderRadius:10, padding:"10px 14px", color:C.text,
  fontFamily:FONT, fontSize:13, outline:"none",
  width:"100%", boxSizing:"border-box",
};

// ─── 프로필 폼 ────────────────────────────────
const RELATIONS = ["본인","연인","가족","친구","지인"];
const ProfileForm = ({initial={},onSave,onCancel}) => {
  // initial.date → yy,mm,dd 분리해서 초기화
  const splitDate = (date="") => {
    const raw=(date||"").replace(/\D/g,"");
    return {y:raw.slice(0,4)||"", m:raw.slice(4,6)||"", d:raw.slice(6,8)||""};
  };
  const initD = splitDate(initial.date);
  const [f,setF] = useState({
    name:"",lunar:false,hour:"",gender:"여",relation:"본인",
    ...initial,
    birthY:initD.y, birthM:initD.m, birthD:initD.d,
  });
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  // 실시간 사주 미리보기
  const preview = (() => {
    if(!f.birthY||!f.birthM||!f.birthD) return null;
    try {
      const y=parseInt(f.birthY), m=parseInt(f.birthM), d=parseInt(f.birthD);
      if(isNaN(y)||isNaN(m)||isNaN(d)) return null;
      let sy=y,sm=m,sd=d;
      if(f.lunar){const r=lunarToSolar(y,m,d);sy=r.y;sm=r.m;sd=r.d;}
      const h=f.hour!=null&&f.hour!==""?parseInt(f.hour):null;
      return calcSaju(sy,sm,sd,h);
    } catch { return null; }
  })();

  const valid = f.name.trim()&&f.birthY.length===4&&f.birthM.length>=1&&f.birthD.length>=1;

  // 시지: 자시 대표시각 23, 축시 1, 인시 3 ... (각 시의 시작 홀수시)
  const SIJI = [
    {label:"자시 (子) 23:00~01:00", h:23},
    {label:"축시 (丑) 01:00~03:00", h:1},
    {label:"인시 (寅) 03:00~05:00", h:3},
    {label:"묘시 (卯) 05:00~07:00", h:5},
    {label:"진시 (辰) 07:00~09:00", h:7},
    {label:"사시 (巳) 09:00~11:00", h:9},
    {label:"오시 (午) 11:00~13:00", h:11},
    {label:"미시 (未) 13:00~15:00", h:13},
    {label:"신시 (申) 15:00~17:00", h:15},
    {label:"유시 (酉) 17:00~19:00", h:17},
    {label:"술시 (戌) 19:00~21:00", h:19},
    {label:"해시 (亥) 21:00~23:00", h:21},
  ];

  const save = () => {
    const y=parseInt(f.birthY), m=parseInt(f.birthM), d=parseInt(f.birthD);
    let sy=y,sm=m,sd=d;
    if(f.lunar){const r=lunarToSolar(y,m,d);sy=r.y;sm=r.m;sd=r.d;}
    const h=f.hour!=null&&f.hour!==""?parseInt(f.hour):null;
    const saju=calcSaju(sy,sm,sd,h);
    const dateStr=String(f.birthY).padStart(4,"0")+String(f.birthM).padStart(2,"0")+String(f.birthD).padStart(2,"0");
    onSave({...f,date:dateStr,y:sy,m:sm,d:sd,h,saju,id:initial.id||Date.now().toString()});
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <input placeholder="이름" value={f.name} onChange={e=>set("name",e.target.value)} style={inp}/>

      {/* 양력/음력 */}
      <div style={{display:"flex",gap:8}}>
        {["양력","음력"].map(t=>(
          <button key={t} onClick={()=>set("lunar",t==="음력")} style={{
            flex:1,padding:"10px 0",borderRadius:10,border:`1px solid ${C.border}`,cursor:"pointer",fontSize:13,
            background:(f.lunar?t==="음력":t==="양력")?"rgba(109,40,217,0.5)":"rgba(255,255,255,0.04)",
            color:(f.lunar?t==="음력":t==="양력")?C.text:C.sub,fontFamily:FONT
          }}>{t}</button>
        ))}
      </div>

      {/* 생년월일 — 년/월/일 3칸 분리 */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8}}>
        <input
          type="number" placeholder="출생연도 (예: 1999)"
          value={f.birthY} onChange={e=>set("birthY",e.target.value)}
          style={{...inp}} inputMode="numeric"
        />
        <input
          type="number" placeholder="월" min="1" max="12"
          value={f.birthM} onChange={e=>set("birthM",e.target.value)}
          style={{...inp}} inputMode="numeric"
        />
        <input
          type="number" placeholder="일" min="1" max="31"
          value={f.birthD} onChange={e=>set("birthD",e.target.value)}
          style={{...inp}} inputMode="numeric"
        />
      </div>

      {/* 실시간 사주 미리보기 */}
      {preview&&(
        <div style={{
          background:"rgba(109,40,217,0.1)",border:`1px solid rgba(109,40,217,0.25)`,
          borderRadius:10,padding:"10px 14px",
        }}>
          <div style={{color:C.sub,fontFamily:FONT,fontSize:10,marginBottom:6}}>✦ 사주 미리보기</div>
          <div style={{display:"flex",gap:6}}>
            {[{l:"년주",v:preview.yp},{l:"월주",v:preview.mp},{l:"일주",v:preview.dp},{l:"시주",v:preview.tp||"미상"}].map(({l,v})=>(
              <div key={l} style={{
                flex:1,textAlign:"center",
                background:"rgba(109,40,217,0.15)",borderRadius:8,padding:"4px 2px",
                border:`1px solid rgba(109,40,217,0.3)`
              }}>
                <div style={{color:C.sub,fontSize:9,fontFamily:FONT}}>{l}</div>
                <div style={{color:C.text,fontSize:15,fontFamily:FONT,letterSpacing:2,marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{color:C.purple,fontFamily:FONT,fontSize:10,marginTop:6,textAlign:"center"}}>
            {preview.el}오행 · 일주 {preview.dp}
          </div>
        </div>
      )}

      {/* 시간 - 버튼 클릭 → 바텀시트 팝업 */}
      <div>
        <div style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:8}}>태어난 시간</div>
        <button onClick={()=>set("showSiji",true)} style={{
          width:"100%",padding:"12px 16px",borderRadius:10,cursor:"pointer",
          border:`1px solid ${f.hour?C.purple:C.border}`,
          background:f.hour?"rgba(109,40,217,0.15)":"rgba(255,255,255,0.03)",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          fontFamily:FONT,
        }}>
          <span style={{color:f.hour?C.text:C.sub,fontSize:13}}>
            {f.hour
              ? SIJI.find(s=>String(s.h)===String(f.hour))?.label || "시간 모름"
              : "⏰ 태어난 시간 선택"}
          </span>
          <span style={{color:C.sub,fontSize:12}}>▾</span>
        </button>
      </div>

      {/* 시지 바텀시트 */}
      {f.showSiji&&(
        <div style={{
          position:"fixed",inset:0,zIndex:1000,
          background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",
          display:"flex",alignItems:"flex-end",justifyContent:"center",
        }} onClick={()=>set("showSiji",false)}>
          <div onClick={e=>e.stopPropagation()} style={{
            width:"100%",maxWidth:480,
            background:"#100820",
            borderRadius:"20px 20px 0 0",
            border:`1px solid ${C.border}`,
            borderBottom:"none",
            padding:"0 0 32px",
            maxHeight:"75vh",
            display:"flex",flexDirection:"column",
          }}>
            {/* 핸들 */}
            <div style={{display:"flex",justifyContent:"center",padding:"12px 0 8px"}}>
              <div style={{width:40,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)"}}/>
            </div>
            <div style={{
              textAlign:"center",color:C.text,fontFamily:FONT,
              fontSize:16,padding:"4px 0 16px",
              borderBottom:`1px solid ${C.border}`,marginBottom:8,
            }}>태어난 시간</div>

            <div style={{overflowY:"auto",padding:"0 16px"}}>
              {/* 시간 모름 */}
              <div onClick={()=>{set("hour","");set("showSiji",false);}} style={{
                padding:"16px",borderRadius:12,marginBottom:6,cursor:"pointer",
                border:`1px solid ${(!f.hour||f.hour==="")?C.purple:C.border}`,
                background:(!f.hour||f.hour==="")?
                  "linear-gradient(135deg,rgba(109,40,217,0.25),rgba(79,70,229,0.2))":
                  "rgba(255,255,255,0.03)",
                display:"flex",alignItems:"center",justifyContent:"space-between",
              }}>
                <div>
                  <div style={{color:C.text,fontFamily:FONT,fontSize:14}}>⏰ 시간 모름</div>
                  <div style={{color:C.sub,fontFamily:FONT,fontSize:11,marginTop:2}}>
                    태어난 시간을 모르는 경우
                  </div>
                </div>
                {(!f.hour||f.hour==="")&&(
                  <div style={{color:C.purple,fontSize:18}}>✓</div>
                )}
              </div>

              {/* 시지 목록 */}
              {SIJI.map(s=>{
                const isSel = String(f.hour)===String(s.h);
                const [siName,,timeRange] = s.label.split(" ");
                return (
                  <div key={s.h}
                    onClick={()=>{set("hour",String(s.h));set("showSiji",false);}}
                    style={{
                      padding:"14px 16px",borderRadius:12,marginBottom:6,cursor:"pointer",
                      border:`1px solid ${isSel?C.purple:C.border}`,
                      background:isSel?
                        "linear-gradient(135deg,rgba(109,40,217,0.25),rgba(79,70,229,0.2))":
                        "rgba(255,255,255,0.03)",
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                    }}>
                    <div>
                      <div style={{color:C.text,fontFamily:FONT,fontSize:15}}>{siName}</div>
                      <div style={{color:C.sub,fontFamily:FONT,fontSize:12,marginTop:2}}>
                        {timeRange}
                      </div>
                    </div>
                    {isSel&&<div style={{color:C.purple,fontSize:18}}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 성별 */}
      <div style={{display:"flex",gap:8}}>
        {["여","남"].map(g=>(
          <button key={g} onClick={()=>set("gender",g)} style={{
            flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:"pointer",fontFamily:FONT,fontSize:13,
            background:f.gender===g?"linear-gradient(135deg,#7c3aed,#4f46e5)":"rgba(255,255,255,0.05)",
            color:f.gender===g?"white":C.sub
          }}>{g==="여"?"👩 여성":"👨 남성"}</button>
        ))}
      </div>

      {/* 관계 */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {RELATIONS.map(r=>(
          <button key={r} onClick={()=>set("relation",r)} style={{
            padding:"6px 14px",borderRadius:20,border:`1px solid ${C.border}`,cursor:"pointer",
            background:f.relation===r?"rgba(109,40,217,0.4)":"rgba(255,255,255,0.03)",
            color:f.relation===r?C.text:C.sub,fontFamily:FONT,fontSize:12
          }}>{r}</button>
        ))}
      </div>

      <div style={{display:"flex",gap:8,marginTop:4}}>
        {onCancel&&<Btn variant="ghost" onClick={onCancel}>취소</Btn>}
        <Btn onClick={save} disabled={!valid}>저장하기</Btn>
      </div>
    </div>
  );
};

// ─── 프로필 선택기 ────────────────────────────
const ProfilePicker = ({profiles,selected,onSelect,onAdd,multi=false,label="프로필 선택"}) => {
  const [adding,setAdding] = useState(false);
  return (
    <div>
      <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:10}}>{label}</p>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
        {profiles.map(p=>{
          const isSel = multi?(selected||[]).some(s=>s.id===p.id):selected?.id===p.id;
          return (
            <div key={p.id} onClick={()=>onSelect(p)} style={{
              padding:"12px 16px",borderRadius:14,cursor:"pointer",
              border:`1px solid ${isSel?C.purple:C.border}`,
              background:isSel?"rgba(109,40,217,0.2)":"rgba(255,255,255,0.03)",
              display:"flex",alignItems:"center",gap:12,transition:"all 0.2s"
            }}>
              <div style={{
                width:38,height:38,borderRadius:"50%",
                background:`linear-gradient(135deg,rgba(109,40,217,0.4),rgba(67,56,202,0.4))`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0
              }}>{p.gender==="여"?"👩":"👨"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{color:C.text,fontFamily:FONT,fontSize:14}}>{p.name}</span>
                  <span style={{
                    color:C.purple,fontFamily:FONT,fontSize:10,
                    background:"rgba(109,40,217,0.15)",padding:"1px 7px",borderRadius:10,
                    border:`1px solid rgba(109,40,217,0.3)`
                  }}>{p.relation}</span>
                </div>
                <div style={{color:C.sub,fontFamily:FONT,fontSize:10,marginBottom:5}}>
                  {p.y}.{String(p.m).padStart(2,"0")}.{String(p.d).padStart(2,"0")}
                  {p.h!=null?` · ${({"0":"자시","1":"축시","2":"축시","3":"인시","4":"인시","5":"묘시","6":"묘시","7":"진시","8":"진시","9":"사시","10":"사시","11":"오시","12":"오시","13":"미시","14":"미시","15":"신시","16":"신시","17":"유시","18":"유시","19":"술시","20":"술시","21":"해시","22":"해시","23":"자시"})[String(p.h)]||"?시"}`:" · 시간미상"}
                </div>
                {p.saju&&(
                  <div style={{display:"flex",gap:4}}>
                    {[
                      {l:"년",v:p.saju.yp},
                      {l:"월",v:p.saju.mp},
                      {l:"일",v:p.saju.dp},
                      {l:"시",v:p.saju.tp},
                    ].map(({l,v})=>(
                      <div key={l} style={{
                        textAlign:"center",
                        background:"rgba(109,40,217,0.12)",
                        border:`1px solid rgba(109,40,217,0.2)`,
                        borderRadius:6,padding:"2px 5px",
                        minWidth:28,
                      }}>
                        <div style={{color:C.sub,fontSize:8,fontFamily:FONT}}>{l}</div>
                        <div style={{
                          color:v?C.text:"rgba(155,138,176,0.3)",
                          fontSize:13,fontFamily:FONT,letterSpacing:1
                        }}>{v||"–"}</div>
                      </div>
                    ))}
                    <div style={{
                      textAlign:"center",
                      background:`rgba(${{"목":"34,197,94","화":"239,68,68","토":"245,158,11","금":"192,192,192","수":"59,130,246"}[p.saju.el]||"109,40,217"},0.15)`,
                      border:`1px solid rgba(${{"목":"34,197,94","화":"239,68,68","토":"245,158,11","금":"192,192,192","수":"59,130,246"}[p.saju.el]||"109,40,217"},0.3)`,
                      borderRadius:6,padding:"2px 7px",display:"flex",alignItems:"center",
                    }}>
                      <div style={{
                        color:{목:"#22c55e",화:"#ef4444",토:"#f59e0b",금:"#c0c0c0",수:"#3b82f6"}[p.saju.el]||C.purple,
                        fontSize:11,fontFamily:FONT
                      }}>{p.saju.el}기운</div>
                    </div>
                  </div>
                )}
              </div>
              {isSel&&<div style={{color:C.purple,fontSize:18}}>✓</div>}
            </div>
          );
        })}
        <div onClick={()=>setAdding(true)} style={{
          padding:"12px 16px",borderRadius:14,cursor:"pointer",
          border:`1px dashed ${C.border}`,background:"transparent",
          display:"flex",alignItems:"center",gap:10,color:C.sub,fontFamily:FONT,fontSize:13
        }}>
          <span style={{fontSize:20}}>＋</span> 새 프로필 추가
        </div>
      </div>
      {adding&&(
        <GlassCard style={{marginBottom:12}}>
          <p style={{color:C.purple,fontFamily:FONT,fontSize:13,marginBottom:14}}>✦ 새 프로필</p>
          <ProfileForm onSave={p=>{onAdd(p);setAdding(false);}} onCancel={()=>setAdding(false)}/>
        </GlassCard>
      )}
    </div>
  );
};

// ─── 사주 기둥 표시 ───────────────────────────
const PillarRow = ({saju}) => (
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:16}}>
    {[{l:"년주",v:saju.yp},{l:"월주",v:saju.mp},{l:"일주",v:saju.dp},{l:"시주",v:saju.tp||"미상"}].map(({l,v})=>(
      <div key={l} style={{
        background:"rgba(109,40,217,0.12)",borderRadius:10,padding:"8px 4px",
        textAlign:"center",border:`1px solid ${C.border}`
      }}>
        <div style={{color:C.sub,fontSize:10,fontFamily:FONT}}>{l}</div>
        <div style={{color:C.text,fontSize:18,fontFamily:FONT,marginTop:3,letterSpacing:4}}>{v}</div>
        <div style={{color:C.sub,fontSize:9,fontFamily:FONT,marginTop:2}}>
          {v&&v!=="미상"?OHAENG[v[0]]||"":""}
        </div>
      </div>
    ))}
  </div>
);

// ─── 챗 전용 타로 피커 (78장 스프레드, 3장 선택) ──
const ChatTarotPicker = ({onDone}) => {
  const COUNT = 3;
  const deck = useRef(shuffleDeck()).current;
  const [flipped, setFlipped]   = useState({}); // {deckIdx: card}
  const [picked, setPicked]     = useState([]);  // [{...card, i}]
  const pickedRef = useRef([]);
  const [animIdx, setAnimIdx]   = useState(null);

  const handlePick = (i) => {
    if(flipped[i] || pickedRef.current.length >= COUNT) return;
    setAnimIdx(i);
    setTimeout(() => {
      const card = deck[i];
      setFlipped(prev => ({...prev, [i]: card}));
      setAnimIdx(null);
      const next = [...pickedRef.current, {...card, i}];
      pickedRef.current = next;
      setPicked([...next]);
      if(next.length === COUNT) setTimeout(() => onDone(next), 600);
    }, 350);
  };

  return (
    <div style={{width:"100%"}}>
      {/* 상단 선택된 카드 */}
      <div style={{
        display:"flex", gap:10, marginBottom:16, justifyContent:"center", minHeight:90
      }}>
        {Array.from({length:COUNT}).map((_,si) => {
          const c = picked[si];
          return (
            <div key={si} style={{
              width:58, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              opacity: c ? 1 : 0.25, transition:"opacity 0.3s"
            }}>
              <div style={{
                width:52, height:72, borderRadius:10,
                background: c
                  ? `linear-gradient(155deg,rgba(109,40,217,0.3),rgba(10,6,30,0.95))`
                  : "rgba(255,255,255,0.04)",
                border:`1px solid ${c ? C.purple : C.border}`,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                transform: c?.rev ? "rotate(180deg)" : "none",
                boxShadow: c ? `0 0 14px ${C.purple}55` : "none",
                transition:"all 0.4s"
              }}>
                {c ? <span style={{fontSize:24}}>{c.emoji}</span>
                   : <span style={{color:C.border, fontSize:18}}>?</span>}
              </div>
              {c && <span style={{color:C.purple,fontFamily:FONT,fontSize:8,textAlign:"center",lineHeight:1.3}}>{c.kr}</span>}
              {c && <span style={{fontSize:8,color:c.rev?"#fca5a5":"#86efac",fontFamily:FONT}}>{c.rev?"역":"정"}</span>}
            </div>
          );
        })}
      </div>

      <p style={{color:C.sub, fontFamily:FONT, fontSize:11, textAlign:"center", marginBottom:12}}>
        끌리는 카드를 {COUNT - picked.length}장 더 선택하세요
      </p>

      {/* 78장 스프레드 그리드 */}
      <div style={{
        display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:5,
        maxHeight:340, overflowY:"auto",
        padding:"4px", borderRadius:12,
      }}>
        {deck.map((_, i) => {
          const isFlipped = !!flipped[i];
          const card = flipped[i];
          const isAnim = animIdx === i;
          const isDone = picked.length >= COUNT;

          return (
            <div
              key={i}
              onClick={() => handlePick(i)}
              style={{
                height:62, borderRadius:8, cursor: isFlipped||isDone ? "default" : "pointer",
                position:"relative", transition:"all 0.2s",
                transform: isAnim ? "scale(0.85) rotateY(90deg)" : "scale(1) rotateY(0deg)",
                opacity: isFlipped ? 0.5 : isDone ? 0.3 : 1,
              }}
            >
              {isFlipped && card ? (
                // 앞면 (뽑힌 카드)
                <div style={{
                  width:"100%", height:"100%", borderRadius:8,
                  background:"linear-gradient(155deg,rgba(109,40,217,0.25),rgba(10,6,30,0.9))",
                  border:`1px solid ${C.purple}88`,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1,
                  transform: card.rev ? "rotate(180deg)" : "none",
                }}>
                  <span style={{fontSize:16}}>{card.emoji}</span>
                  <span style={{color:C.purple, fontSize:6, fontFamily:FONT, textAlign:"center", lineHeight:1.2, padding:"0 2px"}}>
                    {card.kr.length > 5 ? card.kr.slice(0,5) : card.kr}
                  </span>
                </div>
              ) : (
                // 뒷면
                <div style={{
                  width:"100%", height:"100%", borderRadius:8,
                  background: isAnim
                    ? "linear-gradient(135deg,#4c1d95,#1e1b4b)"
                    : "linear-gradient(135deg,#100820,#080614)",
                  border:`1px solid ${isAnim ? C.purple : C.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow: isAnim ? `0 0 12px ${C.purple}77` : "none",
                }}>
                  <span style={{
                    fontSize:10,
                    color: isDone ? `${C.border}` : `${C.purple}66`,
                  }}>✦</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── 타로 카드 셀렉터 ─────────────────────────
const TarotSelector = ({count,onDone}) => {
  const deck = useRef(shuffleDeck()).current;
  const [picked,setPicked] = useState([]);
  const pickedRef = useRef([]);
  const [flipping,setFlipping] = useState(null);
  const flipRef = useRef(false);

  const pick = (i) => {
    if(flipRef.current||pickedRef.current.some(p=>p.i===i)||pickedRef.current.length>=count) return;
    flipRef.current=true; setFlipping(i);
    setTimeout(()=>{
      const card=deck[i];
      const next=[...pickedRef.current,{...card,i}];
      pickedRef.current=next;
      setPicked([...next]);
      setFlipping(null); flipRef.current=false;
      if(next.length===count) setTimeout(()=>onDone(next),400);
    },300);
  };

  return (
    <div>
      <div style={{
        display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12
      }}>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:0}}>
          끌리는 카드를 {count}장 선택하세요
        </p>
        <span style={{
          color:C.purple,fontFamily:FONT,fontSize:13,
          background:"rgba(109,40,217,0.2)",padding:"3px 12px",borderRadius:20
        }}>{picked.length}/{count}</span>
      </div>
      {/* 뽑힌 카드 미리보기 */}
      {picked.length>0&&(
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {picked.map((c,i)=>(
            <div key={i} style={{
              background:"rgba(109,40,217,0.2)",borderRadius:8,padding:"4px 10px",
              border:`1px solid ${C.purple}55`,display:"flex",alignItems:"center",gap:4
            }}>
              <span style={{fontSize:12}}>{c.emoji}</span>
              <span style={{color:C.text,fontFamily:FONT,fontSize:10}}>{c.kr}</span>
              <span style={{
                fontSize:9,color:c.rev?"#fca5a5":"#86efac",fontFamily:FONT
              }}>{c.rev?"역":"정"}</span>
            </div>
          ))}
        </div>
      )}
      {/* 덱 그리드 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,maxHeight:360,overflowY:"auto"}}>
        {deck.map((_,i)=>{
          const isP=pickedRef.current.some(p=>p.i===i);
          const isF=flipping===i;
          if(isP) return <div key={i} style={{height:56}}/>;
          return (
            <div key={i} onClick={()=>pick(i)} style={{
              height:56,borderRadius:8,cursor:"pointer",
              border:`1px solid ${C.border}`,
              background:isF?"linear-gradient(135deg,#4c1d95,#1e1b4b)":"linear-gradient(135deg,#12082d,#080614)",
              display:"flex",alignItems:"center",justifyContent:"center",
              transform:isF?"scale(0.88)":"scale(1)",transition:"all 0.2s",
              boxShadow:isF?`0 0 10px ${C.purple}55`:"none"
            }}>
              <span style={{color:`${C.purple}55`,fontSize:14}}>✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── 타로 스프레드 결과 표시 ──────────────────
const TarotSpreadResult = ({cards,interpretation,layout}) => {
  // layout: "신년" → 3장 / else → 11장 (과거3 현재4 미래4)
  const eras = layout==="신년"
    ? [{label:"전체",cards:cards,summary:interpretation?.overall}]
    : [
        {label:"⏪ 과거",cards:cards.slice(0,3),summary:interpretation?.past},
        {label:"✦ 현재",cards:cards.slice(3,7),summary:interpretation?.present},
        {label:"⏩ 미래",cards:cards.slice(7,11),summary:interpretation?.future},
      ];
  const colors={past:C.purple,present:C.cyan,future:C.gold,"전체":C.purple};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* 모든 카드 한눈에 */}
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:12,textAlign:"center"}}>
          선택된 {cards.length}장
        </p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
          {cards.map((c,i)=>(
            <div key={i} style={{
              width:60,display:"flex",flexDirection:"column",alignItems:"center",gap:4
            }}>
              <div style={{
                width:52,height:72,borderRadius:8,
                background:"rgba(109,40,217,0.15)",border:`1px solid ${C.purple}55`,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                transform:c.rev?"rotate(180deg)":"none"
              }}>
                <span style={{fontSize:22}}>{c.emoji}</span>
              </div>
              <span style={{color:C.sub,fontSize:8,fontFamily:FONT,textAlign:"center",lineHeight:1.3}}>
                {c.kr}
              </span>
              <span style={{fontSize:8,color:c.rev?"#fca5a5":"#86efac",fontFamily:FONT}}>
                {c.rev?"역":"정"}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 에라별 해석 */}
      {interpretation && eras.map(({label,cards:ec,summary})=>{
        const col=colors[label.replace(/[⏪⏩✦ ]/g,"")]||C.purple;
        return (
          <GlassCard key={label} glow>
            <div style={{
              borderBottom:`1px solid ${col}33`,paddingBottom:8,marginBottom:12,
              display:"flex",alignItems:"center",gap:8
            }}>
              <span style={{color:col,fontFamily:FONT,fontSize:15}}>{label}</span>
            </div>
            {summary&&(
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,marginBottom:14}}>
                {summary}
              </p>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {ec.map((c,i)=>{
                const rd=interpretation.cards?.[cards.indexOf(c)];
                return (
                  <div key={i} style={{
                    display:"flex",gap:12,alignItems:"flex-start",
                    background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"10px 12px",
                    border:`1px solid ${C.border}`
                  }}>
                    <div style={{
                      width:32,height:44,borderRadius:6,flexShrink:0,
                      background:"rgba(109,40,217,0.15)",border:`1px solid ${col}44`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      transform:c.rev?"rotate(180deg)":"none"
                    }}><span style={{fontSize:14}}>{c.emoji}</span></div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:6,marginBottom:4,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{color:col,fontFamily:FONT,fontSize:11}}>{c.kr}</span>
                        <span style={{
                          fontSize:9,padding:"1px 6px",borderRadius:6,fontFamily:FONT,
                          background:c.rev?"rgba(239,68,68,0.15)":"rgba(34,197,94,0.15)",
                          color:c.rev?"#fca5a5":"#86efac"
                        }}>{c.rev?"역방향":"정방향"}</span>
                      </div>
                      <p style={{color:C.sub,fontFamily:FONT,fontSize:11,margin:"0 0 4px"}}>
                        {c.rev?c.rev_meaning||c.rev:c.up}
                      </p>
                      {rd&&<p style={{color:C.text,fontFamily:FONT,fontSize:12,lineHeight:1.65,margin:0}}>{rd}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════
// 3. 화면 컴포넌트
// ═══════════════════════════════════════════════

// ─── 홈 ──────────────────────────────────────
const HomeScreen = ({profiles,onAddProfile,navigate}) => {
  const menus = [
    {id:"saju",      icon:"🏮", label:"정통 사주",   desc:"사주팔자 전체 분석"},
    {id:"newyear",   icon:"🎋", label:"신년 사주",   desc:"2026년 흐름 읽기"},
    {id:"gungham",   icon:"💞", label:"사주 궁합",   desc:"두 사람의 인연"},
    {id:"tarot",     icon:"🃏", label:"타로",         desc:"78장 타로 스프레드"},
    {id:"zodiac",    icon:"🌠", label:"별자리 운세",  desc:"오늘의 별자리"},
  ];
  return (
    <div style={{padding:"24px 16px 100px"}}>
      {/* 헤더 */}
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:36,marginBottom:8,animation:"float 3s ease-in-out infinite",display:"inline-block"}}>🌌</div>
        <h1 style={{
          fontFamily:FONT,fontSize:26,margin:"0 0 6px",
          background:`linear-gradient(135deg,${C.text},${C.purple},${C.cyan})`,
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
        }}>별의 흐름</h1>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:0}}>당신의 운명을 별에게 묻다</p>
      </div>

      {/* 메뉴 그리드 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {menus.map(m=>(
          <div key={m.id} onClick={()=>navigate(m.id)} style={{
            background:C.card,border:`1px solid ${C.border}`,borderRadius:18,
            padding:"20px 16px",cursor:"pointer",textAlign:"center",
            transition:"all 0.2s",
            boxShadow:"0 2px 12px rgba(0,0,0,0.3)"
          }}>
            <div style={{fontSize:32,marginBottom:10}}>{m.icon}</div>
            <div style={{color:C.text,fontFamily:FONT,fontSize:14,marginBottom:4}}>{m.label}</div>
            <div style={{color:C.sub,fontFamily:FONT,fontSize:11}}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── 정통 사주 ───────────────────────────────
const SajuScreen = ({profiles,onAddProfile,mode="saju"}) => {
  const [sel,setSel]     = useState(null);
  const [result,setResult] = useState(null);
  const [detail,setDetail] = useState(null); // "직업"|"연애"|"재물"|"건강"
  const [loading,setLoading] = useState(false);
  const [detailLoading,setDetailLoading] = useState(false);
  const [step,setStep] = useState("pick"); // pick|result

  const isShinnyeon = mode==="newyear";

  const read = async () => {
    if(!sel) return;
    setLoading(true); setResult(null); setDetail(null); setStep("result");
    const {yp,mp,dp,tp,el} = sel.saju;
    const born=`${sel.y}년 ${sel.m}월 ${sel.d}일${sel.h!=null?" "+sel.h+"시":""}`;
    const title = isShinnyeon?"2026년 신년 사주":"정통 사주팔자";
    const scope = isShinnyeon?"2026년 한 해의 운세 흐름":"타고난 기질과 전체적인 운세";

    const prompt=`당신은 한국 전통 사주명리학 전문가입니다.
[${title}] 정확히 계산된 사주팔자를 해석해주세요.
생년월일: ${born} / 이름: ${sel.name} / 성별: ${sel.gender}
년주:${yp} 월주:${mp} 일주:${dp} 시주:${tp||"미상"} / 주오행:${el}

${isShinnyeon
  ? `2026년 병오(丙午)년의 대운 흐름을 위 사주와 접목하여 분석하세요. 병화(丙火)와 오화(午火)의 에너지가 ${el}오행의 이 사람에게 어떤 영향을 주는지 중심으로.`
  : `일주 ${dp}의 기질, 십성, 오행 관계를 바탕으로 타고난 성격과 운세 흐름을 분석하세요.`}

JSON으로만 응답:
{
  "title": "${isShinnyeon?"2026년 병오년 흐름":"일주 ${dp}의 기질"} (20자)",
  "nature": "${isShinnyeon?"올해 전반적 흐름":"타고난 기질과 성격"} (100자)",
  "flow": "${isShinnyeon?"2026년 상반기/하반기 흐름":"인생 전체 운세 흐름"} (100자)",
  "thisYear": "${isShinnyeon?"올해 주의사항과 기회":"올해 2026년 대운 포인트"} (80자)"
}`;
    try {
      const r=await callAI(prompt); setResult(r);
    } catch{ setResult({error:true}); }
    setLoading(false);
  };

  const readDetail = async (cat) => {
    if(!sel) return;
    setDetailLoading(true); setDetail(null);
    const {yp,mp,dp,tp,el} = sel.saju;
    const catMap={직업:"직업·적성운",연애:"연애·결혼운",재물:"재물·금전운",건강:"건강·체질"};
    const prompt=`한국 전통 사주명리학 전문가입니다.
사주: 년주${yp} 월주${mp} 일주${dp} 시주${tp||"미상"} 오행${el} / 이름:${sel.name} 성별:${sel.gender}
${isShinnyeon?"2026년 병오년 기준으로":"위 사주 기반으로"} [${catMap[cat]}]을 상세 분석하세요.

JSON으로만:
{
  "heading": "한줄 요약 (25자)",
  "detail": "상세 분석 (150자)",
  "point1": "핵심 포인트 1 (60자)",
  "point2": "핵심 포인트 2 (60자)",
  "advice": "실천 조언 (60자)"
}`;
    try {
      const r=await callAI(prompt,800); setDetail({...r,cat});
    } catch{ setDetail({error:true}); }
    setDetailLoading(false);
  };

  if(step==="pick") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:0,textAlign:"center"}}>
        {isShinnyeon?"🎋 신년 사주":"🏮 정통 사주"}
      </h2>
      <ProfilePicker profiles={profiles} selected={sel} onSelect={setSel}
        onAdd={onAddProfile} label="사주를 볼 프로필을 선택하세요"/>
      {sel&&<PillarRow saju={sel.saju}/>}
      <Btn onClick={read} disabled={!sel||loading}>
        {loading?"읽는 중…":"✨ 별의 흐름 읽기"}
      </Btn>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setStep("pick");setResult(null);setDetail(null);}} style={{
          background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"
        }}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:17,margin:0}}>
          {sel?.name}님의 {isShinnyeon?"2026 신년":"정통"} 사주
        </h2>
      </div>

      {sel&&<PillarRow saju={sel.saju}/>}

      {loading&&<GlassCard><Spinner/></GlassCard>}

      {result&&!result.error&&(
        <GlassCard glow>
          <div style={{
            display:"inline-block",padding:"4px 14px",borderRadius:20,marginBottom:12,
            background:"rgba(109,40,217,0.2)",border:`1px solid ${C.purple}55`,
            color:C.purple,fontFamily:FONT,fontSize:12
          }}>{sel.saju.el}오행 · 일주 {sel.saju.dp}</div>
          <h3 style={{color:C.gold,fontFamily:FONT,fontSize:16,margin:"0 0 12px"}}>
            {result.title}
          </h3>
          <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,marginBottom:10}}>
            {result.nature}
          </p>
          <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,marginBottom:10}}>
            {result.flow}
          </p>
          <div style={{
            background:"rgba(212,168,75,0.08)",border:`1px solid ${C.gold}44`,
            borderRadius:10,padding:"10px 14px"
          }}>
            <div style={{color:C.gold,fontFamily:FONT,fontSize:11,marginBottom:4}}>⭐ {isShinnyeon?"2026년 포인트":"올해 포인트"}</div>
            <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.7,margin:0}}>{result.thisYear}</p>
          </div>
        </GlassCard>
      )}

      {/* 상세 운세 선택 */}
      {result&&!result.error&&(
        <GlassCard>
          <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:12}}>상세 운세 보기</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
            {["직업","연애","재물","건강"].map(cat=>(
              <button key={cat} onClick={()=>readDetail(cat)} style={{
                padding:"12px 0",borderRadius:12,border:`1px solid ${C.border}`,
                cursor:"pointer",fontFamily:FONT,fontSize:13,
                background:detail?.cat===cat?"rgba(109,40,217,0.3)":"rgba(255,255,255,0.03)",
                color:detail?.cat===cat?C.text:C.sub,
              }}>
                {{"직업":"💼 직업운","연애":"💕 연애운","재물":"💰 재물운","건강":"🌿 건강운"}[cat]}
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      {detailLoading&&<GlassCard><Spinner msg="상세 운세 읽는 중…"/></GlassCard>}
      {detail&&!detail.error&&(
        <GlassCard glow>
          <div style={{color:C.cyan,fontFamily:FONT,fontSize:15,marginBottom:10}}>
            {{"직업":"💼","연애":"💕","재물":"💰","건강":"🌿"}[detail.cat]} {detail.heading}
          </div>
          <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,marginBottom:12}}>
            {detail.detail}
          </p>
          {[detail.point1,detail.point2].map((pt,i)=>(
            <div key={i} style={{
              background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 14px",
              border:`1px solid ${C.border}`,marginBottom:8
            }}>
              <p style={{color:C.text,fontFamily:FONT,fontSize:12,lineHeight:1.7,margin:0}}>{pt}</p>
            </div>
          ))}
          <div style={{
            background:"rgba(126,207,207,0.08)",border:`1px solid ${C.cyan}44`,
            borderRadius:10,padding:"10px 14px"
          }}>
            <div style={{color:C.cyan,fontFamily:FONT,fontSize:11,marginBottom:4}}>💡 조언</div>
            <p style={{color:C.text,fontFamily:FONT,fontSize:12,lineHeight:1.7,margin:0}}>{detail.advice}</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// ─── 궁합 ────────────────────────────────────
const GunghamScreen = ({profiles,onAddProfile}) => {
  const [selA,setSelA] = useState(null);
  const [selB,setSelB] = useState(null);
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);
  const [step,setStep] = useState("pick");

  const read = async () => {
    setLoading(true); setResult(null); setStep("result");
    const f=(p)=>`년주${p.saju.yp} 월주${p.saju.mp} 일주${p.saju.dp} 시주${p.saju.tp||"미상"} 오행${p.saju.el}`;
    const prompt=`한국 전통 사주명리학 전문가입니다. 두 사람의 사주를 비교하여 궁합을 분석하세요.
천간지지합, 음양오행, 십성 충·합·형·파를 모두 고려하세요.

[A] ${selA.name}(${selA.gender}) ${selA.y}.${selA.m}.${selA.d}: ${f(selA)}
[B] ${selB.name}(${selB.gender}) ${selB.y}.${selB.m}.${selB.d}: ${f(selB)}

JSON으로만:
{
  "score": 0~100,
  "grade": "최상/상/중/하/최하",
  "summary": "전체 궁합 총평 (100자)",
  "strong": "두 관계의 장점 (80자)",
  "careful": "조심해야 할 것 (80자)",
  "intimate": "속궁합·감정 교류 (80자)",
  "marriage": "결혼운·장기적 관계 (80자)",
  "element_match": "오행 상생/상극 관계 설명 (60자)",
  "pillar_match": "천간지지 합·충 분석 (60자)",
  "keyword": "이 인연을 상징하는 키워드 3개 쉼표구분"
}`;
    try {
      const r=await callAI(prompt,1000); setResult(r);
    } catch{ setResult({error:true}); }
    setLoading(false);
  };

  const gradeColor={"최상":"#22c55e","상":"#86efac","중":C.gold,"하":"#f87171","최하":"#ef4444"};

  if(step==="pick") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:0,textAlign:"center"}}>💞 사주 궁합</h2>
      <ProfilePicker profiles={profiles} selected={selA} onSelect={p=>{if(p.id!==selB?.id)setSelA(p);}}
        onAdd={onAddProfile} label="첫 번째 사람"/>
      <ProfilePicker profiles={profiles} selected={selB} onSelect={p=>{if(p.id!==selA?.id)setSelB(p);}}
        onAdd={onAddProfile} label="두 번째 사람"/>
      <Btn variant="rose" onClick={read} disabled={!selA||!selB||loading}>
        💕 궁합 보기
      </Btn>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setStep("pick");setResult(null);}} style={{
          background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"
        }}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:17,margin:0}}>
          {selA?.name} ✦ {selB?.name}
        </h2>
      </div>
      {loading&&<GlassCard><Spinner/></GlassCard>}
      {result&&!result.error&&(
        <>
          <GlassCard glow style={{textAlign:"center"}}>
            <div style={{fontSize:52,fontFamily:FONT,color:gradeColor[result.grade]||C.purple,marginBottom:8,fontWeight:"bold"}}>
              {result.score}점
            </div>
            <div style={{
              display:"inline-block",padding:"4px 18px",borderRadius:20,marginBottom:12,
              background:`${gradeColor[result.grade]||C.purple}22`,
              border:`1px solid ${gradeColor[result.grade]||C.purple}66`,
              color:gradeColor[result.grade]||C.purple,fontFamily:FONT,fontSize:14
            }}>{result.grade} 궁합</div>
            <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:"0 0 12px"}}>
              {result.summary}
            </p>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              {result.keyword?.split(",").map(k=>(
                <span key={k} style={{
                  padding:"3px 12px",borderRadius:20,fontFamily:FONT,fontSize:11,
                  background:"rgba(109,40,217,0.2)",border:`1px solid ${C.purple}44`,color:C.purple
                }}>{k.trim()}</span>
              ))}
            </div>
          </GlassCard>

          {/* 사주 비교 */}
          <GlassCard>
            <p style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:10}}>사주 분석</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[{l:"오행 관계",v:result.element_match},{l:"천간지지",v:result.pillar_match}].map(({l,v})=>(
                <div key={l} style={{
                  background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"10px 14px",border:`1px solid ${C.border}`
                }}>
                  <span style={{color:C.sub,fontFamily:FONT,fontSize:11}}>{l} · </span>
                  <span style={{color:C.text,fontFamily:FONT,fontSize:12}}>{v}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {[
            {icon:"💪",label:"두 관계의 장점",v:result.strong,col:C.cyan},
            {icon:"⚠️",label:"조심해야 할 것",v:result.careful,col:"#f87171"},
            {icon:"💗",label:"속궁합",v:result.intimate,col:C.rose},
            {icon:"💍",label:"결혼운",v:result.marriage,col:C.gold},
          ].map(({icon,label,v,col})=>(
            <GlassCard key={label}>
              <div style={{color:col,fontFamily:FONT,fontSize:13,marginBottom:6}}>{icon} {label}</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:0}}>{v}</p>
            </GlassCard>
          ))}
        </>
      )}
    </div>
  );
};

// ─── 타로 ────────────────────────────────────
const TarotScreen = ({}) => {
  const CATS = [
    {id:"신년",label:"신년 운세",icon:"🎋",count:3},
    {id:"애정",label:"애정운",icon:"💕",count:11},
    {id:"건강",label:"건강운",icon:"🌿",count:11},
    {id:"재물",label:"재물운",icon:"💰",count:11},
    {id:"취업",label:"취업운",icon:"💼",count:11},
    {id:"학업",label:"학업운",icon:"📚",count:11},
  ];
  const [cat,setCat] = useState(null);
  const [phase,setPhase] = useState("pick"); // pick|select|result
  const [pickedCards,setPickedCards] = useState([]);
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);

  const analyze = async (cards) => {
    setLoading(true); setResult(null);
    const info = cards.map((c,i)=>
      `[${i+1}] ${c.kr}(${c.rev?"역방향":"정방향"}): ${c.rev?c.rev:c.up}`
    ).join("\n");
    const isShinnyeon = cat.id==="신년";
    const positions = isShinnyeon
      ? "카드1=과거흐름, 카드2=현재상황, 카드3=미래방향"
      : "카드1~3=과거, 카드4~7=현재, 카드8~11=미래";
    const prompt=`당신은 타로 마스터입니다. [${cat.label}] 리딩을 해주세요.
포지션: ${positions}

뽑힌 카드:
${info}

타로 카드 본연의 의미에 충실하게, 정/역방향을 정확히 반영하여 해석하세요.
JSON으로만 응답:
{
  "overall": "전체 관통 메시지 (80자)",
  ${isShinnyeon
    ? '"past":"과거흐름 해석(60자)","present":"현재상황 해석(60자)","future":"미래방향 해석(60자)",'
    : '"past":"과거 3장 통합 해석(80자)","present":"현재 4장 통합 해석(80자)","future":"미래 4장 통합 해석(80자)",'
  }
  "cards": [${cards.map((_,i)=>`"카드${i+1} 이 자리에서의 의미 (45자)"`).join(",")}],
  "keyword": "핵심 키워드 3개 쉼표구분",
  "advice": "실천 조언 (60자)"
}`;
    try {
      const r=await callAI(prompt,1500);
      setResult({
        ...r,
        cards: r.cards.map((reading,i)=>reading)
      });
    } catch{ setResult({error:true}); }
    setLoading(false);
  };

  if(phase==="pick") return (
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:"0 0 20px",textAlign:"center"}}>🃏 타로</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {CATS.map(c=>(
          <div key={c.id} onClick={()=>{setCat(c);setPhase("select");setPickedCards([]);setResult(null);}} style={{
            background:C.card,border:`1px solid ${C.border}`,borderRadius:16,
            padding:"20px 14px",cursor:"pointer",textAlign:"center"
          }}>
            <div style={{fontSize:28,marginBottom:8}}>{c.icon}</div>
            <div style={{color:C.text,fontFamily:FONT,fontSize:13,marginBottom:4}}>{c.label}</div>
            <div style={{color:C.sub,fontFamily:FONT,fontSize:10}}>{c.count}장 선택</div>
          </div>
        ))}
      </div>
    </div>
  );

  if(phase==="select") return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setPhase("pick")} style={{
          background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"
        }}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:17,margin:0}}>
          {cat.icon} {cat.label} ({cat.count}장)
        </h2>
      </div>
      <GlassCard>
        <TarotSelector count={cat.count} onDone={cards=>{
          setPickedCards(cards);
          setPhase("result");
          analyze(cards);
        }}/>
      </GlassCard>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setPhase("pick");setResult(null);setPickedCards([]);}} style={{
          background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"
        }}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:17,margin:0}}>
          {cat.icon} {cat.label}
        </h2>
      </div>

      {loading&&<GlassCard><Spinner msg="타로 카드를 읽는 중…"/></GlassCard>}

      {result&&!result.error&&(
        <>
          <GlassCard glow>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {result.keyword?.split(",").map(k=>(
                <span key={k} style={{
                  padding:"3px 10px",borderRadius:20,fontFamily:FONT,fontSize:11,
                  background:"rgba(109,40,217,0.2)",border:`1px solid ${C.purple}44`,color:C.purple
                }}>{k.trim()}</span>
              ))}
            </div>
            <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,marginBottom:10}}>{result.overall}</p>
            <div style={{background:"rgba(212,168,75,0.08)",border:`1px solid ${C.gold}44`,borderRadius:10,padding:"10px 14px"}}>
              <div style={{color:C.gold,fontFamily:FONT,fontSize:11,marginBottom:4}}>💡 조언</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:12,lineHeight:1.7,margin:0}}>{result.advice}</p>
            </div>
          </GlassCard>
          <TarotSpreadResult
            cards={pickedCards}
            interpretation={{
              past:result.past, present:result.present, future:result.future,
              overall:result.overall,
              cards:result.cards
            }}
            layout={cat.id}
          />
        </>
      )}
    </div>
  );
};

// ─── 별자리 ──────────────────────────────────
const ZODIAC_LIST = [
  {sign:"양자리",emoji:"♈",range:"3/21~4/19"},
  {sign:"황소자리",emoji:"♉",range:"4/20~5/20"},
  {sign:"쌍둥이자리",emoji:"♊",range:"5/21~6/21"},
  {sign:"게자리",emoji:"♋",range:"6/22~7/22"},
  {sign:"사자자리",emoji:"♌",range:"7/23~8/22"},
  {sign:"처녀자리",emoji:"♍",range:"8/23~9/22"},
  {sign:"천칭자리",emoji:"♎",range:"9/23~10/22"},
  {sign:"전갈자리",emoji:"♏",range:"10/23~11/21"},
  {sign:"사수자리",emoji:"♐",range:"11/22~12/21"},
  {sign:"염소자리",emoji:"♑",range:"12/22~1/19"},
  {sign:"물병자리",emoji:"♒",range:"1/20~2/18"},
  {sign:"물고기자리",emoji:"♓",range:"2/19~3/20"},
];
const getZodiac = (m,d) => {
  const v=m*100+d;
  if(v>=321&&v<=419)return ZODIAC_LIST[0];if(v>=420&&v<=520)return ZODIAC_LIST[1];
  if(v>=521&&v<=621)return ZODIAC_LIST[2];if(v>=622&&v<=722)return ZODIAC_LIST[3];
  if(v>=723&&v<=822)return ZODIAC_LIST[4];if(v>=823&&v<=922)return ZODIAC_LIST[5];
  if(v>=923&&v<=1022)return ZODIAC_LIST[6];if(v>=1023&&v<=1121)return ZODIAC_LIST[7];
  if(v>=1122&&v<=1221)return ZODIAC_LIST[8];
  if(v>=1222||v<=119)return ZODIAC_LIST[9];
  if(v>=120&&v<=218)return ZODIAC_LIST[10];return ZODIAC_LIST[11];
};

const ZodiacScreen = ({profiles}) => {
  const [sel,setSel] = useState(null);
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);

  const read = async (zod) => {
    setLoading(true); setResult(null);
    const today=new Date().toLocaleDateString("ko-KR");
    const prompt=`오늘(${today}) ${zod.sign}(${zod.emoji})의 운세를 사주명리학과 서양 점성술을 접목하여 알려주세요.
JSON으로만:
{
  "overall":"종합운 한줄(30자)",
  "love":"연애운(50자)","money":"재물운(50자)","work":"직업운(50자)","health":"건강운(40자)",
  "score":{"love":0~100,"money":0~100,"work":0~100,"health":0~100},
  "lucky":"오늘의 행운 아이템(15자)",
  "message":"오늘의 별자리 메시지(70자)"
}`;
    try{ const r=await callAI(prompt,800); setResult({...r,zod}); }
    catch{ setResult({error:true}); }
    setLoading(false);
  };

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:0,textAlign:"center"}}>🌠 별자리 운세</h2>

      {/* 프로필 기반 자동 제안 */}
      {profiles.length>0&&(
        <GlassCard>
          <p style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:10}}>프로필 별자리</p>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {profiles.slice(0,3).map(p=>{
              const z=getZodiac(p.m,p.d);
              return (
                <div key={p.id} onClick={()=>{setSel(z);read(z);}} style={{
                  display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
                  borderRadius:12,cursor:"pointer",border:`1px solid ${C.border}`,
                  background:"rgba(255,255,255,0.02)"
                }}>
                  <span style={{fontSize:24}}>{z.emoji}</span>
                  <div>
                    <div style={{color:C.text,fontFamily:FONT,fontSize:13}}>{p.name} · {z.sign}</div>
                    <div style={{color:C.sub,fontFamily:FONT,fontSize:10}}>{z.range}</div>
                  </div>
                  <span style={{marginLeft:"auto",color:C.purple,fontFamily:FONT,fontSize:12}}>보기 →</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* 전체 별자리 그리드 */}
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:10}}>별자리 선택</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {ZODIAC_LIST.map(z=>(
            <button key={z.sign} onClick={()=>{setSel(z);read(z);}} style={{
              padding:"12px 4px",borderRadius:12,border:`1px solid ${sel?.sign===z.sign?C.purple:C.border}`,
              background:sel?.sign===z.sign?"rgba(109,40,217,0.2)":"rgba(255,255,255,0.02)",
              cursor:"pointer",fontFamily:FONT,textAlign:"center"
            }}>
              <div style={{fontSize:22,marginBottom:4}}>{z.emoji}</div>
              <div style={{color:C.text,fontSize:10}}>{z.sign}</div>
            </button>
          ))}
        </div>
      </GlassCard>

      {loading&&<GlassCard><Spinner/></GlassCard>}
      {result&&!result.error&&(
        <GlassCard glow>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:40,marginBottom:6}}>{result.zod.emoji}</div>
            <div style={{color:C.text,fontFamily:FONT,fontSize:16}}>{result.zod.sign}</div>
            <p style={{color:C.sub,fontFamily:FONT,fontSize:13,marginTop:6}}>"{result.overall}"</p>
          </div>
          {/* 점수 바 */}
          {[["💕 연애운","love",C.rose],["💰 재물운","money",C.gold],["💼 직업운","work",C.cyan],["🌿 건강운","health","#86efac"]].map(([l,k,col])=>(
            <div key={k} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{color:C.sub,fontFamily:FONT,fontSize:12}}>{l}</span>
                <span style={{color:col,fontFamily:FONT,fontSize:12}}>{result.score?.[k]}점</span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${result.score?.[k]||0}%`,background:col,borderRadius:3,transition:"width 1s"}}/>
              </div>
            </div>
          ))}
          {[["💕 연애운","love"],["💰 재물운","money"],["💼 직업운","work"],["🌿 건강운","health"]].map(([l,k])=>(
            <div key={k} style={{
              background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"10px 14px",
              border:`1px solid ${C.border}`,marginBottom:8
            }}>
              <div style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:3}}>{l}</div>
              <div style={{color:C.text,fontFamily:FONT,fontSize:12}}>{result[k]}</div>
            </div>
          ))}
          <div style={{
            marginTop:6,padding:"10px 14px",background:"rgba(212,168,75,0.08)",
            border:`1px solid ${C.gold}44`,borderRadius:10,textAlign:"center"
          }}>
            <div style={{color:C.gold,fontFamily:FONT,fontSize:12,marginBottom:4}}>✨ {result.lucky}</div>
            <div style={{color:C.text,fontFamily:FONT,fontSize:13}}>"{result.message}"</div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// ─── 운세 챗 ─────────────────────────────────
const CHAT_STORE_KEY = "starflow_chats_v1";

// 채팅 목록 로드
const loadChats = () => {
  try { return JSON.parse(localStorage.getItem(CHAT_STORE_KEY)||"[]"); } catch { return []; }
};
// 채팅 저장
const saveChats = (list) => {
  try { localStorage.setItem(CHAT_STORE_KEY, JSON.stringify(list)); } catch {}
};
// 단일 채팅 upsert
const upsertChat = (chat) => {
  const list = loadChats();
  const idx = list.findIndex(c=>c.id===chat.id);
  if(idx>=0) list[idx]=chat; else list.unshift(chat);
  saveChats(list);
};

const ChatScreen = ({profiles,onAddProfile}) => {
  // phase: "list" | "setup_saju" | "setup_tarot" | "chat"
  const [phase,setPhase]           = useState("list");
  const [chatList,setChatList]     = useState(()=>loadChats());
  const [activeChatId,setActiveChatId] = useState(null);
  const [expert,setExpert]         = useState(null);
  const [chatType,setChatType]     = useState(null);
  const [selProfiles,setSelProfiles] = useState([]);
  const [msgs,setMsgs]             = useState([]);
  const [input,setInput]           = useState("");
  const [loading,setLoading]       = useState(false);
  const [tarotPhase,setTarotPhase] = useState(null);
  const [tarotCards,setTarotCards] = useState([]);
  const bottomRef = useRef(null);
  const chatIdRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  // msgs 바뀔 때마다 자동 저장
  useEffect(()=>{
    if(!chatIdRef.current||msgs.length===0) return;
    const chat = {
      id: chatIdRef.current,
      expert, chatType,
      profiles: selProfiles.map(p=>({id:p.id,name:p.name})),
      title: buildTitle(expert,selProfiles,chatType),
      msgs,
      updatedAt: Date.now(),
    };
    upsertChat(chat);
    setChatList(loadChats());
  },[msgs]);

  const buildTitle = (exp,profs,ct) => {
    const expName = exp==="saju"?"문어마녀":"불가사리";
    const names = profs.map(p=>p.name).join("·");
    return `${expName}${names?" · "+names:""}${ct==="gungham"?" 궁합":""}`;
  };

  const formatDate = (ts) => {
    const d=new Date(ts);
    const now=new Date();
    const diffD=Math.floor((now-d)/86400000);
    if(diffD===0) return d.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"});
    if(diffD===1) return "어제";
    if(diffD<7) return `${diffD}일 전`;
    return d.toLocaleDateString("ko-KR",{month:"short",day:"numeric"});
  };

  const sajuContext = () => {
    if(selProfiles.length===0) return "";
    if(chatType==="individual"){
      const p=selProfiles[0];
      const s=p.saju||{};
      return `[상담자 사주] ${p.name}(${p.gender||""}, ${p.y||""}.${p.m||""}.${p.d||""}): 년주${s.yp||""} 월주${s.mp||""} 일주${s.dp||""} 시주${s.tp||"미상"} 오행${s.el||""}`;
    }
    return selProfiles.map(p=>{
      const s=p.saju||{};
      return `[${p.name}] 년주${s.yp||""} 월주${s.mp||""} 일주${s.dp||""} 시주${s.tp||"미상"} 오행${s.el||""}`;
    }).join("\n");
  };

  const suggestQuestions = (exp) => {
    if(exp==="saju")  return ["올해 전반적인 흐름이 궁금해요","연애운이 어떤가요?","직업/진로에 대해 알려주세요","재물운과 투자 타이밍은?"];
    if(exp==="love")  return ["상대방이 저를 좋아하는 걸까요?","연락을 먼저 해야 할까요?","이 관계를 계속해도 될까요?","재회 가능성이 있을까요?"];
    return ["지금 연애를 시작해도 될까요?","이 결정이 맞는 선택인가요?","올해 가장 조심해야 할 것은?","새로운 도전을 해도 될까요?"];
  };

  const sendMessage = async (text) => {
    if(!text.trim()||loading) return;
    const userMsg={role:"user",content:text};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs); setInput(""); setLoading(true);
    try {
      const context=sajuContext();
      const isGungham=chatType==="gungham";
      const loveStyle = chatType==="factual"
        ? "팩트 중심 직설 화법: 잘잘못을 명확히 짚고, 감정보다 현실적 판단을 우선해. 단호하게 조언하되 상담자를 무시하지 않는다."
        : "온건한 응원 화법: 상담자와 상대방 양쪽의 감정을 모두 이해하고 공감하며, 관계가 긍정적으로 흘러가는 방향으로 안내한다.";
      const systemCtx = expert==="saju"
        ? `당신은 '문어마녀'라는 이름의 한국 전통 사주명리학 전문가입니다. 신비롭고 따뜻한 어조로 상담하며 존댓말을 사용합니다.\n${context}\n${isGungham?"위 두 사람의 궁합을 기반으로 답해주세요.":"위 사주를 기반으로 구체적으로 답해주세요."}\n대화 기록을 참고하여 일관된 답변을 해주세요.`
        : expert==="love"
        ? `당신은 '별주부'라는 이름의 연애 심리 상담사입니다. 오은영·이호선 선생님처럼 지혜롭고 따뜻하면서도 조언은 명확합니다.
상담자 성별: ${selProfiles[0]?.gender||"미상"}
상담 톤: ${loveStyle}

핵심 원칙:
1. 먼저 깊이 공감하고 상담자의 감정을 충분히 어루만진 후 조언한다.
2. 연애 상대의 마음도 심리학적으로 분석해 설명한다.
3. "상대가 나를 좋아할까요?" 류의 질문은 상황이 충분하면 빅데이터·심리학 기반으로 가능성을 직접 판단해준다. 상황이 부족하면 "조금 더 구체적으로 말씀해 주세요"라고 요청한다.
4. 재회 상담 시: 상담자가 여성이면 NO CONTACT 전략이 통계적으로 더 효과적임을 설명하고, 남성이면 빠른 행동이 유리한 이유를 설명한다.
5. 답변 마지막에 상담자가 바로 실천할 수 있는 구체적인 행동 조언 1가지를 준다.
6. 존댓말 사용. 200자 내외로 답변하되 필요하면 길게 써도 된다.`
        : `당신은 '불가사리'라는 이름의 타로 전문가입니다. 공감 능력이 뛰어나고 신비로운 어조로 상담합니다.\n타로 카드의 본연 의미에 충실하게 해석하고, 카드를 선택해야 할 시점에는 반드시 "카드를 선택해주세요"라는 문구를 포함하세요.\n${tarotCards.length>0?`[선택된 타로 카드]\n${tarotCards.map((c,i)=>`${i+1}. ${c.kr}(${c.rev?"역방향":"정방향"}): ${c.rev?c.rev:c.up}`).join("\n")}`:""}`;

      const history=newMsgs.slice(-10).map(m=>({role:m.role,content:m.content}));
      const res=await fetch(API_URL,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:systemCtx,messages:history})
      });
      const data=await res.json();
      let reply=data.content[0].text;

      let needTarot=false;
      if(expert==="tarot"&&(reply.includes("카드를 선택")||reply.includes("뽑아주세요")||reply.includes("needTarot"))){
        needTarot=true;
      }

      setMsgs(prev=>[...prev,{role:"assistant",content:reply,suggestions:suggestQuestions(expert),needTarot}]);
      if(needTarot) setTarotPhase("select");
    } catch(e){
      setMsgs(prev=>[...prev,{role:"assistant",content:"별의 기운이 흐트러졌습니다. 다시 시도해주세요."}]);
    }
    setLoading(false);
  };

  const onTarotDone = async (cards) => {
    setTarotCards(cards); setTarotPhase("reading");

    // 화면에는 "카드를 선택했어요" 만 표시
    const displayMsg = {role:"user", content:"🃏 카드를 선택했어요"};
    const newMsgs = [...msgs, displayMsg];
    setMsgs(newMsgs);
    setLoading(true);

    // AI에는 실제 카드 정보 전달 (화면엔 안 보임)
    const info = cards.map((c,i)=>`${i+1}. ${c.kr}(${c.rev?"역방향":"정방향"}): ${c.rev?c.rev:c.up}`).join("\n");
    const hiddenPrompt = `상담자가 타로 카드를 선택했습니다. 아래 카드를 해석해주세요:\n${info}\n카드 의미에 충실히, 앞선 상담 맥락을 반영하여 따뜻하고 통찰력 있게 해석해주세요. 해석을 마친 후 "새로운 질문이 있으시면 편하게 말씀해 주세요 🌟" 라고 안내해주세요.`;

    try {
      const context = sajuContext();
      const systemCtx = `당신은 '불가사리'라는 이름의 타로 전문가입니다. 공감 능력이 뛰어나고 신비로운 어조로 상담합니다.\n타로 카드의 본연 의미에 충실하게 해석하세요.`;
      // history는 화면 메시지 기반 (displayMsg 포함) + 마지막을 hiddenPrompt로 교체
      const history = [
        ...newMsgs.slice(-10, -1).map(m=>({role:m.role, content:m.content})),
        {role:"user", content:hiddenPrompt}
      ];
      const res = await fetch(API_URL, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-20250514", max_tokens:1000, system:systemCtx, messages:history})
      });
      const data = await res.json();
      const reply = data.content[0].text;
      setMsgs(prev=>[...prev, {role:"assistant", content:reply, suggestions:suggestQuestions(expert)}]);
    } catch(e) {
      setMsgs(prev=>[...prev, {role:"assistant", content:"별의 기운이 흐트러졌습니다. 다시 시도해주세요."}]);
    }
    setLoading(false);
    setTarotPhase(null); setTarotCards([]);
  };

  // 새 채팅 시작
  const startNewChat = (exp, profs, ct, initMsg) => {
    const id = Date.now().toString();
    chatIdRef.current = id;
    setActiveChatId(id);
    setExpert(exp); setChatType(ct); setSelProfiles(profs);
    setMsgs([{role:"assistant",content:initMsg,suggestions:suggestQuestions(exp)}]);
    setTarotPhase(null); setTarotCards([]);
    setPhase("chat");
  };

  // 기존 채팅 불러오기
  const openExistingChat = (chat) => {
    chatIdRef.current = chat.id;
    setActiveChatId(chat.id);
    setExpert(chat.expert);
    setChatType(chat.chatType);
    // 프로필 매칭
    const matched = (chat.profiles||[]).map(cp=>profiles.find(p=>p.id===cp.id)||cp).filter(Boolean);
    setSelProfiles(matched);
    setMsgs(chat.msgs||[]);
    setTarotPhase(null); setTarotCards([]);
    setPhase("chat");
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    const updated = loadChats().filter(c=>c.id!==id);
    saveChats(updated);
    setChatList(updated);
  };

  const EXPERTS = {
    saju:  {icon:"🐙", name:"문어마녀", color:C.purple},
    tarot: {icon:"🌟", name:"불가사리", color:C.cyan},
    love:  {icon:"🐢", name:"별주부",   color:C.rose},
  };
  const expertInfo = EXPERTS[expert] || EXPERTS.tarot;

  // ── 채팅 목록 화면 ─────────────────────────────
  if(phase==="list") return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:0}}>🔮 운세 챗</h2>
      </div>

      {/* 전문가 선택 버튼 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
        {[
          {id:"saju",  icon:"🐙",name:"문어마녀",sub:"사주",    color:C.purple},
          {id:"tarot", icon:"🌟",name:"불가사리",sub:"타로",    color:C.cyan},
          {id:"love",  icon:"🐢",name:"별주부",  sub:"연애상담",color:C.rose},
        ].map(e=>(
          <button key={e.id} onClick={()=>{
            setExpert(e.id);
            setPhase(e.id==="saju"?"setup_saju":e.id==="love"?"setup_love":"setup_tarot");
          }} style={{
            padding:"14px 6px",borderRadius:16,border:`1px solid ${C.border}`,
            cursor:"pointer",textAlign:"center",background:C.card,
          }}>
            <div style={{fontSize:24,marginBottom:4}}>{e.icon}</div>
            <div style={{color:C.text,fontFamily:FONT,fontSize:11}}>{e.name}</div>
            <div style={{color:e.color,fontFamily:FONT,fontSize:9,marginTop:2}}>{e.sub}</div>
          </button>
        ))}
      </div>

      {/* 이전 채팅 목록 */}
      {chatList.length>0&&(
        <>
          <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:10}}>이전 채팅</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {chatList.map(chat=>{
              const expInfo=chat.expert==="saju"
                ?{icon:"🐙",color:C.purple}
                :chat.expert==="love"
                ?{icon:"🐢",color:C.rose}
                :{icon:"🌟",color:C.cyan};
              const lastMsg=chat.msgs?.filter(m=>m.role==="assistant").slice(-1)[0];
              return (
                <div key={chat.id} onClick={()=>openExistingChat(chat)} style={{
                  background:C.card,border:`1px solid ${C.border}`,borderRadius:16,
                  padding:"14px 16px",cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start",
                }}>
                  <div style={{
                    width:40,height:40,borderRadius:"50%",flexShrink:0,
                    background:`radial-gradient(circle,${expInfo.color}33,transparent)`,
                    border:`1px solid ${expInfo.color}44`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
                  }}>{expInfo.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{color:C.text,fontFamily:FONT,fontSize:13,fontWeight:"bold"}}>{chat.title}</span>
                      <span style={{color:C.sub,fontFamily:FONT,fontSize:10,flexShrink:0,marginLeft:8}}>{formatDate(chat.updatedAt)}</span>
                    </div>
                    <p style={{
                      color:C.sub,fontFamily:FONT,fontSize:12,margin:0,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                    }}>{lastMsg?.content?.slice(0,45)||"..."}</p>
                    <span style={{
                      display:"inline-block",marginTop:4,fontSize:10,fontFamily:FONT,
                      color:expInfo.color,background:`${expInfo.color}15`,
                      padding:"1px 8px",borderRadius:10,
                    }}>{chat.msgs?.length||0}개 메시지</span>
                  </div>
                  <button onClick={(e)=>deleteChat(chat.id,e)} style={{
                    background:"none",border:"none",color:"rgba(167,139,250,0.3)",
                    fontSize:16,cursor:"pointer",flexShrink:0,padding:"4px",
                  }}>✕</button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {chatList.length===0&&(
        <div style={{textAlign:"center",padding:"40px 0",color:C.sub,fontFamily:FONT,fontSize:13}}>
          위에서 전문가를 선택해 첫 상담을 시작해보세요 ✨
        </div>
      )}
    </div>
  );

  // ── 사주 전문가 셋업 ──────────────────────────
  if(phase==="setup_saju") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setPhase("list");setExpert(null);setChatType(null);setSelProfiles([]);}} style={{
          background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"
        }}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:17,margin:0}}>🐙 문어마녀</h2>
      </div>
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:13,marginBottom:16,textAlign:"center"}}>어떤 상담을 원하시나요?</p>
        <div style={{display:"flex",gap:10}}>
          {[{id:"individual",icon:"👤",label:"개인 상담"},{id:"gungham",icon:"👥",label:"궁합 상담"}].map(t=>(
            <button key={t.id} onClick={()=>setChatType(t.id)} style={{
              flex:1,padding:"16px 8px",borderRadius:14,border:`1px solid ${chatType===t.id?C.purple:C.border}`,
              cursor:"pointer",textAlign:"center",fontFamily:FONT,
              background:chatType===t.id?"rgba(109,40,217,0.25)":"rgba(255,255,255,0.03)",
              color:chatType===t.id?C.text:C.sub
            }}>
              <div style={{fontSize:24,marginBottom:6}}>{t.icon}</div>
              <div style={{fontSize:13}}>{t.label}</div>
            </button>
          ))}
        </div>
      </GlassCard>
      {chatType&&(
        <GlassCard>
          <ProfilePicker
            profiles={profiles}
            selected={chatType==="individual"?selProfiles[0]:selProfiles}
            multi={chatType==="gungham"}
            onSelect={p=>{
              if(chatType==="individual") setSelProfiles([p]);
              else setSelProfiles(prev=>prev.some(s=>s.id===p.id)?prev.filter(s=>s.id!==p.id):[...prev.slice(-1),p]);
            }}
            onAdd={onAddProfile}
            label={chatType==="individual"?"상담 받을 프로필":"두 사람의 프로필 선택"}
          />
        </GlassCard>
      )}
      {((chatType==="individual"&&selProfiles.length===1)||(chatType==="gungham"&&selProfiles.length===2))&&(
        <Btn onClick={()=>{
          const names=selProfiles.map(p=>p.name).join("·");
          const initMsg=chatType==="individual"
            ?`안녕하세요 ✨ 저는 문어마녀예요. ${selProfiles[0].name}님의 사주를 읽어보았어요. ${selProfiles[0].saju?.el||""}오행의 기운이 흐르는군요. 어떤 것이 궁금하신가요?`
            :`안녕하세요 ✨ 저는 문어마녀예요. ${names}님 두 분의 사주를 함께 살펴보았어요. 궁합에 대해 무엇이 궁금하신가요?`;
          startNewChat("saju",selProfiles,chatType,initMsg);
        }}>상담 시작하기</Btn>
      )}
    </div>
  );

  // ── 타로 전문가 셋업 ──────────────────────────
  if(phase==="setup_tarot") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setPhase("list");setExpert(null);}} style={{
          background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"
        }}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:17,margin:0}}>🌟 불가사리</h2>
      </div>
      <GlassCard>
        <p style={{color:C.text,fontFamily:FONT,fontSize:14,marginBottom:8}}>안녕하세요 ✨</p>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:13,lineHeight:1.7,margin:0}}>
          저는 불가사리예요. 78장의 타로 카드로 당신의 고민에 함께할게요.<br/>
          어떤 것이 궁금하신가요? 먼저 고민을 말씀해 주세요.
        </p>
      </GlassCard>
      <Btn onClick={()=>{
        startNewChat("tarot",[],null,"안녕하세요 ✨ 저는 불가사리예요. 고민이 있으신가요? 편하게 말씀해 주세요.");
      }}>상담 시작하기</Btn>
    </div>
  );

  // ── 연애상담 셋업 ─────────────────────────────
  if(phase==="setup_love") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setPhase("list");setExpert(null);setChatType(null);}} style={{
          background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"
        }}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:17,margin:0}}>🐢 별주부</h2>
      </div>

      {/* 소개 */}
      <GlassCard>
        <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{
            width:52,height:52,borderRadius:"50%",flexShrink:0,
            background:`radial-gradient(circle,${C.rose}44,transparent)`,
            border:`1px solid ${C.rose}55`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,
          }}>🐢</div>
          <div>
            <p style={{color:C.text,fontFamily:FONT,fontSize:14,margin:"0 0 6px"}}>안녕하세요, 저는 별주부예요 🌊</p>
            <p style={{color:C.sub,fontFamily:FONT,fontSize:12,lineHeight:1.7,margin:0}}>
              심리학과 빅데이터를 기반으로 연애의 모든 것을 함께 고민해드려요.
              솔직하고 현실적인 조언으로 당신의 마음을 정리해드릴게요.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 상담자 성별 */}
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:12}}>상담자 성별을 알려주세요</p>
        <div style={{display:"flex",gap:8}}>
          {[{v:"여",label:"👩 여성"},{v:"남",label:"👨 남성"}].map(g=>(
            <button key={g.v} onClick={()=>setSelProfiles([{gender:g.v,name:g.v==="여"?"나(여성)":"나(남성)"}])} style={{
              flex:1,padding:"12px 0",borderRadius:10,border:`1px solid ${selProfiles[0]?.gender===g.v?C.rose:C.border}`,
              cursor:"pointer",fontFamily:FONT,fontSize:13,
              background:selProfiles[0]?.gender===g.v?`rgba(212,124,155,0.2)`:"rgba(255,255,255,0.03)",
              color:selProfiles[0]?.gender===g.v?C.text:C.sub,
            }}>{g.label}</button>
          ))}
        </div>
      </GlassCard>

      {/* 이야기 톤 선택 */}
      {selProfiles.length>0&&(
        <GlassCard>
          <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:12}}>이야기 톤을 어떻게 할까요?</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {
                id:"factual",
                icon:"⚡",
                label:"현실적 팩트폭력",
                desc:"잘잘못을 명확히 짚어드려요. 감정보다 현실을 직시하는 솔직한 조언",
                color:"#f87171",
              },
              {
                id:"gentle",
                icon:"🌸",
                label:"온건한 관계 응원가",
                desc:"두 사람 모두의 마음을 이해하며 관계가 좋은 방향으로 흐르도록 함께해요",
                color:C.rose,
              },
            ].map(t=>(
              <div key={t.id} onClick={()=>setChatType(t.id)} style={{
                padding:"14px 16px",borderRadius:14,cursor:"pointer",
                border:`1px solid ${chatType===t.id?t.color:C.border}`,
                background:chatType===t.id?`${t.color}18`:"rgba(255,255,255,0.02)",
                transition:"all 0.2s",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:18}}>{t.icon}</span>
                  <span style={{color:chatType===t.id?t.color:C.text,fontFamily:FONT,fontSize:14}}>{t.label}</span>
                  {chatType===t.id&&<span style={{marginLeft:"auto",color:t.color,fontSize:16}}>✓</span>}
                </div>
                <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:0,lineHeight:1.6}}>{t.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {selProfiles.length>0&&chatType&&(
        <Btn variant="rose" onClick={()=>{
          const gender = selProfiles[0]?.gender;
          const toneLabel = chatType==="factual"?"⚡ 팩트폭력 모드":"🌸 응원가 모드";
          const initMsg = `안녕하세요 🐢 저는 별주부예요.
${toneLabel}로 상담을 시작할게요.

마음속에 담아두셨던 연애 이야기, 편하게 말씀해 주세요. 어떤 상황인지 자세히 이야기해 주실수록 더 정확하게 도와드릴 수 있어요 💙`;
          startNewChat("love", selProfiles, chatType, initMsg);
        }}>상담 시작하기 🐢</Btn>
      )}
    </div>
  );

  // ── 채팅 화면 ─────────────────────────────────
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh"}}>
      {/* 헤더 */}
      <div style={{
        padding:"12px 16px",display:"flex",alignItems:"center",gap:12,
        background:C.card,borderBottom:`1px solid ${C.border}`,flexShrink:0,
      }}>
        <button onClick={()=>setPhase("list")} style={{
          background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"
        }}>←</button>
        <div style={{
          width:36,height:36,borderRadius:"50%",
          background:`radial-gradient(circle,${expertInfo.color}44,transparent)`,
          border:`1px solid ${expertInfo.color}55`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,
        }}>{expertInfo.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:C.text,fontFamily:FONT,fontSize:14}}>{expertInfo.name}</div>
          <div style={{color:expertInfo.color,fontFamily:FONT,fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {selProfiles.length>0?selProfiles.map(p=>p.name).join(" · "):"온라인"}
          </div>
        </div>
        {/* 새 채팅 버튼 */}
        <button onClick={()=>{
          setPhase(expert==="saju"?"setup_saju":expert==="love"?"setup_love":"setup_tarot");
          setChatType(null); setSelProfiles([]);
        }} style={{
          background:"rgba(109,40,217,0.2)",border:`1px solid ${C.purple}55`,
          borderRadius:8,padding:"5px 10px",cursor:"pointer",
          color:C.purple,fontFamily:FONT,fontSize:11,flexShrink:0,
        }}>+ 새 상담</button>
      </div>

      {/* 메시지 */}
      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:14,paddingBottom:120}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",gap:8}}>
            <div style={{
              maxWidth:"82%",padding:"12px 16px",borderRadius:18,
              background:m.role==="user"
                ?"linear-gradient(135deg,rgba(109,40,217,0.5),rgba(67,56,202,0.5))"
                :C.card,
              border:`1px solid ${m.role==="user"?C.purple:C.border}`,
              color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.7,
            }}>{m.content}</div>
            {m.role==="assistant"&&m.suggestions&&(
              <div style={{display:"flex",gap:6,flexWrap:"wrap",maxWidth:"90%"}}>
                {m.suggestions.map((s,si)=>(
                  <button key={si} onClick={()=>sendMessage(s)} style={{
                    padding:"6px 12px",borderRadius:20,border:`1px solid ${C.border}`,
                    background:"rgba(109,40,217,0.12)",color:C.sub,fontFamily:FONT,fontSize:11,cursor:"pointer",
                  }}>{s}</button>
                ))}
              </div>
            )}
            {m.role==="assistant"&&m.needTarot&&tarotPhase==="select"&&tarotCards.length===0&&i===msgs.length-1&&(
              <ChatTarotPicker onDone={onTarotDone}/>
            )}
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
            <div style={{
              width:32,height:32,borderRadius:"50%",
              background:`radial-gradient(circle,${expertInfo.color}44,transparent)`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,
            }}>{expertInfo.icon}</div>
            <div style={{display:"flex",gap:4}}>
              {[0,1,2].map(i=><div key={i} style={{
                width:7,height:7,borderRadius:"50%",background:expertInfo.color,
                animation:`bounce 1.2s ${i*0.2}s infinite`,
              }}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* 입력창 */}
      <div style={{
        position:"fixed",bottom:70,left:0,right:0,
        padding:"12px 16px",background:C.bg,borderTop:`1px solid ${C.border}`,
        display:"flex",gap:10,maxWidth:480,margin:"0 auto",
        boxSizing:"border-box",width:"100%",
      }}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),sendMessage(input))}
          placeholder="궁금한 것을 물어보세요…"
          style={{...inp,flex:1,padding:"10px 14px"}}
        />
        <button onClick={()=>sendMessage(input)} disabled={!input.trim()||loading} style={{
          width:44,height:44,borderRadius:12,border:"none",cursor:"pointer",flexShrink:0,
          background:`linear-gradient(135deg,${expertInfo.color}88,rgba(109,40,217,0.6))`,
          color:"white",fontSize:18,opacity:input.trim()&&!loading?1:0.4,
        }}>↑</button>
      </div>
    </div>
  );
};

// ─── 오늘의 운세 ──────────────────────────────
const TodayScreen = ({profiles,onAddProfile}) => {
  const me = profiles.find(p=>p.relation==="본인")||profiles[0];
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);
  const [loaded,setLoaded] = useState(false);

  useEffect(()=>{
    if(me&&!loaded){setLoaded(true);load();}
  },[me]);

  const load = async () => {
    if(!me) return;
    setLoading(true); setResult(null);
    const {yp,mp,dp,tp,el}=me.saju;
    const today=new Date().toLocaleDateString("ko-KR");
    const prompt=`한국 전통 사주명리학 전문가입니다.
사주: 년주${yp} 월주${mp} 일주${dp} 시주${tp||"미상"} 오행${el} / 이름:${me.name} 성별:${me.gender}
오늘(${today})의 일진과 위 사주를 접목하여 오늘 하루의 운세를 분석하세요.
JSON으로만:
{
  "overall":"오늘 종합운 한줄(35자)",
  "love":"오늘 연애운(55자)","money":"오늘 재물운(55자)","work":"오늘 직업운(55자)","health":"오늘 건강운(45자)",
  "score":{"love":0~100,"money":0~100,"work":0~100,"health":0~100},
  "lucky_color":"오늘의 행운색","lucky_number":"행운숫자","lucky_direction":"행운방향",
  "caution":"오늘 주의사항(40자)",
  "message":"오늘의 사주 메시지(80자)"
}`;
    try{ const r=await callAI(prompt,900); setResult(r); }
    catch{ setResult({error:true}); }
    setLoading(false);
  };

  if(!me) return (
    <div style={{padding:"40px 16px",textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:16}}>🌙</div>
      <p style={{color:C.sub,fontFamily:FONT,fontSize:14}}>
        본인 프로필을 먼저 등록해주세요
      </p>
      <p style={{color:C.sub,fontFamily:FONT,fontSize:12}}>"더보기" → "프로필 관리"에서 추가할 수 있어요</p>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:6}}>🌙</div>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:"0 0 4px"}}>오늘의 운세</h2>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:0}}>
          {me.name}님 · {new Date().toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"long"})}
        </p>
      </div>

      {loading&&<GlassCard><Spinner msg="오늘의 흐름을 읽는 중…"/></GlassCard>}
      {result&&!result.error&&(
        <>
          <GlassCard glow style={{textAlign:"center"}}>
            <p style={{color:C.gold,fontFamily:FONT,fontSize:15,margin:"0 0 12px"}}>"{result.overall}"</p>
            <div style={{display:"flex",justifyContent:"center",gap:16}}>
              {[["색",result.lucky_color,"🎨"],[`${result.lucky_number}`,result.lucky_number,"🔢"],["방향",result.lucky_direction,"🧭"]].map(([l,v,e])=>(
                <div key={l} style={{textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:3}}>{e}</div>
                  <div style={{color:C.sub,fontFamily:FONT,fontSize:10}}>{l}</div>
                  <div style={{color:C.text,fontFamily:FONT,fontSize:12}}>{v}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 점수 */}
          <GlassCard>
            {[["💕 연애운","love",C.rose],["💰 재물운","money",C.gold],["💼 직업운","work",C.cyan],["🌿 건강운","health","#86efac"]].map(([l,k,col])=>(
              <div key={k} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{color:C.sub,fontFamily:FONT,fontSize:12}}>{l}</span>
                  <span style={{color:col,fontFamily:FONT,fontSize:12,fontWeight:"bold"}}>{result.score?.[k]}점</span>
                </div>
                <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${result.score?.[k]||0}%`,background:col,borderRadius:3}}/>
                </div>
              </div>
            ))}
          </GlassCard>

          {[["💕","연애운",result.love],["💰","재물운",result.money],["💼","직업운",result.work],["🌿","건강운",result.health]].map(([e,l,v])=>(
            <GlassCard key={l}>
              <div style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:4}}>{e} {l}</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.7,margin:0}}>{v}</p>
            </GlassCard>
          ))}

          <GlassCard style={{background:"rgba(239,68,68,0.05)",border:"1px solid rgba(239,68,68,0.2)"}}>
            <div style={{color:"#f87171",fontFamily:FONT,fontSize:11,marginBottom:4}}>⚠️ 오늘 주의</div>
            <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.7,margin:0}}>{result.caution}</p>
          </GlassCard>

          <GlassCard glow>
            <div style={{color:C.purple,fontFamily:FONT,fontSize:11,marginBottom:6}}>✦ 오늘의 메시지</div>
            <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:0,fontStyle:"italic"}}>"{result.message}"</p>
          </GlassCard>

          <Btn variant="ghost" onClick={()=>{setResult(null);setLoaded(false);load();}}>🔄 다시 읽기</Btn>
        </>
      )}
    </div>
  );
};

// ─── 더보기 ──────────────────────────────────
const MoreScreen = ({profiles,onAddProfile,onUpdateProfile,onDeleteProfile}) => {
  const me = profiles.find(p=>p.relation==="본인")||profiles[0];
  const [managing,setManaging] = useState(false);
  const [editing,setEditing] = useState(null);

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      {/* 본인 프로필 카드 */}
      <GlassCard glow>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{
            width:52,height:52,borderRadius:"50%",
            background:`radial-gradient(circle,${C.purple}55,transparent)`,
            border:`1px solid ${C.purple}55`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:26
          }}>{me?.gender==="여"?"👩":"👨"}</div>
          <div>
            <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:"0 0 4px"}}>안녕하세요,</p>
            <h2 style={{color:C.text,fontFamily:FONT,fontSize:20,margin:0}}>
              {me?`${me.name}님!`:"새 프로필을 등록해주세요"}
            </h2>
            {me&&(
              <div style={{marginTop:6}}>
                <div style={{display:"flex",gap:4,marginTop:4}}>
                  {[{l:"년",v:me.saju.yp},{l:"월",v:me.saju.mp},{l:"일",v:me.saju.dp},{l:"시",v:me.saju.tp}].map(({l,v})=>(
                    <div key={l} style={{
                      background:"rgba(109,40,217,0.12)",border:`1px solid rgba(109,40,217,0.2)`,
                      borderRadius:6,padding:"2px 6px",textAlign:"center"
                    }}>
                      <div style={{color:C.sub,fontSize:8,fontFamily:FONT}}>{l}</div>
                      <div style={{color:v?C.text:"rgba(155,138,176,0.3)",fontSize:14,fontFamily:FONT,letterSpacing:1}}>{v||"–"}</div>
                    </div>
                  ))}
                  <div style={{
                    display:"flex",alignItems:"center",padding:"2px 8px",borderRadius:6,
                    background:`rgba(109,40,217,0.1)`,border:`1px solid rgba(109,40,217,0.25)`
                  }}>
                    <span style={{color:C.purple,fontSize:11,fontFamily:FONT}}>{me.saju.el}기운</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* 프로필 관리 */}
      <GlassCard>
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:managing?16:0
        }}>
          <span style={{color:C.text,fontFamily:FONT,fontSize:14}}>👤 프로필 관리</span>
          <button onClick={()=>setManaging(m=>!m)} style={{
            background:"rgba(109,40,217,0.2)",border:`1px solid ${C.purple}55`,
            borderRadius:8,padding:"5px 14px",cursor:"pointer",color:C.purple,fontFamily:FONT,fontSize:12
          }}>{managing?"닫기":"열기"}</button>
        </div>

        {managing&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {profiles.map(p=>(
              <div key={p.id}>
                {editing?.id===p.id?(
                  <div style={{background:"rgba(255,255,255,0.02)",borderRadius:12,padding:14,border:`1px solid ${C.border}`}}>
                    <ProfileForm initial={editing} onSave={np=>{onUpdateProfile(np);setEditing(null);}} onCancel={()=>setEditing(null)}/>
                  </div>
                ):(
                  <div style={{
                    display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                    borderRadius:12,border:`1px solid ${C.border}`,background:"rgba(255,255,255,0.02)"
                  }}>
                    <span style={{fontSize:22}}>{p.gender==="여"?"👩":"👨"}</span>
                    <div style={{flex:1}}>
                      <div style={{color:C.text,fontFamily:FONT,fontSize:13}}>{p.name}</div>
                      <div style={{color:C.sub,fontFamily:FONT,fontSize:10,marginBottom:4}}>{p.relation} · {p.saju.el}오행</div>
                      <div style={{display:"flex",gap:3}}>
                        {[{l:"년",v:p.saju.yp},{l:"월",v:p.saju.mp},{l:"일",v:p.saju.dp},{l:"시",v:p.saju.tp}].map(({l,v})=>(
                          <div key={l} style={{
                            background:"rgba(109,40,217,0.12)",border:`1px solid rgba(109,40,217,0.2)`,
                            borderRadius:5,padding:"1px 4px",textAlign:"center"
                          }}>
                            <div style={{color:C.sub,fontSize:7,fontFamily:FONT}}>{l}</div>
                            <div style={{color:v?C.text:"rgba(155,138,176,0.3)",fontSize:11,fontFamily:FONT}}>{v||"–"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={()=>setEditing(p)} style={{
                      background:"none",border:`1px solid ${C.border}`,borderRadius:6,
                      padding:"3px 8px",cursor:"pointer",color:C.sub,fontFamily:FONT,fontSize:11
                    }}>수정</button>
                    <button onClick={()=>onDeleteProfile(p.id)} style={{
                      background:"none",border:`1px solid rgba(239,68,68,0.3)`,borderRadius:6,
                      padding:"3px 8px",cursor:"pointer",color:"#f87171",fontFamily:FONT,fontSize:11
                    }}>삭제</button>
                  </div>
                )}
              </div>
            ))}
            {/* 새 프로필 추가 */}
            {editing?.id==="new"?(
              <div style={{background:"rgba(255,255,255,0.02)",borderRadius:12,padding:14,border:`1px solid ${C.border}`}}>
                <ProfileForm onSave={np=>{onAddProfile(np);setEditing(null);}} onCancel={()=>setEditing(null)}/>
              </div>
            ):(
              <button onClick={()=>setEditing({id:"new"})} style={{
                padding:"12px 0",borderRadius:12,border:`1px dashed ${C.border}`,
                background:"transparent",color:C.sub,fontFamily:FONT,fontSize:13,cursor:"pointer",width:"100%"
              }}>＋ 새 프로필 추가</button>
            )}
          </div>
        )}
      </GlassCard>

      {/* 앱 정보 */}
      <GlassCard>
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:28,marginBottom:8}}>🌌</div>
          <div style={{color:C.text,fontFamily:FONT,fontSize:15,marginBottom:4}}>별의 흐름</div>
          <div style={{color:C.sub,fontFamily:FONT,fontSize:11}}>AI 기반 사주 · 타로 · 운세</div>
        </div>
      </GlassCard>
    </div>
  );
};

// ═══════════════════════════════════════════════
// 4. 앱 루트
// ═══════════════════════════════════════════════
export default function App() {
  const [tab,setTab]         = useState("home");
  const [screen,setScreen]   = useState(null); // home 내 서브화면
  const [profiles,setProfiles] = useState([]);
  const [storageReady,setStorageReady] = useState(false);

  useEffect(()=>{
    loadProfiles().then(p=>{ setProfiles(p); setStorageReady(true); });
  },[]);

  const persist = useCallback(async (list)=>{
    setProfiles(list);
    await saveProfiles(list);
  },[]);

  const addProfile = useCallback(async (p)=>{
    const list=[...profiles.filter(x=>x.id!==p.id),p];
    await persist(list);
  },[profiles,persist]);

  const updateProfile = useCallback(async (p)=>{
    const list=profiles.map(x=>x.id===p.id?p:x);
    await persist(list);
  },[profiles,persist]);

  const deleteProfile = useCallback(async (id)=>{
    const list=profiles.filter(x=>x.id!==id);
    await persist(list);
  },[profiles,persist]);

  const navigate = (s) => { setScreen(s); setTab("home"); };
  const goHome   = () => setScreen(null);

  const NAV = [
    {id:"home",  icon:"🏠", label:"홈"},
    {id:"chat",  icon:"💬", label:"운세챗"},
    {id:"today", icon:"🌙", label:"오늘의 운세"},
    {id:"more",  icon:"🗂️",  label:"더보기"},
  ];

  const renderContent = () => {
    if(tab==="chat")  return <ChatScreen profiles={profiles} onAddProfile={addProfile}/>;
    if(tab==="today") return <TodayScreen profiles={profiles} onAddProfile={addProfile}/>;
    if(tab==="more")  return <MoreScreen profiles={profiles} onAddProfile={addProfile} onUpdateProfile={updateProfile} onDeleteProfile={deleteProfile}/>;
    // home 탭
    if(!screen) return <HomeScreen profiles={profiles} onAddProfile={addProfile} navigate={navigate}/>;
    if(screen==="saju")    return <SajuScreen profiles={profiles} onAddProfile={addProfile} mode="saju"/>;
    if(screen==="newyear") return <SajuScreen profiles={profiles} onAddProfile={addProfile} mode="newyear"/>;
    if(screen==="gungham") return <GunghamScreen profiles={profiles} onAddProfile={addProfile}/>;
    if(screen==="tarot")   return <TarotScreen/>;
    if(screen==="zodiac")  return <ZodiacScreen profiles={profiles}/>;
    return <HomeScreen profiles={profiles} onAddProfile={addProfile} navigate={navigate}/>;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${C.bg};}
        input::placeholder,textarea::placeholder{color:rgba(155,138,176,0.4);}
        select option{background:#1a1030;color:#e8dff5;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(160,130,220,0.3);border-radius:2px;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        @keyframes tw{0%,100%{opacity:0}50%{opacity:0.85}}
        @keyframes bounce{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-7px);opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      `}</style>

      <div style={{
        minHeight:"100vh", maxWidth:480, margin:"0 auto",
        background:`radial-gradient(ellipse at 25% 15%,rgba(80,20,140,0.25) 0%,transparent 55%),radial-gradient(ellipse at 75% 80%,rgba(20,60,110,0.2) 0%,transparent 55%),${C.bg}`,
        position:"relative", fontFamily:FONT,
      }}>
        <Stars/>
        <div style={{position:"relative",zIndex:1,minHeight:"100vh"}}>
          {renderContent()}
        </div>

        {/* 하단 네비게이션 */}
        <div style={{
          position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
          width:"100%",maxWidth:480,
          background:"rgba(8,6,20,0.95)",borderTop:`1px solid ${C.border}`,
          display:"flex",backdropFilter:"blur(20px)",zIndex:100,
        }}>
          {NAV.map(n=>{
            const isActive = tab===n.id;
            return (
              <button key={n.id} onClick={()=>{setTab(n.id);if(n.id==="home")setScreen(null);}} style={{
                flex:1,padding:"10px 4px 14px",border:"none",cursor:"pointer",
                background:"transparent",textAlign:"center",transition:"all 0.2s"
              }}>
                <div style={{fontSize:20,marginBottom:2}}>{n.icon}</div>
                <div style={{
                  fontFamily:FONT,fontSize:10,
                  color:isActive?C.purple:C.sub,
                  borderTop:isActive?`2px solid ${C.purple}`:"2px solid transparent",
                  paddingTop:4,marginTop:2,transition:"all 0.2s"
                }}>{n.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
