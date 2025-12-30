
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fallbacks = {
  start: [
    "準備はいいか、マーティ！時速88マイルまで加速するんじゃ！",
    "電線に触れるタイミングがすべてだ！科学的な正確さが必要なんじゃ！",
    "時計台に落雷があるのは22時04分！一秒たりとも遅れてはならんぞ！"
  ],
  success: [
    "1.21ジゴワット！！やったぞマーティ！未来へ帰れるんじゃ！",
    "グレート・スコット！計算通りじゃ！次元転移装置が作動したぞ！",
    "成功じゃ！君の勇気が歴史を、いや、未来を救ったのじゃ！"
  ],
  failure: [
    "重力（ヘヴィ）すぎる…！タイミングがズレてしまったようじゃ。",
    "マーティ！4次元的に考えるんじゃ！もう一度挑戦するしかない！",
    "科学は正確でなければならん！電線への接触に集中するんじゃ！"
  ]
};

const getRandomFallback = (type: 'success' | 'failure' | 'start') => {
  const list = fallbacks[type];
  return list[Math.floor(Math.random() * list.length)];
};

export const getDocBrownAdvice = async (outcome: 'success' | 'failure' | 'start', speed?: number) => {
  try {
    const prompt = outcome === 'start' 
      ? "あなたはバック・トゥ・ザ・フューチャーのドクです。1955年の時計台のシーンで、マーティに時速88マイルで電線に接触するよう指示する熱狂的な1文を日本語で作成してください。"
      : outcome === 'success'
        ? "あなたはドクです。マーティが成功して未来に帰ったことを祝う、日本語の象徴的なセリフ（『1.21ジゴワット！』など）を含む1文を作成してください。"
        : `あなたはドクです。マーティが失敗した（時速${speed}マイルだった、あるいはミスした）ことに対して、科学的で落胆した、しかし励ますような1文を日本語で作成してください。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "あなたは1955年のエメット・ブラウン博士（ドク）です。日本語で回答してください。20単語以内の短い文章で、科学的な用語（次元転移装置、ジゴワットなど）を交えてください。語尾は『〜じゃ！』や『〜なのだ！』といったドクらしい口調にしてください。",
        temperature: 0.8,
      },
    });

    return response.text || getRandomFallback(outcome);
  } catch (error: any) {
    console.warn("Gemini API Error (Rate Limit or other):", error);
    return getRandomFallback(outcome);
  }
};
