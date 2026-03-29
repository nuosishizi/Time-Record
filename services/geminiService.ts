import { GoogleGenAI } from "@google/genai";
import { Task, Tag, AppSettings } from '../types';

const STORAGE_KEY = 'mindflow_settings_v7';

const getSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to parse settings", e);
  }
  return { 
    model: 'gemini-2.5-flash',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

const getClient = () => {
  const settings = getSettings();
  // Use user provided key, or fallback to process.env.API_KEY
  const apiKey = settings.apiKey || process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey });
};

/**
 * Auto-classifies a task title into one of the user's custom tags using AI.
 */
export const classifyTaskWithAI = async (title: string, availableTags: Tag[]): Promise<string> => {
  const ai = getClient();
  const settings = getSettings();
  
  // Fallback if no tags exist
  if (availableTags.length === 0) return "";

  const tagDescriptions = availableTags.map(t => `ID: ${t.id}, Name: ${t.name}, Keywords: ${t.description}`).join('\n');

  const prompt = `
    You are a task classifier.
    Task Title: "${title}"
    
    Available Tags:
    ${tagDescriptions}
    
    Return ONLY the ID of the best matching tag. If unsure, pick the 'Other' or most generic tag ID.
  `;

  try {
    const response = await ai.models.generateContent({
      model: settings.model,
      contents: prompt,
    });
    const text = response.text?.trim();
    // Basic cleanup in case model returns extra text
    const matchedTag = availableTags.find(t => text?.includes(t.id));
    return matchedTag ? matchedTag.id : availableTags[0].id;
  } catch (error) {
    console.error("Gemini Classification Error:", error);
    return availableTags[0]?.id || ""; // Fallback to first tag
  }
};

/**
 * Generates a reminder or encouragement.
 */
export const generateTaskMessage = async (task: Task, context: 'reminder' | 'next-step'): Promise<string> => {
  const ai = getClient();
  const settings = getSettings();
  
  let systemPrompt = "";
  if (context === 'reminder') {
    systemPrompt = `User's task "${task.title}" is due. Write a 1-sentence urgent but polite reminder in Chinese.`;
  } else {
    systemPrompt = `User just finished "${task.title}". Suggest a generic next step or give a short compliment in Chinese. Keep it under 20 words.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: settings.model,
      contents: systemPrompt,
    });
    return response.text?.trim() || (context === 'reminder' ? "该开始任务了！" : "干得好！继续保持。");
  } catch (error) {
    console.error("Gemini Error:", error);
    return context === 'reminder' ? `提醒：${task.title}` : "任务完成！";
  }
};

/**
 * Analyzes efficiency based on tags and duration.
 */
export const analyzeEfficiencyAI = async (
  stats: { tagName: string; durationMinutes: number }[]
): Promise<string> => {
  const ai = getClient();
  const settings = getSettings();
  
  const statsText = stats.map(s => `- ${s.tagName}: ${s.durationMinutes.toFixed(1)} minutes`).join('\n');

  const prompt = `
    Here is the user's time usage by category tag for today/this week:
    ${statsText}
    
    Act as a productivity coach.
    1. Analyze the balance.
    2. Point out if any area is neglected or over-worked.
    3. Give 1 concrete optimization suggestion.
    
    Reply in Chinese, friendly and professional, around 100 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: settings.model,
      contents: prompt,
    });
    return response.text?.trim() || "无法生成分析建议，请稍后再试。";
  } catch (error) {
    return "AI 服务暂时不可用。";
  }
};

/**
 * Analyzes a specific day's timeline.
 */
export const analyzeDailyTimeline = async (dateStr: string, timelineText: string): Promise<string> => {
    const ai = getClient();
    const settings = getSettings();

    const prompt = `
      Current Date: ${dateStr}
      User's Activity Log (Timeline):
      ${timelineText}

      Please analyze this daily log in Chinese.
      Focus on:
      1. Fragmentation (Are tasks switched too often?)
      2. Priority (Did they focus on deep work?)
      3. Suggestions for tomorrow.

      Keep it concise (bullet points), encouraging, and professional.
    `;

    try {
        const response = await ai.models.generateContent({
          model: settings.model,
          contents: prompt,
        });
        return response.text?.trim() || "暂无建议";
    } catch (error) {
        console.error("Gemini Timeline Error", error);
        return "分析服务繁忙，请稍后重试。";
    }
}

/**
 * Analyzes a generated schedule matrix for copied text.
 */
export const analyzeScheduleMatrix = async (matrixText: string): Promise<string> => {
    const ai = getClient();
    const settings = getSettings();

    const prompt = `
      You are a strict, professional time-management coach.
      Here is the user's detailed schedule matrix (Task with durations, and idle times indicated):
      
      ${matrixText}
      
      Tasks:
      1. Analyze the time allocation based on the specific tasks.
      2. Evaluate the total active time versus idle (empty) time. Is the idle time reasonable or excessive?
      3. Identify potential "mo-yu" (slacking off) or wasted time.
      4. Provide a concise, hard-hitting summary and actionable advice to cherish time better.
      
      Format: Use bullet points. Keep it under 200 words. Output in Chinese. Do NOT include greetings, go straight to the points.
    `;

    try {
        const response = await ai.models.generateContent({
          model: settings.model,
          contents: prompt,
        });
        return response.text?.trim() || "暂无分析建议。";
    } catch (error) {
        console.error("Gemini Matrix Error", error);
        return "AI 分析服务繁忙或未配置 API Key，请稍后重试。";
    }
}