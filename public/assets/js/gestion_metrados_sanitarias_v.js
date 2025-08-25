import Sistema from './metrados/sistema.js';
import { ExcelExport } from './metrados/ExcelExport.js';

const sistema = new Sistema();
const excelExport = new ExcelExport(sistema);