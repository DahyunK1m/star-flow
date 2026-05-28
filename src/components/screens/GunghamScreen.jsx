import { useState } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn, Spinner, PillarRow } from "../common/UI.jsx";
import ProfilePicker from "../common/ProfilePicker.jsx";
import { callSaju } from "../../utils/api.js";
import { saveReport, loadReport } from "../../utils/cache.js";

export default function GunghamScreen({ profiles, onAddProfile, onBack }) {
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [step,        setStep]        = useState("pick");
  const [showDetail,  setShowDetail]  = useState(false);
  const [detail,      setDetail]      = useState(null);
  const [detailLoading,setDetailLoading] = useState(false);

  // 궁합 기본 분석
  const read = async () => {
    if(!selA||!selB) return;
    setLoading(true); setResult(null); setStep("result");

    const prompt = `당신은 한국 전통 사주명리학 전문가입니다. 두 사람의 궁합을 분석해주세요.

분석 원칙:
- 일간 관계(천간 생극), 일지·월지 관계(지지 합충형파해)를 반드시 분석한다
- 두 사람의 이름을 직접 언급하며 분석한다 (A이름님은 ~, B이름님은 ~)
- 추상적 서술 대신 실생활 예시로 구체적으로 쓴다
- 마크다운(**, ##, -, *) 절대 사용 금지. 자연스러운 문장으로

JSON으로만 (각 항목 150~200자, 스토리텔링 문체):
{
  "score": 0~100 숫자만,
  "tagline": "두 사람 관계를 비유로 표현한 한 줄 (예: 예리한 보석과 단단한 도끼가 만드는 짜릿한 스파크) (30자)",
  "summary": "두 사람의 전체적인 관계 분위기. 어떻게 끌리고, 어떤 안정감이 있으며, 어디서 조율이 필요한지. 두 이름 직접 언급 (200자)",
  "ilgan": "두 사람 일간 관계. 서로를 어떻게 인식하는지, 성격적으로 잘 맞는 부분과 자존심이 부딪히는 부분 (150자)",
  "ilji": "일지 궁합. 실제로 가까워졌을 때의 느낌, 연애 중 반복될 수 있는 갈등, 정서적 안정감 여부 (150자)",
  "element": "오행 궁합. 서로에게 보완되는 오행, 부딪히는 오행, 관계에서 균형 잡는 방법 구체적으로 (150자)",
  "conflict": "갈등 패턴. 자주 부딪히는 주제, 싸울 때 각자 보이는 모습, 관계 불안정해지는 원인. 실생활 예시 포함 (150자)",
  "strength": "관계의 장점. 함께 있을 때 좋아지는 것, 서로에게 배울 수 있는 점, 함께하면 시너지 나는 분야 (150자)",
  "love_style": "두 사람의 연애 스타일 차이. 각자 원하는 것과 표현 방식의 차이, 오해가 생기기 쉬운 지점 (150자)",
  "final": "이 관계를 좋게 만들기 위한 핵심 조언. 두 이름 각각에게 구체적인 실천 팁 (150자)",
  "keyword": "이 인연을 설명하는 키워드 3개 쉼표구분"
}`;

    try {
      const r = await callSaju("gungham", {
        profile:  {y:selA.y,m:selA.m,d:selA.d,h:selA.h,isLunar:false,name:selA.name,gender:selA.gender},
        profile2: {y:selB.y,m:selB.m,d:selB.d,h:selB.h,isLunar:false,name:selB.name,gender:selB.gender},
        prompt, maxTokens:2500
      });
      if(r.result) setResult(r.result); else setResult({error:true});
    } catch { setResult({error:true}); }
    setLoading(false);
  };

  // 상세 궁합 리포트
  const readDetail = async () => {
    if(!selA||!selB) return;
    setDetailLoading(true); setDetail(null);

    const cacheKey = `gungham_${selA.id}_${selB.id}`;
    const saved = loadReport(cacheKey, "detail");
    if(saved) { setDetail(saved); setDetailLoading(false); setShowDetail(true); return; }

    const prompt = `당신은 한국 전통 사주명리학 최고 전문가입니다.
두 사람의 궁합을 사주아이 스타일의 깊이 있는 리포트로 작성해주세요.

작성 원칙:
- 각 섹션마다 감성적인 비유로 시작 (예: "고속도로를 질주하는 스포츠카", "황소 두 마리가 뿔을 맞댄 형국")
- 두 사람 이름을 직접 언급하며 각자의 성향 분석
- 전문 용어는 반드시 쉬운 말로 풀어서 설명
- 갈등 상황을 실생활 예시로 구체적으로 묘사
- 각 섹션 마지막에 두 사람에게 실천 가능한 팁 제시
- 마크다운 절대 사용 금지. 자연스러운 문단으로

JSON으로만 (각 항목 300~450자, 스토리텔링 문체):
{
  "r1_overview": "궁합 총평. 두 사람의 만남을 상징하는 이미지로 시작. 점수의 의미, 끌림의 이유, 함께할 때의 시너지, 극복해야 할 과제를 스토리로 연결. 두 이름 직접 언급",
  "r2_daily": "일상 케미. 함께 있을 때의 분위기, 대화 스타일의 차이, 생활 리듬이 맞는 부분과 충돌하는 부분. 실생활 예시 (아침형/저녁형, 계획형/즉흥형 등) 포함",
  "r3_element": "오행 에너지 분석. 두 사람의 오행 조합이 만들어내는 화학 반응. 보완되는 기운과 과하게 부딪히는 기운. 부족한 오행을 채우는 방법 구체적으로 (데이트 장소, 커플 아이템 등)",
  "r4_conflict": "갈등 패턴 심층 분석. 두 사람이 싸울 때 어떤 모습인지 구체적으로. 자존심 충돌, 감정 처리 방식의 차이, 냉전이 길어지는 이유. 갈등을 줄이는 실천 팁",
  "r5_love": "연애 스타일과 속마음. 각자 연애에서 원하는 것, 사랑을 표현하는 방식, 상대방에게 서운할 때 어떻게 반응하는지. 서로의 연애 언어 차이와 오해를 줄이는 방법",
  "r6_strength": "이 관계의 빛나는 장점. 함께할 때 폭발하는 시너지, 서로에게 배울 수 있는 것, 두 사람이 함께 이룰 수 있는 것. 응원과 함께 마무리",
  "r7_marriage": "결혼과 장기연애 가능성. 현실적인 가치관 차이, 돈과 생활 방식의 조율, 가족 관계에서 주의할 점, 오래 함께하기 위한 핵심 전략",
  "r8_tip": "두 사람을 위한 맞춤 처방. 오행 균형을 맞추는 구체적인 방법 (데이트 장소, 커플 아이템, 대화 방식, 함께하면 좋은 활동). 이 관계를 더 좋게 만드는 마지막 조언"
}`;

    try {
      const r = await callSaju("gungham", {
        profile:  {y:selA.y,m:selA.m,d:selA.d,h:selA.h,isLunar:false,name:selA.name,gender:selA.gender},
        profile2: {y:selB.y,m:selB.m,d:selB.d,h:selB.h,isLunar:false,name:selB.name,gender:selB.gender},
        prompt, maxTokens:5000
      });
      if(r.result) {
        saveReport(cacheKey, "detail", r.result);
        setDetail(r.result); setShowDetail(true);
      } else setDetail({error:true});
    } catch { setDetail({error:true}); }
    setDetailLoading(false);
  };

  const gradeColor = {"최상":"#22c55e","상":"#86efac","중":C.gold,"하":"#f87171","최하":"#ef4444"};
  const score = result?.score||0;
  const grade = score>=90?"최상":score>=75?"상":score>=55?"중":score>=40?"하":"최하";

  // 선택 화면
  if(step==="pick") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:0}}>💞 사주 궁합</h2>
      </div>
      <GlassCard>
        <p style={{color:C.rose,fontFamily:FONT,fontSize:12,marginBottom:8,fontWeight:"bold"}}>첫 번째 사람</p>
        <ProfilePicker profiles={profiles} selected={selA} onSelect={p=>{if(p.id!==selB?.id)setSelA(p);}} onAdd={onAddProfile} label=""/>
      </GlassCard>
      <GlassCard>
        <p style={{color:C.cyan,fontFamily:FONT,fontSize:12,marginBottom:8,fontWeight:"bold"}}>두 번째 사람</p>
        <ProfilePicker profiles={profiles} selected={selB} onSelect={p=>{if(p.id!==selA?.id)setSelB(p);}} onAdd={onAddProfile} label=""/>
      </GlassCard>
      <Btn variant="rose" onClick={read} disabled={!selA||!selB||loading}>💕 궁합 보기</Btn>
    </div>
  );

  // 상세 리포트 화면
  if(showDetail) return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setShowDetail(false)} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:15,margin:0}}>{selA?.name} ♥ {selB?.name} 상세 궁합</h2>
      </div>
      {detailLoading&&<GlassCard><Spinner msg="두 사람의 인연을 깊이 읽는 중…"/></GlassCard>}
      {detail&&!detail.error&&(
        <>
          <GlassCard glow style={{textAlign:"center",padding:"24px 20px"}}>
            <div style={{fontSize:48,fontWeight:"bold",color:C.rose,fontFamily:FONT,marginBottom:4}}>{result?.score}점</div>
            <div style={{color:C.sub,fontFamily:FONT,fontSize:13,fontStyle:"italic"}}>{result?.tagline}</div>
          </GlassCard>
          {[
            {icon:"🌌",label:"두 사람의 인연, 한눈에",v:detail.r1_overview,col:C.purple},
            {icon:"☕",label:"일상에서의 케미",v:detail.r2_daily,col:C.cyan},
            {icon:"⚡",label:"에너지 충돌과 보완",v:detail.r3_element,col:"#34d399"},
            {icon:"🔥",label:"갈등, 이렇게 터진다",v:detail.r4_conflict,col:"#f87171"},
            {icon:"💕",label:"연애할 때 각자의 속마음",v:detail.r5_love,col:C.rose},
            {icon:"✨",label:"이 관계의 빛나는 가능성",v:detail.r6_strength,col:C.gold},
            {icon:"💍",label:"오래 함께한다면",v:detail.r7_marriage,col:"#f472b6"},
            {icon:"🧭",label:"두 사람을 위한 맞춤 처방",v:detail.r8_tip,col:C.cyan},
          ].map(({icon,label,v,col})=>v&&(
            <GlassCard key={label}>
              <div style={{color:col,fontFamily:FONT,fontSize:13,fontWeight:"bold",marginBottom:10}}>{icon} {label}</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:2,margin:0}}>{v}</p>
            </GlassCard>
          ))}
        </>
      )}
      {detail?.error&&<GlassCard><p style={{color:"#f87171",fontFamily:FONT,fontSize:13,textAlign:"center",margin:0}}>분석 중 오류가 발생했습니다.</p></GlassCard>}
    </div>
  );

  // 기본 결과 화면
  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setStep("pick");setResult(null);setShowDetail(false);}} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:16,margin:0}}>{selA?.name} ♥ {selB?.name}</h2>
      </div>
      {loading&&<GlassCard><Spinner msg="두 사람의 인연을 읽는 중…"/></GlassCard>}
      {result&&!result.error&&(
        <>
          {/* 점수 */}
          <GlassCard glow style={{textAlign:"center",padding:"28px 20px"}}>
            <div style={{fontSize:56,fontWeight:"bold",color:C.rose,fontFamily:FONT,lineHeight:1}}>{result.score}</div>
            <div style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:12}}>점</div>
            {result.tagline&&(
              <div style={{
                color:C.text,fontFamily:FONT,fontSize:13,fontStyle:"italic",
                padding:"10px 16px",borderRadius:12,background:"rgba(109,40,217,0.1)",
                border:`1px solid ${C.purple}33`,
              }}>"{result.tagline}"</div>
            )}
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginTop:12}}>
              {result.keyword?.split(",").map(k=>(
                <span key={k} style={{padding:"3px 12px",borderRadius:20,fontFamily:FONT,fontSize:11,background:"rgba(212,75,120,0.15)",border:`1px solid ${C.rose}44`,color:C.rose}}>{k.trim()}</span>
              ))}
            </div>
          </GlassCard>

          {/* 총평 */}
          {result.summary&&(
            <GlassCard>
              <div style={{color:C.purple,fontFamily:FONT,fontSize:12,fontWeight:"bold",marginBottom:8}}>💫 궁합 총평</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.9,margin:0}}>{result.summary}</p>
            </GlassCard>
          )}

          {/* 섹션들 */}
          {[
            {icon:"⚡",label:"일간 에너지 궁합",v:result.ilgan,col:C.cyan},
            {icon:"💫",label:"실제로 가까워졌을 때",v:result.ilji,col:C.rose},
            {icon:"🌿",label:"오행 보완과 충돌",v:result.element,col:"#86efac"},
            {icon:"🔥",label:"갈등 패턴",v:result.conflict,col:"#f87171"},
            {icon:"✨",label:"이 관계의 장점",v:result.strength,col:C.gold},
            {icon:"💝",label:"연애 스타일",v:result.love_style,col:C.rose},
            {icon:"🎯",label:"관계를 더 좋게 하는 법",v:result.final,col:C.cyan},
          ].map(({icon,label,v,col})=>v&&(
            <GlassCard key={label}>
              <div style={{color:col,fontFamily:FONT,fontSize:12,fontWeight:"bold",marginBottom:8}}>{icon} {label}</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.9,margin:0}}>{v}</p>
            </GlassCard>
          ))}

          {/* 상세 보기 버튼 */}
          <button onClick={readDetail} disabled={detailLoading} style={{
            padding:"16px",borderRadius:16,cursor:detailLoading?"not-allowed":"pointer",
            border:`1px solid ${C.rose}55`,background:"rgba(212,75,120,0.08)",
            color:C.rose,fontFamily:FONT,fontSize:14,width:"100%",
            opacity:detailLoading?0.5:1,fontWeight:"bold",
          }}>
            {detailLoading?"상세 분석 중…":"💕 더 자세한 궁합 보기 →"}
          </button>
        </>
      )}
      {result?.error&&<GlassCard><p style={{color:"#f87171",fontFamily:FONT,fontSize:13,textAlign:"center",margin:0}}>분석 중 오류가 발생했습니다.</p></GlassCard>}
    </div>
  );
}
