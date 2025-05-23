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


document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const datosUsuario = parseJwt(token);
    
    const costoEnvio = 5000;

    try {
 
        let data;
        
        if (datosUsuario) {
            
            const response = await fetch(`http://localhost:3000/api/carrito/${datosUsuario.id_usuario}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.error("La respuesta no es JSON:", await response.text());
                throw new Error("La respuesta del servidor no es JSON válido");
            }
            
            data = await response.json();
        } else {
            throw new Error("No hay usuario autenticado");
        }

        if (data.success) {
            const cuerpoTabla = document.getElementById("items-carrito");
            
            let subtotal = 0;
            
            if (cuerpoTabla) {
                if (data.carrito.length === 0) {
                    cuerpoTabla.innerHTML = `
                        <tr>
                            <td colspan="5" class="sin-productos">No tienes productos en el carrito aún.</td>
                        </tr>
                    `;
                    
                    subtotal = 0;
                } else {
                    let htmlCarrito = "";
                    
                    // Calcular subtotal sumando los subtotales de cada producto
                    data.carrito.forEach(item => {
                        const itemSubtotal = item.cantidad * item.precio;
                        subtotal += itemSubtotal;
                        
                        htmlCarrito += `
                            <tr data-id="${item.id_producto}">
                                <td><img src="${item.foto}" alt="Producto" class="img-thumbnail" width="50"></td>
                                <td>${item.cantidad}</td>
                                <td>$${item.precio.toLocaleString()} CLP</td>
                                <td>$${itemSubtotal.toLocaleString()} CLP</td>
                                <td><button class="btn btn-danger btn-sm eliminar-item">×</button></td>
                            </tr>
                        `;
                    });

                    // Añadir fila de total para la tabla de productos
                    htmlCarrito += `
                        <tr class="table-dark">
                            <td colspan="3" class="text-end"><strong>Total productos:</strong></td>
                            <td>$${subtotal.toLocaleString()} CLP</td>
                            <td></td>
                        </tr>
                    `;

                    cuerpoTabla.innerHTML = htmlCarrito;
                }
                
                // Calcular el total (subtotal + envío)
                const total = subtotal + costoEnvio;
                
                // Actualizar los elementos del resumen
                actualizarResumenCarrito(subtotal, costoEnvio, total);
                

            }
        } else {
            console.error("Error al obtener carrito:", data.error);
            mostrarMensajeError("Error al cargar el carrito");
        }
    } catch (error) {
        console.error("Error al procesar datos:", error);
        mostrarMensajeError(`Error al cargar el carrito: ${error.message}`);
    }


    document.querySelectorAll(".eliminar-item").forEach(button => {
        button.addEventListener("click", async (event) => {
            const fila = event.target.closest("tr");
            const id_producto = fila.getAttribute("data-id");
            const token = localStorage.getItem("token");
            const datosUsuario = parseJwt(token);

            id_usuario = datosUsuario.id_usuario

            try {
                const res = await fetch(`http://localhost:3000/api/carrito/${id_usuario}/${id_producto}`, {
                    method: "DELETE",
                });

                const result = await res.json();

                if (res.ok && result.success) {
                    
                    fila.remove();

                    location.reload(); 
                } else {
                    mostrarMensajeError("No se pudo eliminar el producto");
                    console.error("No se pudo eliminar el producto: " + result.error)
                }
            } catch (err) {
                console.error("Error al eliminar producto:", err);
                mostrarMensajeError("Ocurrió un error al intentar eliminar el producto.");
            }
            
        });
    });

    document.getElementById("btn-finalizar").addEventListener("click", async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const datosUsuario = parseJwt(token);

    if (!datosUsuario || !datosUsuario.id_usuario) {
        mostrarMensajeError("Debes iniciar sesión para finalizar la compra.");
        return;
    }

    const totalTexto = document.getElementById("total-carrito").textContent;
    const monto = parseInt(totalTexto.replace(/\D/g, ""), 10); 

    try {
        const response = await fetch("http://localhost:3000/api/carrito/pagar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_usuario: datosUsuario.id_usuario,
                total: monto
            })
        });

        const data = await response.json();

        if (data.success) {
            mostrarMensajeError("¡Compra finalizada con éxito!");

            setTimeout(() => {
                window.location.href = "../Cuenta/cuenta.html"; 
            }, 2000);
        } else {
            mostrarMensajeError("Error al finalizar la compra: " + data.message);
            console.error(data);
        }
    } catch (err) {
        console.error("Error al crear la transacción:", err);
        mostrarMensajeError("Ocurrió un error al intentar finalizar la compra.");
    }
});





});


function actualizarResumenCarrito(subtotal, envio, total) {
    const subtotalElement = document.getElementById("subtotal-carrito");
    if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toLocaleString()} CLP`;
    }
    
    const envioElement = document.getElementById("envio-carrito");
    if (envioElement) {
        envioElement.textContent = `$${envio.toLocaleString()} CLP`;
    }
    
    const totalElement = document.getElementById("total-carrito");
    if (totalElement) {
        totalElement.textContent = `$${total.toLocaleString()} CLP`;
    }
}


function mostrarMensajeError(mensaje) {
    const cuerpoTabla = document.getElementById("contenedor-mensaje");
    if (cuerpoTabla) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-danger">${mensaje}</td>
            </tr>
        `;
    }
    
    actualizarResumenCarrito(0, 5000, 5000);
    
}