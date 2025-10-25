
import { createApp, ref, computed, onMounted, watch } from 'vue';
const { empresaId, csrfToken, Logo } = window.APP_INIT || {};
const { jsPDF } = window.jspdf || {};

createApp({
    setup() {
        const activeTab = ref('trabajador'); // 'trabajador' | 'proyecto'
        const mes = ref(new Date().getMonth() + 1);
        const anio = ref(new Date().getFullYear());
        const loading = ref(false);
        const reporteData = ref([]);

        const meses = Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: new Date(0, i).toLocaleString('es-ES', { month: 'long' })
        }));

        // Cambiar pestaña
        const cambiarTab = (tab) => {
            activeTab.value = tab;
            cargarReporte();
        };

        // ✅ Función principal de carga de reporte
        const cargarReporte = async () => {
            loading.value = true;

            const endpoint =
                activeTab.value === 'trabajador'
                    ? `/reportes/general/${empresaId}/datos`
                    : `/reportes/general/${empresaId}/datos/proyecto`;

            try {
                const url = `${endpoint}?mes=${mes.value}&anio=${anio.value}`;

                const response = await fetch(url, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error al cargar datos (${response.status})`);
                }

                reporteData.value = await response.json();
            } catch (err) {
                console.error('Error al cargar reporte:', err);
                reporteData.value = [];
                alert(`No se pudieron cargar los datos del reporte de ${activeTab.value}.`);
            } finally {
                loading.value = false;
            }
        };

        // 🔢 Calcular totales
        const totalPorStatus = (status, campo) => {
            return reporteData.value
                .reduce((sum, item) => sum + (item[status]?.[campo] || 0), 0)
                .toFixed(2);
        };

        // 🧾 Generar PDF

        const generarPDF = () => {
            if (reporteData.value.length === 0) return;

            const id_empresa = parseInt(empresaId);

            const empresaInfo = {
                1: { nombre: "Rizabal & Asociados ING. Estruc", cargo: "Sub Gerente de Estructuras", logo: Logo[1] },
                2: { nombre: "CONSTRUYE HCO", cargo: "Sub Gerente de Estudios", logo: Logo[2] },
                3: { nombre: "SEVEN HEART", cargo: "Sub Gerente de Obras", logo: Logo[3] },
                4: { nombre: "DML Arquitectos", cargo: "Sub Gerente de Arquitectura", logo: Logo[4] },
                5: { nombre: "HYPERIUM", cargo: "Sub Gerente de Informática", logo: Logo[5] }
            }[id_empresa] || { nombre: "Empresa no reconocida", cargo: "Cargo no definido", logo: Logo[2] };

            const jefeInfo = {
                1: { name: "LUIS DANIEL", surname: "ARGANDOÑA PILCO", tipoGerencia: "ÁREA ESTRUCTURAS" },
                2: { name: "JOSE EDUARDO", surname: "NIEVES CUADROS", tipoGerencia: "ÁREA OFICINA TÉCNICA" },
                3: { name: "CESAR RICARDO", surname: "ZELADA RODRIGUEZ", tipoGerencia: "ÁREA CAMPO" },
                4: { name: "DORIS DEL PILAR", surname: "MEZA LÓPEZ", tipoGerencia: "ÁREA ARQUITECTURA" },
                5: { name: "EMERSON MESIAS", surname: "ESPINOZA SALAZAR", tipoGerencia: "ÁREA SISTEMAS" }
            }[id_empresa];

            const title =
                activeTab.value === 'trabajador'
                    ? `Reporte Mensual por Trabajador - ${meses.find(m => m.value === mes.value)?.label} ${anio.value}`
                    : `Reporte Mensual por Proyecto - ${meses.find(m => m.value === mes.value)?.label} ${anio.value}`;

            const date = new Date();
            const anioactual = date.getFullYear();
            const mesLabel = meses.find(m => m.value === mes.value)?.label?.toUpperCase();
            const primerDia = new Date(anioactual, date.getMonth(), 1).toLocaleDateString('es', { day: '2-digit', month: 'long' });
            const ultimoDia = new Date(anioactual, date.getMonth() + 1, 0).toLocaleDateString('es', { day: '2-digit', month: 'long' });
            const fechaActual = date.toLocaleString('es-PE');

            // === INICIO DEL PDF ===
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);

            // ENCABEZADO
            doc.text(`Informe N° 00${mes.value}-${anioactual}/${empresaInfo.nombre}`, 20, 20);
            doc.addImage(empresaInfo.logo, "JPEG", 135, 10, 60, 30);
            doc.setFont("courier", "bold");
            doc.setFontSize(10);
            doc.text("SEÑOR(A):", 20, 35);
            doc.setFont("courier", "normal");
            doc.text("Andrea Alexandra Paredes Sánchez", 45, 35);
            doc.setFont("courier", "bold");
            doc.text("Administradora", 45, 40);

            doc.text("DE:", 20, 45);
            doc.setFont("courier", "normal");
            doc.text(`${jefeInfo.name} ${jefeInfo.surname}`, 45, 45);
            doc.text(empresaInfo.cargo, 45, 50);

            doc.setFont("courier", "bold");
            doc.text("ASUNTO:", 20, 55);
            doc.setFont("courier", "normal");
            doc.text(`INFORME DE AVANCE MENSUAL DEL MES DE ${mesLabel} DEL ${anioactual}`, 45, 55);

            doc.setFont("courier", "bold");
            doc.text("FECHA:", 20, 60);
            doc.setFont("courier", "normal");
            doc.text(`HUÁNUCO, ${fechaActual}`, 45, 60);

            // CUERPO DEL DOCUMENTO
            doc.setFont("courier", "normal");
            doc.setFontSize(9);
            doc.text([
                "Por medio de la presente me es grato dirigirme a Ud. cordialmente y felicitarlo por la acertada labor",
                "que viene desempeñando. Así mismo, entrego a su despacho el informe de avance mensual del área,",
                "para ello se detalla a continuación:"
            ], 20, 70);

            doc.setFont("courier", "bold");
            doc.text(`REPORTE MENSUAL DE ${activeTab.value === 'trabajador' ? 'TRABAJADORES' : 'PROYECTOS'} - ${jefeInfo.tipoGerencia}`, 20, 85);
            doc.setFont("courier", "normal");
            doc.text(`Resumen de actividades del mes (${primerDia} hasta ${ultimoDia} del ${anioactual}):`, 20, 92);

            // === TABLA PRINCIPAL ===
            const columns = [
                activeTab.value === 'trabajador' ? 'Trabajador' : 'Proyecto',
                'TODO\n(Asig / Ejec)',
                'HACIENDO\n(Asig / Ejec)',
                'ECHO\n(Asig / Ejec)',
                'APROVADO\n(Asig / Ejec)'
            ];

            const rows = reporteData.value.map(item => {
                const base = activeTab.value === 'trabajador' ? item.usuario : item.proyecto;
                return [
                    base,
                    item.todo.tareas > 0 ? `${item.todo.diasAsignados} / ${item.todo.elapsed_time}\n(${item.todo.tareas})` : '-',
                    item.doing.tareas > 0 ? `${item.doing.diasAsignados} / ${item.doing.elapsed_time}\n(${item.doing.tareas})` : '-',
                    item.done.tareas > 0 ? `${item.done.diasAsignados} / ${item.done.elapsed_time}\n(${item.done.tareas})` : '-',
                    item.aproved.tareas > 0 ? `${item.aproved.diasAsignados} / ${item.aproved.elapsed_time}\n(${item.aproved.tareas})` : '-'
                ];
            });

            const totalRow = [
                'Totales',
                `${totalPorStatus('todo', 'diasAsignados')} / ${totalPorStatus('todo', 'elapsed_time')}`,
                `${totalPorStatus('doing', 'diasAsignados')} / ${totalPorStatus('doing', 'elapsed_time')}`,
                `${totalPorStatus('done', 'diasAsignados')} / ${totalPorStatus('done', 'elapsed_time')}`,
                `${totalPorStatus('aproved', 'diasAsignados')} / ${totalPorStatus('aproved', 'elapsed_time')}`
            ];
            rows.push(totalRow);

            doc.autoTable({
                startY: 100,
                head: [columns],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [240, 240, 240], textColor: 0 },
                didParseCell: (data) => {
                    if (data.row.index === rows.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [230, 230, 230];
                    }
                }
            });

            const nextY = doc.lastAutoTable.finalY + 15;

            // === CONCLUSIONES ===
            doc.setFont("courier", "bold");
            doc.setFontSize(10);
            doc.text("CONCLUSIONES:", 20, nextY);
            doc.setFont("courier", "normal");
            doc.setFontSize(9);
            doc.text("Durante el presente mes se ejecutaron las tareas asignadas de acuerdo al cronograma establecido.", 25, nextY + 7);

            // FIRMA / PIE
            doc.setFont("courier", "bold");
            doc.text("Atentamente,", 20, nextY + 30);
            doc.setFont("courier", "normal");
            doc.text(`${jefeInfo.name} ${jefeInfo.surname}`, 20, nextY + 40);
            doc.text(empresaInfo.cargo, 20, nextY + 45);
            doc.text(empresaInfo.nombre, 20, nextY + 50);

            doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
            // MOSTRAR EN PANTALLA
            // const pdfString = doc.output('datauristring');
            // const embed = document.createElement('embed');
            // embed.setAttribute('src', pdfString);
            // embed.setAttribute('width', '100%');
            // embed.setAttribute('height', '100%');

            // const container = document.getElementById('mostrarInformePago');
            // container.innerHTML = '';
            // container.appendChild(embed);
        };


        // 🧩 Watchers reactivos automáticos para mes y año
        let debounceTimer = null;
        watch([mes, anio], () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                cargarReporte();
            }, 400); // 🔁 Espera 400ms antes de recargar (evita múltiples llamadas)
        });

        // Al montar el componente
        onMounted(() => {
            cargarReporte();
        });

        return {
            activeTab,
            mes,
            anio,
            loading,
            reporteData,
            meses,
            cambiarTab,
            totalPorStatus,
            generarPDF
        };
    },

    template: `
        <div class="max-w-7xl mx-auto">
            <!-- Tabs -->
            <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    @click="cambiarTab('trabajador')"
                    :class="{
                        'border-indigo-500 text-indigo-600 dark:text-indigo-400': activeTab === 'trabajador',
                        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300': activeTab !== 'trabajador'
                    }"
                    class="py-2 px-4 font-medium text-sm border-b-2">
                    Por Trabajador
                </button>
                <button
                    @click="cambiarTab('proyecto')"
                    :class="{
                        'border-indigo-500 text-indigo-600 dark:text-indigo-400': activeTab === 'proyecto',
                        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300': activeTab !== 'proyecto'
                    }"
                    class="py-2 px-4 font-medium text-sm border-b-2">
                    Por Proyecto
                </button>
            </div>

            <!-- Selector de mes/año + Botón PDF -->
            <div class="flex flex-col sm:flex-row gap-4 mb-6 items-end">
                <div class="w-full sm:w-auto">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Mes</label>
                    <select
                        v-model.number="mes"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600">
                        <option v-for="m in meses" :value="m.value">{{ m.label }}</option>
                    </select>
                </div>
                <div class="w-full sm:w-auto">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Año</label>
                    <input
                        type="number"
                        v-model.number="anio"
                        min="2020"
                        max="2030"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                </div>
                <div class="w-full sm:w-auto">
                    <button
                        @click="generarPDF"
                        :disabled="loading || reporteData.length === 0"
                        class="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-700 dark:hover:bg-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l9-5-9-5-9 5 9 5zm0 0v6M12 20l9-5M12 20l-9-5" />
                        </svg>
                        Exportar PDF
                    </button>
                </div>
            </div>

            <!-- Tabla de reporte -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div v-if="loading" class="text-center py-8">
                    <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando reporte...</p>
                </div>

                <div v-else-if="reporteData.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
                    No hay actividades registradas para este mes.
                </div>

                <div v-else>
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 text-gray-950 dark:bg-gray-700 dark:text-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-950 dark:text-gray-300 uppercase tracking-wider">
                                    {{ activeTab === 'trabajador' ? 'Trabajador' : 'Proyecto' }}
                                </th>
                                <th v-for="status in ['todo', 'doing', 'done', 'aproved']" :key="status" class="px-4 py-3 text-center text-xs font-medium text-gray-950 dark:text-gray-300 uppercase tracking-wider">
                                    {{ status }}
                                    <div class="text-[10px] mt-1">(Asig / Ejec)</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-for="(item, index) in reporteData" :key="index" class="hover:bg-gray-400 dark:hover:bg-gray-400">
                                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {{ item[activeTab === 'trabajador' ? 'usuario' : 'proyecto'] }}
                                </td>
                                <td v-for="status in ['todo', 'doing', 'done', 'aproved']" :key="status" class="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300">
                                    <div v-if="item[status].tareas > 0">
                                        <div class="font-semibold">{{ parseFloat(item[status].diasAsignados).toFixed(1) }}</div>
                                        <div class="text-xs text-gray-950 dark:text-gray-400">{{ parseFloat(item[status].elapsed_time).toFixed(1) }}</div>
                                        <div class="text-[10px] text-indigo-600 dark:text-indigo-400">{{ item[status].tareas }} tareas</div>
                                    </div>
                                    <div v-else>-</div>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-gray-100 dark:bg-gray-700 font-semibold">
                            <tr>
                                <td class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">Totales</td>
                                <td v-for="status in ['todo', 'doing', 'done', 'aproved']" :key="status" class="px-4 py-2 text-center text-sm text-gray-700 dark:text-gray-300">
                                    <div>{{ totalPorStatus(status, 'diasAsignados') }}</div>
                                    <div class="text-xs">{{ totalPorStatus(status, 'elapsed_time') }}</div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    `
}).mount('#reportes-app-container');

