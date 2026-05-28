import { useState } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn, Spinner } from "../common/UI.jsx";
import ProfilePicker from "../common/ProfilePicker.jsx";
import { callSaju } from "../../utils/api.js";

export default function ReunionScreen({ profiles, onAddProfile, onBack }) {
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState("pick");

  const read = async () => {
    if(!selA||!selB) return;
    setLoading(true); setResult(null); setStep("result");

    const prompt = `두 사람의 사주를 바탕으로 재회운을 분석해주세요.

[분석 원칙]
① 이별 후 두 사람의 사주적 흐름과 인연의 강도를 분석한다.
② 재회 가능성을 단계로 표현하되 단정하지 않는다.
③ 일지·월지 관계, 지지 충합을 반드시 반영한다.
④ 상담자(A)의 성별에 맞는 현실적 조언을 준다 (여성이면 NC전략, 남성이면 빠른 행동 전략).

JSON으로만:
{
  "summary": "재회운 총평 — 두 사람의 인연 흐름과 재회 가능성 한 문장",
  "cause": "이별 원인 분석 — 사주적 갈등 패턴·감정 표현 차이·반복 패턴",
  "other_after": "상대의 이별 후 흐름 — 미련 가능성·연락 망설이는 이유",
  "my_after": "나의 이별 후 흐름 — 내 감정 패턴·조심할 점",
  "possibility": "재회 가능성 — 높음/보통/낮음 중 하나와 그 이유",
  "contact": "연락운 — 누가 먼저 할지·연락 오는 방식·기다릴 때 조심할 점",
  "if_reunion": "재회가 된다면 — 좋아질 점·다시 반복될 문제·확인해야 할 것",
  "attitude": "재회를 위한 태도 — 해야 할 행동·하지 말아야 할 행동·대화 방식",
  "recommend": "재회를 추천하는 경우 — 3가지",
  "caution": "재회를 조심해야 하는 경우 — 3가지",
  "final": "최종 조언 — 재회보다 중요한 나의 안정감과 앞으로의 선택"
}`;

    try {
      const r = await callSaju("gungham", {
        profile: {y:selA.y,m:selA.m,d:selA.d,h:selA.h,isLunar:false,name:selA.name,gender:selA.gender},
        profile2: {y:selB.y,m:selB.m,d:selB.d,h:selB.h,isLunar:false,name:selB.name,gender:selB.gender},
        prompt, maxTokens:2500
      });
      if(r.result) setResult(r.result); else setResult({error:true});
    } catch { setResult({error:true}); }
    setLoading(false);
  };

  if(step==="pick") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:0}}>💌 재회운</h2>
      </div>
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:"0 0 4px"}}>나 (A)</p>
        <ProfilePicker profiles={profiles} selected={selA} onSelect={p=>{if(p.id!==selB?.id)setSelA(p);}}
          onAdd={onAddProfile} label=""/>
      </GlassCard>
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:"0 0 4px"}}>상대방 (B)</p>
        <ProfilePicker profiles={profiles} selected={selB} onSelect={p=>{if(p.id!==selA?.id)setSelB(p);}}
          onAdd={onAddProfile} label=""/>
      </GlassCard>
      <Btn variant="rose" onClick={read} disabled={!selA||!selB||loading}>💌 재회운 보기</Btn>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setStep("pick");setResult(null);}} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:16,margin:0}}>{selA?.name} ✦ {selB?.name} 재회운</h2>
      </div>
      {loading&&<GlassCard><Spinner msg="재회운을 읽는 중…"/></GlassCard>}
      {result&&!result.error&&(
        <>
          <GlassCard glow>
            <div style={{color:C.rose,fontFamily:FONT,fontSize:13,marginBottom:8}}>💌 재회운 총평</div>
            <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:0}}>{result.summary}</p>
          </GlassCard>
          {[
            {icon:"🔍",label:"이별 원인 분석",v:result.cause,col:"#f87171"},
            {icon:"💭",label:`${selB?.name}의 이별 후 흐름`,v:result.other_after,col:C.cyan},
            {icon:"🪞",label:`나(${selA?.name})의 이별 후 흐름`,v:result.my_after,col:C.purple},
            {icon:"🎯",label:"재회 가능성",v:result.possibility,col:C.gold},
            {icon:"📱",label:"연락운",v:result.contact,col:C.rose},
            {icon:"🌱",label:"재회가 된다면",v:result.if_reunion,col:"#86efac"},
            {icon:"🧭",label:"재회를 위해 필요한 태도",v:result.attitude,col:C.cyan},
            {icon:"✅",label:"재회를 추천하는 경우",v:result.recommend,col:"#86efac"},
            {icon:"⚠️",label:"재회를 조심해야 하는 경우",v:result.caution,col:"#f87171"},
            {icon:"💫",label:"최종 조언",v:result.final,col:C.gold},
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
