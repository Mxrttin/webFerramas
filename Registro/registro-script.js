document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById("formulario-registro");
    const passwordInput = document.getElementById("password");

    if (passwordInput) {
        passwordInput.addEventListener("input", (e) => {
            const value = e.target.value;
            if (value.length < 8) {
                passwordInput.setCustomValidity("La contraseña debe tener al menos 8 caracteres");
            } else {
                passwordInput.setCustomValidity("");
            }
        });
    }

    if (formulario) {
        const registroBoton = document.getElementById("btn-registro");
        registroBoton.addEventListener("click", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value.trim();
            const apellido = document.getElementById("apellido").value.trim();
            let rut = document.getElementById("rut").value.replace(/\./g, "").replace("-", "").toLowerCase();
            const email = document.getElementById("email").value.trim();
            let telefono = document.getElementById("telefono").value.replace(/[^\d]/g, "");
            const password = document.getElementById("password").value;
            const confirmarPassword = document.getElementById("confirmarPassword").value;

            if (password.length < 8) {
                mostrarMensaje("La contraseña debe tener al menos 8 caracteres", true);
                return;
            }

            if (!nombre || nombre.length < 3) {
                mostrarMensaje("El nombre es obligatorio y debe tener al menos 3 caracteres.", true);
                return;
            }

            if (!apellido || apellido.length < 3) {
                mostrarMensaje("El apellido es obligatorio y debe tener al menos 3 caracteres.", true);
                return;
            }

            if (!rut || rut.length < 8 || rut.length > 9 || !/^\d{7,8}[0-9kK]$/.test(rut)) {
                mostrarMensaje("El RUT es obligatorio y debe tener un formato válido (sin puntos ni guión).", true);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                mostrarMensaje("El correo electrónico no es válido.", true);
                return;
            }

            if (!telefono || telefono.length < 9 || telefono.length > 9) {
                mostrarMensaje("El número de teléfono debe tener 9 dígitos.", true);
                return;
            }

            if (password !== confirmarPassword) {
                mostrarMensaje("Las contraseñas no coinciden.", true);
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/api/auth/registroUsuario", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre, apellido, rut, correo: email, telefono, clave: password })
                });

                const data = await response.json();

                if (data.success) {
                    mostrarMensaje("Usuario creado con éxito.", false);
                    setTimeout(() => {
                        window.location.href = "../Login/login.html";
                    }, 3000);
                } else {
                    mostrarMensaje(data.message || "Error al crear usuario.", true);
                }
            } catch (error) {
                console.error("Error en la petición:", error);
                mostrarMensaje("Error al conectar con el servidor.", true);
            }
        });
    }

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
