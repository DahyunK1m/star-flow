import { useState } from "react";
import { C, FONT, inp } from "../../constants/colors.js";
import { buildProfile } from "../../utils/profileStorage.js";
import { calcSaju, lunarToSolar } from "../../utils/sajuCalculator.js";
import { Btn } from "./UI.jsx";

const RELATIONS = ["본인","연인","가족","친구","지인"];
const REGIONS   = [
  "서울특별시","부산광역시","대구광역시","인천광역시","광주광역시",
  "대전광역시","울산광역시","세종특별자치시","경기도","강원도",
  "충청북도","충청남도","전라북도","전라남도","경상북도","경상남도",
  "제주특별자치도","해외"
];
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

const splitDate = (date="") => {
  const raw = (date||"").replace(/\D/g,"");
  return { y:raw.slice(0,4)||"", m:raw.slice(4,6)||"", d:raw.slice(6,8)||"" };
};

export default function ProfileForm({ initial={}, onSave, onCancel }) {
  const initD = splitDate(initial.date);
  const [f, setF] = useState({
    name:"", lunar:false, hour:"", gender:"여", relation:"본인", birthplace:"",
    ...initial,
    birthY:initD.y, birthM:initD.m, birthD:initD.d,
    showSiji:false, showRegion:false,
  });
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  // 실시간 사주 미리보기
  const preview = (() => {
    if(!f.birthY||!f.birthM||!f.birthD) return null;
    try {
      const y=parseInt(f.birthY), m=parseInt(f.birthM), d=parseInt(f.birthD);
      if(isNaN(y)||isNaN(m)||isNaN(d)) return null;
      let sy=y,sm=m,sd=d;
      if(f.lunar){ const r=lunarToSolar(y,m,d); sy=r.y; sm=r.m; sd=r.d; }
      const h = f.hour!=null&&f.hour!=="" ? parseInt(f.hour) : null;
      return calcSaju(sy,sm,sd,h);
    } catch { return null; }
  })();

  const valid = f.name.trim()&&f.birthY.length===4&&f.birthM.length>=1&&f.birthD.length>=1;

  const save = () => {
    const profile = buildProfile(f);
    onSave(profile);
  };

  const BottomSheet = ({ title, items, current, onSelect, onClose, getId, getLabel }) => (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"100%",maxWidth:480,background:"#100820",
        borderRadius:"20px 20px 0 0",border:`1px solid ${C.border}`,borderBottom:"none",
        padding:"0 0 32px",maxHeight:"75vh",display:"flex",flexDirection:"column",
      }}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 8px"}}>
          <div style={{width:40,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)"}}/>
        </div>
        <div style={{textAlign:"center",color:C.text,fontFamily:FONT,fontSize:16,padding:"4px 0 16px",borderBottom:`1px solid ${C.border}`,marginBottom:8}}>
          {title}
        </div>
        <div style={{overflowY:"auto",padding:"0 16px"}}>
          {items.map(item=>{
            const id=getId(item), label=getLabel(item), isSel=current===id;
            return (
              <div key={id} onClick={()=>{onSelect(id);onClose();}} style={{
                padding:"14px 16px",borderRadius:12,marginBottom:6,cursor:"pointer",
                border:`1px solid ${isSel?C.purple:C.border}`,
                background:isSel?"rgba(109,40,217,0.2)":"rgba(255,255,255,0.03)",
                display:"flex",alignItems:"center",justifyContent:"space-between",
              }}>
                <span style={{color:C.text,fontFamily:FONT,fontSize:14}}>{label}</span>
                {isSel&&<span style={{color:C.purple}}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

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

      {/* 생년월일 */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8}}>
        <input type="number" placeholder="출생연도 (예: 1999)" value={f.birthY}
          onChange={e=>set("birthY",e.target.value)} style={inp} inputMode="numeric"/>
        <input type="number" placeholder="월" value={f.birthM}
          onChange={e=>set("birthM",e.target.value)} style={inp} inputMode="numeric"/>
        <input type="number" placeholder="일" value={f.birthD}
          onChange={e=>set("birthD",e.target.value)} style={inp} inputMode="numeric"/>
      </div>

      {/* 사주 미리보기 */}
      {preview&&(
        <div style={{background:"rgba(109,40,217,0.1)",border:`1px solid rgba(109,40,217,0.25)`,borderRadius:10,padding:"10px 14px"}}>
          <div style={{color:C.sub,fontFamily:FONT,fontSize:10,marginBottom:6}}>✦ 사주 미리보기</div>
          <div style={{display:"flex",gap:6}}>
            {[{l:"년주",v:preview.yp},{l:"월주",v:preview.mp},{l:"일주",v:preview.dp},{l:"시주",v:preview.tp||"미상"}].map(({l,v})=>(
              <div key={l} style={{flex:1,textAlign:"center",background:"rgba(109,40,217,0.15)",borderRadius:8,padding:"4px 2px",border:`1px solid rgba(109,40,217,0.3)`}}>
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

      {/* 태어난 시간 */}
      <div>
        <div style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:8}}>태어난 시간</div>
        <button onClick={()=>set("showSiji",true)} style={{
          width:"100%",padding:"12px 16px",borderRadius:10,cursor:"pointer",
          border:`1px solid ${f.hour?C.purple:C.border}`,
          background:f.hour?"rgba(109,40,217,0.15)":"rgba(255,255,255,0.03)",
          display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:FONT,
        }}>
          <span style={{color:f.hour?C.text:C.sub,fontSize:13}}>
            {f.hour ? SIJI.find(s=>String(s.h)===String(f.hour))?.label||"시간 모름" : "⏰ 태어난 시간 선택"}
          </span>
          <span style={{color:C.sub,fontSize:12}}>▾</span>
        </button>
      </div>

      {/* 출생지 */}
      <div>
        <div style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:8}}>출생지 <span style={{fontSize:10,opacity:0.6}}>(선택사항)</span></div>
        <button onClick={()=>set("showRegion",true)} style={{
          width:"100%",padding:"12px 16px",borderRadius:10,cursor:"pointer",
          border:`1px solid ${f.birthplace?C.purple:C.border}`,
          background:f.birthplace?"rgba(109,40,217,0.15)":"rgba(255,255,255,0.03)",
          display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:FONT,
        }}>
          <span style={{color:f.birthplace?C.text:C.sub,fontSize:13}}>
            {f.birthplace||"📍 출생지 선택"}
          </span>
          <span style={{color:C.sub,fontSize:12}}>▾</span>
        </button>
      </div>

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

      {/* 시지 바텀시트 */}
      {f.showSiji&&(
        <BottomSheet
          title="태어난 시간"
          items={[{label:"⏰ 시간 모름", h:""},...SIJI]}
          current={String(f.hour)}
          onSelect={h=>set("hour",h)}
          onClose={()=>set("showSiji",false)}
          getId={s=>String(s.h)}
          getLabel={s=>s.label}
        />
      )}

      {/* 출생지 바텀시트 */}
      {f.showRegion&&(
        <BottomSheet
          title="출생지"
          items={["선택 안 함",...REGIONS]}
          current={f.birthplace}
          onSelect={r=>set("birthplace",r==="선택 안 함"?"":r)}
          onClose={()=>set("showRegion",false)}
          getId={r=>r==="선택 안 함"?"":r}
          getLabel={r=>r}
        />
      )}
    </div>
  );
}
