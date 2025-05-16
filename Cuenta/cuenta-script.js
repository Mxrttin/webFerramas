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

    
    fetch("http://localhost:3000/direccion", {
      headers: {
        'Authorization': 'Bearer ' + token,
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

    if (datosUsuario.rol === 1) {
      detallesUsuario.innerHTML += `
        <div class="mt-4">
          <a href="../Agregar/agregar_producto.html" class="enlace-admin">
            <i class="fas fa-plus-circle me-2 text-dark"></i>Agregar productos
          </a>
          <a href="../Modificar/modificar_productos.html" class="enlace-admin mt-2">
            <i class="fas fa-edit me-2 text-dark"></i>Modificar productos
          </a>
          <br>
        </div>
      `;
    }
  }
  

  const botonCerrarSesion = document.getElementById("cerrar-sesion");
  if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
});
