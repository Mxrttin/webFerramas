document.addEventListener("DOMContentLoaded", () => {
  const formularioLogin = document.getElementById("formulario-login");

  formularioLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    mostrarMensaje("Intentando iniciar sesión...", false);

    try {
      console.log("Enviando datos:", { correo, contrasena });
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo, password: contrasena })
      });

      const datos = await response.json();

      if (datos.success) {
        mostrarMensaje("Inicio de sesión exitoso. Redirigiendo...", false);

        localStorage.setItem("token", datos.token);
        localStorage.setItem("isLoggedIn", "true")

        setTimeout(() => {
          window.location.href = "../Cuenta/cuenta.html";
        }, 1000);
      } else {
        mostrarMensaje(datos.message || "Credenciales incorrectas", true);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      mostrarMensaje("Error al conectar con el servidor. Verifica que el servidor esté en ejecución.", true);
    }
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
