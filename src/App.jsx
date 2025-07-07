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
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('all');
  const [filtroTipo, setFiltroTipo] = useState('all');
  const [confirmaExclusao, setConfirmaExclusao] = useState(false);
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState(null);

  useEffect(() => {
    const carregarTransacoes = async () => {
      const q = query(collection(db, 'transacoes'), orderBy('DataHora', 'desc'));
      const snapshot = await getDocs(q);
      const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransacoes(dados);
    };
    carregarTransacoes();
  }, [modalAberto, confirmaExclusao]);

  useEffect(() => {
    let r = 0, d = 0;
    transacoes.forEach(t => {
      if (t.Tipo === 'receita') r += t.Valor;
      else if (t.Tipo === 'despesa') d += t.Valor;
    });
    setTotalReceitas(r);
    setTotalDespesas(d);
    setSaldo(r - d);
  }, [transacoes]);

  const salvarTransacao = async e => {
    e.preventDefault();
    if (!descricao || !valor || !datahora) return alert('Preencha todos os campos');
    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) return alert('Informe um valor maior que zero');
    const valorAbsoluto = Math.abs(valorNum);
    try {
      if (editando) {
        const ref = doc(db, 'transacoes', editando.id);
        await updateDoc(ref, { Tipo: tipo, Descrição: descricao, Valor: valorAbsoluto, Categoria: categoria, DataHora: datahora });
      } else {
        await addDoc(collection(db, 'transacoes'), { Tipo: tipo, Descrição: descricao, Valor: valorAbsoluto, Categoria: categoria, DataHora: datahora });
      }
      setModalAberto(false);
      setEditando(null);
      setDescricao('');
      setValor('');
      setCategoria('alimentacao');
      setDatahora('');
    } catch (err) {
      console.error(err);
    }
  };

  const editarTransacao = t => {
    setEditando(t);
    setTipo(t.Tipo);
    setDescricao(t.Descrição);
    setValor(t.Valor);
    setCategoria(t.Categoria);
    setDatahora(t.DataHora);
    setModalAberto(true);
  };

  const excluirTransacao = id => {
    const t = transacoes.find(t => t.id === id);
    setTransacaoParaExcluir(t);
    setConfirmaExclusao(true);
  };

  const confirmarExclusao = async () => {
    if (transacaoParaExcluir) {
      await deleteDoc(doc(db, 'transacoes', transacaoParaExcluir.id));
      setConfirmaExclusao(false);
      setTransacaoParaExcluir(null);
    }
  };

  const aplicadas = transacoes
    .filter(t => !filtroMes || new Date(t.DataHora).getMonth() + 1 === +filtroMes)
    .filter(t => filtroCategoria === 'all' ? true : t.Categoria === filtroCategoria)
    .filter(t => filtroTipo === 'all' ? true : t.Tipo === filtroTipo)
    .sort((a, b) => new Date(b.DataHora) - new Date(a.DataHora));

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 text-gray-800">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-center items-center mb-4">
          <h1 className="text-3xl font-extrabold text-teal-600 text-center">💸 Gestão de Finanças</h1>
        </div>

        <button
          onClick={() => {
            setEditando(null);
            setTipo('receita');
            setDescricao('');
            setValor('');
            setCategoria('alimentacao');
            setDatahora('');
            setModalAberto(true);
          }}
          className="w-full mb-6 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold shadow transition"
        >
          + Nova Transação
        </button>

        {modalAberto && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-xl animate-scale-in mx-4">
              <h2 className="text-2xl font-bold text-teal-700 mb-4">{editando ? 'Editar Transação' : 'Adicionar Transação'}</h2>
              <form onSubmit={salvarTransacao} className="space-y-4">
                <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none">
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
                <input type="text" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none" required />
                <input type="number" placeholder="Valor (R$)" step="0.01" min="0.01" value={valor} onChange={e => setValor(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none" required />
                <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none">
                  <option value="alimentacao">Alimentação</option>
                  <option value="transporte">Transporte</option>
                  <option value="saude">Saúde</option>
                  <option value="educacao">Educação</option>
                  <option value="trabalho">Trabalho</option>
                  <option value="outro">Outro</option>
                </select>
                <input type="datetime-local" value={datahora} onChange={e => setDatahora(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none" required />
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setModalAberto(false)} className="px-5 py-2 rounded-md bg-gray-300 hover:bg-gray-400">Cancelar</button>
                  <button type="submit" className="px-5 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white">
                    {editando ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmaExclusao && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-xl animate-scale-in mx-4 text-center">
              <p className="text-lg mb-4">Tem certeza que deseja excluir <strong>{transacaoParaExcluir?.Descrição}</strong>?</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setConfirmaExclusao(false)} className="px-5 py-2 rounded-md bg-gray-300 hover:bg-gray-400">Cancelar</button>
                <button onClick={confirmarExclusao} className="px-5 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white">Excluir</button>
              </div>
            </div>
          </div>
        )}

        <section className="mt-8 flex flex-col sm:flex-row justify-around gap-4 bg-transparent rounded-lg p-4">
          <div className="text-center p-4 rounded-lg whitespace-nowrap bg-teal-50">
            <p className="text-sm font-semibold text-teal-700">Receitas</p>
            <p className="text-xl font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 rounded-lg whitespace-nowrap bg-teal-50">
            <p className="text-sm font-semibold text-teal-700">Despesas</p>
            <p className="text-xl font-bold text-red-600">
              {totalDespesas > 0 ? `- R$ ${totalDespesas.toFixed(2)}` : `R$ ${totalDespesas.toFixed(2)}`}
            </p>
          </div>
          <div className="text-center p-4 rounded-lg whitespace-nowrap bg-teal-50">
            <p className="text-sm font-semibold text-teal-700">Saldo</p>
            <p className={`text-xl font-bold ${saldo < 0 ? 'text-red-600' : 'text-green-700'}`}>
              R$ {saldo < 0 ? `- ${Math.abs(saldo).toFixed(2)}` : saldo.toFixed(2)}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="flex-grow p-3 rounded-lg border bg-gray-100">
              <option value="">Todos os meses</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i+1}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>
              ))}
            </select>
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="flex-grow p-3 rounded-lg border bg-gray-100">
              <option value="all">Todas as categorias</option>
              <option value="alimentacao">Alimentação</option>
              <option value="transporte">Transporte</option>
              <option value="saude">Saúde</option>
              <option value="educacao">Educação</option>
              <option value="trabalho">Trabalho</option>
              <option value="outro">Outro</option>
            </select>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="flex-grow p-3 rounded-lg border bg-gray-100">
              <option value="all">Todos os tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>
          <button onClick={() => { setFiltroMes(''); setFiltroCategoria('all'); setFiltroTipo('all'); }} className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg w-full sm:w-auto">Limpar Filtros</button>
        </section>

        <section className="mt-6 overflow-x-auto">
          {aplicadas.length === 0 ? (
            <p className="text-gray-500 italic text-center">Nenhuma transação encontrada.</p>
          ) : (
            <ul className="space-y-4">
              {aplicadas.map(t => (
                <li key={t.id} className="bg-gray-100 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700 break-words">{t.Descrição}</p>
                    <p className="text-sm text-gray-500">{new Date(t.DataHora).toLocaleString()} — {t.Categoria}</p>
                  </div>
                  <p className={`font-bold ${t.Tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.Tipo === 'despesa' ? `- R$ ${t.Valor.toFixed(2)}` : `R$ ${t.Valor.toFixed(2)}`}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => editarTransacao(t)} className="px-3 py-1 bg-teal-400 hover:bg-teal-500 text-white rounded-md">Editar</button>
                    <button onClick={() => excluirTransacao(t.id)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md">Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
