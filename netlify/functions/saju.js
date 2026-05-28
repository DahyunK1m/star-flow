/**
 * 사주 계산 백엔드 Function
 * 프론트에서 생년월일만 보내면 사주 계산 + AI 해석까지 처리
 */

// ── 사주 계산 (manseryeok 기반) ──────────────────────────
const CHEONGAN = ["갑","을","병","정","무","기","경","신","임","계"];
const JIJI     = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
const OHAENG   = {갑:"목",을:"목",병:"화",정:"화",무:"토",기:"토",경:"금",신:"금",임:"수",계:"수"};
const JIJI_OHE = {자:"수",축:"토",인:"목",묘:"목",진:"토",사:"화",오:"화",미:"토",신:"금",유:"금",술:"토",해:"수"};
const SIPSEONG_NAMES = ["비견","겁재","식신","상관","편재","정재","편관","정관","편인","정인"];

// 음력 데이터 (1900~2100)
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

const getLunarYearDays = (y) => { let s=348; for(let i=0x8000;i>0x8;i>>=1) s+=LUNAR_DATA[y-1900]&i?1:0; return s+getLeapMonthDays(y); };
const getLeapMonth = (y) => LUNAR_DATA[y-1900]&0xf;
const getLeapMonthDays = (y) => { const lm=getLeapMonth(y); return lm?(LUNAR_DATA[y-1900]&0x10000?30:29):0; };
const getLunarMonthDays = (y,m) => LUNAR_DATA[y-1900]&(0x10000>>m)?30:29;

const lunarToSolar = (year,month,day,isLeap=false) => {
  const base=new Date(1900,0,31); let offset=0;
  for(let i=1900;i<year;i++) offset+=getLunarYearDays(i);
  const lm=getLeapMonth(year); let isLeapFlag=false;
  for(let i=1;i<month;i++){
    if(lm>0&&i===lm&&!isLeapFlag){offset+=getLeapMonthDays(year);isLeapFlag=true;i--;}
    else offset+=getLunarMonthDays(year,i);
  }
  if(isLeap&&lm===month) offset+=getLunarMonthDays(year,month);
  offset+=day-1;
  const d=new Date(base.getTime()+offset*86400000);
  return {y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate()};
};

const SOLAR_TERM_BASE=[5.4055,20.12,3.87,18.73,5.63,20.646,4.81,20.1,5.52,21.04,5.678,21.37,7.108,22.83,7.5,23.13,7.646,23.042,8.318,23.438,7.438,22.36,7.18,21.94];
const getSolarTermDate=(year,idx)=>{const c=Math.floor(year/100),yc=year%100;const day=Math.floor(SOLAR_TERM_BASE[idx]+0.2422*yc+Math.floor(yc/4)-Math.floor(c/4));return new Date(year,Math.floor(idx/2),day);};

const getYearPillar=(year)=>({hs:CHEONGAN[(year-4)%10],eb:JIJI[(year-4)%12],str:CHEONGAN[(year-4)%10]+JIJI[(year-4)%12]});
const getMonthPillar=(year,month,day)=>{
  const date=new Date(year,month-1,day);const lichun=getSolarTermDate(year,2);
  const adjYear=date<lichun?year-1:year;let stMonth=0;
  for(let i=0;i<24;i+=2){if(date>=getSolarTermDate(adjYear,i))stMonth=Math.floor(i/2)+1;else break;}
  const yStem=(adjYear-4)%10;const mStemIdx=(yStem%5*2+stMonth+1)%10;
  const MB={1:'인',2:'묘',3:'진',4:'사',5:'오',6:'미',7:'신',8:'유',9:'술',10:'해',11:'자',12:'축'};
  return {hs:CHEONGAN[mStemIdx],eb:MB[stMonth]||'인',str:CHEONGAN[mStemIdx]+(MB[stMonth]||'인')};
};
const getDayPillar=(year,month,day)=>{
  const base=new Date(1992,9,24),target=new Date(year,month-1,day);
  const diff=Math.floor((target-base)/86400000);
  const idx=((9+diff)%60+60)%60;
  return {hs:CHEONGAN[idx%10],eb:JIJI[idx%12],str:CHEONGAN[idx%10]+JIJI[idx%12]};
};
const hourToJi=h=>{if(h===23||h===0)return 0;return Math.floor((h+1)/2);};
const getTimePillar=(year,month,day,hour)=>{
  const dp=getDayPillar(year,month,day);
  const dgi=CHEONGAN.indexOf(dp.hs);const ji=hourToJi(hour);
  return {hs:CHEONGAN[([0,2,4,6,8,0,2,4,6,8][dgi]+ji)%10],eb:JIJI[ji],str:CHEONGAN[([0,2,4,6,8,0,2,4,6,8][dgi]+ji)%10]+JIJI[ji]};
};
const getDominant=pillars=>{const c={};pillars.filter(Boolean).forEach(p=>{if(p?.hs){const e=OHAENG[p.hs];if(e)c[e]=(c[e]||0)+1;}});return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0]||"목";};

