import Swal from "sweetalert2";
import api from '../../api/api'


const escapeHtml = (str) => (str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "");

export async function openListaPresencaModal(evento, { getAuthHeaders }) {
  const idEvento = evento?.idEvento || evento?.id || evento?.id_evento;
  if (!idEvento) {
    Swal.fire("Erro", "ID do evento não encontrado.", "error");
    return;
  }

  const headers = { Accept: "application/json", ...getAuthHeaders() };

  let interessados = [];
  try {
    console.debug('Headers enviados:', headers);
    const relUrl = `/participacoes/inscritos/cargo2/pendente/${encodeURIComponent(idEvento)}`;
    let res = await api.get(relUrl, { headers });
    console.debug('axios (rel):', res.status, relUrl);

    if (res.status === 404) {
      const absUrl = `/participacoes/inscritos/cargo2/pendente/${encodeURIComponent(idEvento)}`;
      console.debug('Rota relativa retornou 404 — tentando URL absoluta:', absUrl);
      res = await api.get(absUrl, { headers });
      console.debug('axios (abs):', res.status, absUrl);
    }

    if (res.status === 204) interessados = [];
    else if (res.ok) {
      const data = await res.json();

      interessados = (Array.isArray(data) ? data : []).map((item) => {
        const usuario = item.usuario || {};
        const idUsuario = item.idUsuario ?? item.id?.usuarioId ?? usuario.idUsuario ?? item.usuarioId ?? item.id;
        const nomeCompleto = item.nomeCompleto ?? usuario.nomeCompleto ?? usuario.nome ?? item.nome ?? "";
        const telefone = item.telefone ?? usuario.telefone ?? "";
        const email = item.email ?? usuario.email ?? "";
        const presente = !!(item.isPresente ?? item.is_presente ?? item.presente);
        return { ...item, idUsuario, nomeCompleto, telefone, email, presente };
      });
    } else {
      const text = await res.text().catch(() => '');
      console.error('Resposta não OK ao buscar inscritos:', res.status, res.statusText, text);
      Swal.fire("Erro", `Falha ao carregar interessados: ${res.status} ${res.statusText}\n${text}`, "error");
      return;
    }
  } catch (err) {
    console.error("Erro ao buscar interessados:", err);
    Swal.fire("Erro", "Não foi possível carregar a lista de interessados.", "error");
    return;
  }

  const initialState = (interessados || []).map(u => ({ ...u, presente: !!u.presente }));
  let currentState = initialState.map(x => ({ ...x }));

  const rowsHtml = (items) => items.map((u, idx) => {
    const nome = u.nomeCompleto || u.nome || u.nomeUsuario || "";
    const telefone = u.telefone || u.celular || u.phone || "";
    const email = u.email || u.emailContato || "";
    return `
    <div class="lp-row" style="display:flex; align-items:center; gap:12px; padding:8px 12px; border-bottom:1px solid #eee;">
      <input type="checkbox" id="lp-chk-${idx}" ${u.presente ? "checked" : ""} style="flex:0 0 auto;" />
      <div style="flex:1; display:flex; align-items:center; gap:16px;">
        <div style="flex:1; min-width:0;">
          <strong style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(nome)}</strong>
        </div>
        <div style="flex:0 0 170px; color:#666; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(telefone)}</div>
        <div style="flex:0 0 300px; color:#666; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(email)}</div>
      </div>
    </div>
  `;
  }).join("");

  const html = `
    <div style="width:100%; max-width:720px;">
      <div style="font-weight:700; margin-bottom:8px;">Lista de Presença - ${escapeHtml(evento.nomeEvento || evento.nome || "")}</div>
      <div id="lp-list" style="max-height:380px; overflow:auto; border:1px solid #eee; border-radius:6px; background:#fff">
        ${rowsHtml(initialState)}
        ${initialState.length === 0 ? `<div style="padding:16px; color:#666">Nenhum interessado encontrado.</div>` : ""}
      </div>
    </div>
  `;

  const popup = await Swal.fire({
    title: "Lista de Presença",
    html,
    showCancelButton: true,
    confirmButtonText: "Salvar presenças",
    cancelButtonText: "Fechar",
    width: 760,
    didOpen: () => {
      initialState.forEach((u, idx) => {
        const el = document.getElementById(`lp-chk-${idx}`);
        if (!el) return;
        el.addEventListener("change", (ev) => {
          currentState[idx].presente = !!ev.target.checked;
        });
      });
    },
    preConfirm: async () => {
      const changed = currentState.filter((u, i) => u.presente !== initialState[i].presente);
      if (changed.length === 0) return null;

      // monta lista para enviar em massa
      const listaPresenca = changed.map(u => {
        const userId = u.idUsuario ?? u.id ?? u.usuario?.idUsuario;
        return { idUsuario: Number(userId), presente: !!u.presente };
      }).filter(x => Number.isFinite(x.idUsuario));

      if (listaPresenca.length === 0) {
        Swal.showValidationMessage("Nenhum usuário válido para atualizar.");
        return false;
      }

      try {
         const urlRel = `/participacoes/${encodeURIComponent(idEvento)}/presenca/bulk`;
        console.debug('Enviando PUT (rel):', urlRel, listaPresenca);

        let r = await api.put(urlRel, { listaPresenca }, { headers });
        console.debug('Resposta (rel):', r.status, urlRel);

        // se 404 no dev-server, tenta URL absoluta (pode ativar CORS)
        if (r.status === 404) {
          const urlAbs = `http://localhost:8080/participacoes/${encodeURIComponent(idEvento)}/presenca/bulk`;
          console.debug('Relativa retornou 404 — tentando absoluta:', urlAbs);
          try {
            r = await api.put(urlAbs, { listaPresenca }, { headers });
            console.debug('Resposta (abs):', r.status, urlAbs);
          } catch (errAbs) {
            console.error('Erro axios absoluta (possível CORS):', errAbs);
            Swal.showValidationMessage("Falha ao alcançar backend via URL absoluta (possível CORS). Verifique proxy ou CORS no servidor.");
            return false;
          }
        }

        if (!r.ok) {
          const txt = await r.text().catch(() => `Erro ${r.status}`);
          console.error('Resposta não OK ao enviar bulk:', r.status, txt);
          throw new Error(txt || `Erro ${r.status}`);
        }

        return r.data ?? true;
      } catch (err) {
        console.error("Erro ao atualizar presenças em massa:", err);
        Swal.showValidationMessage("Falha ao salvar presenças em massa.");
        return false;
      }
    }
  });

  if (popup.isConfirmed) {
    // popup.value pode conter o json retornado do backend
    const info = popup.value && popup.value.totalAtualizado ? ` (${popup.value.totalAtualizado} registros atualizados)` : "";
    Swal.fire("Sucesso", `Presenças atualizadas.${info}`, "success");
  }
}

