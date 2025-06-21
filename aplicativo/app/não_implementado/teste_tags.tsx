// Código para testar se as tags funcionam

import React from 'react';
import { View, Button, Alert } from 'react-native';
import {
  criarAvaliacao,
  buscarAvaliacao,
  atualizarAvaliacao,
  deletarAvaliacao,
} from './tags';

export default function TesteCrudComponent() {
  async function testeCRUD() {
    try {
      const novaAvaliacao = {
        usuario: 'uid_teste',
        filme: 'filme_teste',
        assistido: true,
        quero_assistir: false,
        adorei: true,
        nao_gostei: false,
        nao_tenho_interesse: false,
        gostei: true,
        amei: false,
        abandonado: false,
        nota: 8,
      };

      const criada = await criarAvaliacao(novaAvaliacao);
      console.log('Avaliação criada:', criada);

      const avaliada = await buscarAvaliacao(criada.id);
      console.log('Avaliação buscada:', avaliada);

      await atualizarAvaliacao(criada.id, { nota: 10 });
      console.log('Avaliação atualizada');

      const atualizada = await buscarAvaliacao(criada.id);
      console.log('Avaliação atualizada:', atualizada);

      await deletarAvaliacao(criada.id);
      console.log('Avaliação deletada');

      // Confirmar exclusão
      try {
        await buscarAvaliacao(criada.id);
        Alert.alert('Erro', 'Avaliação ainda existe após exclusão!');
      } catch {
        Alert.alert('Sucesso', 'Avaliação criada, atualizada e removida com sucesso!');
      }
    } catch (error) {
      console.error('Erro no teste CRUD:', error);
      Alert.alert('Erro', 'Falha no teste CRUD. Veja o console.');
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Button title="Testar CRUD Avaliação" onPress={testeCRUD} />
    </View>
  );
}
