import { useState } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn, Spinner, PillarRow } from "../common/UI.jsx";
import ProfilePicker from "../common/ProfilePicker.jsx";
import { callSaju } from "../../utils/api.js";
import { getCached, setCached } from "../../utils/cache.js";

export default function SajuScreen({ profiles, onAddProfile, mode="saju", onBack }) {
  const isShinnyeon = mode === "newyear";
  const [sel, setSel]         = useState(null);
  const [step, setStep]       = useState("pick");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const read = async () => {
    if(!sel) return;
    setLoading(true); setResult(null); setStep("result");

    const cacheType = isShinnyeon ? "newyear" : "saju_free";
    const cached = getCached(sel.id, cacheType);
    if(cached) { setResult(cached); setLoading(false); return; }

    const prompt = isShinnyeon
      ? `[신년사주 2026년 분석 원칙]
① 위 사주는 이 사람의 원국(原局)이다. 단순 띠별 운세처럼 쓰지 않는다.
② 원국의 일간과 오행을 중심으로, 현재 대운과 2026년 병오(丙午)년 세운을 함께 접목한다.
③ 병오년: 천간 병화(丙火), 지지 오화(午火). 이 기운이 원국 지지와 어떻게 충·합·생하는지 분석한다.
④ 상반기(1~6월)와 하반기(7~12월) 흐름을 구분하여 서술한다.
⑤ 총운/애정운/금전운/학업운/취업운/건강운 6개 섹션으로 나눈다. 각 섹션 6~8줄.

JSON으로만:
{
  "keyword": "올해 키워드 3개 쉼표구분",
  "overall": "신년 총운 (180자, 상/하반기 구분)",
  "love": "2026 애정운 (140자)",
  "money": "2026 금전운 (140자)",
  "study": "2026 학업운 (140자)",
  "job": "2026 취업운 (140자)",
  "health": "2026 건강운 (140자)",
  "advice": "올해 실천 조언 한 문장 (50자)"
}`
      : `이 사주의 무료 핵심 분석을 해주세요.
일간 중심 기질·오행·지지 구조(일지·월지·충합)를 바탕으로 분석하세요.

JSON으로만:
{
  "title": "일주 기질 한줄 (20자)",
  "keyword": "이 사람을 설명하는 키워드 3개 쉼표구분",
  "nature": "일간 중심 타고난 기질 (120자)",
  "jiji": "일지·월지 특성과 지지 충합 구조 (80자)",
  "element_strong": "강한 오행과 성격 장점 (80자)",
  "element_weak": "부족한 오행과 조심해야 할 성향 (80자)",
  "flow": "인생 전체 운세 흐름 (100자)",
  "love": "연애운 요약 (60자)",
  "money": "재물운 요약 (60자)",
  "work": "직업운 요약 (60자)",
  "health": "건강운 요약 (60자)",
  "advice": "오늘부터 참고할 조언 (60자)"
}`;

    try {
      const r = await callSaju("interpret", {
        profile: {y:sel.y,m:sel.m,d:sel.d,h:sel.h,isLunar:false,name:sel.name,gender:sel.gender,birthplace:sel.birthplace||""},
        prompt, maxTokens:2000, model:"openai"
      });
      if(r.result) { setCached(sel.id, cacheType, r.result); setResult(r.result); }
      else setResult({error:true});
    } catch { setResult({error:true}); }
    setLoading(false);
  };

  const readDetail = async () => {
    if(!sel) return;
    setDetailLoading(true); setDetail(null);
    const cached = getCached(sel.id, "saju_detail");
    if(cached) { setDetail(cached); setDetailLoading(false); setShowDetail(true); return; }

    const {yp,mp,dp,tp,el,dayHs,dayEb,monthEb,ohaengCount,chungs} = sel.saju;
    const prompt = `이 사주를 20페이지 정밀 리포트로 분석해주세요. 깊고 구체적으로 작성하세요.

분석 원칙:
- 일간(${dayHs}) 중심으로 타고난 기질을 핵심으로 본다
- 지지 충합형파해를 반드시 언급한다 (지지충: ${chungs.join(",")||"없음"})
- 대운·세운을 포함한 시간 흐름을 분석한다
- 의학적 진단은 하지 않는다

JSON으로만 (각 항목 150~200자):
{
  "p1_nature": "일간으로 보는 타고난 성격·사고방식·인간관계 태도",
  "p2_social": "월지로 보는 사회적 성향과 조직에서의 모습",
  "p3_element": "오행 균형 분석 — 강한 오행·부족한 오행·반복 패턴",
  "p4_sipseong": "십성 구조 — 경쟁력·돈 대하는 방식·사랑 방식·일과 성취",
  "p5_jiji": "지지 구조 — 합·충·형·파·해와 내면 갈등·관계 패턴",
  "p6_job": "직업운 — 잘 맞는 방향·피해야 할 환경·성장 포인트",
  "p7_money": "재물운 — 돈 버는 방식·모으는 방식·투자 성향·조심할 점",
  "p8_love": "연애운 — 사랑할 때 모습·끌리는 유형·반복 패턴·조심할 점",
  "p9_marriage": "결혼운 — 장기연애 성향·결혼에서 중요한 것·조언",
  "p10_relation": "인간관계운 — 친구·가족·지치게 하는 유형·가까이 두면 좋은 유형",
  "p11_health": "건강운 — 체력 흐름·스트레스 표현 방식·생활 습관 조언",
  "p12_daeun": "대운 흐름 — 현재 대운·앞으로의 흐름·인생 전환점",
  "p13_seun": "세운 흐름 — 올해 2026년 흐름·기회·조심할 점",
  "p14_life": "인생 전체 — 초년·청년·중년·후반 흐름과 성장 방향",
  "p15_strength": "나의 강점 — 타고난 장점·살리면 좋은 재능",
  "p16_weakness": "나의 약점 — 반복되는 실수·감정적 흔들리는 지점",
  "p17_strategy": "삶의 전략 — 일·돈·인간관계·사랑·자기관리 핵심",
  "p18_action": "올해 실천 조언 — 지금 신경 써야 할 것·줄여야 할 것·키워야 할 것",
  "p19_summary": "사주 총평 — 전체 요약과 나를 위한 한 문장 조언",
  "one_line": "나를 위한 한 문장 조언 (30자)"
}`;

    try {
      const r = await callSaju("interpret", {
        profile: {y:sel.y,m:sel.m,d:sel.d,h:sel.h,isLunar:false,name:sel.name,gender:sel.gender,birthplace:sel.birthplace||""},
        prompt, maxTokens:4000, model:"openai"
      });
      if(r.result) { setCached(sel.id, "saju_detail", r.result); setDetail(r.result); setShowDetail(true); }
      else setDetail({error:true});
    } catch { setDetail({error:true}); }
    setDetailLoading(false);
  };

  if(step==="pick") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:0}}>
          {isShinnyeon?"🎋 신년운세":"🏮 정통 사주"}
        </h2>
      </div>
      <ProfilePicker profiles={profiles} selected={sel} onSelect={setSel} onAdd={onAddProfile}
        label="사주를 볼 프로필을 선택하세요"/>
      {sel&&<PillarRow saju={sel.saju}/>}
      <Btn onClick={read} disabled={!sel||loading}>
        {loading?"읽는 중…":"✨ 별의 흐름 읽기"}
      </Btn>
    </div>
  );

  // 상세 리포트 화면
  if(showDetail) return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setShowDetail(false)} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:16,margin:0}}>{sel?.name}님 정밀 사주 리포트</h2>
      </div>
      {detailLoading&&<GlassCard><Spinner msg="20페이지 리포트 생성 중…"/></GlassCard>}
      {detail&&!detail.error&&(
        <>
          {[
            {icon:"🌟",label:"일간으로 보는 나의 본질",v:detail.p1_nature},
            {icon:"🏢",label:"월지로 보는 사회적 성향",v:detail.p2_social},
            {icon:"⚡",label:"오행 균형 분석",v:detail.p3_element},
            {icon:"💫",label:"십성 구조 분석",v:detail.p4_sipseong},
            {icon:"🔮",label:"지지 구조 분석",v:detail.p5_jiji},
            {icon:"💼",label:"직업운",v:detail.p6_job},
            {icon:"💰",label:"재물운",v:detail.p7_money},
            {icon:"💕",label:"연애운",v:detail.p8_love},
            {icon:"💍",label:"결혼운과 장기 관계",v:detail.p9_marriage},
            {icon:"🤝",label:"인간관계운",v:detail.p10_relation},
            {icon:"🌿",label:"건강운",v:detail.p11_health},
            {icon:"🌊",label:"대운 흐름",v:detail.p12_daeun},
            {icon:"📅",label:"세운 흐름 (2026년)",v:detail.p13_seun},
            {icon:"🗺️",label:"인생 전체 흐름",v:detail.p14_life},
            {icon:"💪",label:"나의 강점",v:detail.p15_strength},
            {icon:"⚠️",label:"나의 약점",v:detail.p16_weakness},
            {icon:"🎯",label:"나에게 맞는 삶의 전략",v:detail.p17_strategy},
            {icon:"✅",label:"올해의 실천 조언",v:detail.p18_action},
            {icon:"✨",label:"사주 총평",v:detail.p19_summary},
          ].map(({icon,label,v})=>v&&(
            <GlassCard key={label}>
              <div style={{color:C.purple,fontFamily:FONT,fontSize:12,marginBottom:8}}>{icon} {label}</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:0}}>{v}</p>
            </GlassCard>
          ))}
          {detail.one_line&&(
            <GlassCard glow style={{textAlign:"center"}}>
              <p style={{color:C.gold,fontFamily:FONT,fontSize:15,fontStyle:"italic",margin:0}}>
                "{detail.one_line}"
              </p>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setStep("pick");setResult(null);}} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:16,margin:0}}>
          {sel?.name}님의 {isShinnyeon?"2026 신년운세":"사주 분석"}
        </h2>
      </div>
      {sel&&<PillarRow saju={sel.saju}/>}
      {loading&&<GlassCard><Spinner/></GlassCard>}
      {result&&!result.error&&(
        <>
          {/* 핵심 요약 */}
          <GlassCard glow>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {result.keyword?.split(",").map(k=>(
                <span key={k} style={{padding:"3px 12px",borderRadius:20,fontFamily:FONT,fontSize:11,background:"rgba(109,40,217,0.2)",border:`1px solid ${C.purple}44`,color:C.purple}}>{k.trim()}</span>
              ))}
            </div>
            {isShinnyeon ? (
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:0}}>{result.overall}</p>
            ) : (
              <>
                <h3 style={{color:C.gold,fontFamily:FONT,fontSize:16,margin:"0 0 8px"}}>{result.title}</h3>
                <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.8,margin:0}}>{result.nature}</p>
              </>
            )}
          </GlassCard>

          {/* 오행/지지 */}
          {!isShinnyeon&&(
            <GlassCard>
              <div style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:6}}>⚡ 오행과 지지 구조</div>
              {result.jiji&&<p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.7,margin:"0 0 8px"}}>{result.jiji}</p>}
              {result.element_strong&&<p style={{color:"#86efac",fontFamily:FONT,fontSize:12,lineHeight:1.6,margin:"0 0 4px"}}>강한 기운: {result.element_strong}</p>}
              {result.element_weak&&<p style={{color:"#fca5a5",fontFamily:FONT,fontSize:12,lineHeight:1.6,margin:0}}>조심할 성향: {result.element_weak}</p>}
            </GlassCard>
          )}

          {/* 운세 미리보기 */}
          {[
            {icon:"💼",label:isShinnyeon?"취업운":"직업운",  v:isShinnyeon?result.job:result.work,  col:C.cyan},
            {icon:"💕",label:"애정운",  v:result.love,   col:C.rose},
            {icon:"💰",label:"금전운",  v:result.money,  col:C.gold},
            {icon:"🌿",label:"건강운",  v:result.health, col:"#86efac"},
            ...(isShinnyeon?[{icon:"📚",label:"학업운",v:result.study,col:"#60a5fa"}]:[]),
          ].map(({icon,label,v,col})=>v&&(
            <GlassCard key={label}>
              <div style={{color:col,fontFamily:FONT,fontSize:12,marginBottom:4}}>{icon} {label}</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.7,margin:0}}>{v}</p>
            </GlassCard>
          ))}

          {result.advice&&(
            <GlassCard glow style={{textAlign:"center"}}>
              <div style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:6}}>✦ 오늘의 조언</div>
              <p style={{color:C.gold,fontFamily:FONT,fontSize:14,fontStyle:"italic",margin:0}}>"{result.advice}"</p>
            </GlassCard>
          )}

          {/* 상세 보기 버튼 (정통사주만) */}
          {!isShinnyeon&&(
            <button onClick={readDetail} disabled={detailLoading} style={{
              padding:"14px",borderRadius:14,cursor:detailLoading?"not-allowed":"pointer",
              border:`1px solid ${C.gold}44`,background:"rgba(212,168,75,0.08)",
              color:C.gold,fontFamily:FONT,fontSize:13,width:"100%",opacity:detailLoading?0.5:1,
            }}>
              {detailLoading?"리포트 생성 중…":"📋 20페이지 정밀 사주 리포트 보기 →"}
            </button>
          )}
        </>
      )}
      {result?.error&&<GlassCard><p style={{color:"#f87171",fontFamily:FONT,fontSize:13,textAlign:"center",margin:0}}>분석 중 오류가 발생했습니다. 다시 시도해주세요.</p></GlassCard>}
    </div>
  );
}
