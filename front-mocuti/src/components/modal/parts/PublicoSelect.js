/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
export function buildPublicoOptions(publicos = []) {
  if (!Array.isArray(publicos) || publicos.length === 0) {
    return `<option value="" disabled>Nenhum público cadastrado</option>`;
  }
  return publicos.map(p => `<option value="${String(p).replace(/"/g, "&quot;")}">${String(p)}</option>`).join("");
}

/**
 * attachPublicoBehavior(options)
 * - publicaId: id do select
 * - novoBlockId: id do bloco do input novo
 * - novoInputId: id do input novo
 */
export function attachPublicoBehavior({ publicaId = "ev-publico", novoBlockId = "ev-publico-novo", novoInputId = "ev-publico-novo-input" } = {}) {
  try {
    const publicoSelect = document.getElementById(publicaId);
    const publicoNovoBlock = document.getElementById(novoBlockId);
    const publicoNovoInput = document.getElementById(novoInputId);
    if (!publicoSelect) return;
    publicoSelect.addEventListener("change", (ev) => {
      const v = ev.target.value;
      if (publicoNovoBlock) publicoNovoBlock.style.display = v === "__novo" ? "block" : "none";
      if (v && v !== "__novo") {
        if (publicoNovoInput) publicoNovoInput.value = "";
      }
    });
  } catch (err) {
    console.debug("PublicoSelect.attachPublicoBehavior:", e);
  }
}

