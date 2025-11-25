// utilitário para cores de badges: categorias (paleta estável) e status (paleta separada)
export const CATEGORY_PALETTE = [
  "#4CAF50", // verde
  "#F44336", // vermelho
  "#2196F3", // azul
  "#FFC107", // amarelo
  "#795548", // marrom
];

export const CATEGORY_OVERRIDES = {
  natal: "#F44336", // sempre vermelho para "natal"
  carnaval: "#4CAF50",
  doacao: "#4CAF50",
  palestra: "#4CAF50",
};

export function getCategoryColor(name) {
  if (!name) return "#4CAF50";
  const s = String(name).toLowerCase();
  // overrides por substring
  for (const sub in CATEGORY_OVERRIDES) {
    if (s.includes(sub)) return CATEGORY_OVERRIDES[sub];
  }
  // hash estável -> gera hue (0..359) para cor HSL; mantém saturação/luz constantes
  let hash = 5381;
  for (let i = 0; i < s.length; i++) hash = ((hash << 5) + hash) + s.charCodeAt(i);
  const hue = Math.abs(hash) % 360;
  const saturation = 62; // % (ajustar se quiser mais/menos vívido)
  const lightness = 48;  // %
  // converte HSL para HEX
  const hslToHex = (h, sPct, lPct) => {
    const s = sPct / 100;
    const l = lPct / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  return hslToHex(hue, saturation, lightness);
}

// Paleta exclusiva para status (garante cores diferentes das categorias)
export const STATUS_COLOR_MAP = {
  "Aberto": "#00BCD4",       // ciano
  "Em andamento": "#9C27B0", // roxo
  "Encerrado": "#9E9E9E"     // cinza
};

export function getStatusColor(status) {
  if (!status) return "#9E9E9E";
  const key = String(status).trim();
  if (STATUS_COLOR_MAP[key]) return STATUS_COLOR_MAP[key];
  const normalized = key[0].toUpperCase() + key.slice(1).toLowerCase();
  return STATUS_COLOR_MAP[normalized] || "#9E9E9E";
}