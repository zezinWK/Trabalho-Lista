import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../fireBase/config';

export default function Login() {
  const loginComGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const resultado = await signInWithPopup(auth, provider);
      const user = resultado.user;

      // Verifica se o usuário já existe na coleção "users"
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Não é necessário chamar onLogin aqui — o App já detecta o login.
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
