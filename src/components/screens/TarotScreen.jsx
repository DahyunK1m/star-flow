import { useState, useRef } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn, Spinner } from "../common/UI.jsx";
import { TAROT_CATS, shuffleDeck } from "../../data/tarotDeck.js";
import TarotCardArt from "../tarot/TarotCardArt.jsx";
import { callAI } from "../../utils/api.js";

export default function TarotScreen({}) {
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
      const r=await callAI(prompt,1500,true);
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
}