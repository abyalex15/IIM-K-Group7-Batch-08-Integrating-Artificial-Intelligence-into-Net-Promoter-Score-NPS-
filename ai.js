const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeFeedback(feedbackText) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Analyze the following patient feedback for a hospital.
    Feedback: "${feedbackText}"
    
    Provide the response in the following strict JSON format:
    {
      "sentiment_score": (integer 0-10, where 0-6 is Detractor, 7-8 is Passive, 9-10 is Promoter based on NPS logic),
      "nps_category": (string: "Promoter", "Passive", or "Detractor"),
      "actionable_insight": (string: 1 short sentence summarizing what the hospital can do to improve based on this feedback)
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response format if there's markdown wrappers
    let jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error analyzing feedback with Gemini:', error);
    // Fallback if AI fails
    return {
      sentiment_score: 5,
      nps_category: 'Passive',
      actionable_insight: 'Could not process AI insight. Needs manual review.'
    };
  }
}

async function analyzeAudioFeedback(audioBufferBase64, mimeType = 'audio/ogg') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Analyze the following audio patient feedback for a hospital.
    
    Provide the response in the following strict JSON format:
    {
      "feedback_text": (string: exact transcription of the audio),
      "sentiment_score": (integer 0-10, where 0-6 is Detractor, 7-8 is Passive, 9-10 is Promoter based on NPS logic),
      "nps_category": (string: "Promoter", "Passive", or "Detractor"),
      "actionable_insight": (string: 1 short sentence summarizing what the hospital can do to improve based on this feedback)
    }`;

    const audioPart = {
      inlineData: {
        data: audioBufferBase64,
        mimeType
      }
    };

    const result = await model.generateContent([prompt, audioPart]);
    const responseText = result.response.text();
    
    let jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error analyzing audio feedback with Gemini:', error);
    return {
      feedback_text: "Audio transcribed as unintelligible.",
      sentiment_score: 5,
      nps_category: 'Passive',
      actionable_insight: 'Could not process AI insight. Needs manual review.'
    };
  }
}

module.exports = { analyzeFeedback, analyzeAudioFeedback };
