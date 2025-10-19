// script.js
const compraForm = document.getElementById('compraForm');
const tablaBody = document.getElementById('tablaBody');
const totalGeneral = document.getElementById('totalGeneral');
const totalesPorProductor = document.getElementById('totalesPorProductor');

// Array para guardar las compras
let compras = [];

compraForm.addEventListener('submit', function(e) {
    e.preventDefault(); // evita que se recargue la página

    // Tomar los valores del formulario
    const productor = document.getElementById('productor').value;
    const fecha = document.getElementById('fecha').value;
    const producto = document.getElementById('producto').value;
    const cantidad = parseFloat(document.getElementById('cantidad').value);
    const precioUnidad = parseFloat(document.getElementById('precioUnidad').value);
    const total = cantidad * precioUnidad;

    // Crear objeto compra
    const compra = { productor, fecha, producto, cantidad, precioUnidad, total };
    compras.push(compra);

    // Limpiar tabla y volver a dibujar
    dibujarTabla();
    actualizarTotales();

    // Limpiar formulario
    compraForm.reset();
});

// Función para dibujar la tabla
function dibujarTabla() {
    tablaBody.innerHTML = ''; // vaciar tabla

    compras.forEach(compra => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${compra.productor}</td>
            <td>${compra.fecha}</td>
            <td>${compra.producto}</td>
            <td>${compra.cantidad}</td>
            <td>${compra.precioUnidad.toFixed(2)}</td>
            <td>${compra.total.toFixed(2)}</td>
        `;
        tablaBody.appendChild(fila);
    });
}

// Función para actualizar totales
function actualizarTotales() {
    // Total general
    const total = compras.reduce((sum, c) => sum + c.total, 0);
    totalGeneral.textContent = total.toFixed(2);

    // Total por productor
    const totales = {};
    compras.forEach(c => {
        totales[c.productor] = (totales[c.productor] || 0) + c.total;
    });

    totalesPorProductor.innerHTML = '';
    for (const productor in totales) {
        const p = document.createElement('p');
        p.textContent = `${productor}: $${totales[productor].toFixed(2)}`;
        totalesPorProductor.appendChild(p);
    }

    
}
// Botones y contenedor
const verGraficoBtn = document.getElementById('verGraficoBtn');
const cerrarGraficoBtn = document.getElementById('cerrarGraficoBtn');
const graficoContainer = document.getElementById('graficoContainer');

verGraficoBtn.addEventListener('click', () => {
    graficoContainer.style.display = 'block';
    actualizarGrafico(crearTotalesPorProductor());
});

cerrarGraficoBtn.addEventListener('click', () => {
    graficoContainer.style.display = 'none';
});

// Función para crear totales por productor
function crearTotalesPorProductor() {
    const totales = {};
    compras.forEach(c => {
        totales[c.productor] = (totales[c.productor] || 0) + c.total;
    });
    return totales;
}

// Función para actualizar gráfico (Pie Chart)
let grafico;
function actualizarGrafico(totales) {
    const ctx = document.getElementById('graficoProductores').getContext('2d');
    const labels = Object.keys(totales);
    const data = Object.values(totales);

    if (grafico) grafico.destroy(); // destruir gráfico anterior

    grafico = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#40916c',
                    '#52b788',
                    '#74c69d',
                    '#95d5b2',
                    '#b7e4c7'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}


document.getElementById('descargarExcel').addEventListener('click', () => {
    const ws_data = [
        ["Productor","Fecha","Producto","Cantidad","Precio Unidad","Gasto Combustible","Gasto Recipientes","Gasto Embaladores","Total"],
        ...compras.map(c => [
            c.productor,
            c.fecha,
            c.producto,
            c.cantidad,
            c.precioUnidad,
            c.gastoCombustible || 0,
            c.gastoRecipientes || 0,
            c.gastoEmbaladores || 0,
            c.total
        ])
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Compras");
    XLSX.writeFile(wb, `compras_${new Date().toISOString().slice(0,10)}.xlsx`);
});
