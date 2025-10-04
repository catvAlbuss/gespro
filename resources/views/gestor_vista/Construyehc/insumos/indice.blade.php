<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-bold text-2xl text-gray-800 dark:text-gray-100">📊 Índices Empresariales</h2>
        </div>
    </x-slot>

    <div class="py-10 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl -mt-16 mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <!-- Success Message -->
            <?php if (session('success')): ?>
            <div
                class="bg-green-100 border-l-4 border-green-500 text-green-700 dark:bg-green-900 dark:text-green-200 p-4 rounded mb-6 animate-fade-in">
                <?php echo session('success'); ?>
            </div>
            <?php endif; ?>

            <!-- Search and Filter -->
            <div class="mb-6 flex flex-col sm:flex-row gap-4">
                <div class="relative flex-1">
                    <input type="text" id="searchInput" placeholder="Buscar índices..."
                        class="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <select id="filterColumn"
                    class="px-4 py-2 border rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200">
                    <option value="all">Todas las columnas</option>
                    <option value="id">ID</option>
                    <option value="codigo">Código</option>
                    <option value="descripcion">Descripción</option>
                </select>
                <button onclick="openCreateModal()"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-200">
                    + Nuevo Índice
                </button>
            </div>

            <!-- Table -->
            <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table id="indicesTable" class="min-w-full text-sm text-left">
                        <thead class="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            <tr>
                                <th class="px-6 py-3">ID</th>
                                <th class="px-6 py-3">Código</th>
                                <th class="px-6 py-3">Descripción</th>
                                <th class="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody" class="text-gray-800 dark:text-gray-100">
                            <?php foreach ($indices as $indice): ?>
                            <tr class="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-100"
                                data-id="<?php echo $indice->id; ?>" data-codigo="<?php echo $indice->codigo; ?>"
                                data-descripcion="<?php echo $indice->descripcion; ?>">
                                <td class="px-6 py-4"><?php echo $indice->id; ?></td>
                                <td class="px-6 py-4"><?php echo $indice->codigo; ?></td>
                                <td class="px-6 py-4"><?php echo $indice->descripcion; ?></td>
                                <td class="px-6 py-4 space-x-2 flex">
                                    <button
                                        onclick="openEditModal(<?php echo $indice->id; ?>, '<?php echo $indice->codigo; ?>', '<?php echo $indice->descripcion; ?>')"
                                        class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-3 py-1 rounded-lg shadow-sm transition duration200">
                                        ✏️ Editar
                                    </button>
                                    <form action="<?php echo route('insumosAcu.destroy', $indice->id); ?>" method="POST" class="inline">
                                        <?php echo csrf_field(); ?>
                                        <?php echo method_field('DELETE'); ?>
                                        <button onclick="return confirm('¿Eliminar este índice?')"
                                            class="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded-lg shadow-sm transition duration-200">
                                            🗑️ Eliminar
                                        </button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Pagination -->
            <div class="flex justify-between items-center mt-4">
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-700 dark:text-gray-300">Filas por página:</span>
                    <select id="itemsPerPage"
                        class="px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                        <option value="5">5</option>
                        <option value="25" selected>25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="500">500</option>
                    </select>
                </div>
                <div id="pagination" class="flex space-x-1">
                    <!-- Pagination buttons will be dynamically generated -->
                </div>
                <div class="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando <span id="pageInfo">1-10</span> de <span id="totalItems"><?php echo count($indices); ?></span>
                    índices
                </div>
            </div>

            <!-- Create Modal -->
            <div id="createModal"
                class="fixed inset-0 bg-black bg-opacity-60 hidden z-50 flex items-center justify-center transition-opacity duration-300">
                <div
                    class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform scale-95 transition-transform duration-300">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">➕ Nuevo Índice</h3>
                    <form method="POST" action="<?php echo route('insumosAcu.store'); ?>">
                        <?php echo csrf_field(); ?>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Código</label>
                            <input type="number" name="codigo" required
                                class="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200">
                        </div>
                        <div class="mb-4">
                            <label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
                            <input type="text" name="descripcion" required
                                class="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200">
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="closeCreateModal()"
                                class="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200">
                                Cancelar
                            </button>
                            <button type="submit"
                                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition duration-200">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Edit Modal -->
            <div id="editModal"
                class="fixed inset-0 bg-black bg-opacity-60 hidden z-50 flex items-center justify-center transition-opacity duration-300">
                <div
                    class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform scale-95 transition-transform duration-300">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">✏️ Editar Índice</h3>
                    <form id="editForm" method="POST">
                        <?php echo csrf_field(); ?>
                        <?php echo method_field('PUT'); ?>
                        <input type="hidden" name="id" id="edit_id">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Código</label>
                            <input type="number" name="codigo" id="edit_codigo" required
                                class="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200">
                        </div>
                        <div class="mb-4">
                            <label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
                            <input type="text" name="descripcion" id="edit_descripcion" required
                                class="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200">
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="closeEditModal()"
                                class="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200">
                                Cancelar
                            </button>
                            <button type="submit"
                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition duration-200">
                                Actualizar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <script>
            // Modal Functions (unchanged)
            function openCreateModal() {
                const modal = document.getElementById('createModal');
                modal.classList.remove('hidden');
                setTimeout(() => modal.querySelector('div').classList.remove('scale-95'), 10);
            }

            function closeCreateModal() {
                const modal = document.getElementById('createModal');
                modal.querySelector('div').classList.add('scale-95');
                setTimeout(() => modal.classList.add('hidden'), 300);
            }

            function openEditModal(id, codigo, descripcion) {
                document.getElementById('edit_id').value = id;
                document.getElementById('edit_codigo').value = codigo;
                document.getElementById('edit_descripcion').value = descripcion;
                document.getElementById('editForm').action = `/indices/${id}`;
                const modal = document.getElementById('editModal');
                modal.classList.remove('hidden');
                setTimeout(() => modal.querySelector('div').classList.remove('scale-95'), 10);
            }

            function closeEditModal() {
                const modal = document.getElementById('editModal');
                modal.querySelector('div').classList.add('scale-95');
                setTimeout(() => modal.classList.add('hidden'), 300);
            }

            // Normalize string for case-insensitive and accent-insensitive search
            function normalizeString(str) {
                return str
                    .toLowerCase()
                    .normalize("NFD") // Decompose accents
                    .replace(/[\u0300-\u036f]/g, ""); // Remove diacritical marks
            }

            // Search and Pagination Logic
            const searchInput = document.getElementById('searchInput');
            const filterColumn = document.getElementById('filterColumn');
            const tableBody = document.getElementById('tableBody');
            const itemsPerPageSelect = document.getElementById('itemsPerPage');
            const paginationContainer = document.getElementById('pagination');
            const pageInfo = document.getElementById('pageInfo');
            const totalItemsSpan = document.getElementById('totalItems');

            let currentPage = 1;
            let itemsPerPage = parseInt(itemsPerPageSelect.value);
            let indices = Array.from(tableBody.querySelectorAll('tr')).map(row => ({
                id: row.dataset.id,
                codigo: row.dataset.codigo,
                descripcion: row.dataset.descripcion,
                element: row
            }));

            function filterIndices() {
                const searchValue = normalizeString(searchInput.value);
                const filter = filterColumn.value;

                return indices.filter(indice => {
                    if (filter === 'all') {
                        return (
                            normalizeString(indice.id).includes(searchValue) ||
                            normalizeString(indice.codigo).includes(searchValue) ||
                            normalizeString(indice.descripcion).includes(searchValue)
                        );
                    } else {
                        return normalizeString(indice[filter]).includes(searchValue);
                    }
                });
            }

            function renderTable(filteredIndices) {
                const start = (currentPage - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const paginatedIndices = filteredIndices.slice(start, end);

                tableBody.innerHTML = '';
                paginatedIndices.forEach(indice => tableBody.appendChild(indice.element));

                updatePagination(filteredIndices.length);
                updatePageInfo(start + 1, Math.min(end, filteredIndices.length), filteredIndices.length);
            }

            function updatePagination(totalItems) {
                const pageCount = Math.ceil(totalItems / itemsPerPage);
                paginationContainer.innerHTML = '';

                // Maximum number of page buttons to show at once
                const maxVisibleButtons = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
                let endPage = Math.min(pageCount, startPage + maxVisibleButtons - 1);

                // Adjust startPage if endPage is at the limit
                if (endPage === pageCount) {
                    startPage = Math.max(1, endPage - maxVisibleButtons + 1);
                }

                // Previous Button
                const prevButton = document.createElement('button');
                prevButton.textContent = '«';
                prevButton.className =
                    `px-3 py-1 border rounded dark:border-gray-600 dark:text-gray-200 transition duration-200 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`;
                prevButton.disabled = currentPage === 1;
                prevButton.onclick = () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderTable(filterIndices());
                    }
                };
                paginationContainer.appendChild(prevButton);

                // Add ellipsis if startPage > 1
                if (startPage > 1) {
                    const firstPageButton = document.createElement('button');
                    firstPageButton.textContent = '1';
                    firstPageButton.className =
                        'px-3 py-1 border rounded dark:border-gray-600 dark:text-gray-200 transition duration-200 hover:bg-gray-100 dark:hover:bg-gray-700';
                    firstPageButton.onclick = () => {
                        currentPage = 1;
                        renderTable(filterIndices());
                    };
                    paginationContainer.appendChild(firstPageButton);

                    if (startPage > 2) {
                        const ellipsis = document.createElement('span');
                        ellipsis.textContent = '...';
                        ellipsis.className = 'px-3 py-1 text-gray-500';
                        paginationContainer.appendChild(ellipsis);
                    }
                }

                // Page Numbers
                for (let i = startPage; i <= endPage; i++) {
                    const pageButton = document.createElement('button');
                    pageButton.textContent = i;
                    pageButton.className =
                        `px-3 py-1 border rounded dark:border-gray-600 dark:text-gray-200 transition duration-200 ${i === currentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`;
                    pageButton.onclick = () => {
                        currentPage = i;
                        renderTable(filterIndices());
                    };
                    paginationContainer.appendChild(pageButton);
                }

                // Add ellipsis if endPage < pageCount
                if (endPage < pageCount) {
                    if (endPage < pageCount - 1) {
                        const ellipsis = document.createElement('span');
                        ellipsis.textContent = '...';
                        ellipsis.className = 'px-3 py-1 text-gray-500';
                        paginationContainer.appendChild(ellipsis);
                    }

                    const lastPageButton = document.createElement('button');
                    lastPageButton.textContent = pageCount;
                    lastPageButton.className =
                        'px-3 py-1 border rounded dark:border-gray-600 dark:text-gray-200 transition duration-200 hover:bg-gray-100 dark:hover:bg-gray-700';
                    lastPageButton.onclick = () => {
                        currentPage = pageCount;
                        renderTable(filterIndices());
                    };
                    paginationContainer.appendChild(lastPageButton);
                }

                // Next Button
                const nextButton = document.createElement('button');
                nextButton.textContent = '»';
                nextButton.className =
                    `px-3 py-1 border rounded dark:border-gray-600 dark:text-gray-200 transition duration-200 ${currentPage === pageCount ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`;
                nextButton.disabled = currentPage === pageCount;
                nextButton.onclick = () => {
                    if (currentPage < pageCount) {
                        currentPage++;
                        renderTable(filterIndices());
                    }
                };
                paginationContainer.appendChild(nextButton);
            }

            function updatePageInfo(start, end, total) {
                pageInfo.textContent = `${start}-${end}`;
                totalItemsSpan.textContent = total;
            }

            // Event Listeners
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentPage = 1;
                    renderTable(filterIndices());
                }, 500);
            });

            filterColumn.addEventListener('change', () => {
                currentPage = 1;
                renderTable(filterIndices());
            });

            itemsPerPageSelect.addEventListener('change', () => {
                itemsPerPage = parseInt(itemsPerPageSelect.value);
                currentPage = 1;
                renderTable(filterIndices());
            });

            // Initial Render
            renderTable(filterIndices());
        </script>

        <style>
            /* Animation for fade-in */
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }

                to {
                    opacity: 1;
                }
            }

            .animate-fade-in {
                animation: fadeIn 0.5s ease-in;
            }

            #pagination {
                max-width: 100%;
                overflow-x: auto;
                white-space: nowrap;
            }
        </style>
    </div>
</x-app-layout>
