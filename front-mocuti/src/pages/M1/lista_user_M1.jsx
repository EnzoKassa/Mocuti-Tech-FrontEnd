// src/pages/admin/ListaUsuariosM1.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

  // const rotasAdmin = [
  //   { texto: "Eventos", rota: "/admin/eventos", img: Calendario },
  //   { texto: "Lista De Usuários", rota: "/admin/lista-usuarios", img: ListaIcon },
  //   { texto: "Feedbacks", rota: "/admin/feedbacks", img: FeedbackIcon },
  //   { texto: "Meu Perfil", rota: "/admin/perfil", img: MeuPerfil },
  //   { texto: "Visão Geral", rota: "/admin/visao-geral", img: Visao },
  // ];

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
        return "Lista de Mantenedores 1";
      case 2:
        return "Lista de Mantenedores 2";
      case 3:
        return "Lista de Beneficiários";
      default:
        return "Lista de Usuários";
    }
  };

  const getTextoBotaoNovo = () => {
    switch (cargoSelecionado) {
      case 1:
        return "+ Novo Mantenedor 1";
      case 2:
        return "+ Novo Mantenedor 2";
      case 3:
        return "+ Novo Beneficiário";
      default:
        return "+ Novo Usuário";
    }
  };

  const carregarUsuarios = async (cargo) => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:8080/usuarios/listar-por-cargo/${cargo}`
      );

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
      Swal.fire("Atenção", "Selecione ao menos um usuário.", "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Desativar usuários?",
      text: "Eles não poderão acessar o sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await Promise.all(
        selecionados.map((id) =>
          axios.patch(`http://localhost:8080/usuarios/desativar/${id}`)
        )
      );

      Swal.fire("Sucesso", "Usuários desativados!", "success");
      carregarUsuarios(cargoSelecionado);
    } catch (err) {
      Swal.fire("Erro", "Não foi possível desativar.", "error");
    }
  }

  const irParaNovoUsuario = () => {
    setFormNovoUsuario({
      nomeCompleto: "",
      cpf: "",
      email: "",
      telefone: "",
      dtNasc: "",
      senha: "",
    });
    setMostrarModal(true);
  };

  const salvarNovoUsuario = async () => {
    try {
      const body = {
        ...formNovoUsuario,
        cargo: cargoSelecionado,
        isAtivo: true,
      };

      await axios.post("http://localhost:8080/usuarios/cadastrar", body);

      Swal.fire("Sucesso!", "Usuário cadastrado.", "success");
      setMostrarModal(false);
      carregarUsuarios(cargoSelecionado);
    } catch (err) {
      Swal.fire("Erro", "Dados inválidos.", "error");
    }
  };

  const handleTrocarCargo = (cargo) => {
    if (cargo === cargoSelecionado) return;
    setCargoSelecionado(cargo);
  };

  return (
    <div className="TelaComNavLateral containerGeral">
      {/* <NavLateral rotasPersonalizadas={rotasAdmin} /> */}
      <NavLateral rotasPersonalizadas={rotasPersonalizadas} />

      <main className="conteudoPrincipal" style={{ fontSize: `${fonte}px` }}>
        <h1 className="tituloPagina">{getTituloPagina()}</h1>

        <div className="abasLista">
          <button
            className={`aba ${cargoSelecionado === 1 ? "ativa" : ""}`}
            onClick={() => handleTrocarCargo(1)}
          >
            Mantenedores 1
          </button>
          <button
            className={`aba ${cargoSelecionado === 2 ? "ativa" : ""}`}
            onClick={() => handleTrocarCargo(2)}
          >
            Mantenedores 2
          </button>
          <button
            className={`aba ${cargoSelecionado === 3 ? "ativa" : ""}`}
            onClick={() => handleTrocarCargo(3)}
          >
            Beneficiários
          </button>
        </div>

        <div className="linhaAcoes">
          <div></div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btnNovo" onClick={irParaNovoUsuario}>
              {getTextoBotaoNovo()}
            </button>

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
                    {/* <td className="tresPontos">⋯</td> */}
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
