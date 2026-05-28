/**
 * 사주 계산 유틸리티 (manseryeok 라이브러리 기반)
 * 기준일: 1992.10.24 = 계유일(9번)
 */

const CHEONGAN = ["갑","을","병","정","무","기","경","신","임","계"];
const JIJI     = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
export const OHAENG   = {갑:"목",을:"목",병:"화",정:"화",무:"토",기:"토",경:"금",신:"금",임:"수",계:"수"};
export const JIJI_OHE = {자:"수",축:"토",인:"목",묘:"목",진:"토",사:"화",오:"화",미:"토",신:"금",유:"금",술:"토",해:"수"};

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

const getLunarYearDays = y => { let s=348; for(let i=0x8000;i>0x8;i>>=1) s+=LUNAR_DATA[y-1900]&i?1:0; return s+getLeapMonthDays(y); };
const getLeapMonth = y => LUNAR_DATA[y-1900]&0xf;
const getLeapMonthDays = y => { const lm=getLeapMonth(y); return lm?(LUNAR_DATA[y-1900]&0x10000?30:29):0; };
const getLunarMonthDays = (y,m) => LUNAR_DATA[y-1900]&(0x10000>>m)?30:29;

export const lunarToSolar = (year,month,day,isLeap=false) => {
  const base=new Date(1900,0,31); let offset=0;
  for(let i=1900;i<year;i++) offset+=getLunarYearDays(i);
  const lm=getLeapMonth(year); let leapFlag=false;
  for(let i=1;i<month;i++){
    if(lm>0&&i===lm&&!leapFlag){offset+=getLeapMonthDays(year);leapFlag=true;i--;}
    else offset+=getLunarMonthDays(year,i);
  }
  if(isLeap&&lm===month) offset+=getLunarMonthDays(year,month);
  offset+=day-1;
  const d=new Date(base.getTime()+offset*86400000);
  return {y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate()};
};

const SOLAR_TERM_BASE=[5.4055,20.12,3.87,18.73,5.63,20.646,4.81,20.1,5.52,21.04,5.678,21.37,7.108,22.83,7.5,23.13,7.646,23.042,8.318,23.438,7.438,22.36,7.18,21.94];
const getSolarTermDate=(year,idx)=>{const c=Math.floor(year/100),yc=year%100;const day=Math.floor(SOLAR_TERM_BASE[idx]+0.2422*yc+Math.floor(yc/4)-Math.floor(c/4));return new Date(year,Math.floor(idx/2),day);};

export const getYearPillar = year => ({
  hs:CHEONGAN[(year-4)%10], eb:JIJI[(year-4)%12],
  str:CHEONGAN[(year-4)%10]+JIJI[(year-4)%12]
});

export const getMonthPillar = (year,month,day) => {
  const date=new Date(year,month-1,day);
  const lichun=getSolarTermDate(year,2);
  const adjYear=date<lichun?year-1:year;
  let stMonth=0;
  for(let i=0;i<24;i+=2){ if(date>=getSolarTermDate(adjYear,i)) stMonth=Math.floor(i/2)+1; else break; }
  const yStem=(adjYear-4)%10;
  const mStemIdx=(yStem%5*2+stMonth+1)%10;
  const MB={1:'인',2:'묘',3:'진',4:'사',5:'오',6:'미',7:'신',8:'유',9:'술',10:'해',11:'자',12:'축'};
  return {hs:CHEONGAN[mStemIdx],eb:MB[stMonth]||'인',str:CHEONGAN[mStemIdx]+(MB[stMonth]||'인')};
};

export const getDayPillar = (year,month,day) => {
  const base=new Date(1992,9,24), target=new Date(year,month-1,day);
  const diff=Math.floor((target-base)/86400000);
  const idx=((9+diff)%60+60)%60;
  return {hs:CHEONGAN[idx%10],eb:JIJI[idx%12],str:CHEONGAN[idx%10]+JIJI[idx%12]};
};

export const getHourPillar = (dayHs,hour,minute=0) => {
  const h=hour===23?0:hour;
  const total=h*60+minute;
  const shichen=Math.floor((total+60)/120)%12;
  const dIdx=CHEONGAN.indexOf(dayHs);
  const hStemIdx=((dIdx%5)*2+shichen)%10;
  return {hs:CHEONGAN[hStemIdx],eb:JIJI[shichen],str:CHEONGAN[hStemIdx]+JIJI[shichen]};
};

const getDominant = pillars => {
  const c={};
  pillars.filter(Boolean).forEach(p=>{ if(p?.hs){const e=OHAENG[p.hs];if(e)c[e]=(c[e]||0)+1;} });
  return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0]||"목";
};

export const calcSaju = (y,m,d,h,min=0) => {
  const yp=getYearPillar(y), mp=getMonthPillar(y,m,d), dp=getDayPillar(y,m,d);
  const tp=h!=null?getHourPillar(dp.hs,h,min):null;
  // 오행 분포
  const ohaengCount={목:0,화:0,토:0,금:0,수:0};
  [yp,mp,dp,tp].filter(Boolean).forEach(p=>{
    if(OHAENG[p.hs]) ohaengCount[OHAENG[p.hs]]++;
    if(JIJI_OHE[p.eb]) ohaengCount[JIJI_OHE[p.eb]]++;
  });
  // 지지 충
  const jijiList=[yp.eb,mp.eb,dp.eb,tp?.eb].filter(Boolean);
  const CHUNG={자:"오",축:"미",인:"신",묘:"유",진:"술",사:"해",오:"자",미:"축",신:"인",유:"묘",술:"진",해:"사"};
  const chungs=[];
  for(let i=0;i<jijiList.length;i++) for(let j=i+1;j<jijiList.length;j++){
    if(CHUNG[jijiList[i]]===jijiList[j]) chungs.push(`${jijiList[i]}${jijiList[j]}충`);
  }
  return {
    yp:yp.str, mp:mp.str, dp:dp.str, tp:tp?.str||null,
    el:getDominant([yp,mp,dp,tp]),
    dayHs:dp.hs, dayEb:dp.eb, monthEb:mp.eb,
    ohaengCount, chungs,
  };
};

export const getTodayPillar = () => {
  const n=new Date();
  return getDayPillar(n.getFullYear(),n.getMonth()+1,n.getDate());
};
