export const escapeHtml = (str) =>
  str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

export function formatCep(cep) {
  if (!cep) return cep;
  const digits = String(cep).replace(/\D/g, "");
  if (digits.length === 8) return digits.slice(0, 5) + "-" + digits.slice(5);
  return cep;
}

export function buildInitialValues(evento = {}) {
  return {
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
    enderecoId: evento?.endereco?.idEndereco ?? evento?.enderecoId ?? evento?.endereco?.id ?? ""
  };
}

