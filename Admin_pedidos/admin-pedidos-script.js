document.addEventListener("DOMContentLoaded", () => {
  const tablaBody = document.querySelector(".tabla-pedidos tbody");

  function cargarPedidos() {
    fetch(`http://localhost:3000/api/pedidos`)
      .then(res => res.json())
      .then(data => {
        if (!tablaBody) return;

        if (data.success && data.pedidos.length > 0) {
          tablaBody.innerHTML = "";

          data.pedidos.forEach(pedido => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
              <td>${pedido.id_pedido}</td>
              <td>${new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
              <td>${pedido.estado || 'Sin estado'}</td>
              <td>$${pedido.total.toLocaleString('es-CL')}</td>
              <td><a href="#" class="text-dark ver-detalle" data-id="${pedido.id_pedido}">Ver detalle</a></td>
            `;
            tablaBody.appendChild(fila);
          });

        } else {
          tablaBody.innerHTML = `
            <tr>
              <td colspan="5" class="sin-pedidos">No hay pedidos registrados.</td>
            </tr>
          `;
        }
      })
      .catch(err => {
        console.error("Error al cargar los pedidos:", err);
      });
  }

  // Delegación para "Ver detalle"
  tablaBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("ver-detalle")) {
      e.preventDefault();
      const idPedido = e.target.getAttribute("data-id");
      window.location.href = `../Detalle_pedido/detalle_pedido.html?id=${idPedido}`;
    }
  });

  cargarPedidos();
});