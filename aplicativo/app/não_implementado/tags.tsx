import { db } from '../../src/config/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

// algumas como gostei e não gostei são opostas e podem ser uma só, mas também precisa existir um valor nulo entre elas. TO DO: Revisar isso
export type Avaliacao = {
  usuario: string; // UID
  filme: string;   // ID do filme
  assistido: boolean;
  quero_assistir: boolean;
  adorei: boolean;
  nao_gostei: boolean;
  nao_tenho_interesse: boolean;
  gostei: boolean;
  amei: boolean;
  abandonado: boolean;
  nota: number;
};


const colecao = collection(db, 'avaliacoes');

// CREATE
export async function criarAvaliacao(data: Avaliacao) {
  const docRef = await addDoc(colecao, data);
  return { id: docRef.id, ...data };
}

// READ ALL
export async function listarAvaliacoes(): Promise<(Avaliacao & { id: string })[]> {
  const ref = collection(db, 'avaliacoes');
  const snapshot = await getDocs(ref);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Avaliacao),
  }));
}

// READ ONE
export async function buscarAvaliacao(id: string): Promise<Avaliacao & { id: string }> {
  const ref = doc(db, 'avaliacoes', id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error('Avaliação não encontrada');
  }

  return {
    id: snap.id,
    ...(snap.data() as Avaliacao),
  };
}

// UPDATE
export async function atualizarAvaliacao(id: string, data: Partial<Avaliacao>) {
  const docRef = doc(db, 'avaliacoes', id);
  await updateDoc(docRef, data);
}

// DELETE
export async function deletarAvaliacao(id: string) {
  const docRef = doc(db, 'avaliacoes', id);
  await deleteDoc(docRef);
}
