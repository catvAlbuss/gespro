// Export to PDF function
function exportToPDF() {
    if (!gantt.exportToPDF) {
        alert("PDF export plugin is not available. Please include the export API.");
        return;
    }
    gantt.exportToPDF({
        name: "project_gantt.pdf",
        header: "Project Gantt Chart",
        footer: "Page {page} of {total}"
    });
}

// Export to MS Project function
function exportToMSProject() {
    if (!gantt.exportToMSProject) {
        alert("MS Project export plugin is not available. Please include the export API.");
        return;
    }
    gantt.exportToMSProject({
        skip_circular_links: false,
        project: {
            name: "Project Plan"
        },
        data: {
            file_name: "project_plan.xml"
        }
    });
}

// Import from MS Project function
function importFromMSProject() {
    if (!gantt.importFromMSProject) {
        alert("MS Project import plugin is not available. Please include the export API.");
        return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xml, .mpp";

    input.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                gantt.importFromMSProject({
                    data: e.target.result,
                    callback: function (project) {
                        gantt.clearAll();
                        gantt.parse(project);
                        updateCountersAndItems();
                    }
                });
            } catch (error) {
                alert("Error importing file: " + error.message);
            }
        };
        reader.readAsDataURL(file);
    };

    input.click();
}

// Dependency type mapping
const dependencyTypes = {
    "0": "Inicio-Inicio (SS)",
    "1": "Fin-Inicio (FS)",
    "2": "Inicio-Fin (SF)",
    "3": "Fin-Fin (FF)"
};
// Configure gantt
gantt.i18n.setLocale("es");
gantt.config.date_format = "%Y-%m-%d %H:%i";
gantt.config.work_time = true;
gantt.config.duration_unit = "day";
gantt.config.scale_unit = "day";
gantt.config.row_height = 30;
gantt.config.task_date = "%d %M %Y";

// Enable critical path (per DHTMLX documentation)
gantt.config.highlight_critical_path = true;
gantt.config.auto_scheduling = true;
gantt.config.auto_scheduling_strict = true;
gantt.config.links.start_to_start = "start2start";
gantt.config.open_split_tasks = true;
gantt.config.auto_scheduling_compatibility = true; // Asegura compatibilidad con versiones anteriores
gantt.config.schedule_from_end = false; // Programa desde el inicio del proyecto


// Configure columns
gantt.config.columns = [
    { name: "counter", label: "#", width: 60, template: t => t.$index + 1, resize: true },
    {
        name: "item", label: "Item", width: 80, resize: true,
        template: function (task) {
            return task.item || "";
        }
    },
    {
        name: "text", label: "Nombre", width: 200, tree: true,
        resize: true,
        template: t => `<div class="whitespace-pre-line break-words">${t.text}</div>`
    },
    { name: "duration", label: "Duración", width: 80, align: "center" },
    { name: "start_date", label: "Inicio", width: 130, align: "center" },
    { name: "end_date", label: "Fin", width: 130, align: "center" },
    {
        name: "predecessors",
        label: "Predecesoras",
        width: 150,
        align: "center",
        resize: true,
        template: function (task) {
            const links = gantt.getLinks()
                .filter(l => l.target == task.id)
                .map(l => {
                    const types = { 0: 'FC', 1: 'CC', 2: 'FF', 3: 'CF', 4: '' };
                    return `${l.source}${types[l.type]}`;
                })
                .join(', ');
            // Added a container div with specific class for potential styling/wrapping
            return `<div class="predecessors-cell-content flex items-center justify-between px-2">
            <span>${links}</span>
            <input type="button" value="🔗" onclick="openPredecessorModal(${task.id})">
        </div>`;
        },
        resize: true
    },
    {
        name: "cost", label: "Costos", width: 100, resize: true, template: function (task) {
            return task.cost ? "S/. " + task.cost : "";
        }
    },
    { name: "add" }
];

// Configure link types
gantt.config.links = {
    "finish_to_start": "0",
    "start_to_start": "1",
    "finish_to_finish": "2",
    "start_to_finish": "3"
};

