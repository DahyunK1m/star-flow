import { useState } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn, Spinner } from "../common/UI.jsx";
import { shuffleDeck } from "../../data/tarotDeck.js";
import TarotCardArt from "../tarot/TarotCardArt.jsx";
import { callAI } from "../../utils/api.js";

const CATS = [
  {id:"today",  label:"오늘의 운세", icon:"☀️", count:1,
    positions:["핵심 메시지"],
    desc:"오늘의 핵심 메시지"},
  {id:"month",  label:"이달의 운세", icon:"📅", count:1,
    positions:["이달의 흐름"],
    desc:"이번 달 전체 흐름"},
  {id:"love",   label:"애정운",      icon:"💕", count:5,
    positions:["나의 감정","상대의 감정","관계의 흐름","조언","결과"],
    desc:"5장 스프레드"},
  {id:"inner",  label:"상대 속마음", icon:"💭", count:3,
    positions:["현재 마음","숨은 마음","앞으로의 행동"],
    desc:"3장 스프레드"},
  {id:"reunion",label:"재회운",      icon:"💌", count:11,
    positions:["상대방 감정","상대방 기대","연락없는 이유","상대 행동","나의 감정","나의 바람","내가 극복할 것","내가 해야 할 행동","아무것도 안 하면","객관적 상태","재회 가능성"],
    desc:"11장 스프레드"},
  {id:"money",  label:"금전운",      icon:"💰", count:5,
    positions:["과거 금전운","현재 금전운","미래 금전운","위험 요소","조언"],
    desc:"5장 스프레드"},
  {id:"health", label:"건강운",      icon:"🌿", count:3,
    positions:["현재 컨디션","조심할 습관","건강 조언"],
    desc:"3장 스프레드"},
  {id:"job",    label:"취업운",      icon:"💼", count:7,
    positions:["과거 흐름","현재 상태","가까운 미래","나의 강점","장애물","기회","조언"],
    desc:"7장 스프레드"},
  {id:"study",  label:"학업운",      icon:"📚", count:4,
    positions:["집중력","약점","결과 흐름","조언"],
    desc:"4장 스프레드"},
];

