// SUBSTITUA O CONTEÚDO DE: aplicativo/src/validacao/Validacao.tsx

export const validarSenha = (senha: string) => {
  // Verificação de segurança para prevenir o crash.
  // Se a senha não for uma string válida, retorna um estado padrão.
  if (!senha || typeof senha !== 'string') {
    return {
      temMaiuscula: false,
      temMinuscula: false,
      temDigito: false,
      temCaractereEspecial: false,
      tamanhoValido: false,
    };
  }

  // A partir daqui, o código só roda se 'senha' for uma string.
  const temMaiuscula = !!senha.match(/[A-Z]/);
  const temMinuscula = !!senha.match(/[a-z]/);
  const temDigito = !!senha.match(/[0-9]/);
  const temCaractereEspecial = !!senha.match(/[\W_]/); // Verifica qualquer caractere que não seja letra ou número
  const tamanhoValido = senha.length >= 8;

  return {
    temMaiuscula,
    temMinuscula,
    temDigito,
    temCaractereEspecial,
    tamanhoValido,
  };
};