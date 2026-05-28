export const ZODIAC_LIST = [
  {sign:"양자리",  emoji:"♈",range:"3/21~4/19", element:"불", quality:"활동"},
  {sign:"황소자리",emoji:"♉",range:"4/20~5/20", element:"흙", quality:"고정"},
  {sign:"쌍둥이자리",emoji:"♊",range:"5/21~6/21",element:"바람",quality:"변통"},
  {sign:"게자리",  emoji:"♋",range:"6/22~7/22", element:"물", quality:"활동"},
  {sign:"사자자리",emoji:"♌",range:"7/23~8/22", element:"불", quality:"고정"},
  {sign:"처녀자리",emoji:"♍",range:"8/23~9/22", element:"흙", quality:"변통"},
  {sign:"천칭자리",emoji:"♎",range:"9/23~10/22",element:"바람",quality:"활동"},
  {sign:"전갈자리",emoji:"♏",range:"10/23~11/21",element:"물",quality:"고정"},
  {sign:"사수자리",emoji:"♐",range:"11/22~12/21",element:"불",quality:"변통"},
  {sign:"염소자리",emoji:"♑",range:"12/22~1/19", element:"흙",quality:"활동"},
  {sign:"물병자리",emoji:"♒",range:"1/20~2/18", element:"바람",quality:"고정"},
  {sign:"물고기자리",emoji:"♓",range:"2/19~3/20",element:"물",quality:"변통"},
];

export const getZodiac = (m, d) => {
  const v = m*100+d;
  if(v>=321&&v<=419) return ZODIAC_LIST[0];
  if(v>=420&&v<=520) return ZODIAC_LIST[1];
  if(v>=521&&v<=621) return ZODIAC_LIST[2];
  if(v>=622&&v<=722) return ZODIAC_LIST[3];
  if(v>=723&&v<=822) return ZODIAC_LIST[4];
  if(v>=823&&v<=922) return ZODIAC_LIST[5];
  if(v>=923&&v<=1022) return ZODIAC_LIST[6];
  if(v>=1023&&v<=1121) return ZODIAC_LIST[7];
  if(v>=1122&&v<=1221) return ZODIAC_LIST[8];
  if(v>=1222||v<=119) return ZODIAC_LIST[9];
  if(v>=120&&v<=218) return ZODIAC_LIST[10];
  return ZODIAC_LIST[11];
};