// Link template for relationship descriptions
gantt.templates.link_description = function (link) {
    const types = {
        "0": "Fin-Comienzo",
        "1": "Comienzo-Comienzo",
        "2": "Fin-Fin",
        "3": "Comienzo-Fin"
    };
    const predecessor = gantt.getTask(link.source);
    const successor = gantt.getTask(link.target);
    return `${predecessor.text} (${types[link.type]}) → ${successor.text}`;
};

gantt.plugins({
    critical_path: true,
    auto_scheduling: true,
    marker: true
});

// Task class template for critical path
gantt.templates.task_class = function (start, end, task) {
    if (gantt.isCriticalTask(task) && gantt.config.highlight_critical_path) {
        return "gantt_critical_task";
    }

    if (task.parent) {
        let parent = gantt.getTask(task.parent);
        if (gantt.isCriticalTask(parent) && gantt.config.highlight_critical_path && parent.type != "project") {
            return "gantt_critical_task";
        }
    }
    return "";
};

function toggle() {
    gantt.config.highlight_critical_path = !gantt.config.highlight_critical_path;
    gantt.render();
}

// Link class template for critical path
gantt.templates.link_class = function (link) {
    const sourceTask = gantt.getTask(link.source);
    const targetTask = gantt.getTask(link.target);
    if (sourceTask.critical && targetTask.critical) {
        return "critical_link";
    }
    return "";
};

// Task tooltip
gantt.templates.tooltip_text = function (start, end, task) {
    let tooltipText = "<b>Task:</b> " + task.text + "<br/>" +
        "<b>Duration:</b> " + task.duration + " days<br/>" +
        "<b>Start:</b> " + gantt.templates.tooltip_date_format(start) + "<br/>" +
        "<b>End:</b> " + gantt.templates.tooltip_date_format(end);

    if (task.cost) {
        tooltipText += "<br/><b>Cost:</b> $" + task.cost;
    }

    if (task.critical) {
        tooltipText += "<br/><b>Critical:</b> Yes";
    }

    // Añadir predecesores al tooltip
    const links = gantt.getLinks().filter(l => l.target == task.id);
    if (links.length > 0) {
        tooltipText += "<br/><b>Predecesores:</b> ";
        const types = { 0: 'FC', 1: 'CC', 2: 'FF', 3: 'CF' };
        tooltipText += links.map(l => {
            const sourceTask = gantt.getTask(l.source);
            return `${sourceTask.item}${types[l.type]}`;
        }).join(', ');
    }

    return tooltipText;
};

