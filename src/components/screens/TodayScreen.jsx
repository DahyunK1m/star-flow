import { useState, useEffect } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn, Spinner } from "../common/UI.jsx";
import { callSaju } from "../../utils/api.js";
import { getCached, setCached } from "../../utils/cache.js";
import { getDayPillar, getYearPillar } from "../../utils/sajuCalculator.js";

export default function TodayScreen({ profiles, onAddProfile }) {
  const me = profiles.find(p=>p.relation==="본인")||profiles[0];
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);
  const [loaded,setLoaded] = useState(false);

  useEffect(()=>{ if(me&&!loaded){setLoaded(true);load();} },[me]);

  const load = async () => {
    if(!me) return;
    setLoading(true); setResult(null);
    const cached = getCached(me.id,"today");
    if(cached){setResult(cached);setLoading(false);return;}
    const now=new Date();
    const todayDp=getDayPillar(now.getFullYear(),now.getMonth()+1,now.getDate());
    const todayYp=getYearPillar(now.getFullYear());
    const today=now.toLocaleDateString("ko-KR");
    const {yp,mp,dp,tp,el}=me.saju;
    const prompt=`[오늘의 운세 분석]
오늘(${today}) 일진: 년주${todayYp} 일주${todayDp.str}
오늘 일진의 천간·지지가 상담자 원국의 지지와 어떻게 합·충·생·극하는지 분석하여 오늘 하루 운세를 구체적으로 서술하세요.
"오늘 일진이 ~이라 ~한 에너지가 흐릅니다" 형식으로 일진 근거를 명시하세요.

JSON으로만:
{
  "overall": "🌱 오늘 총운 — 일진 근거 포함 (60자)",
  "love": "오늘 연애운 구체적으로 (60자)",
  "money": "오늘 금전운 구체적으로 (60자)",
  "work": "오늘 직장·학업운 구체적으로 (60자)",
  "lucky_color": "오늘의 행운색 (색깔 이름)",
  "score": {"love":0~100,"money":0~100,"work":0~100},
  "letter": "오늘 사주에서 상담자에게 보내는 위로와 응원 감성 편지 (100자, 따뜻하고 시적으로)"
}`;
    try {
      const r=await callSaju("interpret",{
        profile:{y:me.y,m:me.m,d:me.d,h:me.h,isLunar:false,name:me.name,gender:me.gender,birthplace:me.birthplace||""},
        prompt,maxTokens:1000,model:"openai"
      });
      if(r.result){setCached(me.id,"today",r.result);setResult(r.result);}
      else setResult({error:true});
    } catch{setResult({error:true});}
    setLoading(false);
  };

  if(!me) return (
    <div style={{padding:"40px 16px",textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:16}}>🌙</div>
      <p style={{color:C.sub,fontFamily:FONT,fontSize:14}}>본인 프로필을 먼저 등록해주세요</p>
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:6}}>🌙</div>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:"0 0 4px"}}>오늘의 운세</h2>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:0}}>
          {me.name}님 · {new Date().toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"long"})}
        </p>
      </div>
      {loading&&<GlassCard><Spinner msg="오늘의 흐름을 읽는 중…"/></GlassCard>}
      {result&&!result.error&&(
        <>
          <GlassCard glow>
            <p style={{color:C.gold,fontFamily:FONT,fontSize:14,lineHeight:1.7,margin:"0 0 14px",textAlign:"center"}}>{result.overall}</p>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:3}}>🎨</div>
              <div style={{color:C.sub,fontFamily:FONT,fontSize:10}}>행운의 색</div>
              <div style={{color:C.text,fontFamily:FONT,fontSize:13,marginTop:2}}>{result.lucky_color}</div>
            </div>
          </GlassCard>
          <GlassCard>
            <p style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:12}}>오늘의 운세</p>
            {[["💕 연애운","love",C.rose],["💰 금전운","money",C.gold],["💼 직장·학업운","work",C.cyan]].map(([l,k,col])=>(
              <div key={k} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:C.sub,fontFamily:FONT,fontSize:12}}>{l}</span>
                  <span style={{color:col,fontFamily:FONT,fontSize:12,fontWeight:"bold"}}>{result.score?.[k]}점</span>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${result.score?.[k]||0}%`,background:col,borderRadius:3}}/>
                </div>
              </div>
            ))}
          </GlassCard>
          {[{e:"💕",l:"오늘의 연애운",v:result.love,col:C.rose},{e:"💰",l:"오늘의 금전운",v:result.money,col:C.gold},{e:"💼",l:"오늘의 직장·학업운",v:result.work,col:C.cyan}].map(({e,l,v,col})=>v&&(
            <GlassCard key={l}>
              <div style={{color:col,fontFamily:FONT,fontSize:12,marginBottom:6}}>{e} {l}</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.7,margin:0}}>{v}</p>
            </GlassCard>
          ))}
          {result.letter&&(
            <GlassCard glow style={{background:"rgba(109,40,217,0.08)",border:`1px solid ${C.purple}44`}}>
              <div style={{color:C.purple,fontFamily:FONT,fontSize:12,marginBottom:8}}>✉️ 오늘 별이 보낸 편지</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.9,margin:0,fontStyle:"italic"}}>"{result.letter}"</p>
            </GlassCard>
          )}
          <Btn variant="ghost" onClick={()=>{setResult(null);setLoaded(false);load();}}>🔄 다시 읽기</Btn>
        </>
      )}
    </div>
  );
}
