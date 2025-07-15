// components/ListaTransacoes.jsx
export default function ListaTransacoes({ transacoes, onEditar, onExcluir }) {
    if (transacoes.length === 0) {
      return <p className="text-gray-500 italic text-center mt-6">Nenhuma transação encontrada.</p>;
    }
  
    return (
      <section className="mt-6 overflow-x-auto">
        <ul className="space-y-4">
          {transacoes.map(t => (
            <li key={t.id} className="bg-gray-100 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
              <div className="flex-1">
                <p className="font-semibold text-gray-700 break-words">{t.Descrição}</p>
                <p className="text-sm text-gray-500">{new Date(t.DataHora).toLocaleString()} — {t.Categoria}</p>
              </div>
              <p className={`font-bold ${t.Tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                {t.Tipo === 'despesa' && t.Valor > 0 ? 'R$ -' : 'R$ '}{t.Valor.toFixed(2)}
              </p>
              <div className="flex gap-2">
                <button onClick={() => onEditar(t)} className="px-3 py-1 bg-teal-400 hover:bg-teal-500 text-white rounded-md">Editar</button>
                <button onClick={() => onExcluir(t.id)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  