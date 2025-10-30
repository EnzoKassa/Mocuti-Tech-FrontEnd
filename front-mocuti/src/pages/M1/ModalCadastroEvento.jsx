import React, { useState, useEffect } from "react";

export default function CadastroEvento() {
  const [evento, setEvento] = useState({
    nomeEvento: "",
    descricao: "",
    dia: "",
    horaInicio: "",
    horaFim: "",
    isAberto: true,
    qtdVaga: "",
    publicoAlvo: "",
    qtdInteressado: 0,
    enderecoId: "",
    statusEventoId: 1,
    categoriaId: "",
  });

  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoOpcao, setEnderecoOpcao] = useState(""); // "sim" ou "nao"
  const [novoEndereco, setNovoEndereco] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    uf: "",
    estado: "",
    bairro: "",
  });
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);

  // Fetch categorias
  useEffect(() => {
    fetch("http://localhost:8080/categorias")
      .then((res) => res.json())
      .then(setCategorias)
      .catch(console.error);
  }, []);

  // Fetch endereços usados em eventos
  useEffect(() => {
    fetch("http://localhost:8080/endereco/enderecos-eventos")
      .then((res) => res.json())
      .then(setEnderecos)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvento({
      ...evento,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleEnderecoChange = (e) => {
    const { name, value } = e.target;
    setNovoEndereco({ ...novoEndereco, [name]: value });
  };

  const buscarCep = async () => {
    if (!novoEndereco.cep) return;
    try {
      const res = await fetch(
        `https://viacep.com.br/ws/${novoEndereco.cep}/json/`
      );
      const data = await res.json();
      setNovoEndereco({
        ...novoEndereco,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        uf: data.uf || "",
        estado: data.localidade || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const salvarEndereco = async () => {
    try {
      const res = await fetch("http://localhost:8080/endereco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...novoEndereco, idEndereco: 0 }),
      });
      const data = await res.json();
      setEvento({ ...evento, enderecoId: data.idEndereco });
      setEnderecos([...enderecos, data]);
      setEnderecoSelecionado(data);
      setEnderecoOpcao("sim"); // mostra apenas o selecionado
    } catch (err) {
      console.error(err);
    }
  };

  const selecionarEndereco = (e) => {
    setEvento({ ...evento, enderecoId: e.idEndereco });
    setEnderecoSelecionado(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");

    try {
      const formData = new FormData();
      formData.append(
        "dados",
        new Blob([JSON.stringify(evento)], { type: "application/json" })
      );
      if (foto) formData.append("foto", foto);

      const response = await fetch("http://localhost:8080/eventos/cadastrar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao cadastrar evento");

      setMensagem("✅ Evento cadastrado com sucesso!");
      setEvento({
        nomeEvento: "",
        descricao: "",
        dia: "",
        horaInicio: "",
        horaFim: "",
        isAberto: true,
        qtdVaga: "",
        publicoAlvo: "",
        qtdInteressado: 0,
        enderecoId: "",
        statusEventoId: 1,
        categoriaId: "",
      });
      setFoto(null);
      setEnderecoOpcao("");
      setEnderecoSelecionado(null);
      setNovoEndereco({
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        uf: "",
        estado: "",
        bairro: "",
      });
    } catch (error) {
      setMensagem("❌ Falha ao cadastrar evento.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Cadastrar Novo Evento
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="nomeEvento"
            placeholder="Nome do evento"
            value={evento.nomeEvento}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="text"
            name="publicoAlvo"
            placeholder="Público alvo"
            value={evento.publicoAlvo}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />

          <textarea
            name="descricao"
            placeholder="Descrição"
            value={evento.descricao}
            onChange={handleChange}
            className="border p-2 rounded col-span-2"
            required
          />

          <input
            type="date"
            name="dia"
            value={evento.dia}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]} // só permite hoje ou depois
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="time"
            name="horaInicio"
            value={evento.horaInicio}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="time"
            name="horaFim"
            value={evento.horaFim}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="number"
            name="qtdVaga"
            placeholder="Quantidade de vagas"
            value={evento.qtdVaga}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />

          {/* Categoria */}
          <select
            name="categoriaId"
            value={evento.categoriaId}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((cat) => (
              <option key={cat.idCategoria} value={cat.idCategoria}>
                {cat.nome}
              </option>
            ))}
          </select>

          {/* Pergunta sobre endereço */}
          <div className="col-span-2 mt-2">
            <p className="font-medium mb-1">Endereço já cadastrado?</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setEnderecoOpcao("sim")}
                className={`py-2 px-4 rounded border ${
                  enderecoOpcao === "sim" ? "bg-blue-500 text-white" : ""
                }`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setEnderecoOpcao("nao")}
                className={`py-2 px-4 rounded border ${
                  enderecoOpcao === "nao" ? "bg-blue-500 text-white" : ""
                }`}
              >
                Não
              </button>
            </div>
          </div>

          {/* Mostrar apenas o endereço selecionado */}
          {enderecoOpcao === "sim" && enderecoSelecionado && (
            <div className="col-span-2 mt-2 p-2 border rounded bg-gray-50">
              {`${enderecoSelecionado.logradouro}, ${enderecoSelecionado.numero} - ${enderecoSelecionado.bairro} (${enderecoSelecionado.cep})`}
              <button
                type="button"
                onClick={() => setEnderecoSelecionado(null)}
                className="ml-4 px-2 py-1 bg-yellow-500 text-white rounded"
              >
                Alterar
              </button>
            </div>
          )}

          {/* Lista de endereços caso queira selecionar */}
          {enderecoOpcao === "sim" && !enderecoSelecionado && (
            <div className="col-span-2 mt-2">
              <ul className="border p-2 rounded max-h-40 overflow-y-auto">
                {enderecos.map((e) => (
                  <li
                    key={e.idEndereco}
                    className="p-1 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selecionarEndereco(e)}
                  >
                    {`${e.logradouro}, ${e.numero} - ${e.bairro} (${e.cep})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formulário novo endereço */}
          {enderecoOpcao === "nao" && (
            <div className="col-span-2 mt-2 grid grid-cols-2 gap-2">
              <input
                type="text"
                name="cep"
                placeholder="CEP"
                value={novoEndereco.cep}
                onChange={handleEnderecoChange}
                onBlur={buscarCep}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="logradouro"
                placeholder="Logradouro"
                value={novoEndereco.logradouro}
                onChange={handleEnderecoChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="numero"
                placeholder="Número"
                value={novoEndereco.numero}
                onChange={handleEnderecoChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="complemento"
                placeholder="Complemento"
                value={novoEndereco.complemento}
                onChange={handleEnderecoChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="bairro"
                placeholder="Bairro"
                value={novoEndereco.bairro}
                onChange={handleEnderecoChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="uf"
                placeholder="UF"
                value={novoEndereco.uf}
                onChange={handleEnderecoChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="estado"
                placeholder="Cidade"
                value={novoEndereco.estado}
                onChange={handleEnderecoChange}
                className="border p-2 rounded w-full"
              />
              <button
                type="button"
                onClick={salvarEndereco}
                className="col-span-2 mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Salvar Endereço
              </button>
            </div>
          )}

          <label className="flex items-center gap-2 col-span-2">
            <input
              type="checkbox"
              name="isAberto"
              checked={evento.isAberto}
              onChange={handleChange}
            />
            <span>Evento aberto?</span>
          </label>

          <div className="col-span-2">
            <label className="block mb-1 font-medium">Foto do evento</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e);
                if (e.target.files && e.target.files[0]) {
                  setFotoPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className="border p-2 rounded w-full"
            />
            {/* Preview da imagem */}
            {fotoPreview && (
              <img
                src={fotoPreview}
                alt="Preview"
                className="mt-2 w-40 h-40 object-cover rounded border"
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all"
        >
          {loading ? "Enviando..." : "Cadastrar Evento"}
        </button>

        {mensagem && (
          <p className="mt-4 text-center text-gray-700 font-medium">
            {mensagem}
          </p>
        )}
      </form>
    </div>
  );
}
