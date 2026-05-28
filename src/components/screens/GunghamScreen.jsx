import { useState } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn, Spinner, PillarRow } from "../common/UI.jsx";
import ProfilePicker from "../common/ProfilePicker.jsx";
import { callSaju } from "../../utils/api.js";

export default function GunghamScreen({ profiles, onAddProfile, onBack }) {
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState("pick");

  const read = async () => {
    if(!selA||!selB) return;
    setLoading(true); setResult(null); setStep("result");
    const prompt = `[궁합 분석 원칙]
① 두 사람의 일간 관계(천간 생극), 일지·월지 관계(지지 합충형파해), 삼합·방합·육합을 반드시 분석한다.
② 연애/결혼 궁합에서 일지와 월지 관계를 핵심으로 본다.
③ 오행 균형(한쪽 부족한 오행을 상대가 채워주는지), 십성 관계도 분석한다.
④ 점수는 위 요소들을 종합하여 객관적으로 산출한다.

JSON으로만 (각 항목 80~120자):
{
  "score": 0~100 숫자만,
  "grade": "최상/상/중/하/최하",
  "summary": "전체 궁합 총평 — 일지/월지 관계 포함 (120자)",
  "ilgan": "일간 궁합 — 두 사람 일간 관계·서로 인식 방식 (80자)",
  "ilji": "일지 궁합 — 실제 가까워졌을 때의 느낌·연애 갈등 (80자)",
  "wolji": "월지 궁합 — 생활 리듬·함께 지낼 때의 편안함 (80자)",
  "jiji": "지지 합충형파해 — 끌림과 갈등 패턴 (80자)",
  "element": "오행 궁합 — 보완·부딪히는 기운 (60자)",
  "expression": "애정 표현 방식 — 각자 사랑 표현·오해 생기는 지점 (80자)",
  "conflict": "갈등 패턴 — 자주 부딪힐 주제·불안정해지는 원인 (80자)",
  "strength": "관계의 장점 — 함께 있을 때 좋아지는 것·성장 가능성 (80자)",
  "careful": "조심해야 할 점 — 반복되면 위험한 패턴 (80자)",
  "skin_temp": "스킨십 온도 — 정서적 친밀감·서로에게 끌리는 방식 (80자)",
  "marriage": "결혼/장기연애 가능성 — 장기 조율 가능성·가치관 차이 (80자)",
  "final": "궁합 최종 조언 — 관계를 좋게 만들기 위한 핵심 태도 (80자)",
  "keyword": "이 인연 키워드 3개 쉼표구분"
}`;

    try {
      const r = await callSaju("gungham", {
        profile: {y:selA.y,m:selA.m,d:selA.d,h:selA.h,isLunar:false,name:selA.name,gender:selA.gender},
        profile2:{y:selB.y,m:selB.m,d:selB.d,h:selB.h,isLunar:false,name:selB.name,gender:selB.gender},
        prompt, maxTokens:2500
      });
      if(r.result) setResult(r.result); else setResult({error:true});
    } catch { setResult({error:true}); }
    setLoading(false);
  };

  const gradeColor={"최상":"#22c55e","상":"#86efac","중":C.gold,"하":"#f87171","최하":"#ef4444"};

  if(step==="pick") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:0}}>💞 사주 궁합</h2>
      </div>
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:8}}>첫 번째 사람</p>
        <ProfilePicker profiles={profiles} selected={selA} onSelect={p=>{if(p.id!==selB?.id)setSelA(p);}} onAdd={onAddProfile} label=""/>
      </GlassCard>
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:8}}>두 번째 사람</p>
        <ProfilePicker profiles={profiles} selected={selB} onSelect={p=>{if(p.id!==selA?.id)setSelB(p);}} onAdd={onAddProfile} label=""/>
      </GlassCard>
      <Btn variant="rose" onClick={read} disabled={!selA||!selB||loading}>💕 궁합 보기</Btn>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setStep("pick");setResult(null);}} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:16,margin:0}}>{selA?.name} ✦ {selB?.name}</h2>
      </div>
      {loading&&<GlassCard><Spinner msg="궁합을 읽는 중…"/></GlassCard>}
      {result&&!result.error&&(
        <>
          <GlassCard glow style={{textAlign:"center"}}>
            <div style={{fontSize:52,fontFamily:FONT,color:gradeColor[result.grade]||C.purple,fontWeight:"bold"}}>{result.score}점</div>
            <div style={{display:"inline-block",padding:"4px 18px",borderRadius:20,marginBottom:12,background:`${gradeColor[result.grade]||C.purple}22`,border:`1px solid ${gradeColor[result.grade]||C.purple}66`,color:gradeColor[result.grade]||C.purple,fontFamily:FONT,fontSize:14}}>{result.grade} 궁합</div>
            <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:"0 0 10px"}}>{result.summary}</p>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              {result.keyword?.split(",").map(k=>(
                <span key={k} style={{padding:"3px 12px",borderRadius:20,fontFamily:FONT,fontSize:11,background:"rgba(109,40,217,0.2)",border:`1px solid ${C.purple}44`,color:C.purple}}>{k.trim()}</span>
              ))}
            </div>
          </GlassCard>
          {[
            {icon:"⚡",label:"일간 궁합",v:result.ilgan,col:C.cyan},
            {icon:"💫",label:"일지 궁합",v:result.ilji,col:C.rose},
            {icon:"🌊",label:"월지 궁합",v:result.wolji,col:"#60a5fa"},
            {icon:"🔮",label:"지지 합충형파해",v:result.jiji,col:C.purple},
            {icon:"🌿",label:"오행 궁합",v:result.element,col:"#86efac"},
            {icon:"💝",label:"애정 표현 방식",v:result.expression,col:C.rose},
            {icon:"⚠️",label:"갈등 패턴",v:result.conflict,col:"#f87171"},
            {icon:"✨",label:"관계의 장점",v:result.strength,col:C.gold},
            {icon:"🛡️",label:"조심해야 할 점",v:result.careful,col:"#f87171"},
            {icon:"🌡️",label:"스킨십 온도",v:result.skin_temp,col:C.rose},
            {icon:"💍",label:"결혼/장기연애 가능성",v:result.marriage,col:C.gold},
            {icon:"🎯",label:"궁합 최종 조언",v:result.final,col:C.cyan},
          ].map(({icon,label,v,col})=>v&&(
            <GlassCard key={label}>
              <div style={{color:col,fontFamily:FONT,fontSize:12,marginBottom:6}}>{icon} {label}</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:0}}>{v}</p>
            </GlassCard>
          ))}
        </>
      )}
      {result?.error&&<GlassCard><p style={{color:"#f87171",fontFamily:FONT,fontSize:13,textAlign:"center",margin:0}}>분석 중 오류가 발생했습니다.</p></GlassCard>}
    </div>
  );
}
