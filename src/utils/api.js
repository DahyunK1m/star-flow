const API_SAJU   = "/.netlify/functions/saju";
const API_CLAUDE = "/.netlify/functions/claude";
const API_GPT    = "/.netlify/functions/openai";

/** 사주 계산 + AI 해석 통합 백엔드 호출 */
export const callSaju = async (action, payload) => {
  const res = await fetch(API_SAJU, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
};

/** 일반 AI 호출 (운세챗용)
 *  cheap=true  → GPT-4o mini (홈 운세, 빠르고 저렴)
 *  cheap=false → Claude Sonnet (운세챗, 깊은 맥락)
 */
export const callAI = async (prompt, maxTokens=1200, cheap=false) => {
  const url   = cheap ? API_GPT : API_CLAUDE;
  const model = cheap ? "gpt-4o-mini" : "claude-sonnet-4-20250514";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages:[{role:"user",content:prompt}] }),
  });
  const data = await res.json();
  const txt = data.content[0].text.replace(/```json|```/g,"").trim();
  return JSON.parse(txt);
};

/** 운세챗 메시지 전송 (히스토리 포함, 시스템 프롬프트) */
export const callChat = async (systemCtx, history, maxTokens=800) => {
  const res = await fetch(API_CLAUDE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemCtx,
      messages: history,
    }),
  });
  const data = await res.json();
  return data.content[0].text;
};
