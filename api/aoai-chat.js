export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
    }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    if (!endpoint || !apiKey || !deployment) {
      return res.status(500).json({
        error: "Faltan variables de entorno AZURE_OPENAI_*",
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
          {
            role: "system",
            content: "Eres un asistente industrial experto en FRISA que explica defectos de manufactura."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    const answer =
      data?.choices?.[0]?.message?.content ||
      "No hubo respuesta del modelo";

    res.status(200).json({ answer });

  } catch (err) {
    console.error("ERROR Azure:", err);
    res.status(500).json({ error: err.message });
  }
}
