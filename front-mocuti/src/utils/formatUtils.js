// Funções de formatação
export function formatNomeCompleto(nome) {
    return nome
        .split(' ') //Transforma a palavra em um array
        .map(word => {
            if (word.length <= 2) {
                return word.toLowerCase(); // palavras curtas ficam minúsculas
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // palavras maiores capitalizam
        })
        .join(' '); // usado para juntar
};

export function formatCpf(cpfInput) {

     // Remove tudo que não é número
  let cpf = cpfInput.replace(/\D/g, '');

  // Limita a 11 dígitos
  if (cpf.length > 11) cpf = cpf.slice(0, 11);

  // Formata apenas se tiver algum número
  if (cpf.length === 0) return '';

    return cpf.replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
};

export function formatTelefone(telInput) {
  // Remove tudo que não é número
  let tel = telInput.replace(/\D/g, '');

  // Limita a 11 dígitos (DD + 9 dígitos)
  if (tel.length > 11) tel = tel.slice(0, 11);

  // Formata telefone
  if (tel.length <= 10) {
    // Formato sem 9º dígito extra: (DD) XXXX-XXXX
    return tel.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  } else {
    // Formato com 9º dígito: (DD) 9XXXX-XXXX
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

export function formatCep(cep) {
    return cep.replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 9);
};

export function formatEmail(email) {
  return email ? email.trim() : '';
};

console.log(formatNomeCompleto("joao da silva")); // "Joao da Silva"
console.log(formatCpf("12345678901"));           // "123.456.789-01"
console.log(formatTelefone("11987654321"));      // "(11) 98765-4321"
console.log(formatCep("12345678"));              // "12345-678"
console.log(formatEmail("   teste@email.com "))

// para importar: import { formatNomeCompleto, formatCpf, formatTelefone, formatCep, formatEmail } from '../utils/formatUtils';
