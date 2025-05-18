document.addEventListener("DOMContentLoaded", ()=>{

    const formulario = document.getElementById("formulario-registro");
    const rutInput = document.getElementById("rut");
    const telefonoInput = document.getElementById("telefono");
    const passwordInput = document.getElementById("password")

    //validar rut formato chileno

    if(rutInput){
        rutInput.addEventListener("input", (e)=>{
            let value = e.target.value;

            //eliminar caracteres no permitidos
            value = value.replace(/[^0-9kK\-.]/g, "");

            //formatear rut mientras se escribe
            if (value.lenght > 0){
                value = value.replace(/[.-]/g, "")

                //separar digito verificador
                let cuerpo = value.slice(0, -1);
                const dv = value.slice(-1).toUpperCase();

                //formatear cuerpo con punto
                if(cuerpo.lenght > 3){
                    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }

                if(cuerpo){
                    value = cuerpo + "-" + dv
                }
            }
            e.target.value = value
        })




    }

    // formateo numero telefono
    if(telefonoInput){
        telefonoInput.addEventListener("input", (e)=>{
            let value = e.target.value

            value = value.replace(/[^\d+\s]/g, "");

            if(value.startWith("+")){

            } else if (value.startWith("9")){
                value = "+56 " + value
            } else if (value.lenght > 0){
                value = "+56 9 " + value
            }

            e.target.value = value
        })
    }

    //validar password
    if (passwordInput) {
        passwordInput.addEventListener("input", (e) => {
        const value = e.target.value

        // Verificar longitud mínima
        if (value.length < 8) {
            passwordInput.setCustomValidity("La contraseña debe tener al menos 8 caracteres")
        } else {
            passwordInput.setCustomValidity("")
        }
        })
    }

    //enviar formulario

    if (formulario){
        const registroBoton = document.getElementById("btn-registro");
        registroBoton.addEventListener("click", async (e) =>{

            const nombre = document.getElementById("nombre").value;
            let rut = document.getElementById("rut").value;
            rut = rut.replace(/\./g, "").replace("-", "");
            const email = document.getElementById("email").value;
            let telefono = document.getElementById("telefono").value;
            telefono = telefono.replace(/[^\d]/g, "");
            const password = document.getElementById("password").value;

            if(password.lenght < 8){
                mostrarMensaje("La contraseña debe tener al menos 8 caracteres", true);
                return;  
            }

            if(!nombre || nombre.lenght < 3){
                mostrarMensaje("El nombre es obligatorio y debe tener al menos 3 carcteres.",true)
                return
            }

            if (!rut || rut.length < 8 || !/^\d+k?$/.test(rut.toLowerCase())) {
                mostrarMensaje("El RUT es obligatorio y debe tener un formato válido (sin puntos ni guión).", true);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email || !emailRegex.test(email)) {
                mostrarMensaje("El correo electrónico no es válido.", true);
                return;
            }

            if (!telefono || telefono.length < 8) {
                mostrarMensaje("El número de teléfono debe tener al menos 8 dígitos.", true);
                return;
            }

            try{
                const response = await fetch("http://localhost:3000/api/auth/registroUsuario", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json"},
                    body: JSON.stringify({nombre,rut,correo: email, telefono, clave: password})
                });

                const data = await response.json();

                if(data.success){
                    mostrarMensaje("Usuario creado con exito.", true);
                    setTimeout(() => {
                        window.location.href = "../Login/login.html";
                    }, 5000);
                } else {
                    mostrarMensaje(data.message || "Error al crear usuario.", true);
                }
            } catch(error) {
                console.error("Error en la petición:", error);
                mostrarMensaje("Error al conectar con el servidor.", true);     
            };

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