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
⑤ 응답에 글자수, 자릿수 같은 숫자 표기를 절대 포함하지 않는다.

JSON으로만 응답:
{
  "keyword": "변화, 성장, 도약 (예시처럼 키워드만 3개)",
  "overall": "신년 총운. 상반기와 하반기 흐름을 구분해서",
  "love": "2026 애정운",
  "money": "2026 금전운",
  "study": "2026 학업운",
  "job": "2026 취업운",
  "health": "2026 건강운",
  "advice": "올해 실천 조언 한 문장"
}`
      : `이 사주를 깊이 있게 분석해주세요.

분석 원칙:
- 일간(${sel.saju.dayHs}) 중심으로 기질을 핵심으로 본다
- 일지(${sel.saju.dayEb})와 월지(${sel.saju.monthEb}) 특성을 반드시 언급한다
- 지지 충합이 있으면 구체적으로 어떤 영향인지 설명한다
- 오행 분포를 바탕으로 강한 기운과 부족한 기운을 분석한다
- 추상적인 말 대신 실생활에서 어떻게 드러나는지 구체적으로 서술한다
- 응답에 글자수, 자릿수 같은 숫자 표기를 절대 포함하지 않는다

JSON으로만 응답:
{
  "title": "이 일주의 기질을 한 줄로",
  "keyword": "결단력, 신중함, 독립심 (예시처럼 키워드만 3개)",
  "nature": "일간 중심 타고난 성격과 사고방식. 인간관계에서 어떻게 행동하는지, 스트레스 받을 때 어떤 모습인지",
  "jiji": "일지·월지 특성 분석. 두 지지가 어떤 에너지를 만들어내는지, 충합이 있다면 삶에서 어떤 패턴으로 드러나는지",
  "element_strong": "강한 오행이 만들어내는 성격 장점과 재능. 어떤 상황에서 빛을 발하는지 구체적으로",
  "element_weak": "부족한 오행으로 생기는 조심해야 할 성향. 실생활에서 어떤 실수로 나타나는지",
  "flow": "인생 전체 운세 흐름. 어떤 시기에 강해지고 약해지는지, 삶의 큰 방향성",
  "love": "연애할 때의 모습, 끌리는 상대 유형, 반복되는 연애 패턴과 조심할 점",
  "money": "돈을 버는 방식, 쓰는 방식, 모으는 방식. 재물운에서 조심해야 할 점",
  "work": "잘 맞는 직업 방향, 조직형인지 프리랜서형인지, 커리어 성장 포인트",
  "health": "타고난 체력 흐름, 스트레스가 몸에 드러나는 방식, 조심해야 할 생활 습관",
  "advice": "지금 이 사람에게 가장 필요한 조언. 구체적이고 실천 가능한 것으로"
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
    // 영구 저장 확인
    const saved = loadReport(sel.id, "saju_detail");
    if(saved) { setDetail(saved); setDetailLoading(false); setShowDetail(true); return; }
    const cached = getCached(sel.id, "saju_detail");
    if(cached) { setDetail(cached); setDetailLoading(false); setShowDetail(true); return; }

    const {yp,mp,dp,tp,el,dayHs,dayEb,monthEb,ohaengCount,chungs} = sel.saju;

    const profileInfo = `이름: ${sel.name} / 성별: ${sel.gender} / 출생지: ${sel.birthplace||"미상"}
사주: 년주${yp} 월주${mp} 일주${dp} 시주${tp||"미상"} / 일간${dayHs} 일지${dayEb} 월지${monthEb} 오행${el}
오행분포: ${Object.entries(ohaengCount).map(([k,v])=>k+":"+v).join(", ")}
지지충: ${chungs.join(",") || "없음"}`;

    const RULE = `[작성 규칙 — 반드시 준수]
① 각 섹션을 넉넉하고 풍부하게 써라. 짧으면 안 된다.
② 생생한 비유와 은유로 시작한다. (예: "광야에 홀로 선 바위 성벽처럼")
③ 전문 용어는 반드시 바로 옆에 쉬운 말로 풀어준다.
④ "이런 경향이 있다" 대신 "돈 모이면 꼭 친구가 빌려달라고 한다"처럼 실생활 예시로 쓴다.
⑤ 글자수, 자릿수 같은 지시사항을 절대 응답에 포함하지 않는다.
⑥ 마크다운(**, ##, -, *) 절대 사용 금지. 자연스러운 문단으로만 쓴다.`;

    // 1차: 성격·기질·직업·재물·연애·관계
    const prompt1 = `당신은 한국 전통 사주명리학 최고 전문가입니다.
${profileInfo}

${RULE}

아래 5개 섹션을 각각 충분히 길고 깊게 써라. 각 섹션은 3~4개 문단으로 구성한다.

JSON으로만 응답 (글자수 표기 절대 금지):
{
  "p1_nature": "일간(${dayHs})으로 보는 나의 본질. 이 일간의 상징 이미지(금속/나무/물/불/흙)로 시작. 타고난 성격의 핵심, 사고하는 방식, 감정을 처리하는 방식, 스트레스 상황에서 드러나는 모습, 이 일간이 가진 빛과 그림자를 스토리로 풀어낸다",
  "p2_element": "오행 균형과 기질 분석. 강한 오행(${el})이 성격과 행동 방식에서 어떻게 드러나는지 실생활 장면으로. 부족한 오행이 만들어내는 결핍 패턴, 삶에서 반복되는 상황들. 균형을 맞추기 위해 할 수 있는 것들을 구체적으로",
  "p3_career": "직업운과 커리어. 어떤 분야에서 빛나는지 구체적 직군으로. 어떤 환경이 맞고 어떤 환경이 독인지. 조직형·프리랜서형·사업형 중 어디에 가까운지. 커리어에서 가장 중요한 시기와 절대 하면 안 되는 선택",
  "p4_money": "재물운과 돈 관리. 돈이 들어오는 방식과 새나가는 방식을 실생활 예시로 생생하게. 이 사람에게 맞는 재테크 방식, 절대 하면 안 되는 투자 방식. 돈과 관련해 반복되는 패턴과 주의사항",
  "p5_love": "연애운과 인간관계. 사랑할 때 어떤 모습인지, 끌리는 상대 유형, 반복되기 쉬운 연애 패턴. 친구 관계와 가족 관계에서의 특성. 나를 지치게 하는 사람 유형과 가까이 두면 좋은 사람 유형"
}`;

    // 2차: 운세흐름·강점·약점·총평
    const prompt2 = `당신은 한국 전통 사주명리학 최고 전문가입니다.
${profileInfo}

${RULE}

아래 5개 섹션을 각각 충분히 길고 깊게 써라. 각 섹션은 3~4개 문단으로 구성한다.

JSON으로만 응답 (글자수 표기 절대 금지):
{
  "p6_flow": "대운과 세운 흐름. 현재 어떤 대운에 있는지, 이 대운이 삶에 어떤 영향을 주고 있는지. 2026년 병오(丙午)년 세운이 원국과 어떻게 만나는지 구체적으로. 올해 강해지는 기운과 조심해야 할 기운, 기회가 열리는 영역",
  "p7_life": "인생 전체 흐름. 초년에 어떤 환경에서 자랐을지, 청년기의 성장 방향, 중년에 펼쳐질 일들, 후반 인생의 모습. 이 사람이 인생에서 반드시 이루게 되는 것과 평생 씨름할 과제",
  "p8_strength": "나의 강점과 재능. 타고난 장점을 구체적으로. 노력하지 않아도 자연스럽게 잘 하는 것, 주변에서 인정받기 쉬운 부분. 이 강점을 제대로 살리는 방법과 실제로 꽃피우는 시기",
  "p9_weakness": "나의 약점과 극복법. 반복되기 쉬운 실수의 패턴을 실생활 예시로 생생하게. 감정적으로 흔들리는 지점, 관계에서 상처받기 쉬운 순간. 이 약점이 사실 어떤 장점의 이면인지도 함께 써준다",
  "p10_summary": "사주 총평과 위로. 이 사주를 가진 사람의 삶을 한 문장으로 정의한다. 지금까지 얼마나 힘들게 버텨왔는지 따뜻하게 인정해준다. 앞으로 어떤 방향으로 나아가면 좋을지. 마지막은 반드시 이 사람에게 보내는 진심 어린 응원 한 문장으로 마무리"
}`;

    try {
      const profilePayload = {y:sel.y,m:sel.m,d:sel.d,h:sel.h,isLunar:false,name:sel.name,gender:sel.gender,birthplace:sel.birthplace||""};

      // 두 번 나눠서 요청 (토큰 한도 초과 방지)
      // 상세 리포트는 Claude 사용 (JSON 파싱 안정성 + 충분한 토큰)
      const [r1, r2] = await Promise.all([
        callSaju("interpret", {profile:profilePayload, prompt:prompt1, maxTokens:4000, model:"claude"}),
        callSaju("interpret", {profile:profilePayload, prompt:prompt2, maxTokens:4000, model:"claude"}),
      ]);

      if(r1.result && r2.result) {
        const merged = {...r1.result, ...r2.result};
        setCached(sel.id, "saju_detail", merged);
        saveReport(sel.id, "saju_detail", merged);
        setDetail(merged);
        setShowDetail(true);
      } else {
        // 하나라도 성공하면 부분 표시
        const partial = {...(r1.result||{}), ...(r2.result||{})};
        if(Object.keys(partial).length > 0) {
          setDetail(partial); setShowDetail(true);
        } else {
          setDetail({error:true});
        }
      }
    } catch(e) {
      console.error("saju detail error:", e);
      setDetail({error:true, msg: e.message||"알 수 없는 오류"});
    }
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
            {icon:"✦",  label:"나는 어떤 사람인가",        v:detail.p1_nature,  col:"#a78bfa"},
            {icon:"⚡",  label:"내 안의 기운 지도",         v:detail.p2_element, col:"#34d399"},
            {icon:"⚔️",  label:"타고난 직업과 커리어",      v:detail.p3_career,  col:C.cyan},
            {icon:"💰",  label:"돈과 나의 관계",            v:detail.p4_money,   col:C.gold},
            {icon:"💕",  label:"사랑과 인간관계",           v:detail.p5_love,    col:C.rose},
            {icon:"🌊",  label:"대운과 올해의 흐름",        v:detail.p6_flow,    col:"#60a5fa"},
            {icon:"🗺️",  label:"초년부터 노년까지",         v:detail.p7_life,    col:C.purple},
            {icon:"💎",  label:"내가 가진 빛나는 것들",     v:detail.p8_strength,col:C.gold},
            {icon:"🪞",  label:"내가 조심해야 할 것들",     v:detail.p9_weakness,col:"#f87171"},
            {icon:"🌌",  label:"별이 전하는 총평",           v:detail.p10_summary,col:C.purple},
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
