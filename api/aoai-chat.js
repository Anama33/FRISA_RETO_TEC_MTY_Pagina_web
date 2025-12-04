export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    if (!endpoint || !apiKey || !deployment) {
      return res.status(500).json({
        error: "Faltan variables de entorno",
      });
    }

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-01`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Eres un asistente industrial de FRISA." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "No response";

    res.status(200).json({ answer: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
