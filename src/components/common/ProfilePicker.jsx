import { useState } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn } from "./UI.jsx";
import ProfileForm from "./ProfileForm.jsx";

export default function ProfilePicker({ profiles, selected, onSelect, onAdd, label, multi=false }) {
  const [adding, setAdding] = useState(false);

  const isSelected = (p) => multi
    ? (Array.isArray(selected) ? selected.some(s=>s?.id===p.id) : false)
    : selected?.id === p.id;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {label && <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:0}}>{label}</p>}

      {profiles.map(p=>(
        <div key={p.id} onClick={()=>onSelect(p)} style={{
          display:"flex",alignItems:"center",gap:12,padding:"12px 16px",
          borderRadius:14,cursor:"pointer",
          border:`1px solid ${isSelected(p)?C.purple:C.border}`,
          background:isSelected(p)?"rgba(109,40,217,0.15)":"rgba(255,255,255,0.02)",
          transition:"all 0.2s"
        }}>
          <span style={{fontSize:24}}>{p.gender==="여"?"👩":"👨"}</span>
          <div style={{flex:1}}>
            <div style={{color:C.text,fontFamily:FONT,fontSize:14}}>{p.name}</div>
            <div style={{color:C.sub,fontFamily:FONT,fontSize:11}}>
              {p.relation} · {p.saju?.el}오행 · 일주 {p.saju?.dp}
              {p.birthplace && ` · ${p.birthplace}`}
            </div>
          </div>
          {isSelected(p)&&<span style={{color:C.purple,fontSize:18}}>✓</span>}
        </div>
      ))}

      {adding ? (
        <GlassCard>
          <ProfileForm
            onSave={(p)=>{ onAdd(p); setAdding(false); }}
            onCancel={()=>setAdding(false)}
          />
        </GlassCard>
      ) : (
        <button onClick={()=>setAdding(true)} style={{
          padding:"12px",borderRadius:12,cursor:"pointer",fontFamily:FONT,fontSize:13,
          border:`1px dashed ${C.border}`,background:"rgba(255,255,255,0.02)",color:C.sub,
        }}>+ 새 프로필 추가</button>
      )}
    </div>
  );
}
