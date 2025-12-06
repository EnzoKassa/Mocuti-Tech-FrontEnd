import Swal from "sweetalert2";
import api from "../../api/api";

const escapeHtml = (str) =>
  str
    ? String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    : "";
// helper: monta uma string legível a partir do objeto endereco
const formatEnderecoObj = (e) => {
  if (!e || typeof e !== "object") return "";
  const rua = e.logradouro || e.rua || e.endereco || "";
  const numero =
    e.numero !== undefined && e.numero !== null
      ? String(e.numero)
      : e.enderecoNumero
      ? String(e.enderecoNumero)
      : "";
  const bairro = e.bairro || "";
  const parts = [];
  if (rua) parts.push(rua + (numero ? `, ${numero}` : ""));
  if (bairro) parts.push(bairro);
  return parts.filter(Boolean).join(" - ");
};

export async function openGerenciarModal(
  evento,
  { onEdit, onDelete, onLista, navigate, getAuthHeaders } = {}
) {
  const titulo =
    evento.nomeEvento || evento.nome || evento.nome_evento || "Evento";
  let descricao =
    evento.descricao ||
    evento.descricaoEvento ||
    evento.descricao_evento ||
    "Sem descrição.";
  let dataFormat = evento.data_evento || evento.dia || evento.day || "";
  let horaInicio = evento.hora_inicio || evento.horaInicio || "-";
  let horaFim = evento.hora_fim || evento.horaFim || "-";
  let imgUrl = evento.imagemUrl || null;

  const buildLocalString = (ev) => {
    if (!ev) return "";

    const looksLikeJsonString = (v) =>
      typeof v === "string" &&
      v.trim().length &&
      ((v.trim().startsWith("{") && v.trim().endsWith("}")) ||
        (v.trim().startsWith("[") && v.trim().endsWith("]")));
    const tryParse = (v) => {
      if (!looksLikeJsonString(v)) return v;
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    };

    const isAddressObject = (o) =>
      o &&
      typeof o === "object" &&
      (o.logradouro ||
        o.endereco ||
        o.rua ||
        o.bairro ||
        o.numero ||
        o.enderecoLogradouro);

    const findAddress = (node, seen = new Set()) => {
      if (!node || typeof node === "number" || typeof node === "boolean")
        return null;
      if (typeof node === "string") {
        const parsed = tryParse(node);
        if (parsed && parsed !== node) return findAddress(parsed, seen);
        return null;
      }
      if (seen.has(node)) return null;
      seen.add(node);

      if (isAddressObject(node)) return node;
      if (Array.isArray(node)) {
        for (const it of node) {
          const res = findAddress(it, seen);
          if (res) return res;
        }
      } else {
        const candidates = [
          "endereco",
          "enderecoEvento",
          "local",
          "enderecoFormatado",
          "localizacao",
          "localObjeto",
        ];
        // checar campos prováveis primeiro
        for (const key of candidates) {
          if (Object.prototype.hasOwnProperty.call(node, key)) {
            const val = node[key];
            if (isAddressObject(val)) return val;
            if (looksLikeJsonString(val)) {
              const parsed = tryParse(val);
              const res = findAddress(parsed, seen);
              if (res) return res;
            }
          }
        }
        // varredura geral como fallback
        for (const key of Object.keys(node)) {
          const res = findAddress(node[key], seen);
          if (res) return res;
        }
      }
      return null;
    };

    let addr = findAddress(ev);
    if (!addr) {
      const direct =
        ev.endereco ?? ev.enderecoEvento ?? ev.local ?? ev.enderecoFormatado;
      if (typeof direct === "string") {
        const parsed = tryParse(direct);
        if (parsed && typeof parsed === "object") addr = parsed;
      } else if (direct && typeof direct === "object") {
        addr = direct;
      }
    }

    if (addr && typeof addr === "object") {
      const log =
        addr.logradouro ||
        addr.endereco ||
        addr.rua ||
        addr.enderecoLogradouro ||
        "";
      const num =
        addr.numero !== undefined && addr.numero !== null
          ? String(addr.numero)
          : addr.enderecoNumero
          ? String(addr.enderecoNumero)
          : "";
      const bairro = addr.bairro || "";
      const cidade = addr.cidade || addr.localidade || addr.estado || "";
      const uf = addr.uf || "";
      const parts = [];
      if (log) parts.push(log + (num ? `, ${num}` : ""));
      if (bairro) parts.push(bairro);
      if (cidade) parts.push(cidade);
      if (uf) parts.push(uf);
      const formatted = parts.filter(Boolean).join(" - ");
      if (formatted) return formatted;
    }

    // fallback: campos soltos no evento
    const log2 = ev.logradouro || ev.enderecoLogradouro || "";
    const num2 = ev.numero || ev.enderecoNumero || "";
    const bairro2 = ev.bairro || "";
    const parts2 = [];
    if (log2) parts2.push(log2 + (num2 ? `, ${num2}` : ""));
    if (bairro2) parts2.push(bairro2);
    if (parts2.length) return parts2.join(" - ");

    if (typeof ev.enderecoFormatado === "string" && ev.enderecoFormatado.trim())
      return ev.enderecoFormatado.trim();
    if (typeof ev.local === "string" && ev.local.trim()) return ev.local.trim();

    return "";
  };

  let localComputed = buildLocalString(evento);

  if (!localComputed || !localComputed.trim()) {
    const maybeId =
      evento.endereco?.idEndereco ??
      evento.endereco?.id ??
      evento.fk_endereco_evento ??
      evento.fkEndereco ??
      evento.fk_endereco ??
      evento.id_endereco ??
      evento.enderecoId ??
      evento.idEndereco ??
      null;

    if (maybeId) {
      try {
        const headers =
          typeof getAuthHeaders === "function" ? getAuthHeaders() || {} : {};

        const tryAxios = async (url) => {
          const response = await api.get(url, { headers });
          return response.data || null;
        };

        let fetched = null;
        try {
          fetched = await tryAxios(
            `/api/endereco/${encodeURIComponent(maybeId)}`
          );
        } catch {
          try {
            fetched = await tryAxios(
              `http://localhost:8080/endereco/${encodeURIComponent(maybeId)}`
            );
          } catch (err) {
            console.warn(
              "gerenciarModal: não foi possível buscar endereco por id",
              maybeId,
              err
            );
          }
        }

        if (fetched) {
          // monta string a partir do objeto retornado
          localComputed =
            buildLocalString({ endereco: fetched }) ||
            buildLocalString(fetched) ||
            "";
        }
      } catch (err) {
        console.warn("gerenciarModal: erro ao buscar endereco:", err);
      }
    }
  }

  // preferir enderecoFormatado > local (string) > evento.endereco (obj) > fallback
  const localFromObj =
    evento.endereco && typeof evento.endereco === "object"
      ? formatEnderecoObj(evento.endereco)
      : "";
  const localStr =
    evento.enderecoFormatado ||
    (typeof evento.local === "string" && evento.local.trim()
      ? evento.local.trim()
      : localFromObj || "Local não informado");

  let vagas =
    evento.qtdVaga ??
    evento.qtd_vaga ??
    evento.qtdVagas ??
    "Evento aberto ao público";
  let categoria = evento.categoriaNome || evento.categoria?.nome || "-";
  let status =
    evento.statusSituacao ||
    evento.statusEvento?.situacao ||
    evento.status_evento ||
    "-";
  let publico =
    evento.publico || evento.publicoAlvo || evento.publico_alvo || "Público";

  const imgHtml = imgUrl
    ? `<img src="${imgUrl}" alt="${escapeHtml(titulo)}" class="sw-img" />`
    : `<div class="sw-img sw-noimg">Sem imagem</div>`;

  const html = `
    <div class="sw-modal-compact" style="display:flex; flex-direction:column; gap:18px; position:relative;">
      <div style="display:flex; gap:18px; align-items:flex-start; width:100%;">
        <div class="sw-left" style="flex:1; min-width:260px; min-height:220px; display:flex; flex-direction:column;">
          ${imgHtml}
          <div class="sw-desc" style="flex:1; display:flex; flex-direction:column; justify-content:flex-start;">
            <h4>Descrição</h4>
            <p style="margin-top:6px;">${escapeHtml(descricao)}</p>
          </div>
        </div>

        <div class="sw-right" style="flex:1; min-width:260px; min-height:220px; display:flex; flex-direction:column; justify-content:flex-start;">
          <div style="flex:1;">
            <div class="sw-row"><span class="label">Data:</span><span class="value">${escapeHtml(
              String(dataFormat)
            )}</span></div>
            <div class="sw-row"><span class="label">Hora:</span><span class="value">${escapeHtml(
              String(horaInicio)
            )} - ${escapeHtml(String(horaFim))}</span></div>
            <div class="sw-row" style="align-items:flex-start;">
            <span class="label">Local:</span>
            <span class="value" style="white-space:normal; overflow-wrap:break-word;">${escapeHtml(
              localStr
            )}</span>
            </div>
            <div class="sw-row"><span class="label">Nº de vagas:</span><span class="value">${escapeHtml(
              String(vagas)
            )}</span></div>
            <div class="sw-row"><span class="label">Status:</span><span class="value">${escapeHtml(
              status
            )}</span></div>
            <div class="sw-row"><span class="label">Categoria:</span><span class="value">${escapeHtml(
              categoria
            )}</span></div>
            <div class="sw-row"><span class="label">Público Alvo:</span><span class="value">${escapeHtml(
              publico
            )}</span></div>
          </div>
        </div>
      </div>

      <div style="display:flex; gap:12px; width:100%; justify-content:space-between; box-sizing:border-box;">
        <button id="gerenciar-editar" class="sw-btn sw-btn-confirm" style="flex:1; min-width:140px; max-width:23%; background:#3DA5E1">Editar Evento</button>
        <button id="gerenciar-cancelar" class="sw-btn sw-btn-cancel" style="flex:1; min-width:140px; max-width:23%; background:#e74c3c">Cancelar Evento</button>
        <button id="gerenciar-lista" class="sw-btn" style="flex:1; min-width:140px; max-width:23%; background:#f39c12; color:#fff">Lista de Presença</button>
        <button id="gerenciar-dashboard" class="sw-btn" style="flex:1; min-width:140px; max-width:23%; background:#2ecc71; color:#fff">Dashboard</button>
      </div>
    </div>
  `;

  Swal.fire({
    title: "Gerenciar Evento",
    html,
    width: 780,
    showCloseButton: true,
    showConfirmButton: false,
    customClass: { popup: "my-swal compact-swal" },
    buttonsStyling: false,
    didOpen: () => {
      console.log("gerenciarModal evento:", evento);
      document
        .getElementById("gerenciar-editar")
        ?.addEventListener("click", () => {
          Swal.close();
          if (onEdit) onEdit(evento);
        });
      document
        .getElementById("gerenciar-cancelar")
        ?.addEventListener("click", async () => {
          const confirm = await Swal.fire({
            title: "Confirmação",
            text: "Tem certeza que deseja cancelar o evento?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, cancelar",
            cancelButtonText: "Não",
            confirmButtonColor: "#FFC107",
            cancelButtonColor: "#6c757d",
            reverseButtons: true,
          });
          if (!confirm.isConfirmed) return;

          const id = evento.idEvento ?? evento.id;
          if (!id)
            return Swal.fire({
              title: "Erro",
              text: "ID do evento não disponível.",
              icon: "error",
              confirmButtonColor: "#FF4848",
            });

          // se a página forneceu onDelete, delega
          if (typeof onDelete === "function") {
            try {
              await onDelete(evento);
              Swal.fire({
                title: "Cancelado",
                text: "Evento cancelado com sucesso.",
                icon: "success",
                confirmButtonColor: "#FF4848",
              });

              // eslint-disable-next-line no-undef
            } catch (err) {
              console.error("gerenciarModal: onDelete falhou:", err);
              const msg = err?.response?.data ?? err?.message ?? String(err);
              Swal.fire({
                title: "Erro",
                text:
                  "Falha ao cancelar evento: " +
                  (typeof msg === "string" ? msg : JSON.stringify(msg)),
                icon: "error",
                confirmButtonColor: "#FF4848",
              });
            }
            return;
          }

          // tentativa padrão: DELETE /eventos/{id}
          try {
            const headers =
              typeof getAuthHeaders === "function"
                ? getAuthHeaders() || {}
                : {};
            const res = await api
              .delete(`/eventos/${encodeURIComponent(id)}`, { headers })
              .catch((e) => e);
            if (res && res.status >= 200 && res.status < 300) {
              Swal.fire({
                title: "Cancelado",
                text: "Evento removido com sucesso.",
                icon: "success",
                confirmButtonColor: "#FF4848",
              });
              // eslint-disable-next-line no-undef
              try {
                triggerApiRefresh();
              } catch (e) {
                console.debug("Ignorado:", e);
              }
              return;
            }

            // falha do servidor: mostrar detalhes e oferecer copiar ID
            const srv = res?.response?.data ?? res?.data ?? res;
            console.error("Erro ao deletar evento:", res);
            const text = typeof srv === "string" ? srv : JSON.stringify(srv);
            const action = await Swal.fire({
              title: "Falha ao cancelar",
              html: `<pre style="text-align:left;max-height:220px;overflow:auto">${escapeHtml(
                text
              )}</pre>`,
              icon: "error",
              showCancelButton: true,
              showDenyButton: true,
              confirmButtonText: "Fechar",
              denyButtonText: "Copiar ID",
              cancelButtonText: "Abrir issue/backend",
              confirmButtonColor: "#6c757d",
              denyButtonColor: "#4CAF50",
            });
            if (action.isDenied) {
              try {
                await navigator.clipboard.writeText(String(id));
              } catch (e) {
                console.debug("Ignorado:", e);
              }
              Swal.fire({
                title: "Copiado",
                text: "ID do evento copiado para a área de transferência.",
                icon: "info",
                confirmButtonColor: "#45AA48",
              });
            }
          } catch (err) {
            console.error("gerenciarModal: exceção ao tentar deletar:", err);
            const resp = err?.response?.data ?? err?.message ?? String(err);
            try {
              await navigator.clipboard.writeText(String(id));
            } catch (e) {
              console.debug("Ignorado:", e);
            }
            Swal.fire({
              title: "Erro",
              text:
                "Falha ao cancelar evento. ID copiado para ajudar o suporte. Detalhes: " +
                (typeof resp === "string" ? resp : JSON.stringify(resp)),
              icon: "error",
              confirmButtonColor: "#FF4848",
            });
          }
        });
      document
        .getElementById("gerenciar-lista")
        ?.addEventListener("click", () => {
          Swal.close();
          if (onLista) onLista(evento);
        });
      document
        .getElementById("gerenciar-dashboard")
        ?.addEventListener("click", () => {
          Swal.close();
          if (navigate) navigate(`/app/eventos/${evento.id}/dashboard`);
        });
    },
  });
}