// 십성 계산
const getSipseong=(dayHs, targetHs)=>{
  const dayIdx=CHEONGAN.indexOf(dayHs);const tIdx=CHEONGAN.indexOf(targetHs);
  const diff=((tIdx-dayIdx)%10+10)%10;return SIPSEONG_NAMES[diff];
};

// 지지 충합 계산
const JIJI_CHUNG={자:"오",축:"미",인:"신",묘:"유",진:"술",사:"해",오:"자",미:"축",신:"인",유:"묘",술:"진",해:"사"};
const JIJI_HAP=[[자,축],[인,해],[묘,술],[진,유],[사,신],[오,미]]; // 육합
const SAMHAP=[[인,오,술],[해,묘,미],[신,자,진],[사,유,축]]; // 삼합

const calcSaju=(y,m,d,h)=>{
  const yp=getYearPillar(y),mp=getMonthPillar(y,m,d),dp=getDayPillar(y,m,d);
  const tp=h!=null?getTimePillar(y,m,d,h):null;
  // 지지 충 체크
  const jijiList=[yp.eb,mp.eb,dp.eb,tp?.eb].filter(Boolean);
  const chungs=[];
  for(let i=0;i<jijiList.length;i++) for(let j=i+1;j<jijiList.length;j++){
    if(JIJI_CHUNG[jijiList[i]]===jijiList[j]) chungs.push(`${jijiList[i]}${jijiList[j]}충`);
  }
  // 오행 분포
  const ohaengCount={목:0,화:0,토:0,금:0,수:0};
  [yp,mp,dp,tp].filter(Boolean).forEach(p=>{
    if(OHAENG[p.hs]) ohaengCount[OHAENG[p.hs]]++;
    if(JIJI_OHE[p.eb]) ohaengCount[JIJI_OHE[p.eb]]++;
  });
  return {
    yp:yp.str,mp:mp.str,dp:dp.str,tp:tp?.str||null,
    el:getDominant([yp,mp,dp,tp]),
    ohaengCount, chungs,
    dayHs:dp.hs, dayEb:dp.eb,
    monthEb:mp.eb,
  };
};

// 오늘 일진
const getTodayPillar=()=>{
  const n=new Date();
  return getDayPillar(n.getFullYear(),n.getMonth()+1,n.getDate());
};

