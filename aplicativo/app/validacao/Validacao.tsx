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
  if (senha !== confirmarSenha) {
    msgVal.mensagemConfirmacao = "Senha diferente da confirmação";
  }
  return msgVal;
}

export function validarCadastro(nome: string, email: string, senha: string, confirmarSenha: string): boolean {
  const valEmail = validarEmail(email);
  const valSenha = validarSenha(senha);

  if (senha !== confirmarSenha) {
    return false // TODO melhorar mensagens de erro
  }
  if (!(valEmail && valSenha.tamanhoValido)) {
    return false;
  }
  const novoUsuario: usuario = {
    nome: nome,
    email: email,
    senha: senha // TODO criptografar senha
  }
  // TODO Salvar no banco de 
  return true;
}