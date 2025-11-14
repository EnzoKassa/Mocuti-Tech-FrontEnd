/* eslint-disable no-unused-vars */
import Swal from "sweetalert2";
import "../../styles/pagina-evento-modal.css";
import { buildPublicoOptions } from "./parts/PublicoSelect";
import { buildEnderecosOptions } from "./parts/EnderecoFields";
import { escapeHtml, formatCep } from "./parts/UtilsModal";
import { attachModalBehavior } from "./parts/ModalBehavior";
import api from "../../api/api";

export async function openEventoFormModal(
  evento = null,
  {
    categorias = [],
    statusList = [],
    getAuthHeaders = () => ({}),
    onSaved = null,
    enderecos = [],
  } = {}
) {
  const isEdit = !!evento;
  const values = {
    nome: evento?.nomeEvento || evento?.nome || "",
    descricao: evento?.descricao || evento?.descricaoEvento || "",
    publico: evento?.publico || evento?.publicoAlvo || "",
    categoriaId: evento?.categoria?.idCategoria ?? evento?.categoria?.id ?? "",
    statusId: evento?.statusEvento?.idStatusEvento ?? evento?.statusEvento?.id ?? "",
    dia: evento?.data_evento || evento?.dia || "",
    horaInicio: evento?.hora_inicio || evento?.horaInicio || "",
    horaFim: evento?.hora_fim || evento?.horaFim || "",
    qtdVaga: evento?.qtdVaga ?? evento?.qtd_vaga ?? "",
    isAberto: evento?.isAberto ?? true,
    enderecoId: evento?.endereco?.idEndereco ?? evento?.enderecoId ?? evento?.endereco?.id ?? "",
  };

  // 🔹 Buscar listas se necessário
  const fetchList = async (endpoint, setter) => {
    try {
      const { data } = await api.get(endpoint);
      if (Array.isArray(data)) setter(data);
    } catch (err) {
      console.debug(`Erro ao buscar ${endpoint}:`, err);
    }
  };

  if (!categorias?.length) await fetchList("/categorias", (d) => (categorias = d));
  if (!statusList?.length) await fetchList("/status-eventos", (d) => (statusList = d));
  if (!enderecos?.length) await fetchList("/endereco/enderecos-eventos", (d) => (enderecos = d));

  let publicos = [];
  await fetchList("/eventos/publico-alvo", (d) => (publicos = d));

  const categoriaOptions = categorias
    .map((c) => `<option value="${c.idCategoria ?? c.id}">${escapeHtml(c.nome ?? "")}</option>`)
    .join("");
  const statusOptions = statusList
    .map((s) => `<option value="${s.idStatusEvento ?? s.id}">${escapeHtml(s.situacao ?? s.nome ?? "")}</option>`)
    .join("");
  const enderecosOptions = buildEnderecosOptions(enderecos);
  const publicoOptions = buildPublicoOptions(publicos);

  const html = `
    <div class="pagina-evento-modal">
      <div class="pagina-evento-conteudo" style="font-family:inherit; text-align:left; font-size:13px; color:#333;">
        <div style="max-height:520px; overflow:auto; padding:8px;">
          <div style="display:grid; grid-template-columns: 1fr 260px; gap:12px;">
            <div>
              <label>Nome</label>
              <input id="ev-nome" value="${escapeHtml(values.nome)}" class="campo-entrada" style="width:100%;" />
              <label>Público alvo</label>
              <select id="ev-publico" class="campo-selecao" style="width:100%;">
                <option value="" disabled selected hidden>Selecione</option>
                ${publicoOptions}
                <option value="__novo">Cadastrar novo público...</option>
              </select>
              <div id="ev-publico-novo" style="display:none; margin-top:6px;">
                <input id="ev-publico-novo-input" placeholder="Novo público (ex: Jovens)" class="campo-entrada" />
              </div>
              <label>Descrição</label>
              <textarea id="ev-desc" class="campo-textarea" style="width:100%;">${escapeHtml(values.descricao)}</textarea>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <input id="ev-dia" type="date" value="${values.dia || ""}" class="campo-entrada" />
                <input id="ev-qtd" type="number" value="${escapeHtml(values.qtdVaga)}" class="campo-entrada" placeholder="Qtd vagas" />
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <input id="ev-hora-inicio" type="time" value="${values.horaInicio || ""}" class="campo-entrada" />
                <input id="ev-hora-fim" type="time" value="${values.horaFim || ""}" class="campo-entrada" />
              </div>
              <label>Foto do evento</label>
              <input id="ev-foto" type="file" accept="image/*" class="campo-entrada" />
            </div>
            <div>
              <label>Categoria</label>
              <select id="ev-categoria" class="campo-selecao" style="width:100%;">
                <option value="">Selecione</option>${categoriaOptions}
              </select>
              <label>Status</label>
              <select id="ev-status" class="campo-selecao" style="width:100%;">
                <option value="">Selecione</option>${statusOptions}
              </select>
              <label>Endereço</label>
              <select id="ev-endereco-select" class="campo-selecao" style="width:100%;">
                <option value="" disabled selected hidden>Selecione</option>${enderecosOptions}
                <option value="__novo">Cadastrar novo endereço...</option>
              </select>
              <div id="ev-endereco-novo" style="display:none; border:1px solid #eee; padding:8px; border-radius:6px;">
                <input id="ev-cep" placeholder="CEP" class="campo-entrada" />
                <input id="ev-logradouro" placeholder="Logradouro" class="campo-entrada" />
                <input id="ev-numero" placeholder="Número" class="campo-entrada" />
                <input id="ev-complemento" placeholder="Complemento" class="campo-entrada" />
                <input id="ev-bairro" placeholder="Bairro" class="campo-entrada" />
                <input id="ev-uf" placeholder="UF" class="campo-entrada" />
                <input id="ev-cidade" placeholder="Cidade" class="campo-entrada" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const popup = await Swal.fire({
    title: isEdit ? "Editar Evento" : "Cadastrar novo evento",
    html,
    showCancelButton: true,
    confirmButtonText: isEdit ? "Salvar" : "Cadastrar",
    cancelButtonText: "Fechar",
    width: 760,
    focusConfirm: false,
    didOpen: () => attachModalBehavior({ values, enderecos, getAuthHeaders }),
    preConfirm: async () => {
      const nome = document.getElementById("ev-nome")?.value?.trim();
      const dia = document.getElementById("ev-dia")?.value?.trim();
      const descricao = document.getElementById("ev-desc")?.value?.trim() || "";
      if (!nome || !dia) {
        Swal.showValidationMessage("Nome e data são obrigatórios.");
        return false;
      }

      const enderecoSelectVal = document.getElementById("ev-endereco-select")?.value || "";
      let enderecoId = null;

      // 🔹 Criar endereço novo se necessário
      if (enderecoSelectVal === "__novo") {
        const cep = document.getElementById("ev-cep")?.value?.trim() || "";
        const logradouro = document.getElementById("ev-logradouro")?.value?.trim() || "";
        if (!logradouro || !cep) {
          Swal.showValidationMessage("CEP e Logradouro são obrigatórios.");
          return false;
        }

        const numero = document.getElementById("ev-numero")?.value?.trim() || "";
        const complemento = document.getElementById("ev-complemento")?.value?.trim() || "";
        const bairro = document.getElementById("ev-bairro")?.value?.trim() || "";
        const uf = document.getElementById("ev-uf")?.value?.trim() || "";
        const cidade = document.getElementById("ev-cidade")?.value?.trim() || "";

        const MAP_UF_ESTADO = {
          AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
          CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
          MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
          PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
          RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
          RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
          SE: "Sergipe", TO: "Tocantins"
        };

        const payloadEndereco = {
          cep: formatCep(cep.replace(/\D/g, "")) || null,
          logradouro,
          numero: numero ? Number(numero) : 1,
          complemento: complemento || null,
          bairro: bairro || null,
          uf: uf.toUpperCase() || null,
          cidade: cidade || null,
          estado: MAP_UF_ESTADO[uf.toUpperCase()] || cidade || "",
        };

        try {
          const { data: savedEndereco } = await api.post("/endereco", payloadEndereco);
          enderecoId = savedEndereco?.idEndereco ?? savedEndereco?.id ?? null;
          if (!enderecoId) {
            Swal.showValidationMessage("Endereço salvo, mas id não retornado.");
            return false;
          }
        } catch (error) {
          const msg =
            error.response?.data?.message || error.response?.data?.error || `Erro ${error.response?.status || ""}`;
          Swal.showValidationMessage(`Falha ao salvar endereço: ${msg}`);
          return false;
        }
      } else enderecoId = Number(enderecoSelectVal) || null;

      // 🔹 Monta payload do evento
      const payloadEvento = {
        nomeEvento: nome,
        descricao,
        publicoAlvo:
          document.getElementById("ev-publico")?.value === "__novo"
            ? document.getElementById("ev-publico-novo-input")?.value?.trim() || values.publico || ""
            : document.getElementById("ev-publico")?.value?.trim() || values.publico || "",
        categoriaId: Number(document.getElementById("ev-categoria")?.value || 0) || null,
        statusEventoId: Number(document.getElementById("ev-status")?.value || 0) || null,
        dia,
        horaInicio: document.getElementById("ev-hora-inicio")?.value || null,
        horaFim: document.getElementById("ev-hora-fim")?.value || null,
        qtdVaga: Number(document.getElementById("ev-qtd")?.value || 0),
        isAberto: values.isAberto,
        enderecoId,
      };

      const authHeaders = { ...getAuthHeaders() };
      const file = document.getElementById("ev-foto")?.files?.[0] ?? null;

      try {
        let result = null;

        if (!isEdit) {
          const fd = new FormData();
          fd.append("dados", new Blob([JSON.stringify(payloadEvento)], { type: "application/json" }));
          if (file) fd.append("foto", file);
          const res = await api.post("/eventos/cadastrar", fd, {
            headers: { ...authHeaders, "Content-Type": "multipart/form-data" },
          });
          result = res.data;
        } else {
          const idEvento = evento?.idEvento ?? evento?.id;
          if (!idEvento) throw new Error("ID do evento não encontrado.");

          const res = await api.put(`/eventos/${idEvento}`, payloadEvento, {
            headers: { ...authHeaders, "Content-Type": "application/json" },
          });
          result = res.data;

          if (file) {
            const fd = new FormData();
            fd.append("foto", file);
            await api.patch(`/eventos/foto/${idEvento}`, fd, { headers: authHeaders });
          }
        }

        if (typeof onSaved === "function") await onSaved(result);
        return result ?? true;
      } catch (err) {
        const msg =
          err.response?.data?.message || err.response?.data?.error || `Erro ${err.response?.status || ""}`;
        Swal.showValidationMessage(`Falha ao salvar evento: ${msg}`);
        return false;
      }
    },
  });

  return popup.isConfirmed;
}
