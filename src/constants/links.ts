import dotenv from 'dotenv';

dotenv.config();

const apiURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1350';

export const GitHub: string = 'https://github.com/RuanLopes1350';
export const LinkedIn: string = 'https://www.linkedin.com/in/ruan-lopes-1350s';
export const Version: string = '0.0.3';
export const Documentacao: string = `${apiURL}/api-docs`;
export const Tutorial: string = '#';
export const Privacidade: string = '#';