// Add custom fields to task edit form
gantt.config.lightbox.sections = [
    { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
    { name: "time", type: "duration", map_to: "auto", time_format: ["%d", "%m", "%Y"] },
    { name: "cost", height: 22, map_to: "cost", type: "textarea", default_value: "0" }
];

gantt.locale.labels.section_cost = "Cost";

// Event handler for updating counters and items after task updates
function updateCountersAndItems() {
    let counter = 1;

    function traverseTree(parentId, parentItem) {
        const children = gantt.getChildren(parentId);
        let childIndex = 1;

        children.forEach(taskId => {
            const task = gantt.getTask(taskId);
            task.counter = counter++;

            // Set item based on hierarchy
            if (!parentItem) { // Root level task
                task.item = String(childIndex).padStart(2, '0');
            } else {
                task.item = parentItem + "." + String(childIndex).padStart(2, '0');
            }

            childIndex++;
            gantt.updateTask(task.id);

            if (gantt.hasChild(task.id)) {
                traverseTree(task.id, task.item);
            }
        });
    }

    // Start with root level tasks
    traverseTree(0, null);
    gantt.render();
}

// Función para aplicar auto-scheduling después de cambios
function applyAutoScheduling() {
    // Si es necesario, establecer una fecha de inicio para el proyecto
    if (gantt.getTaskByTime().length > 0) {
        const projectStart = gantt.getState().min_date;
        gantt.batchUpdate(() => {
            gantt.eachTask(task => {
                if (!task.parent) {
                    // Solo para tareas de nivel superior sin predecesores
                    const hasLinks = gantt.getLinks().some(link => link.target === task.id);
                    if (!hasLinks && task.start_date < projectStart) {
                        task.start_date = projectStart;
                        gantt.updateTask(task.id);
                    }
                }
            });
        });
    }

    // Ejecutar el auto-scheduling
    gantt.autoSchedule();
}

// Custom function to calculate the earliest start and latest end dates of a task and its descendants
function getSubtreeDates(taskId) {
    const task = gantt.getTask(taskId);
    if (!task || !task.start_date || !task.end_date) return null;

    let earliestStart = new Date(task.start_date);
    let latestEnd = new Date(task.end_date);
    const visited = new Set();

    function traverseChildren(id) {
        if (visited.has(id)) return;
        visited.add(id);

        const children = gantt.getChildren(id) || []; // Maneja caso de null/undefined
        children.forEach(childId => {
            const child = gantt.getTask(childId);
            if (!child || !child.start_date || !child.end_date) return; // Salta tareas inválidas
            if (new Date(child.start_date) < earliestStart) {
                earliestStart = new Date(child.start_date);
            }
            if (new Date(child.end_date) > latestEnd) {
                latestEnd = new Date(child.end_date);
            }
            if (gantt.hasChild(childId)) {
                traverseChildren(childId);
            }
        });
    }

    if (gantt.hasChild(taskId)) {
        traverseChildren(taskId);
    }

    return {
        start_date: earliestStart,
        end_date: latestEnd
    };
}

let isUpdating = false;

gantt.attachEvent("onAfterTaskUpdate", (id) => {
    if (isUpdating) return true;
    isUpdating = true;
    try {
        const dates = getSubtreeDates(id);
        if (dates) {
            // Actualiza solo si es necesario
            const task = gantt.getTask(id);
            task.start_date = dates.start_date;
            task.end_date = dates.end_date;
            gantt.updateTask(id);
        }
    } finally {
        isUpdating = false;
    }
    return true;
});
// Event handlers for task operations
gantt.attachEvent("onAfterTaskAdd", function (id, task) {
    updateCountersAndItems();
    if (!task.cost) task.cost = 0;
    gantt.updateTask(id);
    applyAutoScheduling();
});

gantt.attachEvent("onAfterTaskDelete", function (id) {
    updateCountersAndItems();
    applyAutoScheduling();
});

gantt.attachEvent("onAfterTaskMove", function (id, parent, tindex) {
    updateCountersAndItems();
    applyAutoScheduling();
});

gantt.attachEvent("onAfterLinkAdd", function (id, link) {
    const source = gantt.getTask(link.source);
    const target = gantt.getTask(link.target);

    // Update predecessors display
    const linkTypes = {
        "0": "FC", // Finish-to-Start
        "1": "CC", // Start-to-Start
        "2": "FF", // Finish-to-Finish
        "3": "CF"  // Start-to-Finish
    };

    target.predecessors = (target.predecessors || "") +
        (target.predecessors ? ", " : "") +
        source.item + " (" + linkTypes[link.type] + ")";

    gantt.updateTask(target.id);

    // Aplicar auto-scheduling para reflejar la nueva dependencia
    applyAutoScheduling();
});

gantt.attachEvent("onAfterLinkDelete", function (id, link) {
    const target = gantt.getTask(link.target);

    // Rebuild predecessors from existing links
    target.predecessors = "";

    gantt.getLinks().forEach(function (link) {
        if (link.target === target.id) {
            const source = gantt.getTask(link.source);
            const linkTypes = {
                "0": "FC",
                "1": "CC",
                "2": "FF",
                "3": "CF"
            };

            target.predecessors = (target.predecessors || "") +
                (target.predecessors ? ", " : "") +
                source.item + " (" + linkTypes[link.type] + ")";
        }
    });

    gantt.updateTask(target.id);
    applyAutoScheduling();
});

gantt.attachEvent("onBeforeSplitTaskDisplay", function (id, task, parent) {
    if (task.duration < 3) {
        return false;
    }
    return true;
});

// Prevent parent tasks from rendering default bars by modifying the task object during loading
gantt.attachEvent("onTaskLoading", function (task) {
    if (gantt.hasChild(task.id)) {
        // For parent tasks, set a flag to prevent rendering the default bar
        task.type = gantt.config.types.project; // Treat as a project task (no bar by default)
        task.unscheduled = true; // Prevent default bar rendering
    }
    return true;
});

// Add CSS to ensure parent task bars are hidden
gantt.attachEvent("onGanttRender", function () {
    const style = document.createElement("style");
    style.innerHTML = `
        .gantt_parent_task .gantt_task_progress,
        .gantt_parent_task .gantt_task_content,
        .gantt_parent_task .gantt_task_line {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
});

// Use addTaskLayer to draw brackets for parent tasks
gantt.addTaskLayer(function drawBracket(task) {
    if (!gantt.hasChild(task.id)) {
        return false; // Only draw for parent tasks
    }

    // Get the full date range of the task's subtree (including all children)
    const dates = getSubtreeDates(task.id);
    if (!dates) return false;

    const start = dates.start_date;
    const end = dates.end_date;

    // Get the positions of the start and end dates in the timeline
    const sizes = gantt.getTaskPosition(task, start, end);
    const height = gantt.config.row_height;
    const y = sizes.top;

    // Create a custom HTML element for the bracket
    const bracket = document.createElement("div");
    bracket.className = "gantt_bracket";
    bracket.style.position = "absolute";
    bracket.style.left = sizes.left + "px";
    bracket.style.width = sizes.width + "px";
    bracket.style.height = height + "px";
    bracket.style.top = y + "px";

    // Style the bracket to match the provided image (vertical ends, single top line)
    bracket.innerHTML = `
        <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 5px;
            height: 50%;
            border-left: 2px solid #000;
            border-top: 2px solid #000;
        "></div>
        <div style="
            position: absolute;
            top: 0;
            left: 5px;
            width: calc(100% - 10px);
            height: 0;
            border-top: 2px solid #000;
        "></div>
        <div style="
            position: absolute;
            top: 0;
            right: 0;
            width: 5px;
            height: 50%;
            border-right: 2px solid #000;
            border-top: 2px solid #000;
        "></div>
    `;

    return bracket;
});


// Initialize gantt
gantt.init("gantt_here");

// Sample data with tree structure
const data = {
    tasks: [
        {
            id: 1,
            text: "Office itinerancy",
            start_date: "2024-07-22",
            duration: 25,
            progress: 0.6,
            open: true,
            critical: true,
            cost: 5000
        },
        {
            id: 2,
            text: "Office facing",
            start_date: "2024-07-22",
            duration: 20,
            parent: 1,
            progress: 0.5,
            cost: 2500
        },
        {
            id: 3,
            text: "Furniture installation",
            start_date: "2024-07-22",
            duration: 5,
            parent: 1,
            progress: 0.8,
            critical: true,
            cost: 1000
        },
        {
            id: 4,
            text: "The employee relocation",
            start_date: "2024-07-29",
            duration: 15,
            parent: 1,
            progress: 0.2,
            cost: 1200
        },
        {
            id: 5,
            text: "Interior office",
            start_date: "2024-07-29",
            duration: 15,
            parent: 1,
            progress: 0.3,
            cost: 3000
        },
        {
            id: 6,
            text: "Air conditioners check",
            start_date: "2024-08-19",
            duration: 2,
            parent: 1,
            progress: 0,
            cost: 400
        },
        {
            id: 7,
            text: "Workplaces preparation",
            start_date: "2024-08-21",
            duration: 2,
            parent: 1,
            progress: 0,
            cost: 600
        },
        {
            id: 8,
            text: "Preparing workplaces for us",
            start_date: "2024-07-22",
            duration: 10,
            parent: 1,
            progress: 0.6,
            critical: true,
            cost: 1500
        },
        {
            id: 9,
            text: "Workplaces imports",
            start_date: "2024-08-23",
            duration: 1,
            parent: 1,
            progress: 0,
            cost: 2000
        }
    ],
    links: [
        { id: 1, source: 3, target: 4, type: "0" },  // Fin-Comienzo
        { id: 2, source: 3, target: 5, type: "0" },  // Fin-Comienzo
        { id: 3, source: 8, target: 9, type: "0" },  // Fin-Comienzo
        { id: 4, source: 2, target: 8, type: "1" },  // Comienzo-Comienzo
        { id: 5, source: 6, target: 7, type: "2" }   // Fin-Fin
    ]
};

// Load data
gantt.parse(data);

// Gestión de datos
const dataManager = {
    currentSource: 'default',
    data: data,

    setData(newData, source) {
        this.data = newData;
        this.currentSource = source;
        gantt.clearAll();
        gantt.parse(this.data);

        // Safely handle critical path updates
        try {
            if (gantt.getTaskCount() > 0) {
                gantt.eachTask(function (task) {
                    if (task.duration > 0) {
                        task.duration = parseInt(task.duration);
                    }
                });
                gantt.render();
            }
        } catch (err) {
            console.warn('Critical path calculation skipped:', err);
        }

        console.log(`Datos cargados desde: ${source}`);
    },

    reset() {
        this.setData(data, 'default');
    },

    async loadInitialData() {
        const id_presupuestos = document.getElementById('id_presupuestos')?.value || '1';

        try {
            // 1. Intentar cargar desde el servidor (Laravel)
            const response = await fetch('/obtener-cronograma', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ id: id_presupuestos })
            });

            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor: ${response.status}`);
            }

            const result = await response.json();

            if (result?.cronograma?.datacronograma) {
                // Parsear los datos del cronograma
                const parsed = typeof result.cronograma.datacronograma === 'string'
                    ? JSON.parse(result.cronograma.datacronograma)
                    : result.cronograma.datacronograma;

                console.log("📦 Datos del servidor:", parsed);

                // Verificar si los datos son válidos (tienen tareas y/o enlaces)
                if (parsed && (parsed.tasks?.length > 0 || parsed.links?.length > 0)) {
                    this.setData(parsed, 'server');
                    return;
                }
            }

            // 2. Si no hay datos válidos, cargar los datos por defecto
            console.log("⚠️ No se encontraron datos válidos en el servidor, cargando datos por defecto.");
            this.reset();

        } catch (error) {
            console.error("❌ Error al cargar datos iniciales:", error);
            console.log("⚠️ Error en la carga de datos, cargando datos por defecto.");
            this.reset();
        }
    },

    async importFromPresupuesto(id_presupuestos) {
        try {
            const response = await fetch(`/budgets/${id_presupuestos}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor: ${response.status}`);
            }

            const resultResponse = await response.json();
            if (!resultResponse?.data?.datapresupuestos) {
                throw new Error('No se encontraron datos de presupuesto.');
            }

            const result = JSON.parse(resultResponse.data.datapresupuestos);
            console.log("📦 Datos del presupuesto:", result);
            const ganttData = convertToGanttFormat(result);
            this.setData(ganttData, 'presupuesto');
            return true;

        } catch (err) {
            console.error('Error importando desde presupuesto:', err);
            return false;
        }
    }
};

