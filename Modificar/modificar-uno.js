document.addEventListener("DOMContentLoaded", () => {
    // Obtener el ID del producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        mostrarError("No se especificó un producto para mostrar");
        return;
    }

    cargarDetalleProducto(productId);
  
    async function cargarDetalleProducto(id) {
        try {
            const response = await fetch(`http://localhost:3000/productos/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.producto) {
                mostrarDetalleProducto(data.producto);
                cargarCategorias();
            } else {
                throw new Error("No se pudo obtener la información del producto");
            }
        } catch (error) {
            console.error("Error al cargar el detalle del producto:", error);
            mostrarError("Error al cargar la información del producto. Por favor, intenta de nuevo más tarde.");
        }
    }

    function mostrarDetalleProducto(producto) {
        const productDetailContainer = document.getElementById("login-container");

        const detalleHTML = `
            <div class="container contenedor-registro">
                <div class="row justify-content-center">
                    <div class="col-md-6 col-lg-5">
                        <div class="tajeta-registro">
                            <h2 class="registro text-center mb-4 mt-5">Modificar producto</h2>
                            <form id="formulario-modificar">
                                <div class="mb-3">
                                    <label for="nombre" class="form-label">Nombre</label>
                                    <input type="text" class="form-control" id="nombre" value="${producto.nombre}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="descripcion" class="form-label">Descripcion</label>
                                    <input type="text" class="form-control" id="descripcion" value="${producto.descripcion}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="marca" class="form-label">Marca</label>
                                    <input type="text" class="form-control" id="marca" value="${producto.marca}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="precio" class="form-label">Precio</label>
                                    <input type="text" class="form-control" id="precio" value="${producto.precio}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="cantidad" class="form-label">Cantidad</label>
                                    <input type="number" class="form-control" id="cantidad" value="${producto.cantidad}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="categoria-antigua" class="form-label">Categoria antigua</label>
                                    <input type="text" class="form-control" id="categoria-antigua" placeholder="${producto.categoria}" disabled>
                                </div>
                                <div class="mb-3">
                                    <label for="categoria" class="form-label">Categoría</label>
                                    <select id="categoria" class="form-select">
                                        <option selected disabled>Selecciona una categoría</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="foto" class="form-label">Foto</label>
                                    <input type="text" class="form-control" id="foto" value="${producto.foto}" required>
                                </div>
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-dark btn-registro" id="btn-modificar">Modificar producto</button>
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
        
        productDetailContainer.innerHTML = detalleHTML;
        
        const registerForm = document.getElementById("formulario-modificar");
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value;
            const descripcion = document.getElementById("descripcion").value;
            const marca = document.getElementById("marca").value;
            const precio = document.getElementById("precio").value;
            const cantidad = document.getElementById("cantidad").value;
            const categoria = document.getElementById("categoria").value;
            const foto = document.getElementById("foto").value;

            try {
                const id = producto.id_producto;
                const response = await fetch(`http://localhost:3000/modificarProducto/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre, descripcion, marca, precio, cantidad, categoria, foto })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    mostrarMensaje("Producto modificado con éxito.");
                    setTimeout(() => {
                        window.location.href = "../Cuenta/cuenta.html";
                    }, 2000);
                } else {
                    mostrarMensaje(data.message || "Error al modificar el producto.");
                }
            } catch (error) {
                console.error("Error en la petición", error);
                mostrarMensaje(`Error: ${error.message || "Error al conectar con el servidor."}`);
            }
        });
    }

    async function cargarCategorias() {
        try {
            const response = await fetch("http://localhost:3000/categorias");
            const data = await response.json();
            
            const selectCategoria = document.getElementById("categoria");
            
            if (data.success) {
                selectCategoria.innerHTML = '<option selected disabled>Selecciona una categoría</option>';
                
                data.categorias.forEach(e => {
                    const option = document.createElement("option");
                    option.value = e.id_categoria;
                    option.textContent = `${e.id_categoria}. ${e.nombre}`;
                    selectCategoria.appendChild(option);
                });
            } else {
                console.error("Error en la respuesta de categorías:", data);
            }
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
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

    function mostrarError(mensaje) {
        const productDetailContainer = document.getElementById("product-detail");

        if (productDetailContainer) {
            productDetailContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        ${mensaje}
                    </div>
                    <a href="../Productos/productos.html" class="btn btn-outline-dark mt-3">
                        <i class="fas fa-arrow-left me-2"></i>
                        Volver a productos
                    </a>
                </div>
            `;
        }
    }
});
