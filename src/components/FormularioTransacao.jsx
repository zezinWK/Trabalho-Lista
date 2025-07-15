// components/FormularioTransacao.jsx
import { useEffect, useState } from 'react';

export default function FormularioTransacao({
  aberto,
  onCancelar,
  onSalvar,
  transacaoEditando
}) {
  const [tipo, setTipo] = useState('receita');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('alimentacao');
  const [datahora, setDatahora] = useState('');

  useEffect(() => {
    if (transacaoEditando) {
      setTipo(transacaoEditando.Tipo);
      setDescricao(transacaoEditando.Descrição);
      setValor(transacaoEditando.Valor.toFixed(2));
      setCategoria(transacaoEditando.Categoria);
      setDatahora(transacaoEditando.DataHora);
    } else {
      setTipo('receita');
      setDescricao('');
      setValor('');
      setCategoria('alimentacao');
      setDatahora('');
    }
  }, [transacaoEditando]);

  const formatarValorInput = valor => {
    let v = valor.replace(/[^\d]/g, '');
    if (v.length > 6) v = v.slice(0, 6);
    const parteInteira = v.slice(0, -2) || '0';
    const parteDecimal = v.slice(-2);
    return `${parseInt(parteInteira)}.${parteDecimal}`;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (!descricao || !valor || !datahora || valorNumerico <= 0) return;

    const dados = {
      Tipo: tipo,
      Descrição: descricao,
      Valor: Math.round(valorNumerico * 100) / 100,
      Categoria: categoria,
      DataHora: datahora
    };

    onSalvar(dados);
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-xl animate-scale-in mx-4">
        <h2 className="text-2xl font-bold text-teal-700 mb-4">{transacaoEditando ? 'Editar Transação' : 'Adicionar Transação'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100">
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
          <input type="text" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100" required />
          <input
            type="text"
            placeholder="Valor (R$)"
            inputMode="numeric"
            value={valor}
            onChange={e => setValor(formatarValorInput(e.target.value))}
            className="w-full p-3 border rounded-lg bg-gray-100"
            required
          />
          <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100">
            <option value="alimentacao">Alimentação</option>
            <option value="transporte">Transporte</option>
            <option value="saude">Saúde</option>
            <option value="educacao">Educação</option>
            <option value="trabalho">Trabalho</option>
            <option value="outro">Outro</option>
          </select>
          <input type="datetime-local" value={datahora} onChange={e => setDatahora(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100" required />
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onCancelar} className="px-5 py-2 rounded-md bg-gray-300 hover:bg-gray-400">Cancelar</button>
            <button type="submit" className="px-5 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white">
              {transacaoEditando ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