// Import Manager (sin cambios relevantes, solo para referencia)
const importManager = {
    async fromServer(id_presupuestos) {
        try {
            const response = await fetch(`/budgets/${id_presupuestos}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Error en la respuesta del servidor');

            const resultResponse = await response.json();
            const result = JSON.parse(resultResponse.data.datapresupuestos);
            const ganttData = convertToGanttFormat(result);

            dataManager.setData(ganttData, 'server');
            return true;
        } catch (err) {
            console.error('Error importando desde servidor:', err);
            alert('Error al importar datos del servidor');
            return false;
        }
    },

    async fromMSProject(file) {
        try {
            const formData = new FormData();
            formData.append('msProjectFile', file);

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const headers = csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {};

            const response = await fetch('/cronogramas/import-msproject', {
                method: 'POST',
                body: formData,
                headers: headers
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                let userMessage = `Error en la respuesta del servidor: ${response.status} ${response.statusText}.`;
                if (response.status === 413) userMessage = 'El archivo es demasiado grande.';
                if (response.status === 419) userMessage = 'La sesión ha expirado. Por favor, recargue la página.';
                if (response.status === 422) {
                    userMessage = 'Error de validación en el servidor.';
                    try {
                        const errorJson = JSON.parse(errorDetails);
                        if (errorJson.message) userMessage = errorJson.message;
                        if (errorJson.errors) console.error('Validation errors:', errorJson.errors);
                    } catch (e) { }
                }
                throw new Error(userMessage);
            }

            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || 'El servidor reportó un error durante la importación.');
            }
        } catch (err) {
            console.error('Error durante el proceso fetch/parse del archivo MS Project:', err);
            throw err;
        }
    }
};

// Inicialización inmediata
(async () => {
    await dataManager.loadInitialData();
})();

// Manejo del botón de importación
const btnImport = document.getElementById('btn-import');
if (btnImport) {
    btnImport.addEventListener('click', async () => {
        const id_presupuestos = document.getElementById('id_presupuestos')?.value || '1';
        const success = await dataManager.importFromPresupuesto(id_presupuestos);
        if (success) {
            Swal.fire({
                title: "Éxito",
                text: "Datos importados correctamente desde el presupuesto",
                icon: "success",
                timer: 1500
            });
        } else {
            Swal.fire({
                title: "Error",
                text: "No se pudieron importar los datos del presupuesto",
                icon: "error"
            });
        }
    });
}

function convertToGanttFormat(data, parent = 0, output = { data: [], links: [] }) {
    for (const item of data) {
        const id = output.data.length + 1;
        const task = {
            id,
            item: item.item,
            text: item.descripcion,
            cost: item.subtotal || item.parcial || 0,
            start_date: "2025-04-01", // Puedes reemplazar por real si tienes campo
            duration: 1,
            parent: parent || 0
        };

        output.data.push(task);

        if (item._children && item._children.length > 0) {
            convertToGanttFormat(item._children, id, output);
        }
    }

    return output;
}

// Function to toggle critical path visibility
function toggleCriticalPath() {
    gantt.config.highlight_critical_path = !gantt.config.highlight_critical_path;
    gantt.render();
}

// Set initial counter and item values
updateCountersAndItems();

// Modal functionality
window.openPredecessorModal = function (taskId) {
    const modal = document.getElementById('predecessorModal');
    const list = document.getElementById('predecessorList');
    const searchInput = document.getElementById('searchPredecessor');

    if (!modal || !list || !searchInput) {
        console.error('Modal elements not found');
        return;
    }

    list.innerHTML = '';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    const task = gantt.getTask(taskId);
    const currentLinks = gantt.getLinks().filter(l => l.target == taskId);
    const predecessors = currentLinks.map(l => l.source);

    function renderPredecessorList(filter = '') {
        list.innerHTML = '';
        let counter = 1;

        gantt.eachTask(t => {
            if (t.id != taskId) {
                const text = `${counter}. ${t.text}`;
                if (!filter || text.toLowerCase().includes(filter.toLowerCase())) {
                    const alreadyAdded = predecessors.includes(t.id);
                    const div = document.createElement('div');
                    div.className = 'pred-item flex items-center justify-between p-3 border-b border-gray-200';

                    const link = currentLinks.find(l => l.source == t.id);

                    div.innerHTML = `
                        <span class="text-gray-800">${text}</span>
                        <div class="flex items-center gap-3">
                            <select class="link-type px-3 py-1 text-sm border rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="0" ${link && link.type == '0' ? 'selected' : ''}>FC</option>
                                <option value="1" ${link && link.type == '1' ? 'selected' : ''}>CC</option>
                                <option value="2" ${link && link.type == '2' ? 'selected' : ''}>FF</option>
                                <option value="3" ${link && link.type == '3' ? 'selected' : ''}>CF</option>
                                <option value="4" ${link && link.type == '4' ? 'selected' : ''}>Vacío</option>
                            </select>
                            <button class="text-sm px-4 py-1 rounded font-medium transition ${alreadyAdded ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
                        }">
                                ${alreadyAdded ? 'Quitar' : 'Agregar'}
                            </button>
                        </div>
                    `;

                    div.querySelector('button').onclick = () => {
                        if (alreadyAdded) {
                            gantt.deleteLink(link.id);
                        } else {
                            const type = div.querySelector('.link-type').value;
                            gantt.addLink({
                                id: gantt.uid(),
                                source: t.id,
                                target: taskId,
                                type: type
                            });
                        }
                        gantt.refreshData();
                        openPredecessorModal(taskId); // Refresh modal
                    };

                    if (alreadyAdded) {
                        div.querySelector('.link-type').onchange = (e) => updateLinkType(link.id, e.target.value);
                    }

                    list.appendChild(div);
                }
                counter++;
            }
        });
    }

    searchInput.value = '';
    searchInput.onkeyup = (e) => renderPredecessorList(e.target.value);
    renderPredecessorList();

    modal.style靠谱display = 'flex';
};

// Update link type
window.updateLinkType = function (linkId, newType) {
    const link = gantt.getLink(linkId);
    link.type = newType;
    gantt.updateLink(linkId);
    gantt.refreshData();
};

// Close modal
window.closePredecessorModal = function () {
    const modal = document.getElementById('predecessorModal');
    if (!modal) return;

    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
};

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('predecessorModal');
    const closeModalBtn = document.getElementById('closeModal');

    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closePredecessorModal();
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closePredecessorModal);
    }
});

// Función para guardar el cronograma
function saveGantt() {
    // Recopilar tareas
    const tasks = gantt.getTaskByTime().map(task => ({
        id: task.id,
        text: task.text,
        start_date: gantt.date.date_to_str("%Y-%m-%d %H:%i")(task.start_date),
        end_date: gantt.date.date_to_str("%Y-%m-%d %H:%i")(task.end_date),
        duration: task.duration,
        parent: task.parent,
        counter: task.counter,
        item: task.item,
        cost: task.cost,
        predecessors: task.predecessors || ""
    }));

    // Recopilar enlaces
    const links = gantt.getLinks().map(link => ({
        id: link.id,
        source: link.source,
        target: link.target,
        type: link.type
    }));

    // Preparar los datos para enviar con la clave 'datacronograma'
    const dataToSend = {
        datacronograma: JSON.stringify({
            tasks: tasks,
            links: links
        })
    };

    // Obtener el ID del cronograma
    const id = document.getElementById('cronograma_id').value || 1; // Ajusta según tu lógica

    // Enviar los datos al servidor
    $.ajax({
        url: `/guardar-cronograma/${id}`,
        type: 'POST',
        data: dataToSend, // Enviar como formulario, no como JSON puro
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (response) {
            console.log('Save successful:', response);
            alert('Cronograma guardado exitosamente.');
        },
        error: function (xhr, status, error) {
            console.error('Error saving Gantt:', error);
            alert('Error al guardar el cronograma. Por favor, intenta de nuevo.');
        }
    });
}

// Modal Logic
const modal = document.getElementById('ganttSettingsModal');
const modalContent = modal.querySelector('.modal-content');
const openModalBtn = document.getElementById('ajustesProyectoModal');
const closeModalBtns = modal.querySelectorAll('[data-dismiss="modal"]');
const saveSettingsBtn = document.getElementById('saveSettings');

// Open Modal
openModalBtn.addEventListener('click', () => {
    populateFormatOptions();
    setInitialValues();
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10); // Small delay to ensure smooth transition
});

// Close Modal
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    });
});

// Save Settings and Close Modal
saveSettingsBtn.addEventListener('click', () => {
    const topTierUnit = document.getElementById('topTierUnit').value;
    const topTierFormat = document.getElementById('topTierFormat').value;
    const bottomTierUnit = document.getElementById('bottomTierUnit').value;
    const bottomTierFormat = document.getElementById('bottomTierFormat').value;

    gantt.config.scale_unit = topTierUnit;
    gantt.config.date_scale = topTierFormat;
    gantt.config.subscales = [
        { unit: bottomTierUnit, date: bottomTierFormat }
    ];

    const projectStart = new Date(document.getElementById('projectStart').value);
    const projectEnd = new Date(document.getElementById('projectEnd').value);
    const scheduleFromEnd = document.getElementById('scheduleFromEnd').checked;

    gantt.config.schedule_from_end = scheduleFromEnd;
    gantt.config.start_date = projectStart;
    gantt.config.end_date = projectEnd;

    const workingDays = {
        1: document.getElementById('workMon').checked,
        2: document.getElementById('workTue').checked,
        3: document.getElementById('workWed').checked,
        4: document.getElementById('workThu').checked,
        5: document.getElementById('workFri').checked,
        6: document.getElementById('workSat').checked,
        0: document.getElementById('workSun').checked
    };

    gantt.setWorkTime({ days: workingDays });

    const workStartHour = document.getElementById('workStartHour').value;
    const workEndHour = document.getElementById('workEndHour').value;
    const [startHour, startMinute] = workStartHour.split(':').map(Number);
    const [endHour, endMinute] = workEndHour.split(':').map(Number);

    gantt.setWorkTime({ hours: [`${startHour}:${startMinute}-${endHour}:${endMinute}`] });

    gantt.templates.scale_cell_class = function (date) {
        if (!gantt.isWorkTime(date)) {
            return "gantt_non_working";
        }
        return "";
    };

    gantt.render();

    // Close modal
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
});

// Format Options
const formatOptions = {
    day: [
        { value: "%d %M %Y", label: "01 Jan 2019" },
        { value: "%d %M", label: "01 Jan" },
        { value: "%d", label: "01" }
    ],
    week: [
        { value: "%W %Y", label: "Week 01, 2019" },
        { value: "%W", label: "Week 01" }
    ],
    month: [
        { value: "%M %Y", label: "Jan 2019" },
        { value: "%M", label: "Jan" }
    ],
    year: [
        { value: "%Y", label: "2019" }
    ]
};

// Populate Format Options
function populateFormatOptions() {
    const topTierUnit = document.getElementById('topTierUnit');
    const topTierFormat = document.getElementById('topTierFormat');
    const bottomTierUnit = document.getElementById('bottomTierUnit');
    const bottomTierFormat = document.getElementById('bottomTierFormat');

    function updateFormatOptions(unitSelect, formatSelect) {
        const unit = unitSelect.value;
        formatSelect.innerHTML = '';
        formatOptions[unit].forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            formatSelect.appendChild(opt);
        });
    }

    topTierUnit.addEventListener('change', () => updateFormatOptions(topTierUnit, topTierFormat));
    bottomTierUnit.addEventListener('change', () => updateFormatOptions(bottomTierUnit, bottomTierFormat));

    updateFormatOptions(topTierUnit, topTierFormat);
    updateFormatOptions(bottomTierUnit, bottomTierFormat);
}

// Set Initial Values
function setInitialValues() {
    document.getElementById('topTierUnit').value = gantt.config.scale_unit || 'day';
    document.getElementById('bottomTierUnit').value = gantt.config.subscales?.[0]?.unit || 'day';

    const tasks = gantt.getTaskByTime();
    if (tasks.length > 0) {
        const dates = getSubtreeDates(tasks[0].id);
        if (dates) {
            document.getElementById('projectStart').value = dates.start_date.toISOString().split('T')[0];
            document.getElementById('projectEnd').value = dates.end_date.toISOString().split('T')[0];
        }
    }
}
// Add event listeners to buttons
document.getElementById("exportPDF").addEventListener("click", exportToPDF);
document.getElementById("exportMSProject").addEventListener("click", exportToMSProject);
document.getElementById("importMSProject").addEventListener("click", importFromMSProject);
// document.getElementById("toggleCriticalPath").addEventListener("click", toggleCriticalPath);
document.getElementById("toggleCriticalPath").addEventListener("click", toggle);
document.getElementById('saveGantt').addEventListener('click', saveGantt);