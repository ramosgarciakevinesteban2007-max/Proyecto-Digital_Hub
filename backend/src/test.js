const pool = require("./db/database")

const pruebaConexion = async ()=>{
    try {
        const conexion = await pool.getConnection()
        console.log("✅ Conexion exitosa")
        conexion.release()
    } catch (error) {
        console.log("❌ conexion fallida")
    }
}

pruebaConexion()

// ===== GENERADOR =====
function* estadosPortatil() {
    yield "disponible";
    yield "asignado";
    yield "danado";
}

const generador = estadosPortatil();
console.log(generador.next().value); // disponible
console.log(generador.next().value); // asignado
console.log(generador.next().value); // danado
console.log(generador.next().value); // undefined
