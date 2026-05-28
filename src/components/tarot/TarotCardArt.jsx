import { C } from "../../constants/colors.js";

export default function TarotCardArt({card, size=52, isRev=false}) {
  const w = size, h = Math.round(size*1.7);
  const s = (x) => x * size/52; // 스케일 (float 유지)
  const gold="#d4a84b", purple="#6d28d9", cream="#f5f0e0", dark="#1a0a2e";
  const red="#c0392b", blue="#2980b9", green="#27ae60", silver="#bdc3c7";

  // 수트 심볼 여러 개 배치
  const renderPips = (suit, count, color) => {
    const positions = {
      1:[[50,50]],
      2:[[50,25],[50,75]],
      3:[[50,20],[50,50],[50,80]],
      4:[[25,25],[75,25],[25,75],[75,75]],
      5:[[25,20],[75,20],[50,50],[25,80],[75,80]],
      6:[[25,20],[75,20],[25,50],[75,50],[25,80],[75,80]],
      7:[[25,18],[75,18],[50,35],[25,52],[75,52],[25,70],[75,70]],
      8:[[25,15],[75,15],[50,32],[25,50],[75,50],[25,68],[75,68],[50,85]],
      9:[[20,15],[50,15],[80,15],[20,40],[50,40],[80,40],[20,65],[50,65],[80,65]],
      10:[[20,12],[50,12],[80,12],[20,35],[50,35],[80,35],[20,58],[50,58],[80,58],[50,82]],
    }[Math.min(count,10)]||[];
    const sym = suit==="소드"?"⚔":suit==="완드"?"🪄":suit==="컵"?"🏆":"⬟";
    return positions.map(([px,py],i)=>(
      <text key={i} x={`${px}%`} y={`${py}%`} textAnchor="middle" dominantBaseline="middle"
        fontSize={s(count>6?9:count>4?11:13)} fill={color}>{sym}</text>
    ));
  };

  const bg = (c1,c2) => `linear-gradient(160deg,${c1},${c2})`;

  // 카드별 아트
  const art = () => {
    const n = card.n;
    // 메이저 아르카나
    if(n==="The Fool") return (
      <>
        <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB"/><stop offset="100%" stopColor="#FFF9C4"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#sky)"/>
        {/* 절벽 */}
        <polygon points={`0,${s(70)} ${w},${s(55)} ${w},${h} 0,${h}`} fill="#8B6914"/>
        {/* 태양 */}
        <circle cx={s(42)} cy={s(12)} r={s(9)} fill="#FFD700" opacity="0.9"/>
        {/* 광대 몸 */}
        <ellipse cx="50%" cy={s(45)} rx={s(10)} ry={s(14)} fill="#E91E63"/>
        {/* 광대 머리 */}
        <circle cx="50%" cy={s(30)} r={s(8)} fill="#FFCC80"/>
        {/* 모자 */}
        <polygon points={`${s(18)},${s(28)} ${s(26)},${s(12)} ${s(34)},${s(28)}`} fill="#9C27B0"/>
        {/* 꽃 */}
        <circle cx={s(34)} cy={s(25)} r={s(3)} fill="#FFFFFF"/>
        {/* 작은 개 */}
        <ellipse cx={s(35)} cy={s(62)} rx={s(5)} ry={s(4)} fill="#FFF9C4"/>
        <circle cx={s(33)} cy={s(58)} r={s(3)} fill="#FFF9C4"/>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={dark} fontWeight="bold">0 · THE FOOL</text>
      </>
    );
    if(n==="The Magician") return (
      <>
        <rect width="100%" height="100%" fill="#1a0a4e"/>
        {/* 무한대 기호 */}
        <text x="50%" y="15%" textAnchor="middle" fontSize={s(14)} fill={gold}>∞</text>
        {/* 마법사 */}
        <circle cx="50%" cy={s(35)} r={s(9)} fill="#FFCC80"/>
        <rect x={s(19)} y={s(44)} width={s(14)} height={s(20)} rx={s(2)} fill="#E53935"/>
        {/* 지팡이 */}
        <line x1={s(35)} y1={s(25)} x2={s(35)} y2={s(60)} stroke={gold} strokeWidth={s(2)}/>
        <circle cx={s(35)} cy={s(23)} r={s(3)} fill={gold}/>
        {/* 4원소 심볼 */}
        <text x="20%" y="75%" textAnchor="middle" fontSize={s(9)} fill={red}>⚔</text>
        <text x="40%" y="75%" textAnchor="middle" fontSize={s(9)} fill={blue}>🏆</text>
        <text x="60%" y="75%" textAnchor="middle" fontSize={s(9)} fill={green}>⬟</text>
        <text x="80%" y="75%" textAnchor="middle" fontSize={s(9)} fill={gold}>🪄</text>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={gold} fontWeight="bold">I · MAGICIAN</text>
      </>
    );
    if(n==="The High Priestess") return (
      <>
        <rect width="100%" height="100%" fill="#0d1b4b"/>
        {/* 달 */}
        <circle cx="50%" cy={s(15)} r={s(10)} fill="#E8EAF6" opacity="0.9"/>
        <circle cx={s(30)} cy={s(15)} r={s(8)} fill="#0d1b4b"/>
        {/* 베일 */}
        <polygon points={`${s(4)},${s(85)} ${s(22)},${s(30)} ${s(30)},${s(85)}`} fill="#1565C0" opacity="0.7"/>
        <polygon points={`${s(22)},${s(85)} ${s(30)},${s(30)} ${s(38)},${s(85)}`} fill="#E3F2FD" opacity="0.8"/>
        {/* 여사제 */}
        <circle cx="50%" cy={s(42)} r={s(9)} fill="#FFCC80"/>
        <rect x={s(19)} y={s(51)} width={s(14)} height={s(22)} rx={s(2)} fill="#1565C0"/>
        {/* 책 */}
        <rect x={s(18)} y={s(60)} width={s(16)} height={s(10)} rx={s(1)} fill={cream}/>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={cream}>II · HIGH PRIESTESS</text>
      </>
    );
    if(n==="The Empress") return (
      <>
        <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8F5E9"/><stop offset="100%" stopColor="#FFF9C4"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#eg)"/>
        {/* 왕좌 */}
        <rect x={s(12)} y={s(45)} width={s(28)} height={s(35)} rx={s(3)} fill="#8D6E63"/>
        {/* 왕관 */}
        <polygon points={`${s(14)},${s(22)} ${s(19)},${s(12)} ${s(24)},${s(19)} ${s(29)},${s(10)} ${s(34)},${s(19)} ${s(38)},${s(22)}`} fill={gold}/>
        {/* 여황제 */}
        <circle cx="50%" cy={s(30)} r={s(9)} fill="#FFCC80"/>
        <ellipse cx="50%" cy={s(50)} rx={s(12)} ry={s(16)} fill="#E91E63"/>
        {/* 꽃 장식 */}
        {[15,25,35,40,12,48].map((x,i)=><circle key={i} cx={s(x)} cy={s(72+i*2)} r={s(2.5)} fill={["#E91E63","#FF9800","#FFEB3B","#4CAF50","#2196F3","#9C27B0"][i]}/>)}
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={dark}>III · THE EMPRESS</text>
      </>
    );
    if(n==="The Emperor") return (
      <>
        <rect width="100%" height="100%" fill="#B71C1C" opacity="0.15"/>
        <rect width="100%" height="100%" fill="#3E2723" opacity="0.7"/>
        {/* 왕좌 */}
        <rect x={s(8)} y={s(38)} width={s(36)} height={s(40)} rx={s(2)} fill="#5D4037"/>
        <rect x={s(10)} y={s(28)} width={s(32)} height={s(12)} rx={s(2)} fill="#4E342E"/>
        {/* 황제 */}
        <circle cx="50%" cy={s(22)} r={s(8)} fill="#FFCC80"/>
        <polygon points={`${s(14)},${s(18)} ${s(19)},${s(7)} ${s(26)},${s(15)} ${s(33)},${s(7)} ${s(38)},${s(18)}`} fill={gold}/>
        <rect x={s(18)} y={s(30)} width={s(16)} height={s(22)} rx={s(2)} fill="#B71C1C"/>
        {/* 홀과 구 */}
        <line x1={s(36)} y1={s(28)} x2={s(44)} y2={s(42)} stroke={gold} strokeWidth={s(2)}/>
        <circle cx={s(44)} cy={s(42)} r={s(4)} fill={gold}/>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={gold}>IV · THE EMPEROR</text>
      </>
    );
    if(n==="The Lovers") return (
      <>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCE4EC"/><stop offset="100%" stopColor="#F3E5F5"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#lg)"/>
        {/* 천사 */}
        <circle cx="50%" cy={s(15)} r={s(8)} fill="#FFCC80"/>
        <ellipse cx="50%" cy={s(25)} rx={s(10)} ry={s(6)} fill="#FF9800" opacity="0.6"/>
        {/* 두 인물 */}
        <circle cx={s(16)} cy={s(52)} r={s(7)} fill="#FFCC80"/>
        <rect x={s(10)} y={s(59)} width={s(12)} height={s(18)} rx={s(2)} fill="#E53935"/>
        <circle cx={s(36)} cy={s(52)} r={s(7)} fill="#FFCC80"/>
        <rect x={s(30)} y={s(59)} width={s(12)} height={s(18)} rx={s(2)} fill="#1565C0"/>
        {/* 하트 */}
        <text x="50%" y="58%" textAnchor="middle" fontSize={s(16)} fill="#E91E63">♥</text>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={dark}>VI · THE LOVERS</text>
      </>
    );
    if(n==="The Hermit") return (
      <>
        <rect width="100%" height="100%" fill="#1a1a2e"/>
        {/* 산 */}
        <polygon points={`0,${h} ${s(52)},${s(25)} ${w},${h}`} fill="#37474F"/>
        {/* 은자 */}
        <circle cx={s(26)} cy={s(38)} r={s(7)} fill="#FFCC80"/>
        <rect x={s(20)} y={s(45)} width={s(12)} height={s(22)} rx={s(2)} fill="#546E7A"/>
        {/* 지팡이 */}
        <line x1={s(34)} y1={s(38)} x2={s(40)} y2={s(70)} stroke="#8D6E63" strokeWidth={s(2)}/>
        {/* 램프 */}
        <polygon points={`${s(12)},${s(42)} ${s(18)},${s(36)} ${s(24)},${s(42)}`} fill={gold} opacity="0.9"/>
        <circle cx={s(18)} cy={s(36)} r={s(4)} fill="#FFEB3B"/>
        {/* 별빛 */}
        {[[8,15],[40,8],[45,20],[5,28]].map(([x,y],i)=>(
          <text key={i} x={`${x*2}%`} y={`${y*2}%`} fontSize={s(5)} fill="#E8EAF6" textAnchor="middle">★</text>
        ))}
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={cream}>IX · THE HERMIT</text>
      </>
    );
    if(n==="The Tower") return (
      <>
        <rect width="100%" height="100%" fill="#0d0d0d"/>
        {/* 탑 */}
        <rect x={s(16)} y={s(20)} width={s(20)} height={s(55)} rx={s(1)} fill="#37474F"/>
        {/* 왕관 */}
        <polygon points={`${s(14)},${s(22)} ${s(26)},${s(10)} ${s(38)},${s(22)}`} fill={gold}/>
        {/* 번개 */}
        <polyline points={`${s(38)},${s(8)} ${s(30)},${s(30)} ${s(38)},${s(32)} ${s(26)},${s(55)}`}
          stroke="#FFD700" strokeWidth={s(3)} fill="none"/>
        {/* 떨어지는 사람들 */}
        <circle cx={s(10)} cy={s(50)} r={s(4)} fill="#FFCC80"/>
        <circle cx={s(42)} cy={s(55)} r={s(4)} fill="#FFCC80"/>
        {/* 불꽃 */}
        {[14,20,26,32,38].map((x,i)=>(
          <text key={i} x={s(x)} y={s(18+i*2)} fontSize={s(6)} fill="#FF6F00">🔥</text>
        ))}
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill="#FF5722">XVI · THE TOWER</text>
      </>
    );
    if(n==="The Star") return (
      <>
        <defs><linearGradient id="stg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1b4b"/><stop offset="100%" stopColor="#1a237e"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#stg)"/>
        {/* 큰 별 */}
        <text x="50%" y="18%" textAnchor="middle" fontSize={s(18)} fill="#FFD700">★</text>
        {/* 작은 별 7개 */}
        {[[15,10],[80,8],[90,25],[10,30],[85,42],[15,45],[78,55]].map(([x,y],i)=>(
          <text key={i} x={`${x}%`} y={`${y}%`} textAnchor="middle" fontSize={s(8)} fill="#E8EAF6">★</text>
        ))}
        {/* 여인 */}
        <circle cx="50%" cy={s(52)} r={s(7)} fill="#FFCC80"/>
        <ellipse cx="50%" cy={s(65)} rx={s(9)} ry={s(12)} fill="#1565C0" opacity="0.7"/>
        {/* 물 붓기 */}
        <path d={`M${s(20)},${s(58)} Q${s(24)},${s(70)} ${s(20)},${s(80)}`} stroke="#42A5F5" strokeWidth={s(2)} fill="none"/>
        <path d={`M${s(32)},${s(60)} Q${s(28)},${s(72)} ${s(30)},${s(82)}`} stroke="#42A5F5" strokeWidth={s(2)} fill="none"/>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill="#E8EAF6">XVII · THE STAR</text>
      </>
    );
    if(n==="The Moon") return (
      <>
        <rect width="100%" height="100%" fill="#0a0a1a"/>
        {/* 달 */}
        <circle cx="50%" cy={s(18)} r={s(12)} fill="#E8EAF6" opacity="0.85"/>
        <circle cx={s(23)} cy={s(15)} r={s(10)} fill="#0a0a1a"/>
        {/* 탑 두 개 */}
        <rect x={s(4)} y={s(45)} width={s(8)} height={s(30)} fill="#37474F"/>
        <rect x={s(40)} y={s(45)} width={s(8)} height={s(30)} fill="#37474F"/>
        {/* 개와 늑대 */}
        <ellipse cx={s(12)} cy={s(68)} rx={s(6)} ry={s(4)} fill="#FFF9C4"/>
        <circle cx={s(10)} cy={s(64)} r={s(4)} fill="#FFF9C4"/>
        <ellipse cx={s(40)} cy={s(68)} rx={s(6)} ry={s(4)} fill="#607D8B"/>
        <circle cx={s(42)} cy={s(64)} r={s(4)} fill="#607D8B"/>
        {/* 물 */}
        <ellipse cx="50%" cy={s(78)} rx={s(18)} ry={s(5)} fill="#1565C0" opacity="0.5"/>
        {/* 가재 */}
        <text x="50%" y="82%" textAnchor="middle" fontSize={s(9)} fill="#E53935">🦀</text>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill="#E8EAF6">XVIII · THE MOON</text>
      </>
    );
    if(n==="The Sun") return (
      <>
        <defs><linearGradient id="sung" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF9C4"/><stop offset="100%" stopColor="#FFE0B2"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#sung)"/>
        {/* 태양 */}
        <circle cx="50%" cy={s(20)} r={s(14)} fill="#FFD700"/>
        {[0,45,90,135,180,225,270,315].map((deg,i)=>{
          const rad=deg*Math.PI/180;
          const x1=s(26)+s(14)*Math.cos(rad), y1=s(20)+s(14)*Math.sin(rad);
          const x2=s(26)+s(18)*Math.cos(rad), y2=s(20)+s(18)*Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF6F00" strokeWidth={s(2)}/>;
        })}
        {/* 해바라기 */}
        {[10,20,32,42].map((x,i)=><text key={i} x={s(x)} y={s(60+i*3)} fontSize={s(10)} fill="#FF9800">🌻</text>)}
        {/* 아이 */}
        <circle cx="50%" cy={s(62)} r={s(7)} fill="#FFCC80"/>
        <ellipse cx="50%" cy={s(74)} rx={s(7)} ry={s(10)} fill="#E53935"/>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={dark}>XIX · THE SUN</text>
      </>
    );
    if(n==="The World") return (
      <>
        <defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a237e"/><stop offset="100%" stopColor="#4a148c"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#wg)"/>
        {/* 월계관 타원 */}
        <ellipse cx="50%" cy="45%" rx="38%" ry="38%" fill="none" stroke="#4CAF50" strokeWidth={s(2)}/>
        {/* 댄서 */}
        <circle cx="50%" cy={s(38)} r={s(7)} fill="#FFCC80"/>
        <text x="50%" y="60%" textAnchor="middle" fontSize={s(16)} fill="#E91E63">💃</text>
        {/* 4원소 */}
        <text x="12%" y="18%" textAnchor="middle" fontSize={s(9)} fill="#FFD700">♂</text>
        <text x="88%" y="18%" textAnchor="middle" fontSize={s(9)} fill="#FFD700">♀</text>
        <text x="12%" y="82%" textAnchor="middle" fontSize={s(9)} fill="#FFD700">🦅</text>
        <text x="88%" y="82%" textAnchor="middle" fontSize={s(9)} fill="#FFD700">🐂</text>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={cream}>XXI · THE WORLD</text>
      </>
    );
    if(n==="Death") return (
      <>
        <rect width="100%" height="100%" fill="#0d0d0d"/>
        {/* 말 */}
        <ellipse cx={s(26)} cy={s(58)} rx={s(14)} ry={s(10)} fill="#E0E0E0"/>
        <circle cx={s(15)} cy={s(50)} r={s(7)} fill="#E0E0E0"/>
        {/* 기사(해골) */}
        <circle cx={s(26)} cy={s(36)} r={s(7)} fill="#E0E0E0"/>
        <text x={s(22)} y={s(40)} fontSize={s(8)} fill={dark}>💀</text>
        <rect x={s(19)} y={s(43)} width={s(14)} height={s(15)} fill="#212121"/>
        {/* 깃발 */}
        <line x1={s(35)} y1={s(28)} x2={s(35)} y2={s(58)} stroke="#BDBDBD" strokeWidth={s(2)}/>
        <polygon points={`${s(35)},${s(28)} ${s(48)},${s(35)} ${s(35)},${s(42)}`} fill="#E0E0E0"/>
        {/* 해 */}
        <circle cx={s(26)} cy={s(15)} r={s(6)} fill="#FF6F00" opacity="0.7"/>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill="#9E9E9E">XIII · DEATH</text>
      </>
    );
    if(n==="The Devil") return (
      <>
        <rect width="100%" height="100%" fill="#1a0000"/>
        {/* 악마 */}
        <circle cx="50%" cy={s(28)} r={s(10)} fill="#37474F"/>
        {/* 뿔 */}
        <polygon points={`${s(18)},${s(22)} ${s(22)},${s(10)} ${s(26)},${s(22)}`} fill={red}/>
        <polygon points={`${s(26)},${s(22)} ${s(30)},${s(10)} ${s(34)},${s(22)}`} fill={red}/>
        {/* 날개 */}
        <ellipse cx={s(12)} cy={s(45)} rx={s(8)} ry={s(12)} fill="#212121" opacity="0.8"/>
        <ellipse cx={s(40)} cy={s(45)} rx={s(8)} ry={s(12)} fill="#212121" opacity="0.8"/>
        {/* 쇠사슬에 묶인 두 인물 */}
        <circle cx={s(16)} cy={s(68)} r={s(5)} fill="#FFCC80"/>
        <circle cx={s(36)} cy={s(68)} r={s(5)} fill="#FFCC80"/>
        <line x1={s(16)} y1={s(68)} x2={s(26)} y2={s(55)} stroke="#9E9E9E" strokeWidth={s(1.5)}/>
        <line x1={s(36)} y1={s(68)} x2={s(26)} y2={s(55)} stroke="#9E9E9E" strokeWidth={s(1.5)}/>
        {/* 역오각형 */}
        <polygon points={`${s(26)},${s(12)} ${s(18)},${s(22)} ${s(34)},${s(22)}`} fill="none" stroke={red} strokeWidth={s(1)}/>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={red}>XV · THE DEVIL</text>
      </>
    );
    if(n==="Wheel of Fortune") return (
      <>
        <rect width="100%" height="100%" fill="#0d1b4b"/>
        {/* 바퀴 */}
        <circle cx="50%" cy="45%" r="32%" fill="none" stroke={gold} strokeWidth={s(3)}/>
        <circle cx="50%" cy="45%" r="18%" fill="none" stroke={gold} strokeWidth={s(2)}/>
        {[0,45,90,135,180,225,270,315].map((deg,i)=>{
          const rad=deg*Math.PI/180, cx=s(26), cy=s(44);
          return <line key={i} x1={cx+s(9)*Math.cos(rad)} y1={cy+s(9)*Math.sin(rad)}
            x2={cx+s(16)*Math.cos(rad)} y2={cy+s(16)*Math.sin(rad)} stroke={gold} strokeWidth={s(1.5)}/>;
        })}
        {["T","A","R","O"].map((ch,i)=>{
          const angles=[-Math.PI/4,Math.PI/4,3*Math.PI/4,-3*Math.PI/4];
          return <text key={i} x={s(26)+s(20)*Math.cos(angles[i])} y={s(44)+s(20)*Math.sin(angles[i])}
            textAnchor="middle" dominantBaseline="middle" fontSize={s(8)} fill={gold} fontWeight="bold">{ch}</text>;
        })}
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={gold}>X · WHEEL OF FORTUNE</text>
      </>
    );
    if(n==="Justice") return (
      <>
        <rect width="100%" height="100%" fill="#1a1a3e"/>
        {/* 저울 */}
        <line x1="50%" y1={s(15)} x2="50%" y2={s(55)} stroke={gold} strokeWidth={s(2)}/>
        <line x1={s(12)} y1={s(22)} x2={s(40)} y2={s(22)} stroke={gold} strokeWidth={s(2)}/>
        <ellipse cx={s(12)} cy={s(30)} rx={s(8)} ry={s(4)} fill="none" stroke={gold} strokeWidth={s(1.5)}/>
        <ellipse cx={s(40)} cy={s(30)} rx={s(8)} ry={s(4)} fill="none" stroke={gold} strokeWidth={s(1.5)}/>
        {/* 인물 */}
        <circle cx="50%" cy={s(62)} r={s(7)} fill="#FFCC80"/>
        <rect x={s(19)} y={s(69)} width={s(14)} height={s(15)} rx={s(2)} fill="#B71C1C"/>
        {/* 검 */}
        <line x1={s(36)} y1={s(52)} x2={s(42)} y2={s(72)} stroke="#BDBDBD" strokeWidth={s(2)}/>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={gold}>XI · JUSTICE</text>
      </>
    );
    if(n==="The Hanged Man") return (
      <>
        <rect width="100%" height="100%" fill="#0a1628"/>
        {/* T자 나무 */}
        <line x1="50%" y1={s(8)} x2="50%" y2={s(50)} stroke="#8D6E63" strokeWidth={s(4)}/>
        <line x1={s(10)} y1={s(18)} x2={s(42)} y2={s(18)} stroke="#8D6E63" strokeWidth={s(4)}/>
        {/* 매달린 사람 (거꾸로) */}
        <circle cx="50%" cy={s(58)} r={s(8)} fill="#FFCC80"/>
        <line x1="50%" y1={s(50)} x2="50%" y2={s(50)} stroke="#9E9E9E" strokeWidth={s(1.5)}/>
        <rect x={s(19)} y={s(66)} width={s(14)} height={s(16)} rx={s(2)} fill="#1565C0"/>
        {/* 후광 */}
        <circle cx="50%" cy={s(58)} r={s(11)} fill="none" stroke="#FFD700" strokeWidth={s(1.5)} opacity="0.6"/>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill="#E8EAF6">XII · THE HANGED MAN</text>
      </>
    );
    if(n==="Temperance") return (
      <>
        <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3F2FD"/><stop offset="100%" stopColor="#E8F5E9"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#tg)"/>
        {/* 천사 날개 */}
        <ellipse cx={s(12)} cy={s(45)} rx={s(8)} ry={s(18)} fill="#FFF9C4" opacity="0.8"/>
        <ellipse cx={s(40)} cy={s(45)} rx={s(8)} ry={s(18)} fill="#FFF9C4" opacity="0.8"/>
        {/* 천사 */}
        <circle cx="50%" cy={s(30)} r={s(8)} fill="#FFCC80"/>
        <rect x={s(19)} y={s(38)} width={s(14)} height={s(20)} rx={s(2)} fill="#FFFFFF"/>
        {/* 컵 두 개와 물 */}
        <rect x={s(10)} y={s(55)} width={s(8)} height={s(12)} rx={s(1)} fill="#42A5F5"/>
        <rect x={s(34)} y={s(55)} width={s(8)} height={s(12)} rx={s(1)} fill="#42A5F5"/>
        <path d={`M${s(18)},${s(58)} Q${s(26)},${s(50)} ${s(34)},${s(60)}`} stroke="#42A5F5" strokeWidth={s(2)} fill="none"/>
        {/* 삼각형 */}
        <polygon points={`${s(22)},${s(42)} ${s(26)},${s(35)} ${s(30)},${s(42)}`} fill={gold} opacity="0.7"/>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={dark}>XIV · TEMPERANCE</text>
      </>
    );
    if(n==="Judgement") return (
      <>
        <rect width="100%" height="100%" fill="#0d0d2e"/>
        {/* 천사 */}
        <circle cx="50%" cy={s(15)} r={s(7)} fill="#FFCC80"/>
        <ellipse cx={s(16)} cy={s(22)} rx={s(10)} ry={s(6)} fill="#FFF9C4" opacity="0.7"/>
        <ellipse cx={s(36)} cy={s(22)} rx={s(10)} ry={s(6)} fill="#FFF9C4" opacity="0.7"/>
        {/* 나팔 */}
        <line x1={s(28)} y1={s(20)} x2={s(38)} y2={s(30)} stroke={gold} strokeWidth={s(3)}/>
        <ellipse cx={s(40)} cy={s(31)} rx={s(4)} ry={s(2)} fill={gold}/>
        {/* 관에서 일어나는 사람들 */}
        {[10,22,36].map((x,i)=>(
          <g key={i}>
            <rect x={s(x)} y={s(62)} width={s(9)} height={s(14)} rx={s(1)} fill="#E0E0E0"/>
            <circle cx={s(x+4.5)} cy={s(58)} r={s(4)} fill="#FFCC80"/>
          </g>
        ))}
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={cream}>XX · JUDGEMENT</text>
      </>
    );
    // 기본 메이저 (나머지)
    if(card.kr==="전차") return (
      <>
        <rect width="100%" height="100%" fill="#1a1a3e"/>
        {/* 전차 */}
        <rect x={s(8)} y={s(45)} width={s(36)} height={s(22)} rx={s(2)} fill="#5D4037"/>
        {/* 두 스핑크스 */}
        <circle cx={s(16)} cy={s(55)} r={s(6)} fill="#E0E0E0"/>
        <circle cx={s(36)} cy={s(55)} r={s(6)} fill="#212121"/>
        {/* 기사 */}
        <circle cx="50%" cy={s(32)} r={s(8)} fill="#FFCC80"/>
        <polygon points={`${s(18)},${s(28)} ${s(22)},${s(17)} ${s(30)},${s(28)}`} fill="#42A5F5"/>
        <rect x={s(19)} y={s(40)} width={s(14)} height={s(14)} rx={s(1)} fill="#1565C0"/>
        {/* 별 */}
        <text x="50%" y="15%" textAnchor="middle" fontSize={s(10)} fill="#FFD700">★</text>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={cream}>VII · THE CHARIOT</text>
      </>
    );
    if(card.kr==="힘") return (
      <>
        <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF9C4"/><stop offset="100%" stopColor="#E8F5E9"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#sg)"/>
        <text x="50%" y="15%" textAnchor="middle" fontSize={s(12)} fill={gold}>∞</text>
        {/* 여인 */}
        <circle cx={s(30)} cy={s(35)} r={s(8)} fill="#FFCC80"/>
        <ellipse cx={s(30)} cy={s(50)} rx={s(10)} ry={s(14)} fill="#FFFFFF"/>
        {/* 사자 */}
        <ellipse cx={s(30)} cy={s(65)} rx={s(18)} ry={s(10)} fill="#FF9800"/>
        <circle cx={s(18)} cy={s(60)} r={s(8)} fill="#FF6F00"/>
        <text x={s(14)} y={s(63)} fontSize={s(9)} fill="#E65100">🦁</text>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={dark}>VIII · STRENGTH</text>
      </>
    );

    // ── 마이너 아르카나 ─────────────────────────
    const suitColors = {소드:"#1565C0",완드:"#FF6F00",컵:"#1565C0",펜타클:"#2E7D32"};
    const suitBgs = {소드:"#0d1b4b",완드:"#1a0a00",컵:"#0a1a3e",펜타클:"#0a1a0a"};
    const suitSyms = {소드:"⚔",완드:"🪄",컵:"🏆",펜타클:"⬟"};
    const suit = Object.keys(suitColors).find(s=>card.kr.startsWith(s))||"완드";
    const col = suitColors[suit];
    const bgCol = suitBgs[suit];
    const sym = suitSyms[suit];

    // 코트 카드
    if(card.kr.includes("페이지")||card.kr.includes("나이트")||card.kr.includes("퀸")||card.kr.includes("킹")) {
      const courtEmoji = card.kr.includes("킹")?"👑":card.kr.includes("퀸")?"👸":card.kr.includes("나이트")?"🗡️":"🌱";
      return (
        <>
          <rect width="100%" height="100%" fill={bgCol}/>
          <rect x={s(4)} y={s(4)} width={s(44)} height={s(78)} rx={s(3)} fill="none" stroke={col} strokeWidth={s(1.5)} opacity="0.5"/>
          <text x="50%" y="30%" textAnchor="middle" fontSize={s(22)} dominantBaseline="middle">{courtEmoji}</text>
          <text x="50%" y="55%" textAnchor="middle" fontSize={s(22)} dominantBaseline="middle">{sym}</text>
          <text x="50%" y="80%" textAnchor="middle" fontSize={s(22)} dominantBaseline="middle">{sym}</text>
          <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={col} fontWeight="bold">{card.kr}</text>
        </>
      );
    }

    // 숫자 카드 — pip 배치
    const num = parseInt(card.kr.split(" ")[1])||1;
    return (
      <>
        <rect width="100%" height="100%" fill={bgCol}/>
        <rect x={s(4)} y={s(4)} width={s(44)} height={s(78)} rx={s(3)} fill="none" stroke={col} strokeWidth={s(1.5)} opacity="0.4"/>
        {renderPips(suit, num, col)}
        {/* 숫자 */}
        <text x={s(8)} y={s(13)} fontSize={s(9)} fill={col} fontWeight="bold">{num}</text>
        <text x={s(8)} y={s(20)} fontSize={s(8)} fill={col}>{sym}</text>
        <text x={s(44)} y={s(78)} fontSize={s(9)} fill={col} fontWeight="bold" textAnchor="end">{num}</text>
        <text x="50%" y="92%" textAnchor="middle" fontSize={s(7)} fill={col} fontWeight="bold">{card.kr}</text>
      </>
    );
  };

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}
      style={{borderRadius:8, overflow:"hidden", flexShrink:0,
        transform: isRev?"rotate(180deg)":"none",
        filter: isRev?"hue-rotate(30deg)":"none",
      }}>
      {/* 카드 배경 테두리 */}
      <rect width="100%" height="100%" rx={s(5)} fill="#1a0a2e"/>
      {/* 테두리 장식 */}
      <rect x={s(2)} y={s(2)} width={s(w-4)} height={s(h-4)} rx={s(4)}
        fill="none" stroke="rgba(212,168,75,0.4)" strokeWidth={s(1)}/>
      {/* 아트 */}
      {art()}
    </svg>
  );
}