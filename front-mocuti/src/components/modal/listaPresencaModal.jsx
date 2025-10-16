import Swal from "sweetalert2";

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
    const res = await fetch(`http://localhost:8080/participacoes/${encodeURIComponent(idEvento)}/interessados`, { headers });
    if (res.status === 204) interessados = [];
    else if (res.ok) interessados = await res.json();
    else throw new Error(`Erro ${res.status}`);
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

      try {
        for (const u of changed) {
          const userId = u.idUsuario || u.id || u.id_usuario;
          const url = `http://localhost:8080/participacoes/${encodeURIComponent(idEvento)}/marcar-presenca?idUsuario=${encodeURIComponent(userId)}`;
          const r = await fetch(url, { method: "PATCH", headers: { ...headers } });
          if (!r.ok) {
            const txt = await r.text().catch(() => `Erro ${r.status}`);
            throw new Error(txt || `Erro ${r.status}`);
          }
        }
        return true;
      } catch (err) {
        console.error("Erro ao atualizar presenças:", err);
        Swal.showValidationMessage("Falha ao salvar presenças.");
        return false;
      }
    }
  });

  if (popup.isConfirmed) {
    Swal.fire("Sucesso", "Presenças atualizadas.", "success");
  }
}