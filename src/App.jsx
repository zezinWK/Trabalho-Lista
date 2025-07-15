import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './fireBase/config';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

import FormularioTransacao from './components/FormularioTransacao';
import ModalConfirmacao from './components/ModalConfirmacao';
import ResumoFinanceiro from './components/ResumoFinanceiro';
import Filtros from './components/Filtros';
import ListaTransacoes from './components/ListaTransacoes';
import Login from './components/Login';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

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

  // Verifica se o usuário está autenticado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUsuario(user);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  // Carrega transações do Firestore
  useEffect(() => {
    const carregarTransacoes = async () => {
      if (!usuario) return;

      const q = query(
        collection(db, 'transacoes'),
        where('userId', '==', usuario.uid),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransacoes(dados);
    };

    carregarTransacoes();
  }, [modalAberto, confirmaExclusao, usuario]);

  // Calcula totais
  useEffect(() => {
    let receitas = 0, despesas = 0;
    transacoes.forEach(t => {
      if (t.type === 'receita') receitas += t.amount;
      if (t.type === 'despesa') despesas += t.amount;
    });
    setTotalReceitas(receitas);
    setTotalDespesas(despesas);
    setSaldo(receitas - despesas);
  }, [transacoes]);

  const salvarTransacao = async dados => {
    try {
      if (editando) {
        const ref = doc(db, 'transacoes', editando.id);
        await updateDoc(ref, {
          ...dados,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'transacoes'), {
          ...dados,
          userId: usuario.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
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
    .filter(t => !filtroMes || new Date(t.date).getMonth() + 1 === +filtroMes)
    .filter(t => filtroCategoria === 'all' || t.category === filtroCategoria)
    .filter(t => filtroTipo === 'all' || t.type === filtroTipo)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const logout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  if (carregando) {
    return (
      <div className="h-screen flex items-center justify-center text-teal-700 text-lg font-medium">
        Carregando...
      </div>
    );
  }

  if (!usuario) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 text-gray-800">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-extrabold text-teal-600">💸 Gestão de Finanças</h1>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Sair</button>
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
