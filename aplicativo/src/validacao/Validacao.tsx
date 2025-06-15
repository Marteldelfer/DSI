// aplicativo/src/validacao/Validacao.tsx
export function validarSenha(senha: string) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(senha);
    const hasLowerCase = /[a-z]/.test(senha);
    const hasDigit = /[0-9]/.test(senha);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(senha);

    const isLongEnough = senha.length >= minLength;
    const isComplex = hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;

    let forca = 0;
    if (isLongEnough) forca++;
    if (hasUpperCase) forca++;
    if (hasLowerCase) forca++;
    if (hasDigit) forca++;
    if (hasSpecialChar) forca++;

    let valido = isLongEnough && forca >= 4;

    return {
        valido: valido,
        tamanhoValido: isLongEnough,
        temMaiuscula: hasUpperCase,
        temMinuscula: hasLowerCase,
        temDigito: hasDigit,
        temCaractereEspecial: hasSpecialChar,
        forca: forca
    };
}