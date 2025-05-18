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
    datosUsuario = parseJwt(token)

    idUsuario = datosUsuario.id_usuario;

    const registro = document.getElementById("formulario-registro")

    if(registro){
        const registroBoton = document.getElementById("btn-registro")

        registroBoton.addEventListener("click", async(e) =>{
            e.preventDefault();

            const direccion = document.getElementById("direccion").value;
            const comuna = document.getElementById("comuna").value;
            const ciudad = document.getElementById("ciudad").value;
            const region = document.getElementById("region").value;
            const id_usuario = idUsuario;


            if (!direccion || !comuna || !ciudad || !region) {
                mostrarMensaje("Por favor completa todos los campos obligatorios.", true);
                return;
            }

            if (direccion.trim().length < 5 || comuna.trim().length < 4 || ciudad.trim().length < 4 || region.trim().length < 5) {
                mostrarMensaje("Por favor completa todos los campos correctamente.", true);
                return;
            }


            try {
                const response = await fetch("http://localhost:3000/api/direccion/agregarDireccion",{
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({direccion,comuna,ciudad,region,id_usuario})
                });

                data = await response.json();

                if(data){
                    mostrarMensaje("Direccion agregada con exito", false);
                    setTimeout(() => {
                       window.location.href = "../Cuenta/cuenta.html" 
                    }, 2000);
                } else {
                    mostrarMensaje(data.message || "Error al agregar direccion", true)
                }

            } catch (error) {
                console.error("Error en la petición", error);
                mostrarMensaje("Error al conectar con el servidor", true);
            }

        })
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