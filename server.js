// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(".")); // sirve index.html y los archivos del modelo

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` // ✅ AQUÍ se usa tu API key del entorno
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    res.json({ reply: data.choices?.[0]?.message?.content || "Sin respuesta" });

  } catch (error) {
    console.error("Error al llamar a OpenAI:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.listen(3000, () => console.log("✅ Servidor en http://localhost:3000"));
