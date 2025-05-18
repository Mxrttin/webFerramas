document.addEventListener("DOMContentLoaded", () => {
    const selectCategoria = document.getElementById("categoria");

    fetch("http://localhost:3000/api/categorias")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Limpiar el select antes de agregar nuevas opciones
                selectCategoria.innerHTML = '<option selected disabled>Selecciona una categoría</option>';

                data.categorias.forEach(e => {
                    const option = document.createElement("option");
                    option.value = e.id_categoria; // Asegúrate que este campo existe en tu base de datos
                    option.textContent = `${e.id_categoria}. ${e.nombre}`;
                    selectCategoria.appendChild(option);
                });
            } else {
                console.error("Error en la respuesta de categorías:", data);
            }
        })
        .catch(error => {
            console.error("Error al cargar categorías:", error);
    });

    const registro = document.getElementById("formulario-registro");

    if (registro) {
        const registroBoton = document.getElementById("btn-registro");
        registroBoton.addEventListener("click", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value;
            const descripcion = document.getElementById("descripcion").value;
            const marca = document.getElementById("marca").value;
            const precio = document.getElementById("precio").value;
            const cantidad = document.getElementById("cantidad").value;
            const categoria = document.getElementById("categoria").value;
            const foto = document.getElementById("foto").value;

            try {
                const response = await fetch("http://localhost:3000/api/productos/agregarProducto", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre, descripcion, marca, precio, cantidad, categoria, foto })
                });

                const data = await response.json();

                if (data.success) {
                    mostrarMensaje("Producto creado con éxito.", false);
                    setTimeout(() => {
                        window.location.href = "../Cuenta/cuenta.html";
                    }, 2000);
                } else {
                    mostrarMensaje(data.message || "Error al crear producto.", true);
                }
            } catch (error) {
                console.error("Error en la petición", error);
                mostrarMensaje("Error al conectar con el servidor", true);
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
