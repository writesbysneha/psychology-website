exports.handler = async function(event) {

  // Sirf POST requests allow karo
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { question, studentAnswer } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `You are a strict but encouraging Psychology teacher grading a Class 11/12 student's answer.

Question: ${question}

Student's Answer: ${studentAnswer}

Evaluate this answer and respond ONLY in this exact JSON format, nothing else:
{
  "score": <number out of 5>,
  "feedback": "<2-3 sentences of constructive, encouraging feedback>",
  "missedPoints": "<1-2 key points the student missed, or 'None - great job!' if complete>"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    let aiText = data.candidates[0].content.parts[0].text;

    // AI kabhi-kabhi ```json wrap kar deta hai, use hata do
    aiText = aiText.replace(/```json|```/g, "").trim();

    const result = JSON.parse(aiText);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

    } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "DEBUG: " + error.message })
    };
  }
};