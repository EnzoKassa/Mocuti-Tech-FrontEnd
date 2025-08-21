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

export function formatCpf(cpf) {
    return cpf.replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
};

export function formatTelefone(tel) {
    return tel.replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
        .slice(0, 15);
};

export function formatCep(cep) {
    return cep.replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 9);
};

export function formatEmail(email) {
  return email ? email.trim() : '';
};

// para importar: import { formatNomeCompleto, formatCpf, formatTelefone, formatCep, formatEmail } from '../utils/formatUtils';
