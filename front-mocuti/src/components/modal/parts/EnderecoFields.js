export function buildEnderecosOptions(enderecos = []) {
  if (!Array.isArray(enderecos) || enderecos.length === 0) {
    return `<option value="" disabled>Nenhum endereço cadastrado</option>`;
  }
  return enderecos
    .map((e) => {
      const txt =
        (e.logradouro || "") +
        (e.numero ? ", " + e.numero : "") +
        (e.bairro ? " - " + e.bairro : "") +
        " (" +
        (e.cep || "") +
        ")";
      return `<option value="${e.idEndereco ?? e.id}">${String(txt).replace(/"/g, "&quot;")}</option>`;
    })
    .join("");
}

export function attachEnderecoBehavior({
  enderecoSelectId = "ev-endereco-select",
  novoBlockId = "ev-endereco-novo",
  enderecos = [],
  getAuthHeaders = () => ({})
} = {}) {
  try {
    // Referência não-op para evitar warning de 'no-unused-vars' sem chamar a função.
    void getAuthHeaders;
    const enderecoSelect = document.getElementById(enderecoSelectId);
    const novoBlock = document.getElementById(novoBlockId);
    if (!enderecoSelect || !novoBlock) return;

    enderecoSelect.addEventListener("change", (ev) => {
      const val = ev.target.value;
      novoBlock.style.display = val === "__novo" ? "block" : "none";
      if (val && val !== "__novo") {
        const idNum = Number(val);
        const found = (Array.isArray(enderecos) ? enderecos : []).find((ee) => (ee.idEndereco ?? ee.id) === idNum);
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ""; };
        if (found) {
          set("ev-cep", found.cep || "");
          set("ev-logradouro", found.logradouro || "");
          set("ev-numero", found.numero || "");
          set("ev-complemento", found.complemento || "");
          set("ev-bairro", found.bairro || "");
          set("ev-uf", found.uf || "");
          set("ev-cidade", found.estado || found.localidade || "");
        } else {
          set("ev-cep", "");
          set("ev-logradouro", "");
          set("ev-numero", "");
          set("ev-complemento", "");
          set("ev-bairro", "");
          set("ev-uf", "");
          set("ev-cidade", "");
        }
      }
    });

    const cepInput = document.getElementById("ev-cep");
    if (cepInput) {
      cepInput.addEventListener("blur", async () => {
        const v = (cepInput.value || "").replace(/\D/g, "");
        if (!v) return;
        try {
          const r = await fetch(`https://viacep.com.br/ws/${v}/json/`);
          if (!r.ok) return;
          const data = await r.json();
          if (data && !data.erro) {
            const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ""; };
            set("ev-logradouro", data.logradouro || "");
            set("ev-bairro", data.bairro || "");
            set("ev-uf", data.uf || "");
            set("ev-cidade", data.localidade || "");
          }
        } catch (err) {
          console.debug("EnderecoFields.viacep falhou:", err);
        }
      });
    }
  } catch (err) {
    console.debug("EnderecoFields.attachEnderecoBehavior:", err);
  }
}

