// components/ResumoFinanceiro.jsx
export default function ResumoFinanceiro({ receitas, despesas, saldo }) {
    return (
      <section className="mt-8 flex flex-col sm:flex-row justify-around gap-4 bg-transparent rounded-lg p-4">
        <div className="text-center p-4 rounded-lg whitespace-nowrap bg-teal-50">
          <p className="text-sm font-semibold text-teal-700">Receitas</p>
          <p className="text-xl font-bold text-green-600">R$ {receitas.toFixed(2)}</p>
        </div>
        <div className="text-center p-4 rounded-lg whitespace-nowrap bg-teal-50">
          <p className="text-sm font-semibold text-teal-700">Despesas</p>
          <p className="text-xl font-bold text-red-600">{despesas > 0 ? 'R$ -' : 'R$ '}{despesas.toFixed(2)}</p>
        </div>
        <div className="text-center p-4 rounded-lg whitespace-nowrap bg-teal-50">
          <p className="text-sm font-semibold text-teal-700">Saldo</p>
          <p className={`text-xl font-bold ${saldo < 0 ? 'text-red-600' : 'text-green-700'}`}>{saldo < 0 ? 'R$ -' : 'R$ '}{Math.abs(saldo).toFixed(2)}</p>
        </div>
      </section>
    );
  }
  