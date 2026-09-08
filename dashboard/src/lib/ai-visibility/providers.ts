import Anthropic from "@anthropic-ai/sdk";

// Chaque assistant est optionnel : sans sa clé d'API il est simplement
// ignoré, et il s'active sans changement de code le jour où la clé est
// renseignée. Le nom du modèle est lui aussi surchargeable, pour absorber
// les renommages côté fournisseurs sans redéploiement de code.
export type ProviderId = "claude" | "chatgpt" | "gemini" | "perplexity";

export type Provider = {
  id: ProviderId;
  label: string;
  isConfigured: () => boolean;
  ask: (question: string) => Promise<string>;
};

const ANSWER_SYSTEM =
  "Tu réponds comme un assistant grand public à qui quelqu'un demande une " +
  "recommandation de restaurant. Cite des établissements précis quand tu " +
  "en connais, et n'invente pas d'adresses.";

async function askClaude(question: string): Promise<string> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-opus-5",
    max_tokens: 1500,
    system: ANSWER_SYSTEM,
    messages: [{ role: "user", content: question }],
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

// OpenAI et Perplexity partagent le même format de requête.
async function askOpenAiCompatible({
  url,
  apiKey,
  model,
  question,
}: {
  url: string;
  apiKey: string;
  model: string;
  question: string;
}): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: ANSWER_SYSTEM },
        { role: "user", content: question },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`${url} a répondu ${res.status} : ${await res.text()}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

async function askGemini(question: string): Promise<string> {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-pro";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: ANSWER_SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini a répondu ${res.status} : ${await res.text()}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();
}

export const PROVIDERS: Provider[] = [
  {
    id: "claude",
    label: "Claude",
    isConfigured: () => Boolean(process.env.ANTHROPIC_API_KEY),
    ask: askClaude,
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    isConfigured: () => Boolean(process.env.OPENAI_API_KEY),
    ask: (question) =>
      askOpenAiCompatible({
        url: "https://api.openai.com/v1/chat/completions",
        apiKey: process.env.OPENAI_API_KEY!,
        model: process.env.OPENAI_MODEL ?? "gpt-5",
        question,
      }),
  },
  {
    id: "gemini",
    label: "Gemini",
    isConfigured: () => Boolean(process.env.GEMINI_API_KEY),
    ask: askGemini,
  },
  {
    id: "perplexity",
    label: "Perplexity",
    isConfigured: () => Boolean(process.env.PERPLEXITY_API_KEY),
    ask: (question) =>
      askOpenAiCompatible({
        url: "https://api.perplexity.ai/chat/completions",
        apiKey: process.env.PERPLEXITY_API_KEY!,
        model: process.env.PERPLEXITY_MODEL ?? "sonar",
        question,
      }),
  },
];

export function configuredProviders(): Provider[] {
  return PROVIDERS.filter((provider) => provider.isConfigured());
}
