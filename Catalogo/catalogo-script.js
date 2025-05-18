document.addEventListener("DOMContentLoaded", () => {
    const cartaCategoria = document.getElementById("row");
    const params = new URLSearchParams(window.location.search);
    const idCategoria = params.get("id_categoria");


    if(cartaCategoria){
        fetch("http://localhost:3000/api/categorias")
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cartaCategoria.innerHTML = ""; 

                    data.categorias.forEach(categoria => {
                        const detalleHTML = `
                            <div class="col-md-4 mb-4">
                                <div class="tarjeta-categoria">
                                    <div class="imagen-categoria">
                                        <img src="${categoria.foto}" class="img-fluid" alt="${categoria.nombre}">
                                        <div class="overlay-categoria">
                                            <h3 class="texto-categoria ">${categoria.nombre}</h3>
                                        </div>
                                    </div>
                                    <div class="pie-categoria">
                                        <a href="./producto-catalogo.html?id_categoria=${categoria.id_categoria}" class="enlace-categoria text-dark">${categoria.nombre}<i class="fas fa-arrow-right"></i></a>
                                    </div>
                                </div>
                            </div>
                        `;
                        cartaCategoria.innerHTML += detalleHTML;
                    });
                } else {
                    console.error("Error en la respuesta de categorías:", data);
                }
            })
            .catch(error => {
                console.error("Error al cargar categorías:", error);
        });

    }
    


    if (idCategoria) {
    fetch(`http://localhost:3000/api/categorias/${idCategoria}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const contenedor = document.getElementById("producto-container");

                contenedor.innerHTML = ""; 

                data.productos.forEach(producto => {
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
                    contenedor.appendChild(columna);
                });

                document.querySelectorAll(".tarjeta-producto").forEach(tarjeta => {
                    tarjeta.addEventListener("click", () => {
                        const idProducto = tarjeta.dataset.productoId;
                        window.location.href = `../Detalle_producto/detalle_producto.html?id=${idProducto}`;
                    });
                });


            } else {
                console.error("No se encontraron productos para esta categoría.");
            }
        })
        .catch(error => console.error("Error al cargar productos:", error));
    }

});