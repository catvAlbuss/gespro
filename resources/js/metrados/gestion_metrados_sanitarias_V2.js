import Sistema from './metradosSanitaria/sistema.js';
import { ExcelExport } from './metradosSanitaria/ExcelExport.js';

const sistema = new Sistema();
const excelExport = new ExcelExport(sistema);