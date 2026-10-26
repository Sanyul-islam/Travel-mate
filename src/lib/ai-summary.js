/**
 * AI Summarizer for Travel Descriptions
 * Generates the mandatory 'wander_brief' field for voyage_log entries.
 */
export async function generateWanderBrief({ name, location, description }) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const prompt = `You are a poetic travel curator. Generate a concise, vivid 1-2 sentence summary (wander brief) of the following travel experience. Do not add quotes or preamble.
Title: ${name}
Location: ${location}
Description: ${description}`;

  // Try OpenRouter if configured
  if (openRouterKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "OrbitTrail Travel Mate",
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "meta-llama/llama-3.2-3b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 120,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const summary = data?.choices?.[0]?.message?.content?.trim();
        if (summary) {
          return summary.replace(/^["']|["']$/g, "");
        }
      } else {
        console.warn("OpenRouter API returned non-OK status:", response.status);
      }
    } catch (err) {
      console.warn("OpenRouter summarization call error:", err.message);
    }
  }

  // Graceful, high-quality fallback heuristic summarizer
  return generateFallbackSummary(name, location, description);
}

function generateFallbackSummary(name, location, description) {
  if (!description || description.trim().length === 0) {
    return `A captivating moment captured at ${location}.`;
  }

  const cleanDesc = description.trim();
  const sentences = cleanDesc
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 1) {
    if (sentences[0].length < 140) {
      return sentences[0];
    }
    return sentences[0].slice(0, 137).trim() + "...";
  }

  // Pick first 2 sentences or first 140 characters
  const brief = sentences.slice(0, 2).join(" ");
  if (brief.length <= 160) {
    return brief;
  }
  return brief.slice(0, 157).trim() + "...";
}