// ── Netlify Function Handler ──────────────────────────
exports.handler = async (event) => {
  if(event.httpMethod==="OPTIONS") return {statusCode:200,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type"}};
  if(event.httpMethod!=="POST") return {statusCode:405,body:"Method Not Allowed"};

  try {
    const {action, profile, profile2, prompt, maxTokens=1200, model="claude", extraContext} = JSON.parse(event.body);

    // ① 사주 계산만 요청
    if(action==="calc") {
      const {y,m,d,h,isLunar} = profile;
      let sy=y,sm=m,sd=d;
      if(isLunar){const r=lunarToSolar(y,m,d);sy=r.y;sm=r.m;sd=r.d;}
      const saju=calcSaju(sy,sm,sd,h!=null?h:null);
      return {statusCode:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"},body:JSON.stringify({saju})};
    }

    // ② 사주 계산 + AI 해석
    if(action==="interpret") {
      const {y,m,d,h,isLunar,name,gender,birthplace} = profile;
      let sy=y,sm=m,sd=d;
      if(isLunar){const r=lunarToSolar(y,m,d);sy=r.y;sm=r.m;sd=r.d;}
      const saju=calcSaju(sy,sm,sd,h!=null?h:null);
      const todayDp=getTodayPillar();
      const today=new Date().toLocaleDateString("ko-KR");

      // 사주 컨텍스트 자동 생성
      const sajuCtx=`[계산된 사주팔자 — 변경 불가]
이름: ${name} / 성별: ${gender} / 출생지: ${birthplace||"미상"}
생년월일: ${sy}.${sm}.${sd}${h!=null?" "+h+"시":""}
년주: ${saju.yp} / 월주: ${saju.mp} / 일주: ${saju.dp} / 시주: ${saju.tp||"미상"}
일간: ${saju.dayHs} / 일지: ${saju.dayEb} / 월지: ${saju.monthEb}
주요오행: ${saju.el}
오행분포: ${Object.entries(saju.ohaengCount).map(([k,v])=>`${k}:${v}`).join(", ")}
지지충: ${saju.chungs.length>0?saju.chungs.join(", "):"없음"}
오늘일진: ${today} ${todayDp.str}
${extraContext||""}`;

      // AI 호출 (Claude or OpenAI)
      const fullPrompt = `${sajuCtx}\n\n${prompt}`;
      let reply;

      const callClaude = async (prompt, tokens) => {
        const res=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:tokens,messages:[{role:"user",content:prompt}]})
        });
        const data=await res.json();
        return data.content?.[0]?.text||"";
      };

      if(model==="openai") {
        try {
          if(!process.env.OPENAI_API_KEY) throw new Error("no key");
          const res=await fetch("https://api.openai.com/v1/chat/completions",{
            method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.OPENAI_API_KEY}`},
            body:JSON.stringify({model:"gpt-4o-mini",max_tokens:maxTokens,messages:[{role:"user",content:fullPrompt}]})
          });
          const data=await res.json();
          if(data.error) throw new Error(data.error.message);
          reply=data.choices?.[0]?.message?.content||"";
        } catch(e) {
          // OpenAI 실패 시 Claude로 자동 폴백
          console.log("OpenAI 실패, Claude로 폴백:", e.message);
          reply = await callClaude(fullPrompt, maxTokens);
        }
      } else {
        const res=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,messages:[{role:"user",content:fullPrompt}]})
        });
        const data=await res.json();
        reply=data.content?.[0]?.text||"";
      }

      // JSON 파싱 시도
      let parsed;
      try { parsed=JSON.parse(reply.replace(/```json|```/g,"").trim()); }
      catch { parsed={raw:reply}; }

      return {statusCode:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"},body:JSON.stringify({saju,result:parsed})};
    }

    // ③ 궁합 (두 사람)
    if(action==="gungham") {
      const p1=profile, p2=profile2;
      let s1y=p1.y,s1m=p1.m,s1d=p1.d; if(p1.isLunar){const r=lunarToSolar(p1.y,p1.m,p1.d);s1y=r.y;s1m=r.m;s1d=r.d;}
      let s2y=p2.y,s2m=p2.m,s2d=p2.d; if(p2.isLunar){const r=lunarToSolar(p2.y,p2.m,p2.d);s2y=r.y;s2m=r.m;s2d=r.d;}
      const saju1=calcSaju(s1y,s1m,s1d,p1.h!=null?p1.h:null);
      const saju2=calcSaju(s2y,s2m,s2d,p2.h!=null?p2.h:null);

      const sajuCtx=`[두 사람 사주 — 계산값 변경 불가]
[A] ${p1.name}(${p1.gender}) ${s1y}.${s1m}.${s1d}: 년주${saju1.yp} 월주${saju1.mp} 일주${saju1.dp} 시주${saju1.tp||"미상"} / 일간${saju1.dayHs} 일지${saju1.dayEb} 월지${saju1.monthEb} 오행${saju1.el}
[B] ${p2.name}(${p2.gender}) ${s2y}.${s2m}.${s2d}: 년주${saju2.yp} 월주${saju2.mp} 일주${saju2.dp} 시주${saju2.tp||"미상"} / 일간${saju2.dayHs} 일지${saju2.dayEb} 월지${saju2.monthEb} 오행${saju2.el}`;

      const fullPrompt=`${sajuCtx}\n\n${prompt}`;
      let reply;
      const res=await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.OPENAI_API_KEY}`},
        body:JSON.stringify({model:"gpt-4o-mini",max_tokens:maxTokens,messages:[{role:"user",content:fullPrompt}]})
      });
      const data=await res.json(); reply=data.choices?.[0]?.message?.content||"";
      let parsed; try{parsed=JSON.parse(reply.replace(/```json|```/g,"").trim());}catch{parsed={raw:reply};}
      return {statusCode:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"},body:JSON.stringify({saju1,saju2,result:parsed})};
    }

    return {statusCode:400,body:"Unknown action"};
  } catch(err) {
    return {statusCode:500,body:JSON.stringify({error:err.message})};
  }
};
