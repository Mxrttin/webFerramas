document.addEventListener("DOMContentLoaded", () => {

  //localStorage.removeItem("isLoggedIn"); no tocar hasta ultimo aviso 
  //localStorage.removeItem("datosUsuario"); no tocar hasta ultimo aviso

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const cuentaLink = document.getElementById("cuenta-enlace");

  if (cuentaLink) {
    if (isLoggedIn) {
      cuentaLink.setAttribute("href", "./Cuenta/cuenta.html"); // Ajusta la ruta si está en otra carpeta
    } else {
      cuentaLink.setAttribute("href", "./Login/login.html");
    }
  }
});


