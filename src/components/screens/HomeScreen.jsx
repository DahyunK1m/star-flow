import { C, FONT } from "../../constants/colors.js";
import { LETTERS } from "../../constants/letters.js";

const MENUS = [
  {id:"saju",    icon:"🏮", label:"정통 사주",  desc:"나의 사주 전체 분석",   color:"#a78bfa"},
  {id:"newyear", icon:"🎋", label:"신년운세",   desc:"2026년 나의 흐름",      color:"#34d399"},
  {id:"gungham", icon:"💞", label:"사주 궁합",  desc:"두 사람의 인연 분석",   color:"#f472b6"},
  {id:"reunion", icon:"💌", label:"재회운",     desc:"이별 후 흐름과 가능성", color:"#fb923c"},
  {id:"tarot",   icon:"🃏", label:"타로",        desc:"78장 카드 스프레드",   color:"#60a5fa"},
  {id:"zodiac",  icon:"🌠", label:"별자리 운세", desc:"오늘의 별자리 메시지",  color:"#c084fc"},
];

export default function HomeScreen({ profiles, onAddProfile, navigate }) {
  const me = profiles.find(p=>p.relation==="본인") || profiles[0];
  const letter = LETTERS[new Date().getDate() % LETTERS.length];

  return (
    <div style={{padding:"0 0 100px"}}>
      {/* 헤더 */}
      <div style={{padding:"20px 20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22,animation:"float 3s ease-in-out infinite",display:"inline-block"}}>🌌</span>
          <h1 style={{
            fontFamily:FONT,fontSize:20,margin:0,
            background:`linear-gradient(135deg,#60a5fa,#7c3aed)`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
          }}>별의 흐름</h1>
        </div>
        {me&&<div style={{color:C.sub,fontFamily:FONT,fontSize:11}}>{me.name}님 ✦</div>}
      </div>

      <div style={{padding:"0 16px"}}>
        {/* 오늘의 편지 */}
        <div style={{
          background:`linear-gradient(135deg,rgba(109,40,217,0.15),rgba(67,56,202,0.1))`,
          border:`1px solid ${C.purple}44`,borderRadius:20,padding:"20px",
          marginBottom:16,position:"relative",overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:-10,right:-10,fontSize:60,opacity:0.06}}>✉️</div>
          <div style={{color:C.purple,fontFamily:FONT,fontSize:12,marginBottom:10}}>✉️ 오늘 별이 보낸 편지</div>
          <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.85,margin:"0 0 14px",fontStyle:"italic"}}>
            "{letter}"
          </p>
          <div onClick={()=>navigate("today")} style={{
            display:"inline-flex",alignItems:"center",gap:4,
            color:C.purple,fontFamily:FONT,fontSize:12,cursor:"pointer",
            borderBottom:`1px solid ${C.purple}44`,paddingBottom:1,
          }}>
            오늘의 운세 보기 →
          </div>
        </div>

        {/* 메뉴 그리드 */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {MENUS.map(m=>(
            <div key={m.id} onClick={()=>navigate(m.id)} style={{
              background:C.card,border:`1px solid ${m.color}33`,
              borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"center",
              transition:"all 0.2s",boxShadow:`0 2px 16px ${m.color}11`,
              position:"relative",overflow:"hidden",
            }}>
              <div style={{position:"absolute",top:-8,right:-8,fontSize:48,opacity:0.06}}>{m.icon}</div>
              <div style={{fontSize:28,marginBottom:8}}>{m.icon}</div>
              <div style={{color:C.text,fontFamily:FONT,fontSize:13,marginBottom:3,fontWeight:"bold"}}>{m.label}</div>
              <div style={{color:C.sub,fontFamily:FONT,fontSize:10,lineHeight:1.4}}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
