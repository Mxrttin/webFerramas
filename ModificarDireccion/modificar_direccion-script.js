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

  const id_usuario = datosUsuario.id_usuario;
  const container = document.getElementById("modificar-container");

  if (!container) {
    console.error("No se encontró el contenedor para dirección");
    return;
  }

  fetch("http://localhost:3000/api/direccion/direccionUsuario", {
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(data => {
      let direccion = { direccion: '', comuna: '', ciudad: '', region: '' };
      if (data.success && data.direccion) {
        direccion = data.direccion;
      }

      container.innerHTML = `
        <div class="container contenedor-registro">
          <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
              <div class="tajeta-registro">
                <h2 class="registro text-center mb-4 mt-5">Modificar Dirección</h2>
                <form id="formulario-modificar">
                  <div class="mb-3">
                    <label for="direccion" class="form-label">Dirección</label>
                    <input type="text" class="form-control" id="direccion" value="${direccion.direccion}" required>
                  </div>
                  <div class="mb-3">
                    <label for="comuna" class="form-label">Comuna</label>
                    <input type="text" class="form-control" id="comuna" value="${direccion.comuna}" required>
                  </div>
                  <div class="mb-3">
                    <label for="ciudad" class="form-label">Ciudad</label>
                    <input type="text" class="form-control" id="ciudad" value="${direccion.ciudad}" required>
                  </div>
                  <div class="mb-3">
                    <label for="region" class="form-label">Región</label>
                    <input type="text" class="form-control" id="region" value="${direccion.region}" required>
                  </div>
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-dark btn-registro">Modificar Dirección</button>
                  </div>
                  <div id="contenedor-mensaje" class="mt-3"></div>
                </form>
                <div class="text-center mt-3">
                  <a href="../Cuenta/cuenta.html" class="text-dark">Regresar</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const formulario = document.getElementById("formulario-modificar");

      formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nuevaDireccion = document.getElementById("direccion").value.trim();
        const nuevaComuna = document.getElementById("comuna").value.trim();
        const nuevaCiudad = document.getElementById("ciudad").value.trim();
        const nuevaRegion = document.getElementById("region").value.trim();

        try {
          const response = await fetch(`http://localhost:3000/api/direccion/modificarDireccion/${id_usuario}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
              direccion: nuevaDireccion,
              comuna: nuevaComuna,
              ciudad: nuevaCiudad,
              region: nuevaRegion
            })
          });

          const data = await response.json();

          if (data.success) {
            mostrarMensaje("Dirección modificada exitosamente.", false);
            setTimeout(() => {
              window.location.href = "../Cuenta/cuenta.html";
            }, 2000);
          } else {
            mostrarMensaje(data.message || "Error al modificar dirección.", true);
          }
        } catch (error) {
          console.error("Error en la petición", error);
          mostrarMensaje("Error al conectar con el servidor", true);
        }
      });
    })
    .catch(error => {
      console.error("Error al cargar la dirección:", error);
      container.innerHTML = `<p class="text-danger">No se pudo cargar la dirección. Intenta de nuevo más tarde.</p>`;
    });

  function mostrarMensaje(mensaje, esError) {
    const contenedorMensaje = document.getElementById("contenedor-mensaje") || crearContenedorMensaje();
    contenedorMensaje.textContent = mensaje;
    contenedorMensaje.className = esError ? "mensaje-error" : "mensaje-exito";
  }

  function crearContenedorMensaje() {
    const contenedor = document.createElement("div");
    contenedor.id = "contenedor-mensaje";
    document.querySelector("form").appendChild(contenedor);
    return contenedor;
  }
});

