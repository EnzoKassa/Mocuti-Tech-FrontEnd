import Swal from "sweetalert2";

const escapeHtml = (str) => (str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "");

// compact modal: usa max-height com scroll interno e layout em duas colunas melhor aproveitado
export async function openEventoFormModal(evento = null, { categorias = [], statusList = [], getAuthHeaders, safeFetchJson, onSaved, enderecoVinculado = null }) {
  const isEdit = !!evento;
  const enderecoFonte = enderecoVinculado || evento?.endereco || null;
  const values = {
    nome: evento?.nomeEvento || evento?.nome || "",
    descricao: evento?.descricao || evento?.descricaoEvento || "",
    publico: evento?.publico || evento?.publicoAlvo || "",
    categoriaId: evento?.categoria?.idCategoria ?? evento?.categoria?.id ?? "",
    statusId: evento?.statusEvento?.idStatusEvento ?? evento?.statusEvento?.id ?? "",
    dia: evento?.data_evento || evento?.dia || "",
    horaInicio: evento?.hora_inicio || evento?.horaInicio || "",
    horaFim: evento?.hora_fim || evento?.horaFim || "",
    qtdVaga: evento?.qtdVaga || evento?.qtd_vaga || "",
    endereco: {
      idEndereco: enderecoFonte?.idEndereco || enderecoFonte?.id || evento?.enderecoId || null,
      cep: enderecoFonte?.cep || evento?.cep || "",
      logradouro: enderecoFonte?.logradouro || evento?.enderecoLogradouro || "",
      numero: enderecoFonte?.numero ?? evento?.endereco?.numero ?? evento?.numero ?? "",
      complemento: enderecoFonte?.complemento || evento?.endereco?.complemento || evento?.complemento || "",
      uf: enderecoFonte?.uf || evento?.endereco?.uf || evento?.uf || "",
      estado: enderecoFonte?.estado || enderecoFonte?.localidade || evento?.endereco?.estado || evento?.estado || "",
      bairro: enderecoFonte?.bairro || evento?.endereco?.bairro || evento?.bairro || ""
    }
  };

  const categoriaOptions = categorias.map(c => `<option value="${c.idCategoria}" ${String(c.idCategoria) === String(values.categoriaId) ? "selected" : ""}>${escapeHtml(c.nome)}</option>`).join("");
  const statusOptions = statusList.map(s => `<option value="${s.idStatusEvento}" ${String(s.idStatusEvento) === String(values.statusId) ? "selected" : ""}>${escapeHtml(s.situacao)}</option>`).join("");

  const buscarEnderecoPorCEP = async (cepRaw) => {
    const cep = String(cepRaw || "").replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!res.ok) throw new Error("Falha ViaCEP");
      const data = await res.json();
      if (data.erro) { await Swal.fire("CEP não encontrado","Verifique o CEP.","warning"); return; }
      const setIf = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
      setIf("end-cep", data.cep || "");
      setIf("end-logradouro", data.logradouro || "");
      setIf("end-bairro", data.bairro || "");
      setIf("end-uf", data.uf || "");
      setIf("end-estado", data.localidade || "");
    } catch (err) {
      console.error("ViaCEP erro", err);
      await Swal.fire("Erro", "Não foi possível consultar o CEP.", "error");
    }
  };

  const html = `
    <div style="font-family:inherit; text-align:left; font-size:13px; color:#333;">
      <div style="max-height:520px; overflow:auto; padding:8px;">
        <div style="display:grid; grid-template-columns: 1fr 260px; gap:12px; align-items:start;">
          <div>
            <div style="margin-bottom:6px;">
              <label style="font-weight:700; display:block; margin-bottom:6px;">Nome</label>
              <input id="ev-nome" value="${escapeHtml(values.nome)}" class="sw-input" style="width:100%; padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
            </div>

            <div style="margin-bottom:8px;">
              <label style="font-weight:700; display:block; margin-bottom:6px;">Descrição</label>
              <textarea id="ev-desc" class="sw-textarea" style="width:100%; min-height:72px; max-height:160px; padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;">${escapeHtml(values.descricao)}</textarea>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
              <div>
                <label style="font-weight:700; display:block; margin-bottom:6px;">Público alvo</label>
                <input id="ev-publico" value="${escapeHtml(values.publico)}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
              </div>
              <div>
                <label style="font-weight:700; display:block; margin-bottom:6px;">Categoria</label>
                <select id="ev-categoria" class="sw-select" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;">
                  <option value="">Selecione</option>${categoriaOptions}
                </select>
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 110px 110px; gap:8px; margin-bottom:8px;">
              <div>
                <label style="font-weight:700; display:block; margin-bottom:6px;">Data</label>
                <input id="ev-dia" type="date" value="${values.dia || ""}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
              </div>
              <div>
                <label style="font-weight:700; display:block; margin-bottom:6px;">Início</label>
                <input id="ev-hora-inicio" type="time" value="${values.horaInicio || ""}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
              </div>
              <div>
                <label style="font-weight:700; display:block; margin-bottom:6px;">Término</label>
                <input id="ev-hora-fim" type="time" value="${values.horaFim || ""}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
              <div>
                <label style="font-weight:700; display:block; margin-bottom:6px;">Qtd vagas</label>
                <input id="ev-qtd" type="number" value="${escapeHtml(values.qtdVaga)}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
              </div>
              <div>
                <label style="font-weight:700; display:block; margin-bottom:6px;">Status</label>
                <select id="ev-status" class="sw-select" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;">
                  <option value="">Selecione</option>${statusOptions}
                </select>
              </div>
            </div>

            <div style="margin-top:6px; padding-top:8px; border-top:1px dashed #f0f0f0;">
              <div style="font-weight:700; margin-bottom:8px;">Endereço (utilize o CEP para preencher automaticamente)</div>

              <div style="display:grid; grid-template-columns: 1fr 90px; gap:8px; margin-bottom:8px;">
                <input id="end-cep" placeholder="CEP" value="${escapeHtml(values.endereco.cep)}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
                <input id="end-uf" placeholder="UF" value="${escapeHtml(values.endereco.uf)}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
              </div>

              <div style="margin-bottom:8px;">
                <input id="end-logradouro" placeholder="Logradouro" value="${escapeHtml(values.endereco.logradouro)}" class="sw-input" style="width:100%; padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
              </div>

              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
                <input id="end-numero" placeholder="Número" value="${escapeHtml(values.endereco.numero)}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
                <input id="end-bairro" placeholder="Bairro" value="${escapeHtml(values.endereco.bairro)}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
              </div>

              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                <input id="end-estado" placeholder="Cidade" value="${escapeHtml(values.endereco.estado)}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
                <input id="end-complemento" placeholder="Complemento" value="${escapeHtml(values.endereco.complemento)}" class="sw-input" style="padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px;" />
              </div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; align-items:center;">
            <div style="width:220px; height:120px; border-radius:8px; background:#fafafa; border:1px solid #eee; display:flex; align-items:center; justify-content:center; overflow:hidden;">
              ${evento?.imagemUrl ? `<img src="${evento.imagemUrl}" style="max-width:100%; max-height:100%;" alt="Imagem do evento" />` : `<div style="color:#999">Sem imagem</div>`}
            </div>

            <div style="display:flex; gap:8px; justify-content:center; align-items:center;">
              <label for="ev-foto" style="background:#3DA5E1; color:white; padding:6px 10px; border-radius:8px; cursor:pointer; font-weight:700; font-size:13px;">Inserir imagem</label>
              <input id="ev-foto" type="file" accept="image/*" style="display:none" />
            </div>

            <div id="ev-foto-info" style="font-size:12px; color:#666; max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${evento?.imagemUrl ? "Imagem anexada" : ""}
            </div>
            <div style="font-size:11px; color:#888; text-align:center;">Formatos: JPG, PNG. Máx. recomendado 2MB.</div>

            <!-- lista de checkboxes de usuários M2 (substitui select múltiplo) -->
            <div style="width:220px; margin-top:10px;">
              <label style="font-weight:700; display:block; margin-bottom:6px;">Convidar usuários (M2)</label>
              <div id="ev-usuarios-m2-list" style="width:100%; max-height:120px; padding:6px; border-radius:8px; border:1px solid #e6e6e6; font-size:13px; overflow:auto; display:flex; flex-direction:column; gap:6px;">
                <div style="color:#999; font-size:13px;">Carregando...</div>
              </div>
              <div id="ev-usuarios-m2-info" style="font-size:12px; color:#666; margin-top:6px;">Marque as caixas para convidar (pode selecionar vários).</div>
            </div>

            <!-- convites já enviados (só em edição terá conteúdo) -->
            <div style="width:220px; margin-top:10px;">
              <label style="font-weight:700; display:block; margin-bottom:6px;">Convites enviados</label>
              <div id="ev-convidados-list" style="width:100%; max-height:160px; padding:6px; border-radius:8px; border:1px solid #eee; font-size:13px; overflow:auto; color:#666;">
                <div style="color:#999">Nenhum convite enviado</div>
              </div>
              <div style="font-size:12px; color:#666; margin-top:6px;">Lista de convites e status (Aceitou / Recusou / Pendente).</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
let selectedFile = null;

  const popup = await Swal.fire({
    title: isEdit ? "Editar Evento" : "Cadastrar novo evento",
    html,
    showCancelButton: true,
    confirmButtonText: isEdit ? "Salvar alterações" : "Cadastrar",
    cancelButtonText: "Fechar",
    width: 760,
    didOpen: () => {
      const fileInput = document.getElementById("ev-foto");
      const info = document.getElementById("ev-foto-info");
      if (fileInput) {
        fileInput.addEventListener("change", (e) => {
          const f = e.target.files && e.target.files[0];
          selectedFile = f || null;
          info.textContent = f ? `${f.name}` : (evento?.imagemUrl ? "Imagem anexada" : "");
        });
      }

      // carregar lista de usuários M2 para o picklist
      (async () => {
        const sel = document.getElementById("ev-usuarios-m2-list");
        const infoUsers = document.getElementById("ev-usuarios-m2-info");
        if (!sel) return;
        sel.innerHTML = `<div style="color:#999">Carregando...</div>`;
        try {
          const url = "http://localhost:8080/convites/usuarios-m2";
          const headers = (typeof getAuthHeaders === "function") ? (getAuthHeaders() || {}) : {};
          let list;
          if (typeof safeFetchJson === "function") {
            list = await safeFetchJson(url);
          } else {
            const r = await fetch(url, { headers });
            // tratar 204 No Content corretamente
            if (r.status === 204) list = [];
            else list = await r.json().catch(() => []);
          }
          const usuarios = Array.isArray(list) ? list : [];
          if (!usuarios.length) {
            sel.innerHTML = '<div style="color:#999">Nenhum usuário disponível</div>';
            return;
          }
          const preSelected = new Set((evento && Array.isArray(evento.convidados)) ? evento.convidados.map(v => String(v)) : []);
          sel.innerHTML = usuarios.map(u => {
            const id = u.idUsuario ?? u.id ?? "";
            const label = escapeHtml(u.nome || u.nomeCompleto || u.email || "Usuário");
            const email = escapeHtml(u.email || "");
            const checked = preSelected.has(String(id)) ? "checked" : "";
            // importante: adicionar classe usada na coleta
            return `<label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input class="ev-usuario-checkbox" type="checkbox" value="${id}" ${checked} style="width:18px; height:18px; cursor:pointer;" />
              <span style="flex:1; color:#333; font-size:13px;">${label} ${email ? `(${email})` : ""}</span>
            </label>`;
          }).join("");
        } catch (err) {
          sel.innerHTML = '<div style="color:#e74c3c">Erro ao carregar</div>';
          console.error("Erro ao carregar usuarios M2:", err);
          if (infoUsers) infoUsers.textContent = "Falha ao carregar usuários.";
        }

        // carregar convites já enviados (apenas quando editando)
        try {
          const convContainer = document.getElementById("ev-convidados-list");
          if (!convContainer) return;
          const eventId = evento?.idEvento || evento?.id || evento?.id_evento;
          if (!eventId) {
            convContainer.innerHTML = '<div style="color:#999">Nenhum convite enviado</div>';
            return;
          }
          const url = `http://localhost:8080/convites/${encodeURIComponent(eventId)}/convidados`;
          const headers = (typeof getAuthHeaders === "function") ? (getAuthHeaders() || {}) : {};
          let listConv = null;
          try {
            if (typeof safeFetchJson === "function") {
              listConv = await safeFetchJson(url);
            } else {
              const r = await fetch(url, { headers });
              if (r.status === 204 || r.status === 404) { convContainer.innerHTML = '<div style="color:#999">Nenhum convite enviado</div>'; return; }
              if (!r.ok) throw new Error(`HTTP ${r.status}`);
              listConv = await r.json().catch(() => null);
            }
          } catch (err) {
            // trata 404/erros como "nenhum convite" sem poluir o console com stacktrace
            console.debug("convites fetch failed (treated as empty):", err && err.message ? err.message : err);
            convContainer.innerHTML = '<div style="color:#999">Nenhum convite enviado</div>';
            return;
          }

          if (!Array.isArray(listConv) || !listConv.length) {
            convContainer.innerHTML = '<div style="color:#999">Nenhum convite enviado</div>';
            return;
          }

          convContainer.innerHTML = listConv.map(item => {
            const usuario = item["usuario"] ?? item["user"] ?? item["usuarioDto"] ?? null;
            const nome = item["nome"] || (usuario && (usuario.nome || usuario.nomeCompleto)) || item["nomeUsuario"] || item["nomeCompleto"] || item["email"] || "Usuário";
            const email = item["email"] || (usuario && usuario.email) || "";
            let status = item["situacao"] ?? item["status"] ?? item["resposta"] ?? item["aceitou"] ?? item["aceitouConvite"] ?? null;
            if (typeof status === "boolean") status = status ? "Aceitou" : "Recusou";
            else if (status) {
              const s = String(status).toLowerCase();
              if (s.includes("aceit") || s.includes("sim")) status = "Aceitou";
              else if (s.includes("recus") || s.includes("nao") || s.includes("não")) status = "Recusou";
              else status = "Pendente";
            } else status = "Pendente";
            const color = status === "Aceitou" ? "#27ae60" : (status === "Recusou" ? "#e74c3c" : "#999");
            return `<div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #f7f7f7;">
                      <div style="min-width:0">
                        <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(nome)}</div>
                        <div style="font-size:12px;color:#666; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(email)}</div>
                      </div>
                      <div style="font-size:13px;color:${color}; white-space:nowrap; margin-left:6px;">${status}</div>
                    </div>`;
          }).join("");
        } catch (err) {
          console.error("Erro ao carregar convites no modal:", err);
          const convContainer = document.getElementById("ev-convidados-list");
          if (convContainer) convContainer.innerHTML = '<div style="color:#e74c3c">Falha ao carregar convites</div>';
        }
       })();

      // preenche endereço vinculado se houver
      const setIf = (id, val) => { const el = document.getElementById(id); if (el && (el.value === "" || el.value === null)) el.value = val || ""; };
      if (enderecoFonte) {
        setIf("end-cep", enderecoFonte.cep || "");
        setIf("end-logradouro", enderecoFonte.logradouro || "");
        setIf("end-bairro", enderecoFonte.bairro || "");
        setIf("end-uf", enderecoFonte.uf || "");
        setIf("end-estado", enderecoFonte.estado || enderecoFonte.localidade || "");
        setIf("end-numero", enderecoFonte.numero ?? "");
        setIf("end-complemento", enderecoFonte.complemento || "");
      } else {
        const eventoId = evento?.idEvento || evento?.id || evento?.id_evento;
        if (eventoId && safeFetchJson) {
          (async () => {
            try {
              const e = await safeFetchJson(`http://localhost:8080/endereco/evento/${encodeURIComponent(eventoId)}`);
              if (e) {
                setIf("end-cep", e.cep || "");
                setIf("end-logradouro", e.logradouro || "");
                setIf("end-bairro", e.bairro || "");
                setIf("end-uf", e.uf || "");
                setIf("end-estado", e.estado || e.localidade || "");
                setIf("end-numero", e.numero ?? "");
                setIf("end-complemento", e.complemento || "");
              }
            } catch (err) {
              console.error(err);
            }
          })();
        }
      }

      const cepEl = document.getElementById("end-cep");
      if (cepEl) {
        cepEl.addEventListener("blur", async () => { await buscarEnderecoPorCEP(cepEl.value || ""); });
        cepEl.addEventListener("keydown", async (ev) => { if (ev.key === "Enter") { ev.preventDefault(); await buscarEnderecoPorCEP(cepEl.value || ""); } });
      }
    },
    preConfirm: () => {
      // validação e coleta 
      const nome = document.getElementById("ev-nome")?.value?.trim();
      const dia = document.getElementById("ev-dia")?.value || null;
      const descricao = document.getElementById("ev-desc")?.value?.trim() || "";
      // validações mínimas compatíveis com as constraints do backend
      if (!nome || !dia) { Swal.showValidationMessage("Nome e data são obrigatórios."); return false; }
      if (!descricao || descricao.length < 2 || descricao.length > 255) { Swal.showValidationMessage("Descrição deve ter entre 2 e 255 caracteres."); return false; }

      const cepRaw = document.getElementById("end-cep")?.value?.trim() || null;
      const cep = formatCep(cepRaw);

      const logradouro = document.getElementById("end-logradouro")?.value?.trim() || null;
      const numeroRaw = document.getElementById("end-numero")?.value?.trim() || null;
      const numero = numeroRaw ? Number(numeroRaw) : null;
      const complemento = document.getElementById("end-complemento")?.value?.trim() || null;
      const uf = document.getElementById("end-uf")?.value?.trim() || null;
      const estado = document.getElementById("end-estado")?.value?.trim() || null;
      const bairro = document.getElementById("end-bairro")?.value?.trim() || null;

      const enderecoPreenchido = cep && logradouro && numero !== null && uf && estado && bairro;
      if (!enderecoPreenchido && !values.endereco.idEndereco) {
        Swal.showValidationMessage("Preencha o endereço completo (CEP, logradouro, número, UF, cidade e bairro) ou edite um endereço existente.");
        return false;
      }

      // coletar usuários selecionados no picklist
      const checkboxes = Array.from(document.querySelectorAll("#ev-usuarios-m2-list .ev-usuario-checkbox") || []);
      const convidados = checkboxes.filter(cb => cb.checked).map(cb => Number(cb.value)).filter(Boolean);

      return {
        nome: document.getElementById("ev-nome")?.value?.trim(),
        descricao: document.getElementById("ev-desc")?.value?.trim(),
        publico: document.getElementById("ev-publico")?.value?.trim(),
        categoriaId: document.getElementById("ev-categoria")?.value || null,
        statusId: document.getElementById("ev-status")?.value || null,
        dia: document.getElementById("ev-dia")?.value || null,
        horaInicio: document.getElementById("ev-hora-inicio")?.value || null,
        horaFim: document.getElementById("ev-hora-fim")?.value || null,
        qtdVaga: Number(document.getElementById("ev-qtd")?.value || 0),
        endereco: { idEndereco: values.endereco.idEndereco, cep, logradouro, numero, complemento, uf, estado, bairro },
        convidados
      };
    }
  });

  if (popup.isConfirmed && popup.value) {
    // salvar evento + endereço + upload 
    const toTimeWithSeconds = (t) => { if (!t) return null; return t.length === 5 ? `${t}:00` : t; };
    try {
      let enderecoId = popup.value.endereco.idEndereco || values.endereco.idEndereco || null;
      const addr = popup.value.endereco;

      if (!enderecoId && addr && addr.cep) {
        const rEnd = await fetch("http://localhost:8080/endereco", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ cep: formatCep(addr.cep), logradouro: addr.logradouro, numero: addr.numero, complemento: addr.complemento, uf: addr.uf, estado: addr.estado, bairro: addr.bairro })
        });
        if (!rEnd.ok) { const txt = await rEnd.text().catch(() => `Erro ${rEnd.status}`); Swal.fire("Erro", `Falha ao salvar endereço: ${txt}`, "error"); return; }
        const createdEnd = await rEnd.json().catch(() => null);
        enderecoId = createdEnd?.idEndereco || createdEnd?.id;
      } else if (enderecoId && addr && addr.cep) {
        const rUpd = await fetch(`http://localhost:8080/endereco/${encodeURIComponent(enderecoId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ cep: formatCep(addr.cep), logradouro: addr.logradouro, numero: addr.numero, complemento: addr.complemento, uf: addr.uf, estado: addr.estado, bairro: addr.bairro })
        });
        if (!rUpd.ok) { const txt = await rUpd.text().catch(() => `Erro ${rUpd.status}`); Swal.fire("Erro", `Falha ao atualizar endereço: ${txt}`, "error"); return; }
      }

      const body = {
        nomeEvento: popup.value.nome,
        descricao: popup.value.descricao,
        publicoAlvo: popup.value.publico,
        categoriaId: popup.value.categoriaId ? Number(popup.value.categoriaId) : null,
        statusEventoId: popup.value.statusId ? Number(popup.value.statusId) : null,
        dia: popup.value.dia,
        horaInicio: toTimeWithSeconds(popup.value.horaInicio),
        horaFim: toTimeWithSeconds(popup.value.horaFim),
        qtdVaga: popup.value.qtdVaga,
        enderecoId: enderecoId
      };

      const url = isEdit ? `http://localhost:8080/eventos/${encodeURIComponent(evento.idEvento || evento.id || evento.id_evento)}` : `http://localhost:8080/eventos`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", ...getAuthHeaders() }, body: JSON.stringify(body) });

      if (!res.ok) { const t = await res.text().catch(() => `Erro ${res.status}`); Swal.fire("Erro", t, "error"); return; }
      const created = await res.json().catch(() => null);
      const eventId = created?.idEvento || created?.id || (isEdit ? (evento?.idEvento || evento?.id || evento?.id_evento) : null);

      if (selectedFile && eventId) {
        try {
          const form = new FormData();
          form.append("foto", selectedFile);
          const up = await fetch(`http://localhost:8080/eventos/foto/${encodeURIComponent(eventId)}`, {
            method: "PATCH",
            headers: { ...getAuthHeaders() },
            body: form,
            mode: "cors"
          });
          if (!up.ok) { const t = await up.text().catch(() => `Erro ${up.status}`); Swal.fire("Aviso", `Evento salvo, mas upload da imagem falhou: ${t}`, "warning"); }
        } catch (err) {
          console.error("Erro upload imagem:", err);
          Swal.fire("Aviso", "Evento salvo, mas falha ao enviar imagem.", "warning");
        }
      }

      // enviar convites para os usuários selecionados (se houver)
      try {
        const convidados = Array.isArray(popup.value.convidados) ? popup.value.convidados : [];
        if (convidados.length && eventId) {
          let remetente = null;
          const tryKeys = ["idUsuario", "id_usuario", "usuarioId", "id", "userId"];
          for (const k of tryKeys) {
            const raw = localStorage.getItem(k);
            if (!raw) continue;
            try {
              const parsed = JSON.parse(raw);
              remetente = Number(parsed?.id ?? parsed?.idUsuario ?? parsed ?? raw) || null;
            } catch {
              remetente = Number(raw) || null;
            }
            if (remetente) break;
          }
        
          if (!remetente) {
            Swal.fire("Aviso", "Não foi possível identificar o remetente (usuário atual). Convites não enviados.", "warning");
          } else {
            try {
              const urlInvite = `http://localhost:8080/convites/${encodeURIComponent(eventId)}/enviar?idRemetente=${encodeURIComponent(remetente)}`;
              const headersInvite = { "Content-Type": "application/json", ...(typeof getAuthHeaders === "function" ? getAuthHeaders() : {}) };
              const r = await fetch(urlInvite, { method: "POST", headers: headersInvite, body: JSON.stringify(convidados) });
              if (!r.ok) {
                const txt = await r.text().catch(() => null);
                Swal.fire("Aviso", `Falha ao enviar convites: ${txt || r.status}`, "warning");
              } else {
                console.debug("Convites enviados (bulk):", convidados.length);
              }
            } catch (err) {
              console.error("Erro ao enviar convites (bulk):", err);
              Swal.fire("Erro", "Falha ao enviar convites.", "error");
            }
          }
        }
      } catch (err) {
        console.error("Erro ao enviar convites:", err);
      }

      Swal.fire("Sucesso", isEdit ? "Evento atualizado." : "Evento cadastrado.", "success");
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      Swal.fire("Erro", "Falha ao conectar com servidor.", "error");
    }
  }
}

function formatCep(cep) {
  if (!cep) return cep;
  const digits = String(cep).replace(/\D/g, "");
  if (digits.length === 8) return digits.slice(0, 5) + "-" + digits.slice(5);
  return cep;
}