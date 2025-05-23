function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../login.html"; 
    return;
  }

  const datosUsuario = parseJwt(token);
  console.log('id del usuario:', datosUsuario.id_usuario);

  if (!datosUsuario) {
    localStorage.removeItem("token");
    window.location.href = "../login.html";
    return;
  }

  const detallesUsuario = document.querySelector(".detalles-usuario");

  if (detallesUsuario) {
    detallesUsuario.innerHTML = `
      <p class="nombre-usuario">${datosUsuario.nombre || 'Nombre no disponible'}</p>
      <p>${datosUsuario.correo || 'Correo no disponible'}</p>
      <p>${datosUsuario.telefono || 'Teléfono no disponible'}</p>
      <p id="direccion-text">Cargando dirección...</p>
    `;


    // Cargar dirección
    fetch(`http://localhost:3000/api/direccion/direccionUsuario`, {
      headers: {
        'Authorization': 'Bearer ' + `${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      const direccionP = document.getElementById("direccion-text");
      if (data.success && data.direccion) {
        const d = data.direccion;
        direccionP.innerHTML = `
          Dirección: ${d.direccion}, ${d.comuna}, ${d.ciudad}, ${d.region} 
          <br>
          <a href="../ModificarDireccion/modificar_direccion.html" class="text-dark">Modificar dirección</a>
        `;
      } else {
        direccionP.innerHTML = `<a href="../AgregarDireccion/agregar_direccion.html" class="text-dark">No tienes dirección registrada. Regístrala ahora</a>`;
      }
    })
    .catch(err => {
      console.error("Error al cargar la dirección:", err);
      const direccionP = document.getElementById("direccion-text");
      direccionP.textContent = "Error al cargar la dirección";
    });

    // Mostrar enlaces admin si rol = 1
    if (datosUsuario.rol === 1) {
      detallesUsuario.innerHTML += `
        <div class="mt-4">
          <h5 class="mt-5">Menu administrador</h5>
          <a href="../Agregar/agregar_producto.html" class="enlace-admin">
            <i class="fas fa-plus-circle me-2 text-dark"></i>Agregar productos
          </a>
          <a href="../Modificar/modificar_productos.html" class="enlace-admin mt-2">
            <i class="fas fa-edit me-2 text-dark"></i>Modificar productos
          </a>
          <a href="../Admin_pedidos/admin_pedidos.html" class="enlace-admin mt-2">
            <i class="bi bi-card-list me-2 text-dark"></i>Visualizar pedidos
          </a>
          <br>
        </div>
      `;
    }
  }

  // Función para cargar pedidos y mostrar en tabla
  function cargarPedidos(idUsuario) {
    fetch(`http://localhost:3000/api/pedidos/${idUsuario}`, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      const tablaBody = document.querySelector(".tabla-pedidos tbody");
      if (!tablaBody) return;

      if (data.success && data.pedidos.length > 0) {
        tablaBody.innerHTML = "";

        data.pedidos.forEach(pedido => {
          const fila = document.createElement("tr");

          fila.innerHTML = `
            <td>${pedido.id_pedido}</td>
            <td>${new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
            <td>${pedido.estado}</td>
            <td>$${pedido.total}</td>
            <td><a href="#" class="text-dark ver-detalle" data-id="${pedido.id_pedido}">Ver detalle</a></td>
          `;

          tablaBody.appendChild(fila);
        });

        // Agregar el listener UNA sola vez, delegando en el contenedor
        tablaBody.addEventListener("click", (e) => {
          if (e.target.classList.contains("ver-detalle")) {
            e.preventDefault();
            const idPedido = e.target.getAttribute("data-id");
            window.location.href = `../Detalle_pedido/detalle_pedido.html?id=${idPedido}`;
          }
        });


        

      } else {
        tablaBody.innerHTML = `
          <tr>
            <td colspan="4" class="sin-pedidos">No tienes pedidos realizados aún.</td>
          </tr>
        `;
      }
    })
    .catch(err => {
      console.error("Error al cargar los pedidos:", err);
    });
  }

  cargarPedidos(datosUsuario.id_usuario);

  const botonCerrarSesion = document.getElementById("cerrar-sesion");
  if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
});
