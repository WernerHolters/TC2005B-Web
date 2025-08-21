console.clear();

const nombre = "Werner";

let edad = 22;

const esCrack = true;

const nada = null;

let indefinido;

console.log("Tipo de dato de nombre:", typeof nombre, typeof edad, typeof esCrack, typeof nada, typeof indefinido);

const lenguaje = "JavaScript";

console.log(`El lenguaje es ${lenguaje}`);

function imprimirDatos() {
    const datos = {
        nombre: nombre,
        edad: edad,
        esCrack: esCrack,
        nada: nada,
        indefinido: indefinido,
        lenguaje: lenguaje
    };
    console.log(datos);

    document.getElementById("datosImpresos").innerHTML = 
    `
        <p>Nombre: ${nombre}</p>
        <p>Edad: ${edad}</p>
        <p>Es crack: ${esCrack}</p>
        <p>Nada: ${nada}</p>
        <p>Indefinido: ${indefinido}</p>
        <p>Lenguaje: ${lenguaje}</p>
    `;
}
