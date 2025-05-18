document.addEventListener("DOMContentLoaded", () => {
    const rejillaProductos = document.querySelector(".rejilla-productos");
    const contadorProductos = document.querySelector(".contador-productos");

    async function cargarProductos() {
        try {
            const respuesta = await fetch("http://localhost:3000/api/productos", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }

            const datos = await respuesta.json();

            if (datos.success) {
                if (rejillaProductos) {
                    if (datos.productos.length === 0) {
                        rejillaProductos.innerHTML = `
                            <div class="col-12">
                                <p>No existen productos</p>
                            </div>
                        `;
                        
                        // Actualizar contador de productos
                        if (contadorProductos) {
                            contadorProductos.textContent = "0 productos";
                        }
                    } else {
                        rejillaProductos.innerHTML = "";
                        
                        // Crear un mapa para almacenar la relación entre elementos DOM y datos de productos
                        const mapaProductos = new Map();

                        datos.productos.forEach(producto => {
                            const columna = document.createElement("div");
                            columna.className = "col-6 col-md-4 col-lg-4"; 
                            
                            columna.innerHTML = `
                                <div class="tarjeta-producto" data-producto-id="${producto.id_producto}">
                                    <div class="imagen-producto">
                                        <img src="${producto.foto}" alt="imagen-producto">
                                        <div class="etiqueta-producto">${producto.cantidad}</div>
                                    </div>
                                    <div class="info-producto">
                                        <h3 class="nombre-producto">${producto.nombre}</h3>
                                        <p class="precio-producto">$${producto.precio}</p>
                                    </div>
                                </div>
                            `;
                            
                            rejillaProductos.appendChild(columna);
                            
                            // Guardar referencia al elemento y su ID de producto
                            const tarjetaProducto = columna.querySelector(".tarjeta-producto");
                            mapaProductos.set(tarjetaProducto, producto.id_producto);
                        });
                        
                        if (contadorProductos) {
                            contadorProductos.textContent = `${datos.productos.length} productos`;
                        }
                        
                        document.querySelectorAll(".tarjeta-producto").forEach(tarjeta => {
                            tarjeta.addEventListener("click", () => {
                                const idProducto = tarjeta.dataset.productoId;
                                window.location.href = `./modificar.html?id=${idProducto}`;
                            });
                        });
                    }
                }
            } else {
                throw new Error("La respuesta de la API no fue exitosa");
            }
        } catch (error) {
            console.error("Error al cargar los productos:", error);
            if (rejillaProductos) {
                rejillaProductos.innerHTML = `
                    <div class="col-12">
                        <p>Error al cargar los productos. Por favor, intenta de nuevo más tarde.</p>
                    </div>
                `;
            }
        }
    }
    // carga productos de la api, si el servidor esta funcionando
    cargarProductos();
});