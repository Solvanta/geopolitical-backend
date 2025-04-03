require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Node v18+ has fetch globally, no need for node-fetch

// 🌐 Health check for Render
app.get("/", (req, res) => {
  res.send("🌍 Geopolitical Chess Backend is running");
});

// 🔐 Check required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing.");
  process.exit(1);
}
if (!process.env.GNEWS_API_KEY) {
  console.error("❌ GNEWS_API_KEY is missing.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ AI Strategy Route
app.post("/api/strategy", async (req, res) => {
  const { country } = req.body;

  if (!country) {
    return res.status(400).json({ error: "Missing country in request body." });
  }

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
    console.error("❌ OpenAI Error:", error.message);
    res.status(500).json({ error: "AI request failed." });
  }
});

// ✅ News Route via GNews
app.post("/api/news", async (req, res) => {
  const { country } = req.body;

  console.log("🔍 Requested news for:", country);
  console.log("🔑 Using GNEWS_API_KEY:", process.env.GNEWS_API_KEY); // Add this line

  if (!country) {
    return res.status(400).json({ error: "Missing country in request body." });
  }

  try {
    const query = encodeURIComponent(country);
    const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=3&apikey=${process.env.GNEWS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error || !data.articles) {
      console.error("❌ GNews API Error:", data);
      return res.status(500).json({ error: data.error || "Unknown GNews error" });
    }

    res.json({ articles: data.articles });
  } catch (error) {
    console.error("❌ GNews Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to fetch news." });
  }
});


app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
