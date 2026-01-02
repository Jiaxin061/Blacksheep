const { GoogleGenAI } = require("@google/genai");

async function listModels() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await ai.models.list();
        console.log('Available Models:');
        response.forEach(m => console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods})`));
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
