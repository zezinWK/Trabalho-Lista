// components/Filtros.jsx
export default function Filtros({
    filtroMes,
    setFiltroMes,
    filtroCategoria,
    setFiltroCategoria,
    filtroTipo,
    setFiltroTipo,
    limparFiltros
  }) {
    return (
      <section className="mt-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="flex-grow p-3 rounded-lg border bg-gray-100">
            <option value="">Todos os meses</option>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>
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
        <button onClick={limparFiltros} className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg w-full sm:w-auto">Limpar Filtros</button>
      </section>
    );
  }
  