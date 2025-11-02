/**
 * Validador de RUC ecuatoriano con algoritmo de verificación de dígito verificador
 * Basado en las especificaciones del SRI de Ecuador
 */

/**
 * Valida un RUC ecuatoriano
 * @param {string} ruc - RUC a validar
 * @returns {Object} { valido: boolean, mensaje: string }
 */
const validarRUC = (ruc) => {
  if (!ruc) {
    return { valido: false, mensaje: 'El RUC es requerido' };
  }

  // Eliminar espacios en blanco
  ruc = ruc.trim();

  // Verificar longitud
  if (ruc.length < 10 || ruc.length > 13) {
    return { valido: false, mensaje: 'El RUC debe tener entre 10 y 13 dígitos' };
  }

  // Verificar que solo contenga números
  if (!/^\d+$/.test(ruc)) {
    return { valido: false, mensaje: 'El RUC debe contener solo números' };
  }

  // Obtener los dos primeros dígitos (código de provincia)
  const provincia = parseInt(ruc.substring(0, 2));

  // Validar código de provincia (01 a 24, más 30 para ecuatorianos en el exterior)
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return { valido: false, mensaje: 'Código de provincia inválido en el RUC' };
  }

  // El tercer dígito determina el tipo de RUC
  const tercerDigito = parseInt(ruc.charAt(2));

  // Tipo 1: Persona natural o extranjero (tercer dígito < 6)
  if (tercerDigito < 6) {
    if (ruc.length !== 10) {
      return { valido: false, mensaje: 'RUC de persona natural debe tener 10 dígitos' };
    }
    return validarCedulaComoRUC(ruc);
  }

  // Tipo 2: Sociedad privada (tercer dígito = 9)
  if (tercerDigito === 9) {
    if (ruc.length !== 13) {
      return { valido: false, mensaje: 'RUC de sociedad debe tener 13 dígitos' };
    }

    // Los últimos 3 dígitos deben ser 001
    if (ruc.substring(10, 13) !== '001') {
      return { valido: false, mensaje: 'RUC de sociedad debe terminar en 001' };
    }

    return validarRUCSociedad(ruc);
  }

  // Tipo 3: Sociedad pública (tercer dígito = 6)
  if (tercerDigito === 6) {
    if (ruc.length !== 13) {
      return { valido: false, mensaje: 'RUC de entidad pública debe tener 13 dígitos' };
    }

    // Los últimos 3 dígitos deben ser 001
    if (ruc.substring(10, 13) !== '001') {
      return { valido: false, mensaje: 'RUC de entidad pública debe terminar en 001' };
    }

    return validarRUCPublico(ruc);
  }

  return { valido: false, mensaje: 'Tipo de RUC no válido' };
};

/**
 * Valida RUC de persona natural (basado en validación de cédula)
 * @param {string} ruc - RUC de 10 dígitos
 * @returns {Object}
 */
const validarCedulaComoRUC = (ruc) => {
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(ruc.charAt(i)) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const digitoVerificador = parseInt(ruc.charAt(9));
  const residuo = suma % 10;
  const resultado = residuo === 0 ? 0 : 10 - residuo;

  if (resultado === digitoVerificador) {
    return { valido: true, mensaje: 'RUC válido' };
  } else {
    return { valido: false, mensaje: 'Dígito verificador de RUC incorrecto' };
  }
};

/**
 * Valida RUC de sociedad privada (tercer dígito = 9)
 * @param {string} ruc - RUC de 13 dígitos
 * @returns {Object}
 */
const validarRUCSociedad = (ruc) => {
  const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    suma += parseInt(ruc.charAt(i)) * coeficientes[i];
  }

  const digitoVerificador = parseInt(ruc.charAt(9));
  const residuo = suma % 11;
  const resultado = residuo === 0 ? 0 : 11 - residuo;

  if (resultado === digitoVerificador) {
    return { valido: true, mensaje: 'RUC válido' };
  } else {
    return { valido: false, mensaje: 'Dígito verificador de RUC incorrecto' };
  }
};

/**
 * Valida RUC de entidad pública (tercer dígito = 6)
 * @param {string} ruc - RUC de 13 dígitos
 * @returns {Object}
 */
const validarRUCPublico = (ruc) => {
  const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 8; i++) {
    suma += parseInt(ruc.charAt(i)) * coeficientes[i];
  }

  const digitoVerificador = parseInt(ruc.charAt(8));
  const residuo = suma % 11;
  const resultado = residuo === 0 ? 0 : 11 - residuo;

  if (resultado === digitoVerificador) {
    return { valido: true, mensaje: 'RUC válido' };
  } else {
    return { valido: false, mensaje: 'Dígito verificador de RUC incorrecto' };
  }
};

/**
 * Obtiene el tipo de RUC basado en el tercer dígito
 * @param {string} ruc - RUC a analizar
 * @returns {string} Tipo de RUC
 */
const obtenerTipoRUC = (ruc) => {
  if (!ruc || ruc.length < 3) {
    return 'DESCONOCIDO';
  }

  const tercerDigito = parseInt(ruc.charAt(2));

  if (tercerDigito < 6) {
    return 'PERSONA_NATURAL';
  } else if (tercerDigito === 6) {
    return 'ENTIDAD_PUBLICA';
  } else if (tercerDigito === 9) {
    return 'SOCIEDAD_PRIVADA';
  }

  return 'DESCONOCIDO';
};

/**
 * Valida que el RUC sea de una empresa (no persona natural)
 * Solo acepta RUC de sociedades privadas (tercer dígito = 9) o públicas (tercer dígito = 6)
 * @param {string} ruc - RUC a validar
 * @returns {Object} { valido: boolean, mensaje: string }
 */
const validarRUCEmpresa = (ruc) => {
  if (!ruc) {
    return { valido: false, mensaje: 'El RUC es requerido' };
  }

  // Eliminar espacios en blanco
  ruc = ruc.trim();

  // Verificar longitud (empresas siempre tienen 13 dígitos)
  if (ruc.length !== 13) {
    return { valido: false, mensaje: 'El RUC de empresa debe tener 13 dígitos' };
  }

  // Verificar que solo contenga números
  if (!/^\d+$/.test(ruc)) {
    return { valido: false, mensaje: 'El RUC debe contener solo números' };
  }

  // Obtener los dos primeros dígitos (código de provincia)
  const provincia = parseInt(ruc.substring(0, 2));

  // Validar código de provincia (01 a 24, más 30 para ecuatorianos en el exterior)
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return { valido: false, mensaje: 'Código de provincia inválido en el RUC' };
  }

  // El tercer dígito determina el tipo de RUC
  const tercerDigito = parseInt(ruc.charAt(2));

  // Rechazar RUC de personas naturales (tercer dígito < 6)
  if (tercerDigito < 6) {
    return { valido: false, mensaje: 'El RUC proporcionado corresponde a una persona natural. Para empresas debe usar RUC de 13 dígitos' };
  }

  // Los últimos 3 dígitos deben ser 001
  if (ruc.substring(10, 13) !== '001') {
    return { valido: false, mensaje: 'El RUC de empresa debe terminar en 001' };
  }

  // Validar según el tipo
  if (tercerDigito === 9) {
    // Sociedad privada
    return validarRUCSociedad(ruc);
  } else if (tercerDigito === 6) {
    // Entidad pública
    return validarRUCPublico(ruc);
  }

  return { valido: false, mensaje: 'Tipo de RUC no válido para empresa. El tercer dígito debe ser 6 (entidad pública) o 9 (sociedad privada)' };
};

module.exports = {
  validarRUC,
  validarRUCEmpresa,
  obtenerTipoRUC
};
