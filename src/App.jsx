import { useState, useEffect } from "react";
import { C, FONT } from "./constants/colors.js";
import { loadProfiles, saveProfiles } from "./utils/profileStorage.js";

// 화면 컴포넌트
import HomeScreen    from "./components/screens/HomeScreen.jsx";
import SajuScreen    from "./components/screens/SajuScreen.jsx";
import GunghamScreen from "./components/screens/GunghamScreen.jsx";
import ReunionScreen from "./components/screens/ReunionScreen.jsx";
import TarotScreen   from "./components/screens/TarotScreen.jsx";
import ZodiacScreen  from "./components/screens/ZodiacScreen.jsx";
import TodayScreen   from "./components/screens/TodayScreen.jsx";
import MoreScreen    from "./components/screens/MoreScreen.jsx";
import ChatScreen    from "./components/screens/ChatScreen.jsx";

// 공통 UI
import { Stars } from "./components/common/UI.jsx";

// ── CSS 애니메이션 ─────────────────────────────
const STYLE = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:${C.bg}; color:${C.text}; font-family:${FONT}; min-height:100vh; overflow-x:hidden; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes bounce { 0%,100%{transform:scale(0.8);opacity:0.5} 50%{transform:scale(1.2);opacity:1} }
  @keyframes tw    { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  select { color:${C.text}; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(124,58,237,0.3); border-radius:2px; }
`;

// ── 탭 정의 ────────────────────────────────────
const TABS = [
  { id:"home",  icon:"🏠", label:"홈"        },
  { id:"chat",  icon:"💬", label:"운세챗"    },
  { id:"today", icon:"🌙", label:"오늘의운세" },
  { id:"more",  icon:"📁", label:"더보기"    },
];

export default function App() {
  const [profiles,  setProfiles]  = useState([]);
  const [tab,       setTab]       = useState("home");
  const [screen,    setScreen]    = useState(null); // 홈에서 선택한 서브화면

  // 프로필 로드
  useEffect(()=>{ setProfiles(loadProfiles()); }, []);

  // 프로필 CRUD
  const addProfile    = (p) => { const next=[...profiles,p]; setProfiles(next); saveProfiles(next); };
  const updateProfile = (p) => { const next=profiles.map(x=>x.id===p.id?p:x); setProfiles(next); saveProfiles(next); };
  const deleteProfile = (id)=> { const next=profiles.filter(x=>x.id!==id); setProfiles(next); saveProfiles(next); };

  const navigate = (s) => { setScreen(s); setTab("home"); };
  const goHome   = ()   => setScreen(null);

  // ── 현재 화면 결정 ──────────────────────────
  const renderContent = () => {
    // 탭별 전용 화면
    if(tab==="chat")  return <ChatScreen  profiles={profiles} onAddProfile={addProfile}/>;
    if(tab==="today") return <TodayScreen profiles={profiles} onAddProfile={addProfile}/>;
    if(tab==="more")  return <MoreScreen  profiles={profiles} onAddProfile={addProfile} onUpdateProfile={updateProfile} onDeleteProfile={deleteProfile}/>;

    // 홈 탭 — 서브화면
    if(!screen)          return <HomeScreen   profiles={profiles} onAddProfile={addProfile} navigate={navigate}/>;
    if(screen==="saju")  return <SajuScreen   profiles={profiles} onAddProfile={addProfile} mode="saju"    onBack={goHome}/>;
    if(screen==="newyear")return<SajuScreen   profiles={profiles} onAddProfile={addProfile} mode="newyear" onBack={goHome}/>;
    if(screen==="gungham")return<GunghamScreen profiles={profiles} onAddProfile={addProfile} onBack={goHome}/>;
    if(screen==="reunion")return<ReunionScreen profiles={profiles} onAddProfile={addProfile} onBack={goHome}/>;
    if(screen==="tarot") return <TarotScreen/>;
    if(screen==="zodiac")return <ZodiacScreen profiles={profiles}/>;
    return <HomeScreen profiles={profiles} onAddProfile={addProfile} navigate={navigate}/>;
  };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ maxWidth:480, margin:"0 auto", position:"relative", minHeight:"100vh" }}>
        <Stars/>
        <div style={{ position:"relative", zIndex:1, paddingBottom:70 }}>
          {renderContent()}
        </div>

        {/* 하단 탭바 */}
        <nav style={{
          position:"fixed", bottom:0, left:0, right:0,
          maxWidth:480, margin:"0 auto",
          background:"rgba(6,4,18,0.95)",
          borderTop:`1px solid ${C.border}`,
          backdropFilter:"blur(20px)",
          display:"flex", zIndex:100,
        }}>
          {TABS.map(t=>{
            const isActive = t.id==="home" ? tab==="home" : tab===t.id;
            return (
              <button key={t.id}
                onClick={()=>{ setTab(t.id); if(t.id==="home") setScreen(null); }}
                style={{
                  flex:1, padding:"10px 0 14px",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                  background:"none", border:"none", cursor:"pointer",
                  borderTop: isActive ? `2px solid ${C.purple}` : "2px solid transparent",
                }}>
                <span style={{ fontSize:20 }}>{t.icon}</span>
                <span style={{
                  color: isActive ? C.purple : C.sub,
                  fontFamily:FONT, fontSize:10,
                  transition:"color 0.2s"
                }}>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
