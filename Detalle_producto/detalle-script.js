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
  // Obtener el ID del producto de la URL
  const parametrosUrl = new URLSearchParams(window.location.search)
  const idProducto = parametrosUrl.get("id")

  if (!idProducto) {
    mostrarError("No se especificó un producto para mostrar")
    return
  }

  cargarDetalleProducto(idProducto)

  async function cargarDetalleProducto(id) {
    try {
      const respuesta = await fetch(`http://localhost:3000/productos/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`)
      }

      const datos = await respuesta.json()

      if (datos.success && datos.producto) {
        mostrarDetalleProducto(datos.producto)
      } else {
        throw new Error("No se pudo obtener la información del producto")
      }
    } catch (error) {
      console.error("Error al cargar el detalle del producto:", error)
      mostrarError("Error al cargar la información del producto. Por favor, intenta de nuevo más tarde.")
    }
  }

  function mostrarDetalleProducto(producto) {
    const contenedorDetalleProducto = document.getElementById("detalle-producto")

    // Verificar si el producto está disponible
    const disponible = producto.cantidad > 0
    const estadoTexto = disponible ? "Disponible" : "Agotado"
    const estadoClase = disponible ? "disponible" : "agotado"

    // Crear HTML para el detalle del producto
    const detalleHTML = `
            <div class="col-md-6 mb-4">
                <div class="contenedor-imagen-producto">
                    <img src="${producto.foto}" alt="${producto.nombre}" class="imagen-detalle-producto">
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-detalle-producto">
                    <h1 class="titulo-producto">${producto.nombre}</h1>
                    <p class="marca-producto">${producto.marca}</p>
                    <p class="precio-detalle-producto">$${producto.precio} CLP</p>
                    
                    <!-- Estado del producto -->
                    <p class="estado-producto ${estadoClase}">${estadoTexto}</p>
                    
                    <!-- Selector de cantidad -->
                    <div class="selector-cantidad">
                        <p class="etiqueta-cantidad">Cantidad disponible: ${producto.cantidad}</p>
                        <div class="controles-cantidad">
                            <button class="boton-cantidad disminuir" id="disminuir-cantidad" ${!disponible ? 'disabled' : ''}>-</button>
                            <input type="number" value="1" min="1" max="${producto.cantidad}" class="input-cantidad" id="input-cantidad" ${!disponible ? 'disabled' : ''}>
                            <button class="boton-cantidad aumentar" id="aumentar-cantidad" ${!disponible ? 'disabled' : ''}>+</button>
                        </div>
                    </div>

                    <!-- Botón agregar al carrito -->
                    <button type="button" class="btn btn-dark btn-block mb-4 btn-agregar-carrito" id="btn-agregar-carrito" ${!disponible ? 'disabled' : ''}>
                        ${disponible ? 'Agregar al carrito' : 'Producto agotado'}
                    </button>
                    
                    <!-- Contenedor para mensajes -->
                    <div id="contenedor-mensaje" class="mb-4"></div>
                    
                    <!-- Acordeones de información -->
                    <div class="accordion acordeones-producto" id="acordeonProducto">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="encabezadoDescripcion">
                                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDescripcion" aria-expanded="true" aria-controls="collapseDescripcion">
                                    Descripción
                                </button>
                            </h2>
                            <div id="collapseDescripcion" class="accordion-collapse collapse show" aria-labelledby="encabezadoDescripcion" data-bs-parent="#acordeonProducto">
                                <div class="accordion-body">
                                    ${producto.descripcion || "No hay descripción disponible para este producto."}
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        `

    contenedorDetalleProducto.innerHTML = detalleHTML


    configurarControles(producto)
  }

  function configurarControles(producto) {
    const botonDisminuir = document.getElementById("disminuir-cantidad")
    const botonAumentar = document.getElementById("aumentar-cantidad")
    const inputCantidad = document.getElementById("input-cantidad")
    const botonAgregarCarrito = document.getElementById("btn-agregar-carrito")

    if (botonDisminuir && botonAumentar && inputCantidad) {
      botonDisminuir.addEventListener("click", () => {
        const valorActual = parseInt(inputCantidad.value)
        if (valorActual > 1) {
          inputCantidad.value = valorActual - 1
        }
      })

      botonAumentar.addEventListener("click", () => {
        const valorActual = parseInt(inputCantidad.value)
        const maxCantidad = parseInt(inputCantidad.getAttribute("max"))
        if (valorActual < maxCantidad) {
          inputCantidad.value = valorActual + 1
        }
      })

      inputCantidad.addEventListener("change", () => {
        let valor = parseInt(inputCantidad.value)
        const minCantidad = parseInt(inputCantidad.getAttribute("min"))
        const maxCantidad = parseInt(inputCantidad.getAttribute("max"))

        if (isNaN(valor) || valor < minCantidad) {
          inputCantidad.value = minCantidad
        } else if (valor > maxCantidad) {
          inputCantidad.value = maxCantidad
        }
      })
    }

    // Configurar el botón de agregar al carrito
    if (botonAgregarCarrito && producto.cantidad > 0) {
      botonAgregarCarrito.addEventListener("click", () => {
        agregarAlCarrito(producto.id_producto, parseInt(inputCantidad.value))
      })
    }
  }


  async function agregarAlCarrito(idProducto, cantidad) {
    try {
      const sesionIniciada = localStorage.getItem("isLoggedIn");
      const token = localStorage.getItem("token");

      const datosUsuario = parseJwt(token)
      
      if (!sesionIniciada || !datosUsuario) {
        mostrarMensaje("Debes iniciar sesión para agregar productos al carrito", true);
        setTimeout(() => {
          window.location.href = "../Login/login.html";
        }, 2000);
        return;
      }
      
      rutUsuario = datosUsuario.rut
      
      try {
        
        if (!rutUsuario) {
          throw new Error("No se pudo obtener el RUT del usuario");
        }
      } catch (error) {
        console.error("Error al descifrar datos del usuario:", error);
        mostrarMensaje("Error al procesar los datos del usuario. Por favor, inicia sesión nuevamente.", true);
        return;
      }
      
      // mensaje de carga
      mostrarMensaje("Agregando al carrito...", false);
      

      const respuesta = await fetch("http://localhost:3000/carrito/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rut_usuario: rutUsuario,
          id_producto: idProducto,
          cantidad: cantidad
        })
      });
      
      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }
      
      const datos = await respuesta.json();
      
      if (datos.success) {
        mostrarMensaje("¡Producto agregado al carrito con éxito!", false);
      } else {
        mostrarMensaje(datos.message || "Error al agregar el producto al carrito", true);
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      mostrarMensaje("Error al agregar el producto al carrito. Por favor, intenta de nuevo más tarde.", true);
    }
  }

  // Función para mostrar mensajes
  function mostrarMensaje(mensaje, esError) {
    const contenedorMensaje = document.getElementById("contenedor-mensaje")
    
    if (contenedorMensaje) {
      contenedorMensaje.innerHTML = `
        <div class="${esError ? 'mensaje-error' : 'mensaje-exito'}">
          ${mensaje}
        </div>
      `
      
      setTimeout(() => {
        contenedorMensaje.innerHTML = ""
      }, 5000)
    }
  }

  function mostrarError(mensaje) {
    const contenedorDetalleProducto = document.getElementById("detalle-producto")

    if (contenedorDetalleProducto) {
      contenedorDetalleProducto.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        ${mensaje}
                    </div>
                    <a href="productos.html" class="btn btn-outline-dark mt-3">
                        <i class="fas fa-arrow-left me-2"></i>
                        Volver a productos
                    </a>
                </div>
            `
    }
  }
})