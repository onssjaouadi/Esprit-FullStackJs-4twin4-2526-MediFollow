/**
 * Hugging Face – configuration partagée (token + URLs)
 * Ne pas utiliser api-inference.huggingface.co (décommissionné).
 */

export const HF_ROUTER_V1 = "https://router.huggingface.co/v1";
/** Endpoint legacy-compatible pour modèles pipeline (classification, etc.) */
export const HF_ROUTER_HF_INFERENCE = "https://router.huggingface.co/hf-inference";

export function getHFToken(): string {
  const t = process.env.token || process.env.HF_API_TOKEN;
  if (!t) {
    throw new Error(
      'Ajoute token="hf_..." ou HF_API_TOKEN dans .env puis redémarre le serveur.'
    );
  }
  return t;
}
