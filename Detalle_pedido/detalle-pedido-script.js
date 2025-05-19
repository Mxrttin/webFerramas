function obtenerParametro(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const idPedido = obtenerParametro('id');
const infoPedido = document.getElementById('infoPedido');
const tablaDetalle = document.getElementById('tablaDetalle');
const detalleBody = document.getElementById('detalleBody');

if (!idPedido) {
  infoPedido.innerHTML = '<p class="error">No se especificó el ID del pedido.</p>';
} else {
  fetch(`http://localhost:3000/api/pedidos/detalle/${idPedido}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success || !data.detalle || data.detalle.length === 0) {
        infoPedido.innerHTML = '<p class="error">No se encontró el detalle del pedido.</p>';
        tablaDetalle.style.display = 'none';
        return;
      }

      const primerDetalle = data.detalle[0];

      // Verifica si existe una dirección completa
      const tieneDireccion = primerDetalle.direccion && primerDetalle.comuna && primerDetalle.ciudad && primerDetalle.region;

      const direccionTexto = tieneDireccion
        ? `${primerDetalle.direccion}, ${primerDetalle.comuna}, ${primerDetalle.ciudad}, ${primerDetalle.region}`
        : 'Retiro en tienda';

      // Inserta la información del cliente
      infoPedido.innerHTML = `
        <p><strong>Cliente:</strong> ${primerDetalle.nombre_usuario} ${primerDetalle.apellido}</p>
        <p><strong>Correo:</strong> ${primerDetalle.correo}</p>
        <p><strong>Teléfono:</strong> ${primerDetalle.telefono}</p>
        <p><strong>Dirección:</strong> ${direccionTexto}</p>
        <p><strong>Estado del pedido:</strong> ${primerDetalle.estado}</p>
      `;

      // Muestra la tabla y rellena con productos
      tablaDetalle.style.display = 'table';
      detalleBody.innerHTML = '';

      data.detalle.forEach(item => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${item.nombre_producto}</td>
          <td>${item.cantidad}</td>
          <td>$${item.subtotal}</td>
        `;
        detalleBody.appendChild(fila);
      });
    })
    .catch(err => {
      console.error('Error al obtener los datos:', err);
      infoPedido.innerHTML = '<p class="error">Error al cargar el detalle del pedido.</p>';
    });
}
