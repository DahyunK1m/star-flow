import { C, FONT } from '../../constants/colors.js';

export const GlassCard = ({ children, glow, style={} }) => (
  <div style={{
    background: C.card,
    border: `1px solid ${glow ? C.glow : C.border}`,
    borderRadius: 20, padding: 20,
    backdropFilter: "blur(20px)",
    boxShadow: glow ? `0 0 24px ${C.glow},inset 0 0 24px rgba(160,130,220,0.04)` : "none",
    ...style
  }}>
    {children}
  </div>
);

export const Btn = ({ children, onClick, disabled, variant="primary", style={} }) => {
  const bg = {
    primary: `linear-gradient(135deg,#6d28d9,#4338ca)`,
    rose:    `linear-gradient(135deg,#9d174d,#6d28d9)`,
    ghost:   `transparent`,
    gold:    `linear-gradient(135deg,#92400e,#d97706)`,
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:"12px 0", borderRadius:12,
      border: variant==="ghost" ? `1px solid ${C.border}` : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      background: bg,
      color: variant==="ghost" ? C.sub : "white",
      fontFamily: FONT, fontSize: 14,
      width: "100%", opacity: disabled ? 0.45 : 1,
      transition: "all 0.2s",
      boxShadow: variant!=="ghost" ? "0 4px 16px rgba(109,40,217,0.4)" : "none",
      ...style
    }}>{children}</button>
  );
};

export const Spinner = ({ msg="별의 기운을 읽는 중…" }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:40 }}>
    <div style={{ display:"flex", gap:8 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width:10, height:10, borderRadius:"50%",
          background: `radial-gradient(circle,${C.purple},#4a2080)`,
          animation: `bounce 1.2s ${i*0.2}s infinite ease-in-out`
        }}/>
      ))}
    </div>
    <p style={{ color:C.sub, fontFamily:FONT, fontSize:13, margin:0 }}>{msg}</p>
  </div>
);

export const Stars = () => {
  const stars = Array.from({length:60},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    s:Math.random()*2+0.4, delay:Math.random()*5, dur:Math.random()*3+2
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
      {stars.map(s=>(
        <div key={s.id} style={{
          position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
          width:s.s, height:s.s, borderRadius:"50%", background:"white",
          animation:`tw ${s.dur}s ${s.delay}s infinite ease-in-out`
        }}/>
      ))}
    </div>
  );
};

export const PillarRow = ({ saju }) => {
  if(!saju) return null;
  return (
    <div style={{ display:"flex", gap:6 }}>
      {[{l:"년",v:saju.yp},{l:"월",v:saju.mp},{l:"일",v:saju.dp},{l:"시",v:saju.tp||"–"}].map(({l,v})=>(
        <div key={l} style={{
          flex:1, textAlign:"center",
          background:"rgba(109,40,217,0.12)", border:`1px solid rgba(109,40,217,0.25)`,
          borderRadius:10, padding:"6px 4px"
        }}>
          <div style={{ color:C.sub, fontSize:9, fontFamily:FONT }}>{l}주</div>
          <div style={{ color:C.text, fontSize:16, fontFamily:FONT, letterSpacing:2, marginTop:2 }}>{v}</div>
        </div>
      ))}
    </div>
  );
};
