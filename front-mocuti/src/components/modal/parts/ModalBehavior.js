import { attachPublicoBehavior } from "./PublicoSelect";
import { attachEnderecoBehavior } from "./EnderecoFields";
import axios from 'axios'

/**
 * attachModalBehavior(options)
 * - options: { values, enderecos, getAuthHeaders }
 * Attacha listeners usados dentro do modal (preview foto, publico/endereco behaviors, cep lookup, set defaults)
 */
export function attachModalBehavior({ values = {}, enderecos = [], getAuthHeaders = () => ({}) } = {}) {
  try {
    // set default selects safely
    try {
      if (values.categoriaId) document.getElementById("ev-categoria").value = values.categoriaId;
    } catch (err) {
      console.debug("attachModalBehavior: set categoria default falhou:", err);
    }
    try {
      if (values.statusId) document.getElementById("ev-status").value = values.statusId;
    } catch (err) {
      console.debug("attachModalBehavior: set status default falhou:", err);
    }
    try {
      if (values.enderecoId) {
        const sel = document.getElementById("ev-endereco-select");
        const opt = sel?.querySelector(`option[value="${values.enderecoId}"]`);
        if (opt) sel.value = values.enderecoId;
      }
    } catch (err) {
      console.debug("attachModalBehavior: set endereco default falhou:", err);
    }

    // file preview
    try {
      const fileInput = document.getElementById("ev-foto");
      const preview = document.getElementById("ev-foto-preview");
      if (fileInput && preview) {
        fileInput.addEventListener("change", (ev) => {
          const f = ev.target.files?.[0];
          preview.innerHTML = f ? `<img src="${URL.createObjectURL(f)}" style="width:120px;height:120px;object-fit:cover;border-radius:6px;" />` : "";
        });
      }
    } catch (err) {
      console.debug("attachModalBehavior: file preview error", err);
    }

    // attach modular behaviors
    try {
      attachPublicoBehavior();
    } catch (err) {
      console.debug("attachModalBehavior: attachPublicoBehavior", err);
    }
    try {
      attachEnderecoBehavior({ enderecos, getAuthHeaders });
    } catch (err) {
      console.debug("attachModalBehavior: attachEnderecoBehavior", err);
    }

    // duplicate behavior for selects that need inline prefilling (kept lightweight)
    try {
      const enderecoSelect = document.getElementById("ev-endereco-select");
      const novoBlock = document.getElementById("ev-endereco-novo");
      if (enderecoSelect && novoBlock) {
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

        // cep lookup (kept here as fallback in case attachEnderecoBehavior not bound early)
        const cepInput = document.getElementById("ev-cep");
        if (cepInput) {
          cepInput.addEventListener("blur", async () => {
            const v = (cepInput.value || "").replace(/\D/g, "");
            if (!v) return;
            try {
              const r = await axios.get(`https://viacep.com.br/ws/${v}/json/`);
              if (!r.ok) return;
              const data = await r.data;
              if (data && !data.erro) {
                const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ""; };
                set("ev-logradouro", data.logradouro || "");
                set("ev-bairro", data.bairro || "");
                set("ev-uf", data.uf || "");
                set("ev-cidade", data.localidade || "");
              }
            } catch (err) {
              console.debug("attachModalBehavior.viacep falhou:", err);
            }
          });
        }
      }
    } catch (err) {
      console.debug("attachModalBehavior: endereco inline handlers", err);
    }

    // publico select behavior: ensure show/hide of new input
    try {
      const publicoSelect = document.getElementById("ev-publico");
      const publicoNovoBlock = document.getElementById("ev-publico-novo");
      const publicoNovoInput = document.getElementById("ev-publico-novo-input");
      if (publicoSelect) {
        try { if (values.publico) publicoSelect.value = values.publico; } catch (err) { console.debug("attachModalBehavior: set publico default falhou:", err); }
        publicoSelect.addEventListener("change", (ev) => {
          const v = ev.target.value;
          if (publicoNovoBlock) publicoNovoBlock.style.display = v === "__novo" ? "block" : "none";
          if (v && v !== "__novo" && publicoNovoInput) publicoNovoInput.value = "";
        });
      }
    } catch (err) {
      console.debug("attachModalBehavior: publico inline handlers", err);
    }

  } catch (err) {
    console.debug("attachModalBehavior: general error", err);
  }
}

