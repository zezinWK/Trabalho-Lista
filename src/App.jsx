import { useState, useEffect } from 'react';
import { db } from './fireBase/config';
import { addDoc, collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';

function App() {
  const [tipo, setTipo] = useState('receita');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('alimentacao');
  const [datahora, setDatahora] = useState('');
  const [transacoes, setTransacoes] = useState([]);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [editando, setEditando] = useState(null);

  const [filtroMes, setFiltroMes] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('all');
  const [filtroTipo, setFiltroTipo] = useState('all');

  useEffect(() => {
    const carregarTransacoes = async () => {
      const q = query(collection(db, 'transacoes'), orderBy('DataHora', 'desc'));
      const querySnapshot = await getDocs(q);
      const transacoesDados = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransacoes(transacoesDados);
    };

    carregarTransacoes();
  }, []);

  useEffect(() => {
    calcularTotais(transacoes);
  }, [transacoes]);

  const calcularTotais = (transacoes) => {
    let totalR = 0;
    let totalD = 0;

    transacoes.forEach((transacao) => {
      if (transacao.Tipo === 'receita') {
        totalR += transacao.Valor;
      } else if (transacao.Tipo === 'despesa') {
        totalD += transacao.Valor;
      }
    });

    const saldoCalculado = totalR - totalD;
    setTotalReceitas(totalR);
    setTotalDespesas(totalD);
    setSaldo(saldoCalculado);
  };

  const salvarTransacao = async (e) => {
    e.preventDefault();

    try {
      if (editando) {
        const transacaoRef = doc(db, 'transacoes', editando.id);
        await updateDoc(transacaoRef, {
          Tipo: tipo,
          Descrição: descricao,
          Valor: parseFloat(valor),
          Categoria: categoria,
          DataHora: datahora,
        });

        setTransacoes((prevTransacoes) =>
          prevTransacoes.map((transacao) =>
            transacao.id === editando.id
              ? { ...transacao, Tipo: tipo, Descrição: descricao, Valor: parseFloat(valor), Categoria: categoria, DataHora: datahora }
              : transacao
          )
        );
        setEditando(null);
      } else {
        const docRef = await addDoc(collection(db, 'transacoes'), {
          Tipo: tipo,
          Descrição: descricao,
          Valor: parseFloat(valor),
          Categoria: categoria,
          DataHora: datahora,
        });

        setTransacoes((prevTransacoes) => [
          ...prevTransacoes,
          { id: docRef.id, Tipo: tipo, Descrição: descricao, Valor: parseFloat(valor), Categoria: categoria, DataHora: datahora },
        ]);
      }

      setTipo('receita');
      setDescricao('');
      setValor('');
      setCategoria('alimentacao');
      setDatahora('');
    } catch (e) {
      console.error('Erro ao adicionar ou editar transação: ', e);
    }
  };

  const editarTransacao = (transacao) => {
    setEditando(transacao);
    setTipo(transacao.Tipo);
    setDescricao(transacao.Descrição);
    setValor(transacao.Valor);
    setCategoria(transacao.Categoria);
    setDatahora(transacao.DataHora);
  };

  const excluirTransacao = async (id) => {
    try {
      await deleteDoc(doc(db, 'transacoes', id));
      setTransacoes((prevTransacoes) => prevTransacoes.filter((transacao) => transacao.id !== id));
    } catch (e) {
      console.error('Erro ao excluir transação: ', e);
    }
  };

  const aplicarFiltros = () => {
    let transacoesFiltradas = [...transacoes];

    if (filtroMes) {
      transacoesFiltradas = transacoesFiltradas.filter((transacao) => {
        const transacaoMes = new Date(transacao.DataHora).getMonth() + 1;
        return transacaoMes === parseInt(filtroMes);
      });
    }

    if (filtroCategoria !== 'all') {
      transacoesFiltradas = transacoesFiltradas.filter(
        (transacao) => transacao.Categoria === filtroCategoria
      );
    }

    if (filtroTipo !== 'all') {
      transacoesFiltradas = transacoesFiltradas.filter(
        (transacao) => transacao.Tipo === filtroTipo
      );
    }

    return transacoesFiltradas;
  };

  const transacoesFiltradas = aplicarFiltros();

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-center text-teal-600 mb-6">
          💸 Gestão de Finanças Pessoais
        </h1>
        <form onSubmit={salvarTransacao} className="space-y-6 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div>
            <label htmlFor="tipo" className="block font-medium text-gray-700">Tipo:</label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="mt-1 p-3 w-full border border-gray-300 rounded-md bg-gray-100 text-gray-900"
              required
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>

          <div>
            <label htmlFor="descricao" className="block font-medium text-gray-700">Descrição:</label>
            <input
              type="text"
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição da transação"
              className="mt-1 p-3 w-full border border-gray-300 rounded-md bg-gray-100 text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="valor" className="block font-medium text-gray-700">Valor (R$):</label>
            <input
              type="number"
              id="valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              step="0.01"
              placeholder="Digite o valor"
              className="mt-1 p-3 w-full border border-gray-300 rounded-md bg-gray-100 text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="categoria" className="block font-medium text-gray-700">Categoria:</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="mt-1 p-3 w-full border border-gray-300 rounded-md bg-gray-100 text-gray-900"
              required
            >
              <option value="alimentacao">Alimentação</option>
              <option value="transporte">Transporte</option>
              <option value="saude">Saúde</option>
              <option value="educacao">Educação</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label htmlFor="datahora" className="block font-medium text-gray-700">Data e Hora:</label>
            <input
              type="datetime-local"
              id="datahora"
              value={datahora}
              onChange={(e) => setDatahora(e.target.value)}
              className="mt-1 p-3 w-full border border-gray-300 rounded-md bg-gray-100 text-gray-900"
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition-all transform hover:scale-105"
            >
              {editando ? 'Salvar Alterações' : 'Adicionar Transação'}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-center text-teal-600">Totais</h2>
          <div className="flex justify-between mt-4 text-lg text-gray-800">
            <div>
              <p>Receitas: R$ {totalReceitas.toFixed(2)}</p>
            </div>
            <div>
              <p>Despesas: R$ {totalDespesas.toFixed(2)}</p>
            </div>
            <div>
              <p className={`font-bold ${saldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
                Saldo: R$ {saldo.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-teal-600 mb-4">Filtros</h2>
          <div className="flex gap-4">
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="p-3 w-32 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
            >
              <option value="">Mês</option>
              {[...Array(12).keys()].map((i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="p-3 w-32 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
            >
              <option value="all">Categoria</option>
              <option value="alimentacao">Alimentação</option>
              <option value="transporte">Transporte</option>
              <option value="saude">Saúde</option>
              <option value="educacao">Educação</option>
              <option value="outro">Outro</option>
            </select>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="p-3 w-32 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
            >
              <option value="all">Tipo</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          {transacoesFiltradas.length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma transação encontrada.</p>
          ) : (
            <ul className="space-y-4">
              {transacoesFiltradas.map((transacao) => (
                <li key={transacao.id} className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
                  <div>
                    <h3 className="font-semibold">{transacao.Descrição}</h3>
                    <p className="text-gray-600">
                      {transacao.Categoria} - {new Date(transacao.DataHora).toLocaleString()}
                    </p>
                  </div>
                  <div className={`font-bold ${transacao.Tipo === 'despesa' ? 'text-red-600' : 'text-green-600'}`}>
                    R$ {transacao.Valor.toFixed(2)}
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => editarTransacao(transacao)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all transform hover:scale-105"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluirTransacao(transacao.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-all transform hover:scale-105"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
