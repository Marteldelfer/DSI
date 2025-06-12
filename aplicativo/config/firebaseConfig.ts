// aplicativo/config/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Suas credenciais de configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBSJKGvUTTElI9k5slFAMiU-SzR_zNxQTE",
  authDomain: "filmeia.firebaseapp.com",
  projectId: "filmeia",
  storageBucket: "filmeia.firebasestorage.app",
  messagingSenderId: "915638218391",
  appId: "1:915638218391:web:6491d04d221150fae583d2"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Obtém a instância de autenticação
export const auth = getAuth(app);