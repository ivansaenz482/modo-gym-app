// IA gratuita para APK - 100% gratis sin costo
// Usa Hugging Face Inference gratis (sin key para demo) + fallback offline
// Para producción, el usuario puede poner su HF_TOKEN gratis en .env (https://huggingface.co/settings/tokens - free)

const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.1';
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

export async function askFreeAI(prompt: string, context?: string): Promise<string | null> {
  try {
    // Intenta HF gratis sin token (rate limit bajo) o con token si está en env
    const token = (process.env.EXPO_PUBLIC_HF_TOKEN as string) || '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const body = context ? `${context}\n\nPregunta: ${prompt}` : prompt;
    const res = await fetch(HF_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inputs: body, parameters: { max_new_tokens: 250, temperature: 0.7 } }),
    });
    if (!res.ok) throw new Error(`HF ${res.status}`);
    const data = await res.json();
    const text = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    if (text) {
      // Limpia el prompt del inicio
      return text.replace(body, '').trim().slice(0, 600);
    }
    return null;
  } catch {
    return null; // fallback a offline
  }
}
