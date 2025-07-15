// components/ModalConfirmacao.jsx
export default function ModalConfirmacao({ aberto, onCancelar, onConfirmar, transacao }) {
    if (!aberto || !transacao) return null;
  
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-xl animate-scale-in mx-4 text-center">
          <p className="text-lg mb-4">Tem certeza que deseja excluir <strong>{transacao.Descrição}</strong>?</p>
          <div className="flex justify-center gap-3">
            <button onClick={onCancelar} className="px-5 py-2 rounded-md bg-gray-300 hover:bg-gray-400">Cancelar</button>
            <button onClick={onConfirmar} className="px-5 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white">Excluir</button>
          </div>
        </div>
      </div>
    );
  }
