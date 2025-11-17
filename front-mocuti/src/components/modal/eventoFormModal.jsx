/* eslint-disable no-unused-vars */
import Swal from "sweetalert2";
import "../../styles/pagina-evento-modal.css";
import { buildPublicoOptions } from "./parts/PublicoSelect";
import { buildEnderecosOptions } from "./parts/EnderecoFields";
import { escapeHtml, formatCep } from "./parts/UtilsModal";
import { attachModalBehavior } from "./parts/ModalBehavior";

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
            headers: {
              Accept: "application/json",
              ...getAuthHeaders(),
            },
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
    // tenta usar safeFetchJson (se fornecido) e, se não der certo, faz fetch direto ao backend
    if (typeof safeFetchJson === "function") {
      try {
        const r = await api.get("/endereco/enderecos-eventos", {
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
        });

        const es = r?.data ?? null;

        if (Array.isArray(es)) enderecos = es;
      } catch (err) {
        console.debug(
          "eventoFormModal: axios enderecos-eventos (abs) falhou:",
          err
        );
      }
    }

    // fallback: fetch direto ao backend (evita roteamento pelo dev server)
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
        console.debug(
          "eventoFormModal: axios direto publico-alvo falhou:",
          err
        );
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
          <div style="display:grid; grid-template-columns: 1fr 260px; gap:12px;">
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
                  <!-- removed immediate 'Salvar Público' button: new público será usado ao salvar o evento -->
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
                <!-- botão de salvar endereço removido: endereço novo será persistido automaticamente ao salvar o evento -->
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
    width: 760,
    focusConfirm: false,
    didOpen: () => {
      try {
        attachModalBehavior({ values, enderecos, getAuthHeaders });
      } catch (err) {
        console.debug("eventoFormModal: attachModalBehavior falhou:", err);
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

      // validar múltiplos campos e montar lista de faltantes
      const missing = [];
      if (!nome) missing.push("Nome");
      if (!dia) missing.push("Data deve ser hoje ou futura");
      if (!descricao || descricao.length < 2 || descricao.length > 1000)
        missing.push("Descrição (2-1000 caracteres)");
      // considerar valor já presente em edição (values) como válido
      if (!(categoriaSelectVal || values.categoriaId))
        missing.push("Deve preencher categoria");
      if (!(statusSelectVal || values.statusId || values.statusEventoId))
        missing.push("Deve preencher status (inicial sempre em aberto)");
      // quantidade de vagas
      if (qtdVaga === null || !Number.isFinite(qtdVaga) || qtdVaga < 1)
        missing.push(
          "Quantidade de vagas deve ser maior que zero e um número positivo."
        );
      // horário: agora exige ambos preenchidos — se ambos vazios também será reportado
      if (!horaInicio && !horaFim) {
        missing.push("Horário (início e fim)");
      } else if ((horaInicio && !horaFim) || (!horaInicio && horaFim)) {
        missing.push("Horário: informe início e fim");
      }
      // público alvo novo: se selecionou "__novo", o input deve ser preenchido
      if (publicoSel === "__novo") {
        const novoPublico = (
          document.getElementById("ev-publico-novo-input")?.value || ""
        ).trim();
        if (!novoPublico) missing.push("Público alvo (novo)");
      }

      // endereço
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

          let rEnd;

          try {
            rEnd = await api.post("/endereco", payloadEndereco, {
              headers,
              validateStatus: () => true, // permite tratar manualmente o erro igual ao fetch
            });
          } catch (err) {
            Swal.showValidationMessage(
              `Falha ao salvar endereço: erro de conexão`
            );
            return false;
          }

          // mesma lógica do fetch .ok → agora rEnd.status 200-299
          if (rEnd.status < 200 || rEnd.status >= 300) {
            let parsed = rEnd.data;
            let friendly = "";

            if (!parsed) {
              friendly = `HTTP ${rEnd.status}`;
            } else if (typeof parsed === "string") {
              friendly = parsed;
            } else if (
              parsed.fieldErrors &&
              Array.isArray(parsed.fieldErrors)
            ) {
              friendly = parsed.fieldErrors
                .map(
                  (fe) =>
                    `${fe.field}: ${
                      fe.defaultMessage || fe.message || JSON.stringify(fe)
                    }`
                )
                .join("; ");
            } else if (parsed.message || parsed.error) {
              friendly = parsed.message || parsed.error;
            } else {
              friendly = JSON.stringify(parsed);
            }

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
        // if user selected "Cadastrar novo público...", use the input value on save
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
          fd.append(
            "dados",
            new Blob([JSON.stringify(payloadEvento)], {
              type: "application/json",
            })
          );
          if (file) fd.append("foto", file);

          const res = await api.post("/eventos/cadastrar", fd, {
            headers: { ...authHeaders },
          });

          if (!res.ok) {
            let body = await res.text().catch(() => "");
            try {
              const j = JSON.parse(body);
              body = j?.message || j?.error || JSON.stringify(j);
            } catch (err) {
              /* ignore parse error */
            }
            Swal.showValidationMessage(
              `Falha ao cadastrar evento: ${body || res.status}`
            );
            throw new Error(body || `Erro ${res.status}`);
          }

          try {
            resultJson = await res.json().catch(() => null);
          } catch (err) {
            resultJson = null;
          }

          if (typeof onSaved === "function") {
            try {
              await onSaved(resultJson);
            } catch (err) {
              console.debug("eventoFormModal: onSaved falhou:", err);
            }
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
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            validateStatus: () => true, // deixa você tratar o erro como antes
          }
        );

        if (!resDados.ok) {
          let respText = await resDados.text().catch(() => "");
          let parsed = respText;
          try {
            const j = JSON.parse(respText);
            parsed = j;
          } catch (err) {
            /* ignore parse error */
          }
          console.error("eventoFormModal: PUT /eventos response not ok", {
            status: resDados.status,
            statusText: resDados.statusText,
            body: parsed,
            headers: Array.from(resDados.headers.entries()),
          });
          Swal.showValidationMessage(
            `Falha ao salvar dados: ${
              typeof parsed === "string"
                ? parsed
                : JSON.stringify(parsed) || resDados.status
            }`
          );
          throw new Error(
            typeof parsed === "string"
              ? parsed
              : JSON.stringify(parsed) || `Erro ${resDados.status}`
          );
        }

        try {
          resultSaved = await resDados.json().catch(() => null);
        } catch (err) {
          resultSaved = null;
        }

        if (file) {
          const fd = new FormData();
          fd.append("foto", file);
          const resFoto = await api.patch(
            `/eventos/foto/${encodeURIComponent(idEvento)}`,
            fd,
            {
              headers: {
                ...authHeaders,
              },
              validateStatus: () => true,
            }
          );

          if (!resFoto.ok) {
            let body = await resFoto.text().catch(() => "");
            try {
              const j = JSON.parse(body);
              body = j?.message || j?.error || JSON.stringify(j);
            } catch (err) {
              /* ignore parse error */
            }
            Swal.showValidationMessage(
              `Falha ao enviar foto: ${body || resFoto.status}`
            );
            throw new Error(body || `Erro ao enviar foto: ${resFoto.status}`);
          }

          try {
            const fotoJson = await resFoto.json().catch(() => null);
            resultSaved = { ...(resultSaved || {}), foto: fotoJson };
          } catch (err) {
            console.debug("eventoFormModal: parse fotoJson falhou:", err);
          }
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
