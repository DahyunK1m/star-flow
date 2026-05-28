import { useState } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn, Spinner, PillarRow } from "../common/UI.jsx";
import ProfilePicker from "../common/ProfilePicker.jsx";
import { callSaju } from "../../utils/api.js";
import { getCached, setCached, saveReport, loadReport } from "../../utils/cache.js";

export default function SajuScreen({ profiles, onAddProfile, mode="saju", onBack, initialProfileId=null }) {
  const isShinnyeon = mode === "newyear";
  const initProfile = initialProfileId ? profiles.find(p=>p.id===initialProfileId)||null : null;
  const [sel, setSel]         = useState(initProfile);
  const [step, setStep]       = useState(initialProfileId?"result":"pick");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(!!initialProfileId);
  const [detail, setDetail]   = useState(()=>{
    if(!initialProfileId) return null;
    const { loadReport } = require("../../utils/cache.js");
    try { return loadReport(initialProfileId,"saju_detail")||null; } catch { return null; }
  });
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
      : `이 사주를 깊이 있게 분석해주세요. 각 항목을 충분히 구체적으로 서술하세요.

분석 원칙:
- 일간(${sel.saju.dayHs}) 중심으로 기질을 핵심으로 본다
- 일지(${sel.saju.dayEb})와 월지(${sel.saju.monthEb}) 특성을 반드시 언급한다
- 지지 충합이 있으면 구체적으로 어떤 영향인지 설명한다
- 오행 분포를 바탕으로 강한 기운과 부족한 기운을 분석한다
- 추상적인 말 대신 실생활에서 어떻게 드러나는지 구체적으로 서술한다

JSON으로만 (각 항목 지정 글자수 엄수):
{
  "title": "일주 기질 한줄 (25자)",
  "keyword": "이 사람을 가장 잘 설명하는 키워드 3개 쉼표구분",
  "nature": "일간 중심 타고난 성격과 사고방식. 인간관계에서 어떻게 행동하는지, 스트레스 받을 때 어떤 모습인지 포함 (250자)",
  "jiji": "일지·월지 특성 분석. 두 지지가 어떤 에너지를 만들어내는지, 충합이 있다면 삶에서 어떤 패턴으로 드러나는지 (200자)",
  "element_strong": "강한 오행이 만들어내는 성격 장점과 재능. 어떤 상황에서 빛을 발하는지 구체적으로 (150자)",
  "element_weak": "부족한 오행으로 생기는 조심해야 할 성향. 실생활에서 어떤 실수로 나타나는지 (150자)",
  "flow": "인생 전체 운세 흐름. 어떤 시기에 강해지고 약해지는지, 삶의 큰 방향성 (200자)",
  "love": "연애할 때의 모습, 끌리는 상대 유형, 반복되는 연애 패턴과 조심할 점 (150자)",
  "money": "돈을 버는 방식, 쓰는 방식, 모으는 방식. 재물운에서 조심해야 할 점 (150자)",
  "work": "잘 맞는 직업 방향, 조직형인지 프리랜서형인지, 커리어 성장 포인트 (150자)",
  "health": "타고난 체력 흐름, 스트레스가 몸에 드러나는 방식, 조심해야 할 생활 습관 (150자)",
  "advice": "지금 이 사람에게 가장 필요한 조언. 구체적이고 실천 가능한 것으로 (80자)"
}`;

    try {
      const r = await callSaju("interpret", {
        profile: {y:sel.y,m:sel.m,d:sel.d,h:sel.h,isLunar:false,name:sel.name,gender:sel.gender,birthplace:sel.birthplace||""},
        prompt, maxTokens:4000, model:"openai"
      });
      if(r.result) { setCached(sel.id, cacheType, r.result); setResult(r.result); }
      else setResult({error:true});
    } catch { setResult({error:true}); }
    setLoading(false);
  };

  const readDetail = async () => {
    if(!sel) return;
    setDetailLoading(true); setDetail(null);
    // 영구 저장된 리포트 먼저 확인 (유료 컨텐츠 보존)
    const saved = loadReport(sel.id, "saju_detail");
    if(saved) { setDetail(saved); setDetailLoading(false); setShowDetail(true); return; }
    const cached = getCached(sel.id, "saju_detail");
    if(cached) { setDetail(cached); setDetailLoading(false); setShowDetail(true); return; }

    const {yp,mp,dp,tp,el,dayHs,dayEb,monthEb,ohaengCount,chungs} = sel.saju;
    const prompt = `당신은 한국 전통 사주명리학 최고 전문가입니다.
아래 사주를 바탕으로 깊이 있는 사주 리포트를 작성해주세요.

작성 원칙:
- 각 섹션마다 생생한 비유와 은유로 시작한다 (예: "광야에 홀로 서 있는 바위 성벽", "메마른 대지 위에 쌓인 철광석" 같은 이미지)
- 전문 용어(비겁, 식상, 군겁쟁재, 토다금매 등)를 쓸 때는 반드시 쉬운 말로 바로 풀어준다
- 추상적 서술 금지. "이런 경향이 있다" 대신 "돈 좀 모일만 하면 친구가 빌려달라고 하는 상황이 반복된다"처럼 실생활 예시로 쓴다
- 장점은 충분히 인정하고, 단점은 핀잔이 아니라 "이게 오히려 당신의 특별함"으로 연결한다
- 마지막 섹션(p19_summary)은 반드시 따뜻한 위로와 응원으로 마무리한다
- 마크다운(**, ##, -, *)은 절대 사용하지 않는다. 자연스러운 문단으로 쓴다

JSON으로만 응답 (각 항목 반드시 350~500자, 스토리텔링 문체):
{
  "p1_nature": "일간(${dayHs})으로 보는 나의 본질. 이 일간의 상징적 이미지(금속, 나무, 물 등)로 시작해 타고난 성격의 핵심, 사고하는 방식, 감정을 처리하는 방식, 스트레스 상황에서 드러나는 모습까지 스토리로 연결",
  "p2_social": "월지(${monthEb})로 보는 사회적 성향. 사회에서 어떤 이미지로 보이는지, 조직 안에서의 강점과 약점, 사람들과 어울릴 때의 패턴, 대인관계에서 반복되는 실수",
  "p3_element": "오행 균형 분석. 강한 오행(${sel.saju.el})이 삶에서 어떻게 드러나는지, 부족한 오행이 만들어내는 결핍 패턴을 실생활 상황으로 묘사. 보완하면 좋은 방향 구체적으로",
  "p4_sipseong": "십성 구조 분석. 비겁·식상·재성·관성·인성의 흐름을 쉬운 말로. 경쟁심과 자존심, 돈을 대하는 방식, 사랑을 대하는 방식, 일과 성취를 대하는 방식. 이 사람의 핵심 욕구",
  "p5_jiji": "지지 구조 분석. 일지(${dayEb})와 월지(${monthEb})의 관계, 충이나 합(${chungs.join(',') || '없음'})이 있다면 내면에서 어떤 갈등이 생기는지, 겉으로 보이는 모습과 속마음의 차이",
  "p6_job": "직업운. 어떤 분야에서 빛나는지 구체적 직군으로. 어떤 업무 환경이 맞고 안 맞는지, 조직형·프리랜서형·사업형 중 어디인지, 커리어에서 가장 중요한 시기와 피해야 할 함정",
  "p7_money": "재물운. 돈이 들어오는 방식, 새나가는 방식을 실생활 예시로. 저축과 투자에서의 패턴, 조심해야 할 금전적 위험, 이 사람에게 맞는 재테크 방식",
  "p8_love": "연애운. 사랑할 때 어떤 모습인지, 끌리는 상대 유형, 반복되기 쉬운 연애 패턴을 구체적으로. 이 사람이 진짜로 원하는 사랑의 형태와 연애에서 조심해야 할 것",
  "p9_marriage": "결혼운과 장기 관계. 장기 연애나 동거에서 어떤 모습인지, 결혼에서 중요하게 보는 것, 배우자와 부딪히기 쉬운 부분, 안정적인 관계를 만들기 위한 구체적 조언",
  "p10_relation": "인간관계운. 친구 관계의 특성, 가족 관계에서의 역할, 나를 지치게 만드는 사람 유형, 가까이 두면 에너지가 되는 사람 유형, 사회적 관계에서 주의할 점",
  "p11_health": "건강운. 타고난 체력과 건강의 흐름, 스트레스가 몸에 드러나는 방식, 특히 취약한 부분, 조심해야 할 생활 습관, 건강을 지키기 위한 실천 조언. 의학적 진단 절대 금지",
  "p12_daeun": "대운 흐름. 현재 어떤 대운에 있는지, 앞으로의 대운 흐름, 인생에서 중요한 전환점이 될 시기, 지금 이 시기를 어떻게 활용해야 하는지",
  "p13_seun": "세운 흐름. 2026년 병오(丙午)년이 이 사주에 어떤 영향을 주는지 구체적으로. 올해 강해지는 기운과 조심해야 할 기운, 기회가 생기는 영역, 올해 인간관계와 일의 변화",
  "p14_life": "인생 전체 흐름. 초년의 모습과 과제, 청년기의 성장 방향, 중년에 펼쳐질 일들, 후반 인생의 흐름. 이 사람이 인생에서 반드시 이루어야 할 것",
  "p15_strength": "나의 강점. 타고난 장점과 재능을 구체적으로. 노력하지 않아도 자연스럽게 잘 하는 것, 주변에서 인정받기 쉬운 부분, 이 강점을 살리면 좋은 방법",
  "p16_weakness": "나의 약점. 반복되기 쉬운 실수의 패턴을 실생활 예시로. 감정적으로 흔들리는 지점, 이 약점이 사실은 어떤 장점의 이면인지도 함께",
  "p17_strategy": "나에게 맞는 삶의 전략. 일·돈·인간관계·사랑·자기관리 각각에서의 핵심 전략을 실천 가능한 방식으로",
  "p18_action": "올해의 실천 조언. 지금 당장 시작해야 할 것, 지금 줄여야 할 것, 지금 키워야 할 것. 구체적이고 바로 실천 가능한 것들로",
  "p19_summary": "사주 총평과 위로. 이 사람의 사주를 한 문장으로 정의하고, 지금까지 얼마나 힘들게 버텨왔는지 따뜻하게 인정해주고, 앞으로의 방향성과 함께 진심 어린 응원으로 마무리. 마지막 문장은 반드시 이 사람에게 보내는 따뜻한 한마디로",
  "one_line": "이 사람에게 보내는 한 문장 응원 (40자 이내, 시적이고 따뜻하게)"
}`;

    try {
      const r = await callSaju("interpret", {
        profile: {y:sel.y,m:sel.m,d:sel.d,h:sel.h,isLunar:false,name:sel.name,gender:sel.gender,birthplace:sel.birthplace||""},
        prompt, maxTokens:8000, model:"openai"
      });
      if(r.result) { setCached(sel.id, "saju_detail", r.result); saveReport(sel.id, "saju_detail", r.result); setDetail(r.result); setShowDetail(true); }
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
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:16,margin:0}}>{sel?.name}님 상세 사주 분석</h2>
      </div>
      {detailLoading&&<GlassCard><Spinner msg="사주를 깊이 읽는 중… 잠시만요"/></GlassCard>}
      {detail&&!detail.error&&(
        <>
          {[
            {icon:"✦",label:"나는 어떤 사람인가",v:detail.p1_nature,col:"#a78bfa"},
            {icon:"🏙️",label:"세상이 나를 보는 눈",v:detail.p2_social,col:C.cyan},
            {icon:"⚖️",label:"내 안의 기운 지도",v:detail.p3_element,col:"#34d399"},
            {icon:"🧭",label:"욕망과 재능의 설계도",v:detail.p4_sipseong,col:C.gold},
            {icon:"🔮",label:"내면의 갈등과 관계 패턴",v:detail.p5_jiji,col:C.purple},
            {icon:"⚔️",label:"타고난 직업의 방향",v:detail.p6_job,col:C.cyan},
            {icon:"💰",label:"돈과 나의 관계",v:detail.p7_money,col:C.gold},
            {icon:"💕",label:"사랑할 때의 나",v:detail.p8_love,col:C.rose},
            {icon:"💍",label:"긴 인연과 결혼",v:detail.p9_marriage,col:"#f472b6"},
            {icon:"🤝",label:"사람들과의 관계",v:detail.p10_relation,col:C.cyan},
            {icon:"🌿",label:"몸과 마음의 건강",v:detail.p11_health,col:"#86efac"},
            {icon:"🌊",label:"내 인생의 큰 흐름",v:detail.p12_daeun,col:"#60a5fa"},
            {icon:"📅",label:"2026년 올해의 운세",v:detail.p13_seun,col:"#fb923c"},
            {icon:"🗺️",label:"초년부터 노년까지",v:detail.p14_life,col:C.purple},
            {icon:"💎",label:"내가 가진 빛나는 것들",v:detail.p15_strength,col:C.gold},
            {icon:"🪞",label:"내가 조심해야 할 것들",v:detail.p16_weakness,col:"#f87171"},
            {icon:"🎯",label:"나를 위한 삶의 전략",v:detail.p17_strategy,col:C.cyan},
            {icon:"✅",label:"지금 당장 해야 할 것",v:detail.p18_action,col:"#86efac"},
            {icon:"🌌",label:"별이 전하는 총평",v:detail.p19_summary,col:C.purple},
          ].map(({icon,label,v,col})=>v&&(
            <GlassCard key={label}>
              <div style={{color:col||C.purple,fontFamily:FONT,fontSize:12,marginBottom:10,fontWeight:"bold"}}>{icon} {label}</div>
              <p style={{color:C.text,fontFamily:FONT,fontSize:13,lineHeight:2,margin:0,whiteSpace:"pre-wrap"}}>{v}</p>
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
              {detailLoading?"리포트 생성 중…":"📋 더 자세한 사주 보기 →"}
            </button>
          )}
        </>
      )}
      {result?.error&&<GlassCard><p style={{color:"#f87171",fontFamily:FONT,fontSize:13,textAlign:"center",margin:0}}>분석 중 오류가 발생했습니다. 다시 시도해주세요.</p></GlassCard>}
    </div>
  );
}
