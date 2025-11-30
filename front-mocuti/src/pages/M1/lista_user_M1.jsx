// src/pages/admin/ListaUsuariosM1.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../../api/api";
import Swal from "sweetalert2";

import { NavLateral } from "../../components/NavLateral";

import "../../styles/TelaComNavLateral.css";
import "../../styles/ListaUsuariosM1.css";

import Calendario from "../../assets/images/calendario.svg";
import MeuPerfil from "../../assets/images/meuPerfil.svg";
import feedback from "../../assets/images/feedbackLogo.svg";
import Visao from "../../assets/images/visaoGeral.svg";
import Lista from "../../assets/images/listausuariom1.svg";

export default function ListaUsuariosM1() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(10);
  const [selecionados, setSelecionados] = useState([]);
  const [ordenacaoAsc, setOrdenacaoAsc] = useState(true);
  const [fonte, setFonte] = useState(16);

  const [cargoSelecionado, setCargoSelecionado] = useState(1);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [formNovoUsuario, setFormNovoUsuario] = useState({
    nomeCompleto: "",
    cpf: "",
    email: "",
    telefone: "",
    dtNasc: "",
    senha: "",
  });

  const [usuarioOpcoes, setUsuarioOpcoes] = useState(null);
  const abrirMenuUsuario = (id) => setUsuarioOpcoes(id);
  const [modalTrocarCargo, setModalTrocarCargo] = useState({
    aberto: false,
    idUsuario: null,
  });

  const [novoCargoSelecionado, setNovoCargoSelecionado] = useState("");

  const abrirModalTrocarCargo = (id) => {
    setModalTrocarCargo({ aberto: true, idUsuario: id });
    setUsuarioOpcoes(null);
  };

  const rotasPersonalizadas = [
    { texto: "Visão Geral", rota: "/admin/geral", img: Visao },
    { texto: "Eventos", rota: "/admin/eventos", img: Calendario },
    { texto: "Usuários", rota: "/admin/lista-usuarios", img: Lista },
    { texto: "Feedbacks", rota: "/admin/feedbacks", img: feedback },
    { texto: "Meu Perfil", rota: "/admin/perfil", img: MeuPerfil },
  ];

  const getTituloPagina = () => {
    switch (cargoSelecionado) {
      case 1:
        return "Lista de Administradores";
      case 2:
        return "Lista de Mantenedores";
      case 3:
        return "Lista de Beneficiários";
      default:
        return "Lista de Usuários";
    }
  };

  // const getTextoBotaoNovo = () => {
  //   switch (cargoSelecionado) {
  //     case 1:
  //       return "+ Novo Mantenedor 1";
  //     case 2:
  //       return "+ Novo Mantenedor 2";
  //     case 3:
  //       return "+ Novo Beneficiário";
  //     default:
  //       return "+ Novo Usuário";
  //   }
  // };

  const carregarUsuarios = async (cargo) => {
    try {
      setLoading(true);

      const { data } = await api.get(`/usuarios/inativos-por-cargo/${cargo}`);

      const normalizados = (data || []).map((u) => ({
        id: u.idUsuario,
        nome: u.nomeCompleto,
        cpf: u.cpf,
        email: u.email,
        telefone: u.telefone,
        dt_nasc: u.dt_nasc, // <-- aqui
        ativo: u.isAtivo,
      }));

      const totalPaginasNovo = Math.max(
        1,
        Math.ceil(normalizados.length / itensPorPagina)
      );

      setUsuarios(normalizados);

      setPaginaAtual((prev) => {
        if (!prev || prev < 1) return 1;
        if (prev > totalPaginasNovo) return totalPaginasNovo;
        return prev;
      });

      setSelecionados([]);
    } catch (err) {
      Swal.fire("Erro", "Não foi possível carregar os usuários.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios(cargoSelecionado);
  }, [cargoSelecionado]);

  const totalPaginas = Math.max(1, Math.ceil(usuarios.length / itensPorPagina));

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const paginaDados = usuarios.slice(indiceInicial, indiceFinal);

  const gerarPaginas = () => {
    const paginas = [];
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1);
      if (paginaAtual > 3) paginas.push("...");
      const inicio = Math.max(2, paginaAtual - 1);
      const fim = Math.min(totalPaginas - 1, paginaAtual + 1);
      for (let i = inicio; i <= fim; i++) paginas.push(i);
      if (paginaAtual < totalPaginas - 2) paginas.push("...");
      paginas.push(totalPaginas);
    }
    return paginas;
  };

  const paginas = gerarPaginas();

  function toggleSelecionado(id) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelecionarTodos() {
    const idsPagina = paginaDados.map((u) => u.id);
    const todosSelecionados = idsPagina.every((id) =>
      selecionados.includes(id)
    );

    if (todosSelecionados) {
      setSelecionados((prev) => prev.filter((id) => !idsPagina.includes(id)));
    } else {
      setSelecionados((prev) => [...new Set([...prev, ...idsPagina])]);
    }
  }

  function ordenarPorNome() {
    const ordenados = [...usuarios].sort((a, b) => {
      if (ordenacaoAsc) return a.nome.localeCompare(b.nome);
      return b.nome.localeCompare(a.nome);
    });
    setOrdenacaoAsc(!ordenacaoAsc);
    setUsuarios(ordenados);
  }

  async function desativarSelecionados() {
    if (selecionados.length === 0) {
      Swal.fire({
        title: "Atenção",
        text: "Selecione ao menos um usuário.",
        icon: "info",
        confirmButtonColor: "#45AA48",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Desativar usuários?",
      text: "Eles não poderão acessar o sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim",
      confirmButtonColor: "#45AA48",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await Promise.all(
        selecionados.map((id) => api.patch(`/usuarios/desativar/${id}`))
      );

      Swal.fire("Sucesso", "Usuários desativados!", "success");
      carregarUsuarios(cargoSelecionado);
    } catch (err) {
      Swal.fire("Erro", "Não foi possível desativar.", "error");
    }
  }

  // const irParaNovoUsuario = () => {
  //   setFormNovoUsuario({
  //     nomeCompleto: "",
  //     cpf: "",
  //     email: "",
  //     telefone: "",
  //     dtNasc: "",
  //     senha: "",
  //   });
  //   setMostrarModal(true);
  // };

  //  const salvarNovoUsuario = async () => {
  //   try {

  //     // ---------------- VALIDACOES DIRETAS ----------------

  //     if (!formNovoUsuario.nomeCompleto || formNovoUsuario.nomeCompleto.trim().length < 3) {
  //       return Swal.fire("Erro", "Nome deve ter pelo menos 3 letras.", "error");
  //     }

  //     const cpfDigits = formNovoUsuario.cpf.replace(/\D/g, "");
  //     if (cpfDigits.length !== 11) {
  //       return Swal.fire("Erro", "CPF inválido (precisa ter 11 dígitos).", "error");
  //     }

  //     const telefoneDigits = formNovoUsuario.telefone.replace(/\D/g, "");
  //     if (telefoneDigits.length < 10 || telefoneDigits.length > 11) {
  //       return Swal.fire("Erro", "Telefone inválido (10 ou 11 dígitos).", "error");
  //     }

  //     if (!formNovoUsuario.dtNasc) {
  //       return Swal.fire("Erro", "Informe a data de nascimento.", "error");
  //     }

  //     const hoje = new Date();
  //     const nascimento = new Date(formNovoUsuario.dtNasc);
  //     let idade = hoje.getFullYear() - nascimento.getFullYear();
  //     const diffMes = hoje.getMonth() - nascimento.getMonth();
  //     if (diffMes < 0 || (diffMes === 0 && hoje.getDate() < nascimento.getDate())) idade--;

  //     if (idade < 5) {
  //       return Swal.fire("Erro", "Usuário deve ter pelo menos 5 anos.", "error");
  //     }

  //     const emailRegex = /^[A-Za-z0-9.]+@[A-Za-z0-9.]+\.[A-Za-z]{2,}$/;
  //     if (!emailRegex.test(formNovoUsuario.email)) {
  //       return Swal.fire("Erro", "Email inválido.", "error");
  //     }

  //     const senha = formNovoUsuario.senha;

  //     if (!senha || senha.length < 8) {
  //       return Swal.fire("Erro", "A senha deve ter no mínimo 8 caracteres.", "error");
  //     }

  //     if (!/[A-Z]/.test(senha)) {
  //       return Swal.fire("Erro", "A senha deve conter pelo menos 1 letra maiúscula.", "error");
  //     }

  //     if (!/[0-9]/.test(senha)) {
  //       return Swal.fire("Erro", "A senha deve conter pelo menos 1 número.", "error");
  //     }

  //     if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+`~;]/.test(senha)) {
  //       return Swal.fire("Erro", "A senha deve conter pelo menos 1 caractere especial.", "error");
  //     }

  //     if (senha.toLowerCase().includes(formNovoUsuario.nomeCompleto.replace(/\s+/g, "").toLowerCase())) {
  //       return Swal.fire("Erro", "A senha não pode conter o nome do usuário.", "error");
  //     }

  //     if (senha === formNovoUsuario.email) {
  //       return Swal.fire("Erro", "A senha não pode ser igual ao email.", "error");
  //     }

  //     // ---------------- ENVIAR PRO BACKEND ----------------
  //     const body = {
  //       ...formNovoUsuario,
  //       cargo: cargoSelecionado,
  //       isAtivo: true,
  //     };

  //     await axios.post("http://localhost:8080/usuarios/cadastrar", body);

  //     Swal.fire("Sucesso!", "Usuário cadastrado.", "success");
  //     setMostrarModal(false);
  //     carregarUsuarios(cargoSelecionado);

  //   } catch (err) {
  //     Swal.fire("Erro", err.response?.data || "Dados inválidos.", "error");
  //   }
  // };

  const handleTrocarCargo = (cargo) => {
    if (cargo === cargoSelecionado) return;
    setCargoSelecionado(cargo);
  };

  async function desativarUsuario(id) {
    const confirm = await Swal.fire({
      title: "Desativar usuário?",
      text: "Ele não poderá acessar o sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.patch(`/usuarios/desativar/${id}`);

      Swal.fire("Sucesso", "Usuário desativado!", "success");
      carregarUsuarios(cargoSelecionado);
    } catch (err) {
      Swal.fire("Erro", "Não foi possível desativar.", "error");
    }
  }

  // fecha menu ao clicar fora
  useEffect(() => {
    function handleDocClick(e) {
      // se não houver menu aberto, nada a fazer
      if (!usuarioOpcoes) return;
      // se o clique for dentro de um wrapper de três pontos, ignora
      if (
        e.target.closest(".tresPontosWrapper") ||
        e.target.closest(".menu-flutuante")
      )
        return;
      setUsuarioOpcoes(null);
    }

    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, [usuarioOpcoes]);

  async function atualizarCargoUsuario(idUsuario, idCargo) {
    try {
      const response = await api.patch(
        `/usuarios/${idUsuario}/cargo/${idCargo}`
      );

      Swal.fire("Sucesso!", "Cargo atualizado!", "success");

      setModalTrocarCargo({ aberto: false, idUsuario: null });
      carregarUsuarios(cargoSelecionado);
    } catch (err) {
      Swal.fire("Erro", "Não foi possível atualizar o cargo.", "error");
    }
  }

  return (
    <div className="TelaComNavLateral containerGeral">
      {/* <NavLateral rotasPersonalizadas={rotasAdmin} /> */}
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />

      {/* MODAL TROCAR CARGO */}
      {modalTrocarCargo.aberto && (
        <div className="modal-overlay-novo">
          <div className="modal-card-novo">
            <h2>Alterar Cargo</h2>

            <p style={{ marginBottom: "10px" }}>
              Selecione o novo cargo para o usuário:
            </p>

            <select
              className="selectTrocarCargo"
              value={novoCargoSelecionado}
              onChange={(e) => setNovoCargoSelecionado(e.target.value)}
            >
              <option value="" disabled>
                Selecione
              </option>
              <option value="1">Administradores</option>
              <option value="3">Mantenedores</option>
              <option value="2">Beneficiário</option>
            </select>

            <div className="modal-acoes-novo">
              <button
                className="btnCancelar"
                onClick={() => {
                  setNovoCargoSelecionado("");
                  setModalTrocarCargo({ aberto: false, idUsuario: null });
                }}
              >
                Cancelar
              </button>

              <button
                className="btnSalvar"
                disabled={!novoCargoSelecionado}
                onClick={() => {
                  atualizarCargoUsuario(
                    modalTrocarCargo.idUsuario,
                    novoCargoSelecionado
                  );
                  setModalTrocarCargo({ aberto: false, idUsuario: null });
                  setNovoCargoSelecionado("");
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="conteudoPrincipal" style={{ fontSize: `${fonte}px` }}>
        <h1 className="tituloPagina">{getTituloPagina()}</h1>

        <div className="abasLista">
          <button
            className={`aba ${cargoSelecionado === 1 ? "ativa" : ""}`}
            onClick={() => handleTrocarCargo(1)}
          >
            Administradores
          </button>
          <button
            className={`aba ${cargoSelecionado === 3 ? "ativa" : ""}`}
            onClick={() => handleTrocarCargo(3)}
          >
            Mantenedores
          </button>
          <button
            className={`aba ${cargoSelecionado === 2 ? "ativa" : ""}`}
            onClick={() => handleTrocarCargo(2)}
          >
            Beneficiários
          </button>
        </div>

        <div className="linhaAcoes">
          <div></div>

          <div style={{ display: "flex", gap: "8px" }}>
            {/* <button className="btnNovo" onClick={irParaNovoUsuario}>
              {getTextoBotaoNovo()}
            </button> */}

            <button className="btnExcluir" onClick={desativarSelecionados}>
              - Excluir
            </button>
          </div>
        </div>

        {/* TABELA COM LOADING */}
        <section className="tabelaContainer" style={{ position: "relative" }}>
          {loading && (
            <div className="loadingOverlay">
              <div className="spinnerLoader"></div>
            </div>
          )}

          <table className="tabelaPadrao">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={toggleSelecionarTodos}
                    checked={
                      paginaDados.length > 0 &&
                      paginaDados.every((u) => selecionados.includes(u.id))
                    }
                  />
                </th>
                <th onClick={ordenarPorNome} className="colOrdenavel">
                  Usuário ⬍
                </th>
                <th>CPF</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Data de nascimento</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {paginaDados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="semRegistro">
                    Nenhum usuário encontrado para este cargo.
                  </td>
                </tr>
              ) : (
                paginaDados.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selecionados.includes(u.id)}
                        onChange={() => toggleSelecionado(u.id)}
                      />
                    </td>

                    <td className="colUsuario">
                      {/* <div className="avatar"></div> */}
                      {u.nome}
                    </td>

                    <td>{u.cpf}</td>
                    <td>{u.email}</td>
                    <td>{u.telefone}</td>
                    <td>
                      {u.dt_nasc
                        ? new Date(u.dt_nasc).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="tresPontosCell">
                      <div
                        className="tresPontosWrapper"
                        onClick={(e) => {
                          e.stopPropagation(); // evita que o listener de document.feche imediatamente
                          abrirMenuUsuario(u.id);
                        }}
                      >
                        <span className="tresPontosIcon">⋮</span>

                        {usuarioOpcoes === u.id && (
                          <div
                            className="menu-flutuante"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirModalTrocarCargo(u.id);
                              }}
                            >
                              Trocar cargo
                            </button>

                            <button
                              onClick={() => {
                                desativarUsuario(u.id);
                              }}
                            >
                              Desativar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <div className="paginacao">
          <button
            className="btnPaginacaoTexto"
            disabled={paginaAtual === 1}
            onClick={() =>
              setPaginaAtual((prev) => (prev > 1 ? prev - 1 : prev))
            }
          >
            Previous
          </button>

          {paginas.map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="paginacaoDots">
                ...
              </span>
            ) : (
              <button
                key={p}
                className={`btnPaginacaoNumero ${
                  paginaAtual === p ? "paginaAtiva" : ""
                }`}
                onClick={() => setPaginaAtual(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="btnPaginacaoTexto"
            disabled={paginaAtual === totalPaginas}
            onClick={() =>
              setPaginaAtual((prev) => (prev < totalPaginas ? prev + 1 : prev))
            }
          >
            Next
          </button>
        </div>

        <div className="controlesFonte">
          <button onClick={() => setFonte((f) => (f > 10 ? f - 1 : f))}>
            A−
          </button>
          <button onClick={() => setFonte((f) => (f < 24 ? f + 1 : f))}>
            A+
          </button>
        </div>

        {/* MODAL NOVO USUÁRIO */}
        {mostrarModal && (
          <div className="modal-overlay-novo">
            <div className="modal-card-novo">
              <h2>Novo Usuário</h2>

              <div className="form-novo">
                <label>Nome Completo</label>
                <input
                  value={formNovoUsuario.nomeCompleto}
                  onChange={(e) =>
                    setFormNovoUsuario({
                      ...formNovoUsuario,
                      nomeCompleto: e.target.value,
                    })
                  }
                />

                <label>CPF</label>
                <input
                  value={formNovoUsuario.cpf}
                  onChange={(e) =>
                    setFormNovoUsuario({
                      ...formNovoUsuario,
                      cpf: e.target.value,
                    })
                  }
                />

                <label>E-mail</label>
                <input
                  value={formNovoUsuario.email}
                  onChange={(e) =>
                    setFormNovoUsuario({
                      ...formNovoUsuario,
                      email: e.target.value,
                    })
                  }
                />

                <label>Telefone</label>
                <input
                  value={formNovoUsuario.telefone}
                  onChange={(e) =>
                    setFormNovoUsuario({
                      ...formNovoUsuario,
                      telefone: e.target.value,
                    })
                  }
                />

                <label>Data de Nascimento</label>
                <input
                  type="date"
                  value={formNovoUsuario.dtNasc}
                  onChange={(e) =>
                    setFormNovoUsuario({
                      ...formNovoUsuario,
                      dtNasc: e.target.value,
                    })
                  }
                />

                <label>Senha</label>
                <input
                  type="password"
                  value={formNovoUsuario.senha}
                  onChange={(e) =>
                    setFormNovoUsuario({
                      ...formNovoUsuario,
                      senha: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-acoes-novo">
                <button
                  className="btnCancelar"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>

                <button className="btnSalvar" onClick={salvarNovoUsuario}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
