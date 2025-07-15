// components/Login.jsx
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Login({ onLogin }) {
  const loginComGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const resultado = await signInWithPopup(auth, provider);
      onLogin(resultado.user);
    } catch (erro) {
      console.error('Erro ao fazer login:', erro);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-teal-700 mb-6">Bem-vindo(a) 👋</h1>
        <p className="text-gray-600 mb-4">Faça login com sua conta Google para continuar.</p>
        <button
          onClick={loginComGoogle}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium shadow"
        >
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
