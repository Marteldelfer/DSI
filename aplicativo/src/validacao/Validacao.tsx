// aplicativo/app/validacao/Validacao.tsx
export type validacaoSenha = {
    tamanhoValido: boolean;
    contemMinuscula: boolean;
    contemMaiuscula: boolean;
    contemNumero: boolean;
    contemSimbolo: boolean;
}

export type usuario = {
  nome: string,
  email: string,
  senha: string
}

export type mensageValidacao = {
  mensagemNome: string,
  mensagemEmail: string,
  mensagemSenha: string,
  mensagemConfirmacao: string
}

export function validarSenha(senha: string): validacaoSenha {
    const resValidacao: validacaoSenha = {
        tamanhoValido: false,
        contemMinuscula: false,
        contemMaiuscula: false,
        contemNumero: false,
        contemSimbolo: false
    };
    resValidacao.tamanhoValido = senha.length >= 6;
    resValidacao.contemMinuscula = senha.match(/[a-z]/g) ? true : false;
    resValidacao.contemMaiuscula = senha.match(/[A-Z]/g) ? true : false;
    resValidacao.contemNumero = senha.match(/[0-9]/g) ? true : false;
    resValidacao.contemSimbolo = senha.match(
        /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?-]/
    ) ? true : false;
    return resValidacao;
}

export function validarEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

export function gerarMensagemValidacao(nome: string, email: string, senha: string, confirmarSenha: string): mensageValidacao {
  const msgVal: mensageValidacao = {
    mensagemNome: "",
    mensagemEmail: "",
    mensagemSenha: "",
    mensagemConfirmacao: ""
  }
  if (nome.length === 0) {
    msgVal.mensagemNome = "Nome é obrigatório";
  }
  if (!validarEmail(email)) {
    msgVal.mensagemEmail = "Email inválido";
  }
  if (!validarSenha(senha).tamanhoValido) {
    msgVal.mensagemSenha = "Senha muito curta!";
  }
  // Adiciona mais validações de força de senha, se desejar
  if (validarSenha(senha).tamanhoValido && !validarSenha(senha).contemMaiuscula) {
    msgVal.mensagemSenha = "A senha deve conter pelo menos uma letra maiúscula.";
  }
  if (validarSenha(senha).tamanhoValido && !validarSenha(senha).contemMinuscula) {
    msgVal.mensagemSenha = "A senha deve conter pelo menos uma letra minúscula.";
  }
  if (validarSenha(senha).tamanhoValido && !validarSenha(senha).contemNumero) {
    msgVal.mensagemSenha = "A senha deve conter pelo menos um número.";
  }
  if (validarSenha(senha).tamanhoValido && !validarSenha(senha).contemSimbolo) {
    msgVal.mensagemSenha = "A senha deve conter pelo menos um símbolo.";
  }

  if (senha !== confirmarSenha) {
    msgVal.mensagemConfirmacao = "As senhas não coincidem.";
  }
  return msgVal;
}

export function validarCadastro(nome: string, email: string, senha: string, confirmarSenha: string): boolean {
  const msgVal = gerarMensagemValidacao(nome, email, senha, confirmarSenha);

  // Se qualquer mensagem de validação não estiver vazia, o cadastro é inválido
  const isValid = Object.values(msgVal).every(msg => msg === "");

  if (!isValid) {
    // Você pode logar as mensagens de erro aqui para depuração
    console.log("Erros de validação:", msgVal);
    return false;
  }

  // Com a integração Firebase, não é necessário "criptografar senha" manualmente aqui,
  // pois o Firebase Authentication lida com isso de forma segura.
  const novoUsuario: usuario = {
    nome: nome,
    email: email,
    senha: senha // O Firebase irá hash esta senha com segurança
  }
  // TODO: Salvar informações adicionais do usuário (como o nome) em outro serviço do Firebase (ex: Cloud Firestore)
  // return true se a validação local for bem-sucedida, antes de tentar o Firebase.
  return true;
}