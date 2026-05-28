import { useState } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn, Spinner } from "../common/UI.jsx";
import { getZodiac } from "../../utils/zodiac.js";
import { callAI } from "../../utils/api.js";
import { getCached, setCached } from "../../utils/cache.js";

export default function ZodiacScreen({profiles}) {
  const [sel,setSel] = useState(null);
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);

  const read = async (zod) => {
    setLoading(true); setResult(null);
    const today=new Date().toLocaleDateString("ko-KR");
    const prompt=`오늘(${today}) ${zod.sign}(${zod.emoji})의 운세를 사주명리학과 서양 점성술을 접목하여 알려주세요.
JSON으로만:
{
  "overall":"종합운 한줄(30자)",
  "love":"연애운(50자)","money":"재물운(50자)","work":"직업운(50자)","health":"건강운(40자)",
  "score":{"love":0~100,"money":0~100,"work":0~100,"health":0~100},
  "lucky":"오늘의 행운 아이템(15자)",
  "message":"오늘의 별자리 메시지(70자)"
}`;
    try{ const r=await callAI(prompt,800,true); setResult({...r,zod}); }
    catch{ setResult({error:true}); }
    setLoading(false);
  };

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      <h2 style={{color:C.text,fontFamily:FONT,fontSize:18,margin:0,textAlign:"center"}}>🌠 별자리 운세</h2>

      {/* 프로필 기반 자동 제안 */}
      {profiles.length>0&&(
        <GlassCard>
          <p style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:10}}>프로필 별자리</p>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {profiles.slice(0,3).map(p=>{
              const z=getZodiac(p.m,p.d);
              return (
                <div key={p.id} onClick={()=>{setSel(z);read(z);}} style={{
                  display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
                  borderRadius:12,cursor:"pointer",border:`1px solid ${C.border}`,
                  background:"rgba(255,255,255,0.02)"
                }}>
                  <span style={{fontSize:24}}>{z.emoji}</span>
                  <div>
                    <div style={{color:C.text,fontFamily:FONT,fontSize:13}}>{p.name} · {z.sign}</div>
                    <div style={{color:C.sub,fontFamily:FONT,fontSize:10}}>{z.range}</div>
                  </div>
                  <span style={{marginLeft:"auto",color:C.purple,fontFamily:FONT,fontSize:12}}>보기 →</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* 전체 별자리 그리드 */}
      <GlassCard>
        <p style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:10}}>별자리 선택</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {ZODIAC_LIST.map(z=>(
            <button key={z.sign} onClick={()=>{setSel(z);read(z);}} style={{
              padding:"12px 4px",borderRadius:12,border:`1px solid ${sel?.sign===z.sign?C.purple:C.border}`,
              background:sel?.sign===z.sign?"rgba(109,40,217,0.2)":"rgba(255,255,255,0.02)",
              cursor:"pointer",fontFamily:FONT,textAlign:"center"
            }}>
              <div style={{fontSize:22,marginBottom:4}}>{z.emoji}</div>
              <div style={{color:C.text,fontSize:10}}>{z.sign}</div>
            </button>
          ))}
        </div>
      </GlassCard>

      {loading&&<GlassCard><Spinner/></GlassCard>}
      {result&&!result.error&&(
        <GlassCard glow>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:40,marginBottom:6}}>{result.zod.emoji}</div>
            <div style={{color:C.text,fontFamily:FONT,fontSize:16}}>{result.zod.sign}</div>
            <p style={{color:C.sub,fontFamily:FONT,fontSize:13,marginTop:6}}>"{result.overall}"</p>
          </div>
          {/* 점수 바 */}
          {[["💕 연애운","love",C.rose],["💰 재물운","money",C.gold],["💼 직업운","work",C.cyan],["🌿 건강운","health","#86efac"]].map(([l,k,col])=>(
            <div key={k} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{color:C.sub,fontFamily:FONT,fontSize:12}}>{l}</span>
                <span style={{color:col,fontFamily:FONT,fontSize:12}}>{result.score?.[k]}점</span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${result.score?.[k]||0}%`,background:col,borderRadius:3,transition:"width 1s"}}/>
              </div>
            </div>
          ))}
          {[["💕 연애운","love"],["💰 재물운","money"],["💼 직업운","work"],["🌿 건강운","health"]].map(([l,k])=>(
            <div key={k} style={{
              background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"10px 14px",
              border:`1px solid ${C.border}`,marginBottom:8
            }}>
              <div style={{color:C.sub,fontFamily:FONT,fontSize:11,marginBottom:3}}>{l}</div>
              <div style={{color:C.text,fontFamily:FONT,fontSize:12}}>{result[k]}</div>
            </div>
          ))}
          <div style={{
            marginTop:6,padding:"10px 14px",background:"rgba(212,168,75,0.08)",
            border:`1px solid ${C.gold}44`,borderRadius:10,textAlign:"center"
          }}>
            <div style={{color:C.gold,fontFamily:FONT,fontSize:12,marginBottom:4}}>✨ {result.lucky}</div>
            <div style={{color:C.text,fontFamily:FONT,fontSize:13}}>"{result.message}"</div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// ─── 운세 챗 ─────────────────────────────────
const CHAT_STORE_KEY = "starflow_chats_v1";

// 채팅 목록 로드
const loadChats = () => {
  try { return JSON.parse(localStorage.getItem(CHAT_STORE_KEY)||"[]"); } catch { return []; }
};
// 채팅 저장
const saveChats = (list) => {
  try { localStorage.setItem(CHAT_STORE_KEY, JSON.stringify(list)); } catch {}
};
// 단일 채팅 upsert
const upsertChat = (chat) => {
  const list = loadChats();
  const idx = list.findIndex(c=>c.id===chat.id);
  if(idx>=0) list[idx]=chat; else list.unshift(chat);
  saveChats(list);
}