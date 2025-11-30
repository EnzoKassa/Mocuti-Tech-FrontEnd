/* eslint-disable no-unused-vars */
import Swal from "sweetalert2";
import "../../styles/pagina-evento-modal.css";
import { buildPublicoOptions } from "./parts/PublicoSelect";
import { buildEnderecosOptions } from "./parts/EnderecoFields";
import { escapeHtml, formatCep } from "./parts/UtilsModal";
import { attachModalBehavior } from "./parts/ModalBehavior";
import api from "../../api/api";
import {
  listarUsuariosPorCargo,
  inscreverUsuarioEvento,
  listarConvidadosPorEvento,
  BASE_URL,
  triggerApiRefresh,
} from "../../api/api";


export async function openEventoFormModal(
  evento = null,
  {
    categorias = [],
    statusList = [],
    getAuthHeaders = () => ({}),
    safeFetchJson = null,
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
    statusId:
      evento?.statusEvento?.idStatusEvento ?? evento?.statusEvento?.id ?? "",
    dia: evento?.data_evento || evento?.dia || "",
    horaInicio: evento?.hora_inicio || evento?.horaInicio || "",
    horaFim: evento?.hora_fim || evento?.horaFim || "",
    qtdVaga: evento?.qtdVaga ?? evento?.qtd_vaga ?? "",
    isAberto: evento?.isAberto ?? true,
    enderecoId:
      evento?.endereco?.idEndereco ??
      evento?.enderecoId ??
      evento?.endereco?.id ??
      "",
  };

  let usuariosCargo3 = [];
  let convidadosEvento = [];
  const selecionados = new Set(); // ids selecionados no modal
  const convidadosExistentesSet = new Set();

  // normaliza a lista de convidados para garantir nomeConvidado/email disponíveis
  function tryPaths(obj, paths) {
    for (const p of paths) {
      try {
        const parts = p.split(".");
        let cur = obj;
        for (const k of parts) {
          if (cur == null) { cur = null; break; }
          cur = cur[k];
        }
        if (typeof cur === "string" && cur.trim()) return cur.trim();
      } catch (e) { /* ignore */ }
    }
    return "";
  }

  function normalizeConvidadosList(list) {
    if (!Array.isArray(list)) return [];
    const normalized = list.map((c) => {
      const uid = String(c.idUsuario ?? c.usuarioId ?? c.id ?? (c.usuario && c.usuario.id) ?? "");

      // caminhos possíveis onde o nome pode estar (inclui nomeCompleto)
      const namePaths = [
        "nomeConvidado",
        "nomeCompleto",
        "nomeUsuario",
        "nome",
        "email",
        "usuario.nome",
        "usuario.nomeCompleto",
        "usuario.nomeUsuario",
        "usuario.pessoa.nome",
        "usuario.pessoa.nomeCompleto",
        "convidado.nome",
        "convidado.pessoa.nome",
        "pessoa.nome",
        "pessoa.nomeCompleto"
      ];

      // caminhos possíveis para email/status
      const emailPaths = ["email", "usuario.email", "usuario.login", "convidado.email", "pessoa.email"];
      const statusPaths = ["statusConvite", "statusDescricao", "situacao", "status", "tipoInscricao"];

      const nomeFound = tryPaths(c, namePaths) || "";
      const emailFound = tryPaths(c, emailPaths) || "";
      const statusFound = tryPaths(c, statusPaths) || "";

      const nome = nomeFound || (uid ? `Usuário ${uid}` : "");
      const status = statusFound || String(c.idStatusInscricao ?? "Pendente");

      // preservar outros campos, garantir idUsuario/nomeConvidado/email/statusConvite
      return { ...c, idUsuario: uid, nomeConvidado: nome, email: emailFound || c.email || "", statusConvite: status };
    });
    console.debug("eventoFormModal: convidados normalizados:", normalized);
    return normalized;
  }

  // tenta resolver nome real do usuário por id (usa cache usuariosCargo3 e fallback API)
  async function getNomeUsuarioById(id) {
    if (!id) return "";
    const sid = String(id);
    try {
      const found = (usuariosCargo3 || []).find(u => String(u.idUsuario ?? u.id ?? u.usuarioId ?? "") === sid);
      if (found) return tryPaths(found, ["nomeCompleto","nome","nomeUsuario","nome_completo","email"]) || `Usuário ${sid}`;
    } catch (e) { /* ignore */ }
    try {
      const res = await api.get(`/usuarios/${encodeURIComponent(sid)}`);
      const data = res?.data ?? null;
      if (data) return tryPaths(data, ["nomeCompleto","nome","nomeUsuario","pessoa.nome","pessoa.nomeCompleto","email"]) || `Usuário ${sid}`;
    } catch (e) { /* ignore */ }
    return `Usuário ${sid}`;
  }

  // enriquece lista de convidados preenchendo nomeConvidado quando estiver como "Usuário {id}"
  async function enrichConvidadosWithNames(list) {
    if (!Array.isArray(list) || list.length === 0) return list || [];
    const enriched = await Promise.all(list.map(async (c) => {
      const uid = String(c.idUsuario ?? c.usuarioId ?? c.id ?? "");
      const existingName = tryPaths(c, ["nomeConvidado", "nomeCompleto", "nomeUsuario", "nome", "email"]);
      if (existingName && !existingName.startsWith("Usuário ")) {
        return { ...c, idUsuario: uid, nomeConvidado: existingName };
      }
      const resolved = await getNomeUsuarioById(uid);
      return { ...c, idUsuario: uid, nomeConvidado: resolved };
    }));
    console.debug("eventoFormModal: convidados enriquecidos com nomes:", enriched);
    return enriched;
  }

  // novo: atualiza convidados do backend e re-renderiza a lista no modal
  async function refreshConvidados(eventoId) {
    try {
      if (!eventoId) return;
      const fetched = await listarConvidadosPorEvento(eventoId).catch(() => null);
      const normalized = normalizeConvidadosList(fetched || []);
      convidadosEvento = await enrichConvidadosWithNames(normalized);
      // rebuild simple UI block
      const convidadosContainer = document.getElementById("ev-convidados-list");
      if (!convidadosContainer) return;
      convidadosContainer.innerHTML = (convidadosEvento && convidadosEvento.length)
        ? convidadosEvento.map(c => {
            const uid = c.idUsuario ?? c.usuarioId ?? c.id ?? "";
            const nome = escapeHtml(c.nomeConvidado || tryPaths(c, ["nome","email"]) || (uid ? `Usuário ${uid}` : ""));
            const status = escapeHtml(c.statusConvite ?? c.statusDescricao ?? c.situacao ?? c.status ?? String(c.idStatusInscricao ?? "Pendente"));
            return `<div data-uid="${uid}" style="display:flex; justify-content:space-between; gap:8px; padding:6px 0; border-bottom:1px solid #f6f6f6;">
                      <div><strong>${nome}</strong><div style="font-size:11px;color:#666;">${escapeHtml(c.email||"")}</div></div>
                      <div style="min-width:110px; text-align:right;"><span style="padding:4px 8px; border-radius:6px; background:#f2f2f2;">${status}</span></div>
                    </div>`;
          }).join("")
        : `<div style="padding:8px;color:#666;">Nenhum convidado</div>`;
    } catch (err) {
      console.debug("refreshConvidados falhou:", err);
    }
  }

  try {
    if (!categorias || categorias.length === 0) {
      if (typeof safeFetchJson === "function") {
        try {
          const c = await safeFetchJson("/categorias");
          if (Array.isArray(c)) categorias = c;
        } catch (err) {
          console.debug(
            "eventoFormModal: safeFetchJson categorias (abs) falhou:",
            err
          );
        }
      }

      if (!categorias || categorias.length === 0) {
        try {
          const r = await api.get("/categorias", {
            headers: { Accept: "application/json", ...getAuthHeaders() },
          });
          if (r.status === 200) {
            const data = r.data ?? null;
            if (Array.isArray(data)) categorias = data;
          } else {
            console.debug(
              "eventoFormModal: axios direto categorias respondeu:",
              r.status,
              r.statusText
            );
          }
        } catch (err) {
          console.debug(
            "eventoFormModal: axios direto categorias falhou:",
            err
          );
        }
      }
    }
  } catch (err) {
    console.debug("eventoFormModal: fetch categorias ignorado:", err);
  }
  try {
    if (!statusList || statusList.length === 0) {
      if (typeof safeFetchJson === "function") {
        try {
          const s = await safeFetchJson("/status-eventos");
          if (Array.isArray(s)) statusList = s;
        } catch (err) {
          console.debug(
            "eventoFormModal: safeFetchJson status-eventos (abs) falhou:",
            err
          );
        }
      }
      if (!statusList || statusList.length === 0) {
        try {
          const r = await api.get("/status-eventos", {
            headers: {
              Accept: "application/json",
              ...getAuthHeaders(),
            },
          });

          if (r.status === 200) {
            const data = r.data ?? null;
            if (Array.isArray(data)) statusList = data;
          } else {
            console.debug(
              "eventoFormModal: axios direto status-eventos respondeu:",
              r.status,
              r.statusText
            );
          }
        } catch (err) {
          console.debug(
            "eventoFormModal: axios direto status-eventos falhou:",
            err
          );
        }
      }
    }
  } catch (err) {
    console.debug("eventoFormModal: fetch status-eventos ignorado:", err);
  }
  try {
    if (typeof safeFetchJson === "function") {
      try {
        const es = await safeFetchJson("/endereco/enderecos-eventos");
        if (Array.isArray(es)) enderecos = es;
      } catch (err) {
        console.debug(
          "eventoFormModal: axios enderecos-eventos (abs) falhou:",
          err
        );
      }
    }

    if (!Array.isArray(enderecos) || enderecos.length === 0) {
      try {
        const headers = { Accept: "application/json", ...getAuthHeaders() };
        const r = await api.get("/endereco/enderecos-eventos", { headers });

        if (r.status === 200) {
          const data = r.data ?? null;
          if (Array.isArray(data)) enderecos = data;
        } else {
          console.debug(
            "eventoFormModal: axios direto enderecos respondeu:",
            r.status,
            r.statusText
          );
        }
      } catch (err) {
        console.debug("eventoFormModal: axios direto enderecos falhou:", err);
      }
    }
  } catch (err) {
    console.debug("eventoFormModal: fetch enderecos ignorado:", err);
  }

  let publicos = [];
  try {
    if (typeof safeFetchJson === "function") {
      try {
        const p = await safeFetchJson("/eventos/publico-alvo");
        if (Array.isArray(p)) publicos = p;
      } catch (err) {
        console.debug(
          "eventoFormModal: safeFetchJson publico-alvo (abs) falhou:",
          err
        );
      }
    }
    if (!Array.isArray(publicos) || publicos.length === 0) {
      try {
        const r = await api.get("/eventos/publico-alvo", {
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
        });

        if (r.status === 200) {
          const data = r.data ?? null;
          if (Array.isArray(data)) publicos = data;
        } else {
          console.debug(
            "eventoFormModal: axios direto publico-alvo respondeu:",
            r.status,
            r.statusText
          );
        }
      } catch (err) {
        console.debug("eventoFormModal: fetch publico-alvo falhou:", err);
      }
    }
  } catch (err) {
    console.debug("eventoFormModal: fetch publico-alvo ignorado:", err);
  }

  const categoriaOptions = categorias
    .map(
      (c) =>
        `<option value="${c.idCategoria ?? c.id}">${escapeHtml(
          c.nome ?? ""
        )}</option>`
    )
    .join("");
  const statusOptions = statusList
    .map(
      (s) =>
        `<option value="${s.idStatusEvento ?? s.id}">${escapeHtml(
          s.situacao ?? s.nome ?? ""
        )}</option>`
    )
    .join("");
  const enderecosOptions = buildEnderecosOptions(enderecos);
  const publicoOptions = buildPublicoOptions(publicos);

  const html = `
    <div class="pagina-evento-modal">
      <div class="pagina-evento-conteudo" style="font-family:inherit; text-align:left; font-size:13px; color:#333;">
        <div style="max-height:520px; overflow:auto; padding:8px;">
          <!-- agora com 3 colunas: principal | dados rápidos | lista de usuários/convidados -->
          <div style="display:grid; grid-template-columns: 1fr 320px 400px; gap:12px;">
            <div>
              <div style="margin-bottom:8px;">
                <label style="font-weight:700; display:block; margin-bottom:6px;">Nome</label>
                <input id="ev-nome" value="${escapeHtml(
                  values.nome
                )}" class="campo-entrada" style="width:100%;" />
              </div>

              <div style="margin-bottom:8px;">
                <label style="font-weight:700; display:block; margin-bottom:6px;">Público alvo</label>
                <select id="ev-publico" class="campo-selecao" style="width:100%; padding:8px;">
                  <option value="" disabled selected hidden>Selecione</option>
                  ${publicoOptions}
                  <option value="__novo">Cadastrar novo público...</option>
                </select>
                <div id="ev-publico-novo" style="display:none; margin-top:6px;">
                  <input id="ev-publico-novo-input" placeholder="Novo público (ex: Jovens)" class="campo-entrada" style="width:100%; margin-top:6px;" />
                </div>
              </div>

              <div style="margin-bottom:8px;">
                <label style="font-weight:700; display:block; margin-bottom:6px;">Descrição</label>
                <textarea id="ev-desc" class="campo-textarea" style="width:100%; min-height:72px;">${escapeHtml(
                  values.descricao
                )}</textarea>
              </div>

              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
                <input id="ev-dia" type="date" value="${
                  values.dia || ""
                }" class="campo-entrada" />
                <input id="ev-qtd" type="number" value="${escapeHtml(
                  values.qtdVaga
                )}" class="campo-entrada" placeholder="Qtd vagas" />
              </div>

              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
                <input id="ev-hora-inicio" type="time" value="${
                  values.horaInicio || ""
                }" class="campo-entrada" />
                <input id="ev-hora-fim" type="time" value="${
                  values.horaFim || ""
                }" class="campo-entrada" />
              </div>

              <div style="margin-bottom:8px;">
                <label style="font-weight:700; display:block; margin-bottom:6px;">Foto do evento</label>
                <input id="ev-foto" type="file" accept="image/*" class="campo-entrada" />
                <div id="ev-foto-preview" style="margin-top:8px;"></div>
              </div>
            </div>

            <!-- coluna intermediária: categoria / status / endereço -->
            <div>
              <div style="margin-bottom:8px;">
                <label style="font-weight:700; display:block; margin-bottom:6px;">Categoria</label>
                <select id="ev-categoria" class="campo-selecao" style="width:100%;">
                  <option value="">Selecione</option>
                  ${categoriaOptions}
                </select>
              </div>

              <div style="margin-bottom:8px;">
                <label style="font-weight:700; display:block; margin-bottom:6px;">Status</label>
                <select id="ev-status" class="campo-selecao" style="width:100%;">
                  <option value="">Selecione</option>
                  ${statusOptions}
                </select>
              </div>

              <div style="margin-bottom:8px;">
                <label style="font-weight:700; display:block; margin-bottom:6px;">Endereço</label>
                <select id="ev-endereco-select" class="campo-selecao" style="width:100%; padding:8px;">
                  <option value="" disabled selected hidden>Selecione uma opção</option>
                  ${enderecosOptions}
                  <option value="__novo">Cadastrar novo endereço...</option>
                </select>
              </div>

              <div id="ev-endereco-novo" style="display:none; border:1px solid #eee; padding:8px; border-radius:6px;">
                <input id="ev-cep" placeholder="CEP" class="campo-entrada" style="margin-bottom:6px;" />
                <input id="ev-logradouro" placeholder="Logradouro" class="campo-entrada" style="margin-bottom:6px;" />
                <input id="ev-numero" placeholder="Número" class="campo-entrada" style="margin-bottom:6px;" />
                <input id="ev-complemento" placeholder="Complemento" class="campo-entrada" style="margin-bottom:6px;" />
                <input id="ev-bairro" placeholder="Bairro" class="campo-entrada" style="margin-bottom:6px;" />
                <input id="ev-uf" placeholder="UF" class="campo-entrada" style="margin-bottom:6px;" />
                <input id="ev-cidade" placeholder="Cidade" class="campo-entrada" style="margin-bottom:6px;" />
              </div>
            </div>

            <!-- terceira coluna: mover aqui os blocos de usuários/convidados para mais espaço -->
            <div>
              <div style="margin-top:12px;">
                <label style="font-weight:700; display:block; margin-bottom:6px;">Convidar Mantenedores</label>
                <div id="ev-usuarios-cargo3" style="max-height:320px; overflow:auto; border:1px solid #eee; padding:8px; background:#fff; border-radius:6px;"></div>
                <button id="ev-enviar-convites-btn" type="button" style="margin-top:8px; display:block;">Enviar convites selecionados</button>
              </div>

              <div style="margin-top:12px;">
                <label style="font-weight:700; display:block; margin-bottom:6px;">Convidados do evento</label>
                <div id="ev-convidados-list" style="max-height:420px; overflow:auto; border:1px solid #eee; padding:8px; background:#fff; border-radius:6px;"></div>
              </div>
            </div>
           </div>
         </div>
       </div>
     </div>
   `;

  const popup = await Swal.fire({
    title: isEdit ? "Editar Evento" : "Cadastrar novo evento",
    html,
    showCancelButton: true,
    confirmButtonText: isEdit ? "Salvar" : "Cadastrar",
    cancelButtonText: "Fechar",
    // manter sempre verde para o botão de confirmação (Cadastrar / Salvar)
    confirmButtonColor: "#4CAF50",
    width: "60%",
    focusConfirm: false,
    didOpen: () => {
      try {
        // garantir que os botões fiquem alinhados à direita
        try {
          const actions = document.querySelector(".swal2-actions");
          if (actions) actions.style.justifyContent = "flex-end";
        } catch (errStyle) {
          console.debug("eventoFormModal: não foi possível ajustar alinhamento dos botões:", errStyle);
        }

        attachModalBehavior({ values, enderecos, getAuthHeaders });
      } catch (err) {
        console.debug("eventoFormModal: attachModalBehavior falhou:", err);
      }

      // garantir comportamento correto do select de endereços: pré-selecionar e limpar campos ao escolher "__novo"
      const enderecoSelect = document.getElementById("ev-endereco-select");
      const novoContainer = document.getElementById("ev-endereco-novo");
      const clearNovoFields = () => {
        ["ev-cep","ev-logradouro","ev-numero","ev-complemento","ev-bairro","ev-uf","ev-cidade"].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });
      };
      if (enderecoSelect) {
        // setar valor inicial ao abrir (edição)
        if (values.enderecoId) {
          try { enderecoSelect.value = String(values.enderecoId); } catch (e) { /* ignore */ }
        }
        // inicializar visibilidade
        if (enderecoSelect.value === "__novo") {
          if (novoContainer) novoContainer.style.display = "block";
        } else {
          if (novoContainer) novoContainer.style.display = "none";
        }
        enderecoSelect.addEventListener("change", (ev) => {
          const v = ev.target.value;
          if (v === "__novo") {
            if (novoContainer) novoContainer.style.display = "block";
            clearNovoFields();
          } else {
            if (novoContainer) novoContainer.style.display = "none";
          }
        });
      }

      // carregar usuários cargo=3 e convidados (após abrir modal)
      (async () => {
        try {
          // carregar usuarios cargo 3
          try {
            usuariosCargo3 = await listarUsuariosPorCargo(3);
            if (!Array.isArray(usuariosCargo3)) usuariosCargo3 = [];
          } catch (e) {
            console.debug("eventoFormModal: listarUsuariosPorCargo falhou:", e);
            usuariosCargo3 = [];
          }

          const idEventoExistente =
            evento?.idEvento ?? evento?.id ?? evento?.id_evento;
          if (idEventoExistente) {
            try {
              await refreshConvidados(idEventoExistente);
            } catch (e) {
              console.debug("eventoFormModal: refreshConvidados falhou:", e);
              convidadosEvento = [];
            }
          } else {
            convidadosEvento = [];
          }

          // construir set de convidados existentes para filtro/marcação
          convidadosExistentesSet.clear();
          (convidadosEvento || []).forEach((c) => {
            const uid = String(c.idUsuario ?? c.usuarioId ?? c.id ?? "");
            if (uid) convidadosExistentesSet.add(uid);
          });

          usuariosCargo3 = (usuariosCargo3 || []).filter((u) => {
            const uid = String(u.idUsuario ?? u.id ?? u.usuarioId ?? "");
            return uid && !convidadosExistentesSet.has(uid);
          });

          // popular container de usuarios para convidar
          const usuariosContainer =
            document.getElementById("ev-usuarios-cargo3");
          if (usuariosContainer) {
            usuariosContainer.innerHTML = usuariosCargo3
              .map((u) => {
                const uid = u.idUsuario ?? u.id ?? u.usuarioId ?? "";
                // preferir nomeCompleto retornado pela API
                const rawName =
                  u.nomeCompleto ||
                  u.nome || 
                  u.nomeUsuario || 
                  u.nome_completo || 
                  "";
                const rawEmail = u.email || "";
                const nameToShow = escapeHtml(rawName ? rawName : rawEmail);
                const emailToShow = escapeHtml(rawEmail);
                // mostrar email abaixo apenas quando existir nome diferente do email;
                // se não houver nome, mostrar só o email (uma linha)
                const emailLine =
                  rawName && rawEmail && rawEmail !== rawName
                    ? `<div style="font-size:11px;color:#666;">${emailToShow}</div>`
                    : "";
                return `<div style="display:flex; gap:8px; align-items:center; padding:6px 0;">
                          <input data-uid="${uid}" class="ev-usr-chk" type="checkbox" style="width:16px; height:16px;" />
                          <div style="font-size:13px;"><strong>${nameToShow}</strong>${emailLine}</div>
                        </div>`;
              })
              .join("");
            usuariosContainer.querySelectorAll(".ev-usr-chk").forEach((chk) => {
              chk.addEventListener("change", (ev) => {
                const id = ev.target.getAttribute("data-uid");
                if (!id) return;
                if (ev.target.checked) selecionados.add(String(id));
                else selecionados.delete(String(id));
              });
            });
          }

          // popular container de convidados (mostra pendente/confirmado/cancelado)
          const convidadosContainer =
            document.getElementById("ev-convidados-list");
          if (convidadosContainer) {
            if ((convidadosEvento || []).length === 0) {
              convidadosContainer.innerHTML = `<div style="padding:8px;color:#666;">Nenhum convidado</div>`;
            } else {
              convidadosContainer.innerHTML = convidadosEvento
                .map((c) => {
                  const uid = c.idUsuario ?? c.usuarioId ?? c.id ?? "";
                  // preferir os campos do DTO: nomeConvidado / statusConvite
                  const nome = escapeHtml(
                    c.nomeConvidado ?? c.nomeUsuario ?? c.nome ?? c.email ?? ""
                  );
                  const status = escapeHtml(
                    c.statusConvite ??
                      c.statusDescricao ??
                      c.situacao ??
                      c.status ??
                      String(c.idStatusInscricao ?? "Pendente")
                  );
                  return `<div data-uid="${uid}" style="display:flex; justify-content:space-between; gap:8px; padding:6px 0; border-bottom:1px solid #f6f6f6;">
                          <div><strong>${nome}</strong><div style="font-size:11px;color:#666;">${escapeHtml(
                    c.email || ""
                  )}</div></div>
                          <div style="min-width:110px; text-align:right;"><span style="padding:4px 8px; border-radius:6px; background:#f2f2f2;">${status}</span></div>
                        </div>`;
                })
                .join("");
            }
          }
        } catch (err) {
          console.debug(
            "eventoFormModal: erro ao inicializar lista de convidados/usuarios:",
            err
          );
        }
      })();

      // enviar convites botão
      const btnEnviar = document.getElementById("ev-enviar-convites-btn");
      if (btnEnviar) {
        btnEnviar.addEventListener("click", async () => {
          try {
            const idEventoExistente =
              evento?.idEvento ?? evento?.id ?? evento?.id_evento;
            if (!idEventoExistente) {
              return Swal.fire(
                "Atenção",
                "O evento precisa ser salvo primeiro para enviar convites. Ao salvar você poderá enviar automaticamente os selecionados.",
                "info"
              );
            }
            const ids = Array.from(selecionados)
              .map((x) => Number(x))
              .filter(Boolean);
            if (ids.length === 0)
              return Swal.fire(
                "Atenção",
                "Nenhum usuário selecionado.",
                "warning"
              );
            const confirm = await Swal.fire({
              title: "Enviar convites",
              text: `Enviar convite para ${ids.length} usuários?`,
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Enviar",
            });
            if (!confirm.isConfirmed) return;

            // chamar API para cada id
            await Promise.all(
              ids.map((id) =>
                inscreverUsuarioEvento(idEventoExistente, Number(id), 1)
              )
            );
            Swal.fire("Sucesso", "Convites enviados.", "success");
            triggerApiRefresh();

            // remover convidados enviados da lista de usuários e adicioná-los localmente aos convidados exibidos
            const sentSet = new Set(ids.map(String));
            // pegar info dos usuários enviados (nome/email) a partir do usuariosCargo3 ou, se não existir, manter id apenas
            const sentUsers = (usuariosCargo3 || []).filter((u) =>
              sentSet.has(String(u.idUsuario ?? u.id ?? u.usuarioId ?? ""))
            );

            // atualizar usuariosCargo3 (remover enviados)
            usuariosCargo3 = (usuariosCargo3 || []).filter((u) => {
              const uid = String(u.idUsuario ?? u.id ?? u.usuarioId ?? "");
              return !sentSet.has(uid);
            });

            // atualizar selecionados (remover os enviados)
            ids.forEach((id) => selecionados.delete(String(id)));

            // atualizar UI - usuarios para convidar
            const usuariosContainer =
              document.getElementById("ev-usuarios-cargo3");
            if (usuariosContainer) {
              usuariosContainer.innerHTML = usuariosCargo3
                .map((u) => {
                  const uid = u.idUsuario ?? u.id ?? u.usuarioId ?? "";
                  // preferir nomeCompleto retornado pela API
                  const rawName =
                    u.nomeCompleto ||
                    u.nome ||
                    u.nomeUsuario ||
                    u.nome_completo ||
                    "";
                  const rawEmail = u.email || "";
                  const nameToShow = escapeHtml(rawName ? rawName : rawEmail);
                  const emailToShow = escapeHtml(rawEmail);
                  const emailLine =
                    rawName && rawEmail && rawEmail !== rawName
                      ? `<div style="font-size:11px;color:#666;">${emailToShow}</div>`
                      : "";
                  return `<div style="display:flex; gap:8px; align-items:center; padding:6px 0;">
                          <input data-uid="${uid}" class="ev-usr-chk" type="checkbox" style="width:16px; height:16px;" />
                          <div style="font-size:13px;"><strong>${nameToShow}</strong>${emailLine}</div>
                        </div>`;
                })
                .join("");
              usuariosContainer
                .querySelectorAll(".ev-usr-chk")
                .forEach((chk) => {
                  chk.addEventListener("change", (ev) => {
                    const id = ev.target.getAttribute("data-uid");
                    if (!id) return;
                    if (ev.target.checked) selecionados.add(String(id));
                    else selecionados.delete(String(id));
                  });
                });
            }

            // atualizar convidadosEvento localmente: se endpoint não retornar entries, criar objetos PENDENTES com info conhecida
            const convidadosAtualizados = await listarConvidadosPorEvento(
              idEventoExistente
            );
            if (
              Array.isArray(convidadosAtualizados) &&
              convidadosAtualizados.length > 0
            ) {
              convidadosEvento = normalizeConvidadosList(convidadosAtualizados);
              convidadosEvento = await enrichConvidadosWithNames(convidadosEvento);
            } else {
              // backend não retornou a lista atualizada: acrescentar localmente
              const novos = ids.map((id) => {
                const u = sentUsers.find(
                  (x) =>
                    String(x.idUsuario ?? x.id ?? x.usuarioId) === String(id)
                );
                return {
                  idUsuario: id,
                  nomeConvidado:
                    u?.nome ||
                    u?.nomeUsuario ||
                    u?.nome_completo ||
                    u?.email ||
                    `Usuário ${id}`,
                  email: u?.email || "",
                  idStatusInscricao: 1,
                  statusConvite: "Pendente",
                };
              });
              convidadosEvento = (convidadosEvento || []).concat(novos);
              // enriquecer nomes locais (caso existam em usuariosCargo3)
              convidadosEvento = await enrichConvidadosWithNames(convidadosEvento);
              // re-render após fallback local
              await refreshConvidados(evento?.idEvento ?? idEventoExistente);
            }

            // atualizar UI - convidados list
            const convidadosContainer =
              document.getElementById("ev-convidados-list");
            if (convidadosContainer) {
              convidadosContainer.innerHTML =
                (convidadosEvento || [])
                  .map((c) => {
                    const uid = c.idUsuario ?? c.usuarioId ?? c.id ?? "";
                    // preferir nomeConvidado (DTO) -> nomeUsuario -> nome -> email -> fallback com id
                    const rawName =
                      c.nomeConvidado ??
                      c.nomeUsuario ??
                      c.nome ??
                      c.email ??
                      (uid ? `Usuário ${uid}` : "");
                    const nome = escapeHtml(rawName);
                    const status = escapeHtml(
                      c.statusConvite ??
                        c.statusDescricao ??
                        c.situacao ??
                        c.status ??
                        String(c.idStatusInscricao ?? "Pendente")
                    );
                    return `<div data-uid="${uid}" style="display:flex; justify-content:space-between; gap:8px; padding:6px 0; border-bottom:1px solid #f6f6f6;">
                          <div><strong>${nome}</strong><div style="font-size:11px;color:#666;">${escapeHtml(
                      c.email || ""
                    )}</div></div>
                          <div style="min-width:110px; text-align:right;"><span style="padding:4px 8px; border-radius:6px; background:#f2f2f2;">${status}</span></div>
                        </div>`;
                  })
                  .join("") ||
                `<div style="padding:8px;color:#666;">Nenhum convidado</div>`;
            }
          } catch (err) {
            console.error(
              "eventoFormModal: erro ao enviar convites manual:",
              err
            );
            Swal.fire("Erro", "Falha ao enviar convites.", "error");
          }
        });
      }
    },
    preConfirm: async () => {
      const nome = document.getElementById("ev-nome")?.value?.trim();

      const diaRaw = (document.getElementById("ev-dia")?.value || "").trim();
      const dia = diaRaw || null;
      if (diaRaw) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diaDate = new Date(diaRaw + "T00:00:00");
        if (isNaN(diaDate.getTime()) || diaDate < today) {
          Swal.showValidationMessage(
            "Data inválida: o evento deve ser hoje ou uma data futura."
          );
          return false;
        }
      }

      const descricao = document.getElementById("ev-desc")?.value?.trim() || "";
      const categoriaSelectVal =
        document.getElementById("ev-categoria")?.value || "";
      const statusSelectVal = document.getElementById("ev-status")?.value || "";
      const horaInicio = document.getElementById("ev-hora-inicio")?.value || "";
      const horaFim = document.getElementById("ev-hora-fim")?.value || "";
      const qtdVagaRaw = document.getElementById("ev-qtd")?.value ?? "";
      const qtdVaga = qtdVagaRaw === "" ? null : Number(qtdVagaRaw);
      const enderecoSelectVal =
        document.getElementById("ev-endereco-select")?.value || "";
      const publicoSel = document.getElementById("ev-publico")?.value || "";

      const missing = [];
      if (!nome) missing.push("Nome");
      if (!dia) missing.push("Data deve ser hoje ou futura");
      if (!descricao || descricao.length < 2 || descricao.length > 1000)
        missing.push("Descrição (2-1000 caracteres)");
      if (!(categoriaSelectVal || values.categoriaId))
        missing.push("Deve preencher categoria");
      if (!(statusSelectVal || values.statusId || values.statusEventoId))
        missing.push("Deve preencher status (inicial sempre em aberto)");
      if (qtdVaga === null || !Number.isFinite(qtdVaga) || qtdVaga < 1)
        missing.push(
          "Quantidade de vagas deve ser maior que zero e um número positivo."
        );
      if (!horaInicio && !horaFim) {
        missing.push("Horário (início e fim)");
      } else if ((horaInicio && !horaFim) || (!horaInicio && horaFim)) {
        missing.push("Horário: informe início e fim");
      }
      if (publicoSel === "__novo") {
        const novoPublico = (
          document.getElementById("ev-publico-novo-input")?.value || ""
        ).trim();
        if (!novoPublico) missing.push("Público alvo (novo)");
      }
      if (!enderecoSelectVal && !values.enderecoId) {
        missing.push("Endereço");
      } else if (enderecoSelectVal === "__novo") {
        const cep = document.getElementById("ev-cep")?.value?.trim() || "";
        const logradouro =
          document.getElementById("ev-logradouro")?.value?.trim() || "";
        if (!cep) missing.push("CEP (endereço novo)");
        if (!logradouro) missing.push("Logradouro (endereço novo)");
      }

      if (missing.length > 0) {
        const listHtml = missing.map((m) => `• ${m}`).join("<br/>");
        Swal.showValidationMessage(
          `Preencha os campos obrigatórios:<br/>${listHtml}`
        );
        return false;
      }

      // segue com as validações/fluxo existentes (endereço novo, salvar evento, etc.)
      let enderecoId = null;
      if (enderecoSelectVal === "__novo") {
        const cep = document.getElementById("ev-cep")?.value?.trim() || "";
        const logradouro =
          document.getElementById("ev-logradouro")?.value?.trim() || "";
        const numero =
          document.getElementById("ev-numero")?.value?.trim() || "";
        const complemento =
          document.getElementById("ev-complemento")?.value?.trim() || "";
        const bairro =
          document.getElementById("ev-bairro")?.value?.trim() || "";
        const uf = document.getElementById("ev-uf")?.value?.trim() || "";
        const cidade =
          document.getElementById("ev-cidade")?.value?.trim() || "";

        if (!logradouro || !cep) {
          Swal.showValidationMessage(
            "CEP e Logradouro são obrigatórios para salvar endereço."
          );
          return false;
        }

        try {
          const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          };
          const MAP_UF_ESTADO = {
            AC: "Acre",
            AL: "Alagoas",
            AP: "Amapá",
            AM: "Amazonas",
            BA: "Bahia",
            CE: "Ceará",
            DF: "Distrito Federal",
            ES: "Espírito Santo",
            GO: "Goiás",
            MA: "Maranhão",
            MT: "Mato Grosso",
            MS: "Mato Grosso do Sul",
            MG: "Minas Gerais",
            PA: "Pará",
            PB: "Paraíba",
            PR: "Paraná",
            PE: "Pernambuco",
            PI: "Piauí",
            RJ: "Rio de Janeiro",
            RN: "Rio Grande do Norte",
            RS: "Rio Grande do Sul",
            RO: "Rondônia",
            RR: "Roraima",
            SC: "Santa Catarina",
            SP: "São Paulo",
            SE: "Sergipe",
            TO: "Tocantins",
          };

          const cepDigits = (cep || "").replace(/\D/g, "");
          const cepFormatted = formatCep(cepDigits) || null;
          const ufClean = (uf || "").toUpperCase();
          let numeroNum = numero ? Number(numero) : 1;
          if (!Number.isFinite(numeroNum) || numeroNum < 1) {
            Swal.showValidationMessage(
              "Número do endereço inválido. Informe um número inteiro maior ou igual a 1."
            );
            return false;
          }
          const estadoNome = MAP_UF_ESTADO[ufClean] || cidade || "";

          const payloadEndereco = {
            cep: cepFormatted || null,
            logradouro,
            numero: numeroNum,
            complemento: complemento || null,
            bairro: bairro || null,
            uf: ufClean || null,
            cidade: cidade || null,
            estado: estadoNome || null,
          };

          const rEnd = await api.post("/endereco", payloadEndereco, {
            headers,
          });
          // axios response: considerar qualquer 2xx como sucesso
          if (!rEnd || rEnd.status < 200 || rEnd.status >= 300) {
             const parsed = rEnd.data ?? null;
             let friendly = "";
             if (!parsed) friendly = `HTTP ${rEnd.status}`;
             else if (typeof parsed === "string") friendly = parsed;
             else if (parsed.fieldErrors && Array.isArray(parsed.fieldErrors)) {
               friendly = parsed.fieldErrors
                 .map((fe) => `${fe.field}: ${fe.defaultMessage || fe.message || JSON.stringify(fe)}`)
                 .join("; ");
             } else if (parsed.message || parsed.error) friendly = parsed.message || parsed.error;
             else friendly = JSON.stringify(parsed);
             Swal.showValidationMessage(`Falha ao salvar endereço: ${friendly}`);
             return false;
           }
 
           const savedEndereco = rEnd.data ?? null;
           enderecoId = savedEndereco?.idEndereco ?? savedEndereco?.id ?? null;
           if (!enderecoId) {
             Swal.showValidationMessage(
               "Endereço salvo, mas id não retornado pelo servidor."
             );
             return false;
           }
           try {
             const sel = document.getElementById("ev-endereco-select");
             if (sel) {
               const opt = document.createElement("option");
               opt.value = enderecoId;
               opt.text = `${savedEndereco.logradouro || ""}${
                 savedEndereco.numero ? ", " + savedEndereco.numero : ""
               }${savedEndereco.bairro ? " - " + savedEndereco.bairro : ""} (${
                 savedEndereco.cep || ""
               })`;
               const last = sel.querySelector('option[value="__novo"]');
               if (last) sel.insertBefore(opt, last);
               sel.value = enderecoId;
             }
           } catch (err) {
             console.debug(
               "eventoFormModal: atualizar select ev-endereco-select falhou:",
               err
             );
           }
         } catch (err) {
           Swal.showValidationMessage(
             `Erro ao salvar novo endereço: ${err?.message || err}`
           );
           return false;
         }
       } else if (enderecoSelectVal) {
         const idNum = Number(enderecoSelectVal);
         if (Number.isFinite(idNum) && idNum > 0) {
           const existe = Array.isArray(enderecos)
             ? enderecos.some((e) => (e.idEndereco ?? e.id) === idNum)
             : true;
           if (!existe) {
             Swal.showValidationMessage("Endereço selecionado inválido.");
             return false;
           }
           enderecoId = idNum;
         } else {
           Swal.showValidationMessage("Endereço selecionado inválido.");
           return false;
         }
       } else {
         if (isEdit && values.enderecoId) {
           enderecoId = Number(values.enderecoId) || null;
         } else {
           enderecoId = null;
         }
       }

      const payloadEvento = {
        nomeEvento: nome,
        descricao,
        publicoAlvo: (function () {
          const sel = document.getElementById("ev-publico")?.value;
          if (sel === "__novo") {
            const novo = (
              document.getElementById("ev-publico-novo-input")?.value || ""
            ).trim();
            return novo || values.publico || "";
          }
          return (
            document.getElementById("ev-publico")?.value?.trim() ||
            values.publico ||
            ""
          );
        })(),
        categoriaId: categoriaSelectVal
          ? Number(categoriaSelectVal)
          : values.categoriaId
          ? Number(values.categoriaId)
          : null,
        statusEventoId: statusSelectVal
          ? Number(statusSelectVal)
          : values.statusId
          ? Number(values.statusId)
          : null,
        dia,
        horaInicio,
        horaFim,
        qtdVaga,
        isAberto: values.isAberto,
        enderecoId,
        idEndereco: enderecoId,
      };
      if (enderecoId) {
        payloadEvento.endereco = { idEndereco: Number(enderecoId) };
      }

      try {
        const fileInput = document.getElementById("ev-foto");
        const file = fileInput?.files?.[0] ?? null;
        const authHeaders = { ...getAuthHeaders() };

        let resultJson = null;
        let resultSaved = null;
        if (!isEdit) {
          const fd = new FormData();
        
          // JSON deve ser enviado com application/json
          fd.append(
            "dados",
            new Blob([JSON.stringify(payloadEvento)], {
              type: "application/json",
            })
          );
        
          if (file) fd.append("foto", file);
        
          let res;
          try {
            res = await api.post("/eventos/cadastrar", fd, {
              headers: { 
                ...authHeaders,
                "Content-Type": "multipart/form-data" 
              },
            });
          } catch (err) {
            const msg =
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err.message ||
              "Erro ao cadastrar evento";
        
            Swal.showValidationMessage(`Falha ao cadastrar evento: ${msg}`);
            throw new Error(msg);
          }
        
          const resultJson = res?.data ?? null;
        
          if (typeof onSaved === "function") {
            try {
              await onSaved(resultJson);
            } catch (err) {
              console.debug("eventoFormModal: onSaved falhou:", err);
            }
          }
        
          // enviar convites pós-criação
          try {
            const createdId =
              resultJson?.idEvento ??
              resultJson?.id ??
              resultJson?.id_evento ??
              null;
        
            if (createdId && selecionados.size > 0) {
              const ids = Array.from(selecionados).map(Number);
              await Promise.all(ids.map(id => inscreverUsuarioEvento(createdId, id, 1)));
              triggerApiRefresh();
            }
          } catch (errInvite) {
            console.warn("eventoFormModal: convites pós-criação falharam:", errInvite);
          }
        
          return resultJson ?? true;
        }        

        // EDIÇÃO
        const idEvento = evento?.idEvento ?? evento?.id ?? evento?.id_evento;
        if (!idEvento) {
          Swal.showValidationMessage(
            "ID do evento não disponível para edição."
          );
          return false;
        }

        const payloadForPut = { ...payloadEvento };
        delete payloadForPut.idEndereco;
        delete payloadForPut.endereco;
        if (enderecoId) {
          payloadForPut.enderecoId = Number(enderecoId);
        } else {
          delete payloadForPut.enderecoId;
        }

        console.debug("eventoFormModal: PUT payloadEvento:", payloadForPut);

        const resDados = await api.put(
          `/eventos/${encodeURIComponent(idEvento)}`,
          payloadForPut,
          {
            headers: {
              ...authHeaders,
              type: "multipart/form-data",
              Accept: "application/json",
            },
          }
        );

        if (resDados.status !== 200) {
          const parsed = resDados.data ?? null;
          console.error("eventoFormModal: PUT /eventos response not ok", {
            status: resDados.status,
            statusText: resDados.statusText,
            body: parsed,
            headers: resDados.headers,
          });
          const friendly = typeof parsed === "string" ? parsed : JSON.stringify(parsed) || String(resDados.status);
          Swal.showValidationMessage(`Falha ao salvar dados: ${friendly}`);
          throw new Error(friendly);
        }

        // axios -> data
        resultSaved = resDados.data ?? null;
 
        if (file) {
          const fd = new FormData();
          fd.append("foto", file);
        
          try {
            const resFoto = await api.patch(
              `/eventos/foto/${encodeURIComponent(idEvento)}`,
              fd,
              {
                headers: {
                  ...authHeaders,
                  "Content-Type": "multipart/form-data",
                },
              }
            );
        
            // axios nunca usa .ok — resposta 200/201/204 já é sucesso
            if (!resFoto || resFoto.status < 200 || resFoto.status > 299) {
              const errorMsg =
                resFoto?.data?.message ||
                resFoto?.data?.error ||
                `Erro ao enviar foto: ${resFoto?.status}`;
        
              Swal.showValidationMessage(errorMsg);
              throw new Error(errorMsg);
            }
        
            // Se retornar JSON, salva no result
            resultSaved = { ...(resultSaved || {}), foto: resFoto.data || null };
        
          } catch (error) {
            const message =
              error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.message ||
              "Erro desconhecido ao enviar a foto";
        
            Swal.showValidationMessage(`Falha ao enviar foto: ${message}`);
            throw new Error(message);
          }
        }
        
        // após editar, enviar convites selecionados (somente novos)
        try {
          const ids = Array.from(selecionados)
            .map((x) => Number(x))
            .filter(Boolean);
          const newIds = ids.filter(
            (id) => !convidadosExistentesSet.has(String(id))
          );
          if (idEvento && newIds.length > 0) {
            await Promise.all(
              newIds.map((id) => inscreverUsuarioEvento(idEvento, id, 1))
            );
            triggerApiRefresh();
          }
        } catch (errInvite) {
          console.warn(
            "eventoFormModal: convites pós-edicao falharam:",
            errInvite
          );
        }

        if (typeof onSaved === "function") {
          try {
            await onSaved(resultSaved);
          } catch (err) {
            console.debug("eventoFormModal: onSaved falhou:", err);
          }
        }

        return resultSaved ?? true;
      } catch (err) {
        console.error("Erro ao salvar evento:", err);
        Swal.showValidationMessage(
          "Falha ao salvar evento. Veja console para detalhes."
        );
        return false;
      }
    },
  });

  if (popup.isConfirmed) {
    return true;
  }
  return false;
}
