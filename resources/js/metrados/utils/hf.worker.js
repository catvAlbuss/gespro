// 1. AGREGAR: Web Worker para cálculos
// worker.js
self.onmessage = (e) => {
  const { rows } = e.data;
  const calculated = rows.map(calculateRow);
  const totals = calculateTotals(calculated);
  self.postMessage(totals);
};

// 2. AGREGAR: IndexedDB para caché local
const saveToCache = async (rows) => {
  const db = await openDB('metrado', 1);
  await db.put('rows', rows);
};

// 3. AGREGAR: Paginación del backend
const loadPage = async (page, perPage = 1000) => {
  const response = await fetch(`/api/metrado?page=${page}&per_page=${perPage}`);
  return response.json();
};
```

### **Arquitectura Recomendada:**
```
  // Frontend (React)
  // ├── Virtualización ✅
  // ├── Web Worker (cálculos)
  // ├── IndexedDB (caché offline)
  // └── API calls (Laravel)

  // Backend (Laravel)
  // ├── PostgreSQL/MySQL
  // ├── API REST con paginación
  // ├── Export jobs (Queue)
  // └── Validación de datos