export default function TarotScreen({ onBack }) {
  const [cat,       setCat]        = useState(null);
  const [phase,     setPhase]      = useState("pick");
  const [deck,      setDeck]       = useState([]);
  const [picked,    setPicked]     = useState([]);
  const [centerIdx, setCenterIdx]  = useState(0);
  const [flipping,  setFlipping]   = useState(null);
  const [animating, setAnimating]  = useState(false);
  const [result,    setResult]     = useState(null);
  const [loading,   setLoading]    = useState(false);

  const startSelect = (c) => {
    const d = shuffleDeck();
    setCat(c); setDeck(d); setPicked([]); setResult(null);
    setCenterIdx(Math.floor(d.length/2)); setPhase("select");
  };

  const handlePick = (idx) => {
    if(animating || picked.some(p=>p.deckIdx===idx)) return;
    if(picked.length >= cat.count) return;
    setFlipping(idx); setAnimating(true);
    setTimeout(()=>{
      const card = deck[idx];
      const next = [...picked, {...card, deckIdx:idx}];
      setPicked(next); setFlipping(null); setAnimating(false);
      if(next.length === cat.count) setTimeout(()=>analyze(next, cat), 400);
    }, 400);
  };

  const analyze = async (cards, category) => {
    setPhase("result"); setLoading(true); setResult(null);
    const cardInfo = cards.map((c,i)=>
      `[${category.positions[i]}] ${c.kr}(${c.rev?"역방향":"정방향"}): ${c.rev?c.rev:c.up}`
    ).join("\n");

    const categoryPrompts = {
      today: `오늘 하루의 에너지와 흐름을 읽어주세요.
결과에 포함할 것: 오늘의 핵심 메시지, 오늘 조심할 점, 오늘의 실천 조언.`,
      month: `이번 달 전체적인 흐름을 읽어주세요.
결과에 포함할 것: 이번 달 전체 흐름, 이번 달 기회가 되는 부분, 이번 달 조심할 점, 이번 달 실천 조언.`,
      love: `애정운을 5장 스프레드로 읽어주세요.
포지션: 1=나의 감정, 2=상대의 감정, 3=관계의 흐름, 4=조언, 5=결과
각 포지션의 카드 의미를 구체적으로 해석하고, 두 사람의 관계 전체 흐름을 통합 해석해주세요.`,
      inner: `상대방의 속마음을 3장 스프레드로 읽어주세요.
포지션: 1=현재 마음, 2=숨은 마음, 3=앞으로의 행동
겉으로 드러나는 마음과 숨겨진 진짜 감정의 차이를 구체적으로 해석해주세요.`,
      reunion: `재회운을 11장 스프레드로 읽어주세요.
포지션: 1=상대방 감정 상태, 2=상대방의 기대, 3=연락이 없는 이유, 4=앞으로 어떻게 행동할지, 5=나의 감정 상태, 6=나의 바람과 걱정, 7=내가 극복해야 할 것, 8=내가 해야 할 행동, 9=아무것도 안 하면, 10=관계의 객관적인 상태, 11=재회 가능성
각 포지션을 상세히 해석하고, 전체 재회 가능성을 현실적으로 평가해주세요. 시기 질문이 있다면 "올해 7~8월" 같이 구체적으로 답하세요.`,
      money: `금전운을 5장 스프레드로 읽어주세요.
포지션: 1=과거 금전운, 2=현재 금전운, 3=미래 금전운, 4=위험 요소, 5=조언
돈의 흐름 패턴을 과거~미래로 읽고, 지금 조심해야 할 금전적 위험과 구체적 조언을 주세요.`,
      health: `건강운을 3장 스프레드로 읽어주세요.
포지션: 1=현재 컨디션 흐름, 2=조심할 생활 습관, 3=건강 조언
의학적 진단처럼 단정하지 않고, 컨디션과 생활 관리 조언 중심으로 읽어주세요.`,
      job: `취업운을 7장 스프레드로 읽어주세요.
포지션: 1=과거 흐름, 2=현재 상태, 3=가까운 미래, 4=나의 강점, 5=장애물, 6=기회, 7=조언
구직/취업/이직의 흐름을 전체적으로 읽고, 강점과 장애물을 구체적으로 짚어주세요.`,
      study: `학업운을 4장 스프레드로 읽어주세요.
포지션: 1=집중력, 2=약점, 3=결과 흐름, 4=조언
공부 효율, 시험운, 성과를 내기 위한 구체적인 조언을 주세요.`,
    };

    const prompt = `당신은 타로 마스터입니다. 뽑힌 카드의 정/역방향을 정확히 반영하여 깊이 있게 해석하세요.

[${category.label}] 리딩

뽑힌 카드 (포지션별):
${cardInfo}

${categoryPrompts[category.id]||""}

해석 원칙:
- 각 카드의 정방향/역방향 의미를 정확히 반영한다
- 카드가 놓인 포지션의 의미와 결합하여 해석한다
- 추상적인 표현보다 구체적이고 실생활에 와닿는 해석을 한다
- 전체 카드의 흐름을 통합하여 맥락 있는 이야기를 만든다

JSON으로만 응답:
{
  "overall": "전체 통합 메시지 — 이 스프레드가 말하는 핵심",
  "cards": [${category.positions.map((pos,i)=>`"[${pos}] ${category.id==="health"?"건강·컨디션 관점에서 ":" "}이 카드가 이 자리에서 말하는 것"`).join(",")}],
  "flow": "전체 흐름 해석 — 카드들을 연결해서 읽은 이야기",
  "keyword": "변화, 선택, 인내 (예시처럼 키워드만 3개)",
  "advice": "지금 나에게 필요한 실천 조언",
  "message": "타로가 보내는 한 문장 메시지"
}`;

    try {
      const r = await callAI(prompt, 2500, true);
      setResult(r);
    } catch { setResult({error:true}); }
    setLoading(false);
  };

  // ── 카테고리 선택 ───────────────────────────────
  if(phase==="pick") return (
    <div style={{padding:"20px 16px 100px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        {onBack&&<button onClick={onBack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>}
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:0}}>🃏 타로</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {CATS.map(c=>(
          <div key={c.id} onClick={()=>startSelect(c)} style={{
            background:C.card,border:`1px solid ${C.border}`,borderRadius:16,
            padding:"18px 12px",cursor:"pointer",textAlign:"center",
            transition:"all 0.2s",
          }}>
            <div style={{fontSize:26,marginBottom:6}}>{c.icon}</div>
            <div style={{color:C.text,fontFamily:FONT,fontSize:13,marginBottom:2}}>{c.label}</div>
            <div style={{color:C.sub,fontFamily:FONT,fontSize:10}}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── 카드 선택 (슬라이딩 팬) ──────────────────────
  if(phase==="select") {
    const VISIBLE=9, half=Math.floor(VISIBLE/2);
    const visibleCards = Array.from({length:VISIBLE},(_,i)=>{
      const idx=centerIdx-half+i;
      return {idx, card:deck[idx]||null};
    }).filter(v=>v.card);

    return (
      <div style={{padding:"20px 16px 100px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <button onClick={()=>setPhase("pick")} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
          <h2 style={{color:C.text,fontFamily:FONT,fontSize:16,margin:0}}>{cat.icon} {cat.label}</h2>
        </div>

        {/* 선택된 카드 미리보기 */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14,minHeight:110,flexWrap:"wrap"}}>
          {Array.from({length:cat.count}).map((_,si)=>{
            const c=picked[si];
            return (
              <div key={si} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,opacity:c?1:0.3}}>
                {c ? <TarotCardArt card={c} size={50} isRev={c.rev}/>
                   : <div style={{width:50,height:85,borderRadius:7,border:`1px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                       <span style={{color:C.border,fontSize:14}}>?</span>
                     </div>}
                {c&&<span style={{color:C.purple,fontFamily:FONT,fontSize:7,textAlign:"center",maxWidth:52,lineHeight:1.2}}>{cat.positions[si]}</span>}
                {c&&<span style={{fontSize:7,color:c.rev?"#fca5a5":"#86efac",fontFamily:FONT}}>{c.rev?"역":"정"}</span>}
              </div>
            );
          })}
        </div>

        <p style={{color:C.sub,fontFamily:FONT,fontSize:11,textAlign:"center",marginBottom:12}}>
          좌우로 밀어서 카드를 살펴보고, 끌리는 카드를 탭하세요 ({picked.length}/{cat.count})
        </p>

        {/* 카드 팬 */}
        <div style={{position:"relative",height:160,overflow:"hidden",userSelect:"none"}}
          onMouseDown={e=>{e._startX=e.clientX;}}
          onMouseUp={e=>{
            const diff=(e._startX||e.clientX)-e.clientX;
            if(Math.abs(diff)>30) setCenterIdx(p=>Math.max(2,Math.min(deck.length-3,p+Math.round(diff/40))));
          }}
          onTouchStart={e=>{e._startX=e.touches[0].clientX;}}
          onTouchEnd={e=>{
            const diff=(e._startX||0)-e.changedTouches[0].clientX;
            if(Math.abs(diff)>30) setCenterIdx(p=>Math.max(2,Math.min(deck.length-3,p+Math.round(diff/40))));
          }}
        >
          {visibleCards.map(({idx,card},vi)=>{
            const offset=vi-half, isCenter=offset===0;
            const isPicked=picked.some(p=>p.deckIdx===idx);
            const isFlip=flipping===idx;
            return (
              <div key={idx} onClick={()=>!isPicked&&handlePick(idx)} style={{
                position:"absolute",left:"50%",bottom:0,
                transform:`translateX(calc(-50% + ${offset*48}px)) translateY(${Math.abs(offset)*6}px) rotate(${offset*8}deg) scale(${isCenter?1.15:Math.max(0.75,1-Math.abs(offset)*0.07)}) ${isFlip?"rotateY(90deg)":""}`,
                transition:"transform 0.3s cubic-bezier(.34,1.56,.64,1)",
                zIndex:VISIBLE-Math.abs(offset),
                cursor:isPicked?"default":"pointer",
                opacity:isPicked?0.35:1,
              }}>
                {isPicked||isFlip
                  ? <TarotCardArt card={card} size={60} isRev={card.rev}/>
                  : <div style={{
                      width:60,height:102,borderRadius:8,
                      background:"linear-gradient(135deg,#2d0a6e,#100820)",
                      border:`1px solid ${isCenter?C.purple:C.border}`,
                      boxShadow:isCenter?`0 0 18px ${C.purple}66,0 8px 20px rgba(0,0,0,0.5)`:`0 4px 10px rgba(0,0,0,0.4)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      <svg width="60" height="102" viewBox="0 0 60 102" style={{position:"absolute",inset:0}}>
                        <rect x="4" y="4" width="52" height="94" rx="5" fill="none" stroke="rgba(212,168,75,0.3)" strokeWidth="1"/>
                        <text x="30" y="55" textAnchor="middle" fontSize="16" fill="rgba(212,168,75,0.4)">✦</text>
                      </svg>
                    </div>
                }
              </div>
            );
          })}
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:10}}>
          <button onClick={()=>setCenterIdx(p=>Math.max(2,p-5))} style={{background:"rgba(109,40,217,0.2)",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 14px",cursor:"pointer",color:C.sub,fontSize:16}}>‹</button>
          <div style={{display:"flex",gap:2,alignItems:"center"}}>
            {Array.from({length:8},(_,i)=>{const pos=Math.floor(centerIdx/deck.length*8);return <div key={i} style={{width:i===pos?12:4,height:4,borderRadius:2,background:i===pos?C.purple:C.border,transition:"all 0.2s"}}/>;})}
          </div>
          <button onClick={()=>setCenterIdx(p=>Math.min(deck.length-3,p+5))} style={{background:"rgba(109,40,217,0.2)",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 14px",cursor:"pointer",color:C.sub,fontSize:16}}>›</button>
        </div>
      </div>
    );
  }

  // ── 결과 ──────────────────────────────────────
  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setPhase("pick")} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:16,margin:0}}>{cat.icon} {cat.label} 리딩</h2>
      </div>

      {/* 선택된 카드 가로 스크롤 */}
      <div style={{display:"flex",gap:10,overflowX:"auto",padding:"4px 0",scrollbarWidth:"none"}}>
        {picked.map((c,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
            <TarotCardArt card={c} size={56} isRev={c.rev}/>
            <span style={{color:C.purple,fontFamily:FONT,fontSize:8,textAlign:"center",maxWidth:58,lineHeight:1.2}}>{cat.positions[i]}</span>
            <span style={{fontSize:8,color:c.rev?"#fca5a5":"#86efac",fontFamily:FONT}}>{c.rev?"역방향":"정방향"}</span>
          </div>
        ))}
      </div>

      {loading&&<GlassCard><Spinner msg="카드의 기운을 읽는 중…"/></GlassCard>}

      {result&&!result.error&&(
        <>
          {/* 핵심 메시지 */}
          <GlassCard glow>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {result.keyword?.split(",").map(k=>(
                <span key={k} style={{padding:"3px 12px",borderRadius:20,fontFamily:FONT,fontSize:11,background:"rgba(109,40,217,0.2)",border:`1px solid ${C.purple}44`,color:C.purple}}>{k.trim()}</span>
              ))}
            </div>
            <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:0}}>{result.overall}</p>
          </GlassCard>

          {/* 카드별 해석 */}
          <GlassCard>
            <div style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:12}}>카드별 해석</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {picked.map((c,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                  <div style={{flexShrink:0}}><TarotCardArt card={c} size={40} isRev={c.rev}/></div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,marginBottom:4,flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{color:C.purple,fontFamily:FONT,fontSize:11}}>{cat.positions[i]}</span>
                      <span style={{color:C.text,fontFamily:FONT,fontSize:11}}>· {c.kr}</span>
                      <span style={{fontSize:9,padding:"1px 6px",borderRadius:6,fontFamily:FONT,background:c.rev?"rgba(239,68,68,0.15)":"rgba(34,197,94,0.15)",color:c.rev?"#fca5a5":"#86efac"}}>{c.rev?"역방향":"정방향"}</span>
                    </div>
                    <p style={{color:C.sub,fontFamily:FONT,fontSize:11,margin:"0 0 4px",lineHeight:1.5}}>{c.rev?c.rev:c.up}</p>
                    {result.cards?.[i]&&<p style={{color:C.text,fontFamily:FONT,fontSize:12,lineHeight:1.65,margin:0}}>{result.cards[i]}</p>}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 전체 흐름 */}
          {result.flow&&(
            <GlassCard>
              <div style={{color:C.cyan,fontFamily:FONT,fontSize:12,marginBottom:8}}>🌊 전체 흐름</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:0}}>{result.flow}</p>
            </GlassCard>
          )}

          {/* 조언 */}
          {result.advice&&(
            <GlassCard>
              <div style={{color:C.gold,fontFamily:FONT,fontSize:12,marginBottom:8}}>✨ 실천 조언</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:0}}>{result.advice}</p>
            </GlassCard>
          )}

          {/* 한 문장 메시지 */}
          {result.message&&(
            <GlassCard glow style={{textAlign:"center"}}>
              <p style={{color:C.gold,fontFamily:FONT,fontSize:14,fontStyle:"italic",margin:0}}>"{result.message}"</p>
            </GlassCard>
          )}

          <Btn variant="ghost" onClick={()=>startSelect(cat)}>🔀 다시 뽑기</Btn>
          <Btn variant="ghost" onClick={()=>setPhase("pick")}>다른 타로 보기</Btn>
        </>
      )}
      {result?.error&&<GlassCard><p style={{color:"#f87171",fontFamily:FONT,fontSize:13,textAlign:"center",margin:0}}>해석 중 오류가 발생했습니다.</p></GlassCard>}
    </div>
  );
}
