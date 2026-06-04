const rolesValidos = ["administrador", "instructor", "aprendiz"];

const estadosUsuarioValidos = ["activo", "inhabilitado"];

function validarRol(rol) {
    return rolesValidos.includes(rol);
}

function validarEstadoUsuario(estado) {
    return estadosUsuarioValidos.includes(estado);
}

function validarCorreo(correo) {

    const regexCorreo =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regexCorreo.test(correo);
}

module.exports = {
    rolesValidos,
    estadosUsuarioValidos,
    validarRol,
    validarEstadoUsuario,
    validarCorreo
};