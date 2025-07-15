import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './fireBase/config';

import FormularioTransacao from './components/FormularioTransacao';
import ModalConfirmacao from './components/ModalConfirmacao';
import ResumoFinanceiro from './components/ResumoFinanceiro';
import Filtros from './components/Filtros';
import ListaTransacoes from './components/ListaTransacoes';

function App() {
  const [transacoes, setTransacoes] = useState([]);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [saldo, setSaldo] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);

  const [confirmaExclusao, setConfirmaExclusao] = useState(false);
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState(null);

  const [filtroMes, setFiltroMes] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('all');
  const [filtroTipo, setFiltroTipo] = useState('all');

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
    let receitas = 0, despesas = 0;
    transacoes.forEach(t => {
      if (t.Tipo === 'receita') receitas += t.Valor;
      if (t.Tipo === 'despesa') despesas += t.Valor;
    });
    setTotalReceitas(receitas);
    setTotalDespesas(despesas);
    setSaldo(receitas - despesas);
  }, [transacoes]);

  const salvarTransacao = async dados => {
    try {
      if (editando) {
        const ref = doc(db, 'transacoes', editando.id);
        await updateDoc(ref, dados);
      } else {
        await addDoc(collection(db, 'transacoes'), dados);
      }
      setModalAberto(false);
      setEditando(null);
    } catch (err) {
      console.error('Erro ao salvar transação:', err);
    }
  };

  const editarTransacao = transacao => {
    setEditando(transacao);
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

  const limparFiltros = () => {
    setFiltroMes('');
    setFiltroCategoria('all');
    setFiltroTipo('all');
  };

  const transacoesFiltradas = transacoes
    .filter(t => !filtroMes || new Date(t.DataHora).getMonth() + 1 === +filtroMes)
    .filter(t => filtroCategoria === 'all' || t.Categoria === filtroCategoria)
    .filter(t => filtroTipo === 'all' || t.Tipo === filtroTipo)
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
            setModalAberto(true);
          }}
          className="w-full mb-6 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold shadow transition"
        >
          + Nova Transação
        </button>

        <FormularioTransacao
          aberto={modalAberto}
          onCancelar={() => setModalAberto(false)}
          onSalvar={salvarTransacao}
          transacaoEditando={editando}
        />

        <ModalConfirmacao
          aberto={confirmaExclusao}
          onCancelar={() => setConfirmaExclusao(false)}
          onConfirmar={confirmarExclusao}
          transacao={transacaoParaExcluir}
        />

        <ResumoFinanceiro receitas={totalReceitas} despesas={totalDespesas} saldo={saldo} />

        <Filtros
          filtroMes={filtroMes}
          setFiltroMes={setFiltroMes}
          filtroCategoria={filtroCategoria}
          setFiltroCategoria={setFiltroCategoria}
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          limparFiltros={limparFiltros}
        />

        <ListaTransacoes
          transacoes={transacoesFiltradas}
          onEditar={editarTransacao}
          onExcluir={excluirTransacao}
        />
      </div>
    </div>
  );
}

export default App;
