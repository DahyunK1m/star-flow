import { useState, useRef } from "react";
import { C, FONT } from "../../constants/colors.js";
import { shuffleDeck } from "../../data/tarotDeck.js";
import TarotCardArt from "./TarotCardArt.jsx";

export default function ChatTarotPicker({onDone, count=3}) {
  const deck = useRef(shuffleDeck()).current;
  const [picked, setPicked]       = useState([]);
  const pickedRef                 = useRef([]);
  const [centerIdx, setCenterIdx] = useState(Math.floor(deck.length/2));
  const [animating, setAnimating] = useState(false);
  const [flipping, setFlipping]   = useState(null);
  const containerRef              = useRef(null);
  const startX                    = useRef(null);

  // 드래그/스와이프로 카드 팬 이동
  const handleDragStart = (e) => {
    startX.current = e.touches?.[0]?.clientX ?? e.clientX;
  };
  const handleDragEnd = (e) => {
    if(startX.current === null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? e.clientX;
    const diff = startX.current - endX;
    if(Math.abs(diff) > 30) {
      const step = Math.round(diff / 40);
      setCenterIdx(prev => Math.max(2, Math.min(deck.length-3, prev + step)));
    }
    startX.current = null;
  };

  const handlePick = (deckIdx) => {
    if(animating || pickedRef.current.some(p=>p.deckIdx===deckIdx)) return;
    if(pickedRef.current.length >= count) return;
    setFlipping(deckIdx);
    setAnimating(true);
    setTimeout(()=>{
      const card = deck[deckIdx];
      const next = [...pickedRef.current, {...card, deckIdx}];
      pickedRef.current = next;
      setPicked([...next]);
      setFlipping(null);
      setAnimating(false);
      if(next.length === count) setTimeout(()=>onDone(next), 500);
    }, 400);
  };

  const VISIBLE = 9; // 한 번에 보이는 카드 수
  const half = Math.floor(VISIBLE/2);
  const visibleCards = Array.from({length:VISIBLE}, (_,i) => {
    const idx = centerIdx - half + i;
    return {idx, card: deck[idx] || null};
  }).filter(v => v.card);

  return (
    <div style={{width:"100%",userSelect:"none"}}>
      {/* 선택된 카드 미리보기 */}
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14,minHeight:100}}>
        {Array.from({length:count}).map((_,si)=>{
          const c = picked[si];
          return (
            <div key={si} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,opacity:c?1:0.3,transition:"opacity 0.3s"}}>
              {c
                ? <TarotCardArt card={c} size={52} isRev={c.rev}/>
                : <div style={{width:52,height:88,borderRadius:8,border:`1px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{color:C.border,fontSize:16}}>?</span>
                  </div>
              }
              {c&&<span style={{color:C.purple,fontFamily:FONT,fontSize:8,textAlign:"center",lineHeight:1.2,maxWidth:52}}>{c.kr}</span>}
              {c&&<span style={{fontSize:8,color:c.rev?"#fca5a5":"#86efac",fontFamily:FONT}}>{c.rev?"역방향":"정방향"}</span>}
            </div>
          );
        })}
      </div>

      <p style={{color:C.sub,fontFamily:FONT,fontSize:11,textAlign:"center",marginBottom:10}}>
        좌우로 밀어서 카드를 살펴보고, 끌리는 카드를 탭하세요 ({picked.length}/{count})
      </p>

      {/* 카드 팬 */}
      <div
        ref={containerRef}
        onMouseDown={handleDragStart} onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart} onTouchEnd={handleDragEnd}
        style={{
          position:"relative", height:160, cursor:"grab",
          overflow:"hidden", touchAction:"pan-y",
        }}
      >
        {visibleCards.map(({idx, card},vi)=>{
          const offset = vi - half;
          const isCenter = offset === 0;
          const isPicked = pickedRef.current.some(p=>p.deckIdx===idx);
          const isFlip = flipping === idx;
          const angle = offset * 8; // 부채꼴 각도
          const tx = offset * 48;   // 수평 위치
          const ty = Math.abs(offset) * 6; // 아래로 내려가는 정도
          const scale = isCenter ? 1.15 : Math.max(0.75, 1 - Math.abs(offset)*0.07);
          const zIndex = VISIBLE - Math.abs(offset);

          return (
            <div
              key={idx}
              onClick={()=>!isPicked&&handlePick(idx)}
              style={{
                position:"absolute",
                left:"50%",bottom:0,
                transform:`translateX(calc(-50% + ${tx}px)) translateY(${ty}px) rotate(${angle}deg) scale(${scale}) ${isFlip?"rotateY(90deg)":""}`,
                transition:"transform 0.3s cubic-bezier(.34,1.56,.64,1)",
                zIndex,
                cursor: isPicked?"default":"pointer",
                opacity: isPicked ? 0.35 : 1,
              }}
            >
              {isPicked || isFlip ? (
                <TarotCardArt card={card} size={60} isRev={card.rev}/>
              ) : (
                /* 카드 뒷면 */
                <div style={{
                  width:60, height:102, borderRadius:8,
                  background:"linear-gradient(135deg,#2d0a6e,#100820)",
                  border:`1px solid ${isCenter?C.purple:C.border}`,
                  boxShadow: isCenter?`0 0 18px ${C.purple}66,0 8px 20px rgba(0,0,0,0.5)`:`0 4px 10px rgba(0,0,0,0.4)`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  position:"relative", overflow:"hidden",
                }}>
                  {/* 카드 뒷면 패턴 */}
                  <svg width="60" height="102" viewBox="0 0 60 102" style={{position:"absolute",inset:0}}>
                    <rect width="60" height="102" fill="none"/>
                    <rect x="4" y="4" width="52" height="94" rx="5" fill="none" stroke="rgba(212,168,75,0.3)" strokeWidth="1"/>
                    {Array.from({length:8},(_,i)=>(
                      <line key={i} x1="0" y1={i*14} x2="60" y2={i*14+14}
                        stroke="rgba(109,40,217,0.15)" strokeWidth="8"/>
                    ))}
                    <circle cx="30" cy="51" r="14" fill="none" stroke="rgba(212,168,75,0.25)" strokeWidth="1"/>
                    <text x="30" y="55" textAnchor="middle" fontSize="16" fill="rgba(212,168,75,0.4)">✦</text>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 스크롤 힌트 */}
      <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:8}}>
        <button onClick={()=>setCenterIdx(p=>Math.max(2,p-5))} style={{
          background:"rgba(109,40,217,0.2)",border:`1px solid ${C.border}`,
          borderRadius:8,padding:"4px 12px",cursor:"pointer",color:C.sub,fontSize:16,
        }}>‹</button>
        <div style={{display:"flex",gap:2,alignItems:"center"}}>
          {Array.from({length:8},(_,i)=>{
            const pos = Math.floor(centerIdx/deck.length*8);
            return <div key={i} style={{width:i===pos?12:4,height:4,borderRadius:2,background:i===pos?C.purple:C.border,transition:"all 0.2s"}}/>;
          })}
        </div>
        <button onClick={()=>setCenterIdx(p=>Math.min(deck.length-3,p+5))} style={{
          background:"rgba(109,40,217,0.2)",border:`1px solid ${C.border}`,
          borderRadius:8,padding:"4px 12px",cursor:"pointer",color:C.sub,fontSize:16,
        }}>›</button>
      </div>
    </div>
  );
}