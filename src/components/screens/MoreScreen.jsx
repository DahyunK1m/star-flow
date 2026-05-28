import { useState, useEffect } from "react";
import { C, FONT } from "../../constants/colors.js";
import { GlassCard, Btn, PillarRow } from "../common/UI.jsx";
import ProfileForm from "../common/ProfileForm.jsx";
import { loadAllReports } from "../../utils/cache.js";
import SajuScreen from "./SajuScreen.jsx";

export default function MoreScreen({profiles,onAddProfile,onUpdateProfile,onDeleteProfile}) {
  const me = profiles.find(p=>p.relation==="본인")||profiles[0];
  const [managing,setManaging] = useState(false);
  const [editing,setEditing] = useState(null);
  const [viewReport,setViewReport] = useState(null); // {profileId, type}
  const [allReports,setAllReports] = useState({});

  useEffect(()=>{
    // 저장된 리포트 목록 로드
    const reports = {};
    profiles.forEach(p=>{ reports[p.id] = loadAllReports(p.id); });
    setAllReports(reports);
  },[profiles]);

  // 리포트 보기 화면
  if(viewReport) {
    const profile = profiles.find(p=>p.id===viewReport.profileId);
    return <SajuScreen
      profiles={profiles}
      onAddProfile={()=>{}}
      mode={viewReport.type==="newyear"?"newyear":"saju"}
      onBack={()=>setViewReport(null)}
      initialProfileId={viewReport.profileId}
    />;
  }

  return (
    <div style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
      {/* 본인 프로필 카드 */}
      <GlassCard glow>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{
            width:52,height:52,borderRadius:"50%",
            background:`radial-gradient(circle,${C.purple}55,transparent)`,
            border:`1px solid ${C.purple}55`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:26
          }}>{me?.gender==="여"?"👩":"👨"}</div>
          <div>
            <p style={{color:C.sub,fontFamily:FONT,fontSize:12,margin:"0 0 4px"}}>안녕하세요,</p>
            <h2 style={{color:C.text,fontFamily:FONT,fontSize:20,margin:0}}>
              {me?`${me.name}님!`:"새 프로필을 등록해주세요"}
            </h2>
            {me&&(
              <div style={{marginTop:6}}>
                <div style={{display:"flex",gap:4,marginTop:4}}>
                  {[{l:"년",v:me.saju.yp},{l:"월",v:me.saju.mp},{l:"일",v:me.saju.dp},{l:"시",v:me.saju.tp}].map(({l,v})=>(
                    <div key={l} style={{
                      background:"rgba(109,40,217,0.12)",border:`1px solid rgba(109,40,217,0.2)`,
                      borderRadius:6,padding:"2px 6px",textAlign:"center"
                    }}>
                      <div style={{color:C.sub,fontSize:8,fontFamily:FONT}}>{l}</div>
                      <div style={{color:v?C.text:"rgba(155,138,176,0.3)",fontSize:14,fontFamily:FONT,letterSpacing:1}}>{v||"–"}</div>
                    </div>
                  ))}
                  <div style={{
                    display:"flex",alignItems:"center",padding:"2px 8px",borderRadius:6,
                    background:`rgba(109,40,217,0.1)`,border:`1px solid rgba(109,40,217,0.25)`
                  }}>
                    <span style={{color:C.purple,fontSize:11,fontFamily:FONT}}>{me.saju.el}기운</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* 프로필 관리 */}
      <GlassCard>
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:managing?16:0
        }}>
          <span style={{color:C.text,fontFamily:FONT,fontSize:14}}>👤 프로필 관리</span>
          <button onClick={()=>setManaging(m=>!m)} style={{
            background:"rgba(109,40,217,0.2)",border:`1px solid ${C.purple}55`,
            borderRadius:8,padding:"5px 14px",cursor:"pointer",color:C.purple,fontFamily:FONT,fontSize:12
          }}>{managing?"닫기":"열기"}</button>
        </div>

        {managing&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {profiles.map(p=>(
              <div key={p.id}>
                {editing?.id===p.id?(
                  <div style={{background:"rgba(255,255,255,0.02)",borderRadius:12,padding:14,border:`1px solid ${C.border}`}}>
                    <ProfileForm initial={editing} onSave={np=>{onUpdateProfile(np);setEditing(null);}} onCancel={()=>setEditing(null)}/>
                  </div>
                ):(
                  <div style={{
                    display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                    borderRadius:12,border:`1px solid ${C.border}`,background:"rgba(255,255,255,0.02)"
                  }}>
                    <span style={{fontSize:22}}>{p.gender==="여"?"👩":"👨"}</span>
                    <div style={{flex:1}}>
                      <div style={{color:C.text,fontFamily:FONT,fontSize:13}}>{p.name}</div>
                      <div style={{color:C.sub,fontFamily:FONT,fontSize:10,marginBottom:4}}>{p.relation} · {p.saju.el}오행</div>
                      <div style={{display:"flex",gap:3}}>
                        {[{l:"년",v:p.saju.yp},{l:"월",v:p.saju.mp},{l:"일",v:p.saju.dp},{l:"시",v:p.saju.tp}].map(({l,v})=>(
                          <div key={l} style={{
                            background:"rgba(109,40,217,0.12)",border:`1px solid rgba(109,40,217,0.2)`,
                            borderRadius:5,padding:"1px 4px",textAlign:"center"
                          }}>
                            <div style={{color:C.sub,fontSize:7,fontFamily:FONT}}>{l}</div>
                            <div style={{color:v?C.text:"rgba(155,138,176,0.3)",fontSize:11,fontFamily:FONT}}>{v||"–"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={()=>setEditing(p)} style={{
                      background:"none",border:`1px solid ${C.border}`,borderRadius:6,
                      padding:"3px 8px",cursor:"pointer",color:C.sub,fontFamily:FONT,fontSize:11
                    }}>수정</button>
                    <button onClick={()=>onDeleteProfile(p.id)} style={{
                      background:"none",border:`1px solid rgba(239,68,68,0.3)`,borderRadius:6,
                      padding:"3px 8px",cursor:"pointer",color:"#f87171",fontFamily:FONT,fontSize:11
                    }}>삭제</button>
                  </div>
                )}
              </div>
            ))}
            {/* 새 프로필 추가 */}
            {editing?.id==="new"?(
              <div style={{background:"rgba(255,255,255,0.02)",borderRadius:12,padding:14,border:`1px solid ${C.border}`}}>
                <ProfileForm onSave={np=>{onAddProfile(np);setEditing(null);}} onCancel={()=>setEditing(null)}/>
              </div>
            ):(
              <button onClick={()=>setEditing({id:"new"})} style={{
                padding:"12px 0",borderRadius:12,border:`1px dashed ${C.border}`,
                background:"transparent",color:C.sub,fontFamily:FONT,fontSize:13,cursor:"pointer",width:"100%"
              }}>＋ 새 프로필 추가</button>
            )}
          </div>
        )}
      </GlassCard>

      {/* 저장된 리포트 */}
      {profiles.some(p=>Object.keys(allReports[p.id]||{}).length>0)&&(
        <GlassCard>
          <div style={{color:C.text,fontFamily:FONT,fontSize:14,marginBottom:12}}>📋 저장된 리포트</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {profiles.map(p=>{
              const reports = allReports[p.id]||{};
              return Object.entries(reports).map(([type,entry])=>{
                const label = type==="saju_detail"?"정밀 사주 리포트":type==="newyear"?"신년운세":"사주";
                const date = new Date(entry.savedAt).toLocaleDateString("ko-KR",{month:"short",day:"numeric"});
                return (
                  <div key={type} onClick={()=>setViewReport({profileId:p.id,type})} style={{
                    display:"flex",alignItems:"center",justifyContent:"space-between",
                    padding:"12px 14px",borderRadius:12,cursor:"pointer",
                    border:`1px solid ${C.border}`,background:"rgba(255,255,255,0.02)",
                  }}>
                    <div>
                      <div style={{color:C.text,fontFamily:FONT,fontSize:13}}>{p.name}님 {label}</div>
                      <div style={{color:C.sub,fontFamily:FONT,fontSize:10,marginTop:2}}>{date} 저장</div>
                    </div>
                    <span style={{color:C.purple,fontFamily:FONT,fontSize:12}}>보기 →</span>
                  </div>
                );
              });
            })}
          </div>
        </GlassCard>
      )}

      {/* 앱 정보 */}
      <GlassCard>
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:28,marginBottom:8}}>🌌</div>
          <div style={{color:C.text,fontFamily:FONT,fontSize:15,marginBottom:4}}>별의 흐름</div>
          <div style={{color:C.sub,fontFamily:FONT,fontSize:11}}>AI 기반 사주 · 타로 · 운세</div>
        </div>
      </GlassCard>
    </div>
  );
};

// ═══════════════════════════════════════════════
// 4. 앱 루트
// ═══════════════════════════════════════════════