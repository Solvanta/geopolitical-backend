const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { OpenAI } = require("openai");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/strategy", async (req, res) => {
  const { country } = req.body;

  try {
    const prompt = `Give a geopolitical strategy summary for ${country} as if it were a piece in a global chess game. Include its role, goals, recent moves, and predicted strategy.`;

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiResponse = chatCompletion.choices[0].message.content;
    res.json({ summary: aiResponse });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "AI request failed." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
