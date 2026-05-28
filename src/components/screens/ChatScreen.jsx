import { useState, useEffect, useRef } from "react";
import { C, FONT, inp } from "../../constants/colors.js";
import { GlassCard, Btn, Spinner } from "../common/UI.jsx";
import ProfilePicker from "../common/ProfilePicker.jsx";
import { callChat } from "../../utils/api.js";
import { loadChats, saveChats, upsertChat } from "../../utils/cache.js";
import ChatTarotPicker from "../tarot/ChatTarotPicker.jsx";

const EXPERTS = {
  saju:  { icon:"🐙", name:"문어마녀", color:"#7c3aed", sub:"사주 전문가" },
  tarot: { icon:"🌟", name:"불가사리", color:"#06b6d4", sub:"타로 전문가" },
  love:  { icon:"🐢", name:"별주부",   color:"#d47c9b", sub:"연애 심리 상담사" },
};

const MBTI_LIST = ["모름","INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];

export default function ChatScreen({ profiles, onAddProfile }) {
  const [phase,   setPhase]   = useState("list");
  const [chatList,setChatList] = useState(()=>loadChats());
  const [expert,  setExpert]  = useState(null);
  const [chatType,setChatType] = useState(null);
  const [selProfiles,setSelProfiles] = useState([]);
  const [msgs,    setMsgs]    = useState([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [tarotPhase,setTarotPhase] = useState(null);
  const [tarotCards,setTarotCards] = useState([]);
  const [tarotCount,setTarotCount] = useState(3);
  const [activeChatId,setActiveChatId] = useState(null);

  // 별주부 전용 정보
  const [loveInfo, setLoveInfo] = useState({
    myName:"", myGender:"여",
    otherName:"", otherGender:"남",
    myMbti:"모름", otherMbti:"모름",
    myAge:"", otherAge:"",
    tone:"gentle", // factual | gentle
  });

  const bottomRef  = useRef(null);
  const chatIdRef  = useRef(null);
  const expertInfo = EXPERTS[expert] || EXPERTS.tarot;

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  // 메시지 자동 저장
  useEffect(()=>{
    if(!chatIdRef.current||msgs.length===0) return;
    const chat = {
      id:chatIdRef.current, expert, chatType,
      profiles:selProfiles.map(p=>({id:p.id,name:p.name})),
      title:buildTitle(),
      msgs, updatedAt:Date.now(),
    };
    upsertChat(chat);
    setChatList(loadChats());
  },[msgs]);

  const buildTitle = () => {
    const expName = EXPERTS[expert]?.name||"";
    const names = selProfiles.map(p=>p.name).join("·");
    return `${expName}${names?" · "+names:""}`;
  };

  const formatDate = (ts) => {
    const d=new Date(ts), now=new Date();
    const diffD=Math.floor((now-d)/86400000);
    if(diffD===0) return d.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"});
    if(diffD===1) return "어제";
    if(diffD<7)   return `${diffD}일 전`;
    return d.toLocaleDateString("ko-KR",{month:"short",day:"numeric"});
  };

  const getSajuContext = () => {
    if(selProfiles.length===0) return "";
    if(chatType==="individual") {
      const p=selProfiles[0], s=p.saju||{};
      return `[상담자 사주] ${p.name}(${p.gender}, ${p.y}.${p.m}.${p.d}): 년주${s.yp} 월주${s.mp} 일주${s.dp} 시주${s.tp||"미상"} 오행${s.el} 일간${s.dayHs} 일지${s.dayEb}`;
    }
    return selProfiles.map(p=>{ const s=p.saju||{}; return `[${p.name}] 년주${s.yp} 월주${s.mp} 일주${s.dp} 시주${s.tp||"미상"} 오행${s.el}`; }).join("\n");
  };

  const getSystemCtx = () => {
    const ctx = getSajuContext();
    const isGungham = chatType==="gungham";
    if(expert==="saju") return `당신은 '문어마녀'라는 이름의 한국 전통 사주명리학 전문가입니다. 신비롭고 따뜻한 어조로 상담하며 존댓말을 사용합니다.
${ctx}
${isGungham?"위 두 사람의 궁합을 기반으로 답해주세요.":"위 사주를 기반으로 구체적으로 답해주세요. 천간·지지 충합, 일진과의 관계를 언급하세요."}
대화 기록을 참고하여 일관된 답변을 해주세요.`;

    if(expert==="tarot") return `당신은 '불가사리'라는 이름의 타로 전문가입니다. 공감 능력이 뛰어나고 신비로운 어조로 상담합니다.
[타로 해석 원칙]
① 사용자가 직접 선택한 카드만 해석한다. AI가 임의로 카드를 만들지 않는다.
② 카드를 뽑아야 할 시점에 "카드를 선택해주세요"라는 문구를 포함한다.
③ 질문 유형별: 예/아니오→1장, 감정/관계→3장, 선택/고민→5장, 재회→11장
④ 시기 질문은 "올해 7~8월" 등 구체적으로 답한다.
${tarotCards.length>0?`[선택된 카드]\n${tarotCards.map((c,i)=>`${i+1}. ${c.kr}(${c.rev?"역방향":"정방향"}): ${c.rev?c.rev:c.up}`).join("\n")}`:""}`;

    if(expert==="love") {
      const tone = chatType==="factual"
        ? "팩트 중심 직설 화법: 잘잘못을 명확히 짚고 현실적 판단을 우선한다."
        : "온건한 응원 화법: 상담자와 상대 양쪽의 감정을 이해하며 관계가 긍정적으로 흐르도록 안내한다.";
      return `당신은 '별주부'라는 이름의 연애 심리 상담사입니다. 오은영·이호선 선생님처럼 지혜롭고 따뜻하면서도 조언은 명확합니다.
[상담자 정보]
이름: ${loveInfo.myName||"상담자"} / 성별: ${loveInfo.myGender} / MBTI: ${loveInfo.myMbti} / 나이: ${loveInfo.myAge||"미상"}
상대방: ${loveInfo.otherName||"상대방"} / 성별: ${loveInfo.otherGender} / MBTI: ${loveInfo.otherMbti} / 나이: ${loveInfo.otherAge||"미상"}
[상담 톤] ${tone}
[핵심 원칙]
① 먼저 깊이 공감하고 감정을 어루만진 후 조언한다.
② 상대방 심리도 분석해 설명한다.
③ "상대가 나를 좋아하나요?" 류는 상황이 충분하면 빅데이터 기반으로 직접 판단한다. 부족하면 더 설명을 요청한다.
④ 재회 상담: 상담자가 여성이면 NO CONTACT 전략 설명, 남성이면 빠른 행동 전략 설명.
⑤ 매 답변 마지막에 바로 실천할 수 있는 행동 1가지를 준다.
⑥ 존댓말 사용.`;
    }
    return "";
  };

  const suggestQ = () => {
    if(expert==="saju")  return ["올해 전반적인 흐름이 궁금해요","연애운이 어떤가요?","직업/진로 조언 부탁드려요","재물운은 어떤가요?"];
    if(expert==="love")  return ["상대방이 저를 좋아하는 걸까요?","연락을 먼저 해야 할까요?","이 관계를 계속해도 될까요?","재회 가능성이 있을까요?"];
    return ["지금 연애를 시작해도 될까요?","이 결정이 맞는 선택인가요?","올해 가장 조심해야 할 것은?","새로운 도전을 해도 될까요?"];
  };

  const sendMessage = async (text) => {
    if(!text.trim()||loading) return;
    const newMsgs = [...msgs,{role:"user",content:text}];
    setMsgs(newMsgs); setInput(""); setLoading(true);
    try {
      const history = newMsgs.slice(-10).map(m=>({role:m.role,content:m.content}));
      let reply = await callChat(getSystemCtx(), history);
      let needTarot=false, tc=3;
      if(expert==="tarot"&&(reply.includes("카드를 선택")||reply.includes("뽑아주세요"))){
        needTarot=true;
        const q=(text||"").toLowerCase();
        if(q.includes("재회")) tc=11;
        else if(q.includes("연애")||q.includes("감정")||q.includes("속마음")) tc=3;
        else if(q.includes("고민")||q.includes("선택")||q.includes("인생")) tc=5;
        else if(q.includes("될까")||q.includes("맞나")) tc=1;
      }
      setMsgs(prev=>[...prev,{role:"assistant",content:reply,suggestions:suggestQ(),needTarot,tarotCount:tc}]);
      if(needTarot){setTarotPhase("select");setTarotCount(tc);}
    } catch {
      setMsgs(prev=>[...prev,{role:"assistant",content:"별의 기운이 흐트러졌습니다. 다시 시도해주세요."}]);
    }
    setLoading(false);
  };

  const onTarotDone = async (cards) => {
    setTarotCards(cards); setTarotPhase("reading");
    const displayMsg = {role:"user",content:"🃏 카드를 선택했어요"};
    const newMsgs=[...msgs,displayMsg]; setMsgs(newMsgs); setLoading(true);
    const posLabels={1:["핵심 메시지"],3:["현재 마음","장애물","가까운 흐름"],5:["나","상대","문제","조언","결과"],11:["상대감정","상대기대","연락없는이유","상대행동","내감정","내바람","극복할것","해야할행동","안하면","객관상태","재회가능성"]};
    const labels = posLabels[cards.length]||cards.map((_,i)=>`카드 ${i+1}`);
    const info = cards.map((c,i)=>`[${labels[i]}] ${c.kr}(${c.rev?"역방향":"정방향"}): ${c.rev?c.rev:c.up}`).join("\n");
    const hiddenPrompt=`사용자가 직접 선택한 타로 카드(${cards.length}장)를 해석해주세요. AI가 임의로 카드를 추가하지 않습니다.\n\n[선택된 카드와 포지션]\n${info}\n\n각 포지션 의미에 맞게, 정방향/역방향을 정확히 반영하세요. 시기 질문이 있었다면 "올해 7~8월" 같이 구체적으로 답하세요. 해석 후 "새로운 질문이 있으시면 편하게 말씀해 주세요 🌟"로 마무리하세요.`;
    try {
      const history=[...newMsgs.slice(-10,-1).map(m=>({role:m.role,content:m.content})),{role:"user",content:hiddenPrompt}];
      const reply=await callChat(getSystemCtx(),history,1200);
      setMsgs(prev=>[...prev,{role:"assistant",content:reply,suggestions:suggestQ()}]);
    } catch {
      setMsgs(prev=>[...prev,{role:"assistant",content:"별의 기운이 흐트러졌습니다."}]);
    }
    setLoading(false); setTarotPhase(null); setTarotCards([]); setTarotCount(3);
  };

  const startNewChat=(exp,profs,ct,initMsg)=>{
    const id=Date.now().toString(); chatIdRef.current=id;
    setActiveChatId(id); setExpert(exp); setChatType(ct); setSelProfiles(profs);
    setMsgs([{role:"assistant",content:initMsg,suggestions:suggestQ()}]);
    setTarotPhase(null); setTarotCards([]); setPhase("chat");
  };

  const openChat=(chat)=>{
    chatIdRef.current=chat.id; setActiveChatId(chat.id); setExpert(chat.expert); setChatType(chat.chatType);
    const matched=(chat.profiles||[]).map(cp=>profiles.find(p=>p.id===cp.id)||cp).filter(Boolean);
    setSelProfiles(matched); setMsgs(chat.msgs||[]); setTarotPhase(null); setTarotCards([]); setPhase("chat");
  };

  const deleteChat=(id,e)=>{ e.stopPropagation(); const u=loadChats().filter(c=>c.id!==id); saveChats(u); setChatList(u); };

  // ── 채팅 목록 ──────────────────────────────────
  if(phase==="list") return (
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:"0 0 16px"}}>🔮 운세 챗</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
        {Object.entries(EXPERTS).map(([id,e])=>(
          <button key={id} onClick={()=>{setExpert(id);setPhase(`setup_${id}`);}} style={{
            padding:"14px 6px",borderRadius:16,border:`1px solid ${C.border}`,
            cursor:"pointer",textAlign:"center",background:C.card,
          }}>
            <div style={{fontSize:24,marginBottom:4}}>{e.icon}</div>
            <div style={{color:C.text,fontFamily:FONT,fontSize:11}}>{e.name}</div>
            <div style={{color:e.color,fontFamily:FONT,fontSize:9,marginTop:2}}>{e.sub}</div>
          </button>
        ))}
      </div>
      {chatList.length>0&&(
        <>
          <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:10}}>이전 채팅</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {chatList.map(chat=>{
              const e=EXPERTS[chat.expert]||EXPERTS.tarot;
              const lastMsg=chat.msgs?.filter(m=>m.role==="assistant").slice(-1)[0];
              return (
                <div key={chat.id} onClick={()=>openChat(chat)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:`radial-gradient(circle,${e.color}33,transparent)`,border:`1px solid ${e.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{e.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{color:C.text,fontFamily:FONT,fontSize:13,fontWeight:"bold"}}>{chat.title}</span>
                      <span style={{color:C.sub,fontFamily:FONT,fontSize:10,flexShrink:0,marginLeft:8}}>{formatDate(chat.updatedAt)}</span>
                    </div>
                    <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lastMsg?.content?.slice(0,45)||"..."}</p>
                  </div>
                  <button onClick={(e)=>deleteChat(chat.id,e)} style={{background:"none",border:"none",color:"rgba(167,139,250,0.3)",fontSize:16,cursor:"pointer",flexShrink:0}}>✕</button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  // ── 사주 셋업 ─────────────────────────────────
  if(phase==="setup_saju") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setPhase("list");setExpert(null);setChatType(null);setSelProfiles([]);}} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:17,margin:0}}>🐙 문어마녀</h2>
      </div>
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:13,marginBottom:14,textAlign:"center"}}>어떤 상담을 원하시나요?</p>
        <div style={{display:"flex",gap:10}}>
          {[{id:"individual",icon:"👤",label:"개인 상담"},{id:"gungham",icon:"👥",label:"궁합 상담"}].map(t=>(
            <button key={t.id} onClick={()=>setChatType(t.id)} style={{flex:1,padding:"14px 8px",borderRadius:14,border:`1px solid ${chatType===t.id?C.purple:C.border}`,cursor:"pointer",textAlign:"center",fontFamily:FONT,background:chatType===t.id?"rgba(109,40,217,0.25)":"rgba(255,255,255,0.03)",color:chatType===t.id?C.text:C.sub}}>
              <div style={{fontSize:22,marginBottom:5}}>{t.icon}</div><div style={{fontSize:13}}>{t.label}</div>
            </button>
          ))}
        </div>
      </GlassCard>
      {chatType&&(
        <GlassCard>
          <ProfilePicker profiles={profiles} selected={chatType==="individual"?selProfiles[0]:selProfiles} multi={chatType==="gungham"}
            onSelect={p=>{if(chatType==="individual")setSelProfiles([p]);else setSelProfiles(prev=>prev.some(s=>s.id===p.id)?prev.filter(s=>s.id!==p.id):[...prev.slice(-1),p]);}}
            onAdd={onAddProfile} label={chatType==="individual"?"상담 받을 프로필":"두 사람의 프로필 선택"}/>
        </GlassCard>
      )}
      {((chatType==="individual"&&selProfiles.length===1)||(chatType==="gungham"&&selProfiles.length===2))&&(
        <Btn onClick={()=>{
          const names=selProfiles.map(p=>p.name).join("·");
          const initMsg=chatType==="individual"
            ?`안녕하세요 ✨ 저는 문어마녀예요. ${selProfiles[0].name}님의 사주를 읽어보았어요. ${selProfiles[0].saju?.el}오행의 기운이 흐르는군요. 어떤 것이 궁금하신가요?`
            :`안녕하세요 ✨ ${names}님 두 분의 사주를 함께 살펴보았어요. 궁합에 대해 무엇이 궁금하신가요?`;
          startNewChat("saju",selProfiles,chatType,initMsg);
        }}>상담 시작하기</Btn>
      )}
    </div>
  );

  // ── 타로 셋업 ─────────────────────────────────
  if(phase==="setup_tarot") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setPhase("list");setExpert(null);}} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:17,margin:0}}>🌟 불가사리</h2>
      </div>
      <GlassCard>
        <p style={{color:C.text,fontFamily:FONT,fontSize:14,marginBottom:8}}>안녕하세요 ✨</p>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:13,lineHeight:1.7,margin:0}}>
          저는 불가사리예요. 78장의 타로 카드로 당신의 고민에 함께할게요.
        </p>
      </GlassCard>
      <Btn onClick={()=>startNewChat("tarot",[],null,"안녕하세요 ✨ 저는 불가사리예요. 고민이 있으신가요? 편하게 말씀해 주세요.")}>상담 시작하기</Btn>
    </div>
  );

  // ── 별주부 셋업 ────────────────────────────────
  if(phase==="setup_love") return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setPhase("list");setExpert(null);setChatType(null);}} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <h2 style={{color:C.text,fontFamily:FONT,fontSize:17,margin:0}}>🐢 별주부</h2>
      </div>

      {/* 이야기 톤 */}
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:12}}>이야기 톤을 선택해주세요</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {id:"factual",icon:"⚡",label:"현실적 팩트폭력",desc:"잘잘못을 명확히 짚어드려요. 직설적이고 솔직한 조언",col:"#f87171"},
            {id:"gentle", icon:"🌸",label:"온건한 관계 응원가",desc:"두 사람 모두의 마음을 이해하며 관계가 좋은 방향으로",col:C.rose},
          ].map(t=>(
            <div key={t.id} onClick={()=>{setChatType(t.id);setLoveInfo(p=>({...p,tone:t.id}));}} style={{
              padding:"14px 16px",borderRadius:14,cursor:"pointer",
              border:`1px solid ${chatType===t.id?t.col:C.border}`,
              background:chatType===t.id?`${t.col}18`:"rgba(255,255,255,0.02)",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontSize:18}}>{t.icon}</span>
                <span style={{color:chatType===t.id?t.col:C.text,fontFamily:FONT,fontSize:14}}>{t.label}</span>
                {chatType===t.id&&<span style={{marginLeft:"auto",color:t.col}}>✓</span>}
              </div>
              <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:0}}>{t.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 상담자 정보 */}
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:12}}>상담자 정보 <span style={{fontSize:10,opacity:0.6}}>(상담 맞춤화에 사용)</span></p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <input placeholder="내 이름 (선택)" value={loveInfo.myName}
              onChange={e=>setLoveInfo(p=>({...p,myName:e.target.value}))} style={{...inp,fontSize:12}}/>
            <div style={{display:"flex",gap:6}}>
              {["여","남"].map(g=>(
                <button key={g} onClick={()=>setLoveInfo(p=>({...p,myGender:g}))} style={{
                  flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:"pointer",fontFamily:FONT,fontSize:12,
                  background:loveInfo.myGender===g?"linear-gradient(135deg,#7c3aed,#4f46e5)":"rgba(255,255,255,0.05)",
                  color:loveInfo.myGender===g?"white":C.sub
                }}>{g==="여"?"👩":"👨"}</button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <select value={loveInfo.myMbti} onChange={e=>setLoveInfo(p=>({...p,myMbti:e.target.value}))}
              style={{...inp,fontSize:12,appearance:"none"}}>
              {MBTI_LIST.map(m=><option key={m} value={m}>{m==="모름"?"내 MBTI (모름)":m}</option>)}
            </select>
            <input placeholder="내 나이 (선택)" value={loveInfo.myAge} type="number"
              onChange={e=>setLoveInfo(p=>({...p,myAge:e.target.value}))} style={{...inp,fontSize:12}} inputMode="numeric"/>
          </div>
        </div>
      </GlassCard>

      {/* 상대방 정보 */}
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:12,marginBottom:12}}>상대방 정보</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <input placeholder="상대방 이름 (선택)" value={loveInfo.otherName}
              onChange={e=>setLoveInfo(p=>({...p,otherName:e.target.value}))} style={{...inp,fontSize:12}}/>
            <div style={{display:"flex",gap:6}}>
              {["남","여"].map(g=>(
                <button key={g} onClick={()=>setLoveInfo(p=>({...p,otherGender:g}))} style={{
                  flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:"pointer",fontFamily:FONT,fontSize:12,
                  background:loveInfo.otherGender===g?"linear-gradient(135deg,#7c3aed,#4f46e5)":"rgba(255,255,255,0.05)",
                  color:loveInfo.otherGender===g?"white":C.sub
                }}>{g==="여"?"👩":"👨"}</button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <select value={loveInfo.otherMbti} onChange={e=>setLoveInfo(p=>({...p,otherMbti:e.target.value}))}
              style={{...inp,fontSize:12,appearance:"none"}}>
              {MBTI_LIST.map(m=><option key={m} value={m}>{m==="모름"?"상대 MBTI (모름)":m}</option>)}
            </select>
            <input placeholder="상대 나이 (선택)" value={loveInfo.otherAge} type="number"
              onChange={e=>setLoveInfo(p=>({...p,otherAge:e.target.value}))} style={{...inp,fontSize:12}} inputMode="numeric"/>
          </div>
        </div>
      </GlassCard>

      {chatType&&(
        <Btn variant="rose" onClick={()=>{
          const toneLabel=chatType==="factual"?"⚡ 팩트폭력 모드":"🌸 응원가 모드";
          const myStr=loveInfo.myName?`${loveInfo.myName}님`:"상담자님";
          startNewChat("love",[{gender:loveInfo.myGender,name:loveInfo.myName||"나"}],chatType,
            `안녕하세요 🐢 저는 별주부예요.\n${toneLabel}로 상담을 시작할게요.\n\n${myStr}, 마음속에 담아두셨던 연애 이야기를 편하게 말씀해 주세요. 자세히 이야기해 주실수록 더 정확하게 도와드릴 수 있어요 💙`
          );
        }}>상담 시작하기 🐢</Btn>
      )}
    </div>
  );

  // ── 채팅 화면 ─────────────────────────────────
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh"}}>
      <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,background:C.card,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <button onClick={()=>setPhase("list")} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>←</button>
        <div style={{width:36,height:36,borderRadius:"50%",background:`radial-gradient(circle,${expertInfo.color}44,transparent)`,border:`1px solid ${expertInfo.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{expertInfo.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:C.text,fontFamily:FONT,fontSize:14}}>{expertInfo.name}</div>
          <div style={{color:expertInfo.color,fontFamily:FONT,fontSize:10}}>
            {expert==="love"&&loveInfo.myName?`${loveInfo.myName} · `:""}
            {selProfiles.length>0?selProfiles.map(p=>p.name).join(" · "):"온라인"}
          </div>
        </div>
        <button onClick={()=>{setPhase(`setup_${expert}`);setChatType(null);setSelProfiles([]);}} style={{background:"rgba(109,40,217,0.2)",border:`1px solid ${C.purple}55`,borderRadius:8,padding:"5px 10px",cursor:"pointer",color:C.purple,fontFamily:FONT,fontSize:11,flexShrink:0}}>+ 새 상담</button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:14,paddingBottom:120}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",gap:8}}>
            <div style={{maxWidth:"82%",padding:"12px 16px",borderRadius:18,background:m.role==="user"?"linear-gradient(135deg,rgba(109,40,217,0.5),rgba(67,56,202,0.5))":C.card,border:`1px solid ${m.role==="user"?C.purple:C.border}`,color:C.text,fontFamily:FONT,fontSize:13,lineHeight:1.7}}>{m.content}</div>
            {m.role==="assistant"&&m.suggestions&&(
              <div style={{display:"flex",gap:6,flexWrap:"wrap",maxWidth:"90%"}}>
                {m.suggestions.map((s,si)=>(
                  <button key={si} onClick={()=>sendMessage(s)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${C.border}`,background:"rgba(109,40,217,0.12)",color:C.sub,fontFamily:FONT,fontSize:11,cursor:"pointer"}}>{s}</button>
                ))}
              </div>
            )}
            {m.role==="assistant"&&m.needTarot&&tarotPhase==="select"&&i===msgs.length-1&&(
              <ChatTarotPicker onDone={onTarotDone} count={tarotCount}/>
            )}
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`radial-gradient(circle,${expertInfo.color}44,transparent)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{expertInfo.icon}</div>
            <div style={{display:"flex",gap:4}}>
              {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:expertInfo.color,animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{position:"fixed",bottom:70,left:0,right:0,padding:"12px 16px",background:C.bg,borderTop:`1px solid ${C.border}`,display:"flex",gap:10,maxWidth:480,margin:"0 auto",boxSizing:"border-box",width:"100%"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),sendMessage(input))} placeholder="궁금한 것을 물어보세요…" style={{...inp,flex:1,padding:"10px 14px"}}/>
        <button onClick={()=>sendMessage(input)} disabled={!input.trim()||loading} style={{width:44,height:44,borderRadius:12,border:"none",cursor:"pointer",flexShrink:0,background:`linear-gradient(135deg,${expertInfo.color}88,rgba(109,40,217,0.6))`,color:"white",fontSize:18,opacity:input.trim()&&!loading?1:0.4}}>↑</button>
      </div>
    </div>
  );
}
