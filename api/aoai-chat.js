export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { prompt, prediccionJson, imageB64 } = req.body || {};

    const endpoint   = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey     = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    if (!endpoint || !apiKey || !deployment) {
      return res.status(500).json({
        error: 'Faltan variables de entorno AZURE_OPENAI_*',
      });
    }

    const cleanEndpoint = endpoint.replace(/\/+$/, "");

    const messages = [
      {
        role: "system",
        content:
          "Eres un asistente técnico de soporte de FRISA. " +
          "Ayudas a interpretar el estado de piezas de acero a partir de predicciones de un modelo de visión " +
          "y las preguntas del operador. Responde siempre en español, breve pero claro y profesional.",
      },
      {
        role: "user",
        content:
          `Pregunta del operador: ${prompt || "(sin pregunta)"}\n\n` +
          `Predicciones JSON del modelo de visión: ${prediccionJson || "(sin predicción)"}\n` +
          `Imagen recortada en base64: ${imageB64 ? "[incluida]" : "[no incluida]"}\n\n` +
          "Describe brevemente el estado de la pieza (normal/anormal, tipo de defecto, severidad) " +
          "y da recomendaciones de inspección o acción en planta.",
      },
    ];

    const url = `${cleanEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;

    const azureRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        messages,
        temperature: 0.3,
        max_tokens: 400,
      }),
    });

    const data = await azureRes.json().catch(() => null);

    if (!azureRes.ok) {
      console.error("Azure OpenAI error:", azureRes.status, data);
      return res
        .status(azureRes.status)
        .json(data || { error: "Error desde Azure OpenAI" });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "(sin respuesta generada)";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Error interno en /api/aoai-chat" });
  }
}
