const { Compra, Empresa, Usuario, Retencion } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Servicio de gestión de compras
 */
class CompraService {
  /**
   * Obtener todas las compras con filtros
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} pagina - Número de página
   * @param {number} limite - Registros por página
   * @returns {Object} Lista de compras y metadatos
   */
  async obtenerTodas(empresaId, filtros = {}, pagina = 1, limite = 20) {
    const offset = (pagina - 1) * limite;
    const where = { empresa_id: empresaId };

    // Aplicar filtros
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.identificacion_proveedor) {
      where.identificacion_proveedor = { [Op.like]: `%${filtros.identificacion_proveedor}%` };
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const { rows, count } = await Compra.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['fecha_emision', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Retencion,
          as: 'retenciones',
          required: false
        }
      ]
    });

    return {
      compras: rows,
      paginacion: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(count / limite)
      }
    };
  }

  /**
   * Obtener compra por ID
   * @param {number} id - ID de la compra
   * @param {number} empresaId - ID de la empresa
   * @returns {Object} Compra
   */
  async obtenerPorId(id, empresaId) {
    const compra = await Compra.findOne({
      where: { id, empresa_id: empresaId },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Retencion,
          as: 'retenciones'
        }
      ]
    });

    if (!compra) {
      throw new AppError('Compra no encontrada', 404);
    }

    return compra;
  }

  /**
   * Crear nueva compra con retenciones
   * @param {Object} datos - Datos de la compra
   * @param {Array} datos.retenciones - Array de retenciones asociadas a la compra
   * @param {number} usuarioId - ID del usuario que crea
   * @returns {Object} Compra creada con sus retenciones
   */
  async crear(datos, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      // Extraer retenciones del objeto de datos
      const { retenciones, ...datosCompra } = datos;

      // Agregar usuario_id
      datosCompra.usuario_id = usuarioId;

      // Validar totales
      this.validarTotales(datosCompra);

      // Crear la compra
      const compra = await Compra.create(datosCompra, { transaction });

      // Crear retenciones si existen
      const retencionesCreadas = [];
      if (retenciones && Array.isArray(retenciones) && retenciones.length > 0) {
        // Validar y calcular totales de retenciones
        let totalRetencionIva = 0;
        let totalRetencionRenta = 0;

        for (const retencionData of retenciones) {
          // Agregar campos requeridos
          const retencionCompleta = {
            ...retencionData,
            empresa_id: datosCompra.empresa_id,
            usuario_id: usuarioId,
            compra_id: compra.id,
            periodo: datosCompra.periodo,
            identificacion_proveedor: datosCompra.identificacion_proveedor,
            razon_social_proveedor: datosCompra.razon_social_proveedor,
            tipo_identificacion: datosCompra.tipo_identificacion
          };

          // Validar que tenga los campos requeridos
          if (!retencionCompleta.fecha_emision) {
            throw new AppError('La fecha de emisión de la retención es requerida', 400);
          }
          if (!retencionCompleta.establecimiento) {
            throw new AppError('El establecimiento de retención es requerido', 400);
          }
          if (!retencionCompleta.punto_emision) {
            throw new AppError('El punto de emisión de retención es requerido', 400);
          }
          if (!retencionCompleta.secuencial) {
            throw new AppError('El secuencial de retención es requerido', 400);
          }
          if (!retencionCompleta.numero_autorizacion) {
            throw new AppError('El número de autorización de retención es requerido', 400);
          }
          if (!retencionCompleta.tipo_impuesto) {
            throw new AppError('El tipo de impuesto de retención es requerido', 400);
          }
          if (!retencionCompleta.codigo_retencion) {
            throw new AppError('El código de retención es requerido', 400);
          }
          if (retencionCompleta.base_imponible === undefined || retencionCompleta.base_imponible === null) {
            throw new AppError('La base imponible de retención es requerida', 400);
          }
          if (retencionCompleta.porcentaje_retencion === undefined || retencionCompleta.porcentaje_retencion === null) {
            throw new AppError('El porcentaje de retención es requerido', 400);
          }
          if (retencionCompleta.valor_retenido === undefined || retencionCompleta.valor_retenido === null) {
            throw new AppError('El valor retenido es requerido', 400);
          }

          // Crear la retención
          const retencion = await Retencion.create(retencionCompleta, { transaction });
          retencionesCreadas.push(retencion);

          // Sumar a los totales según el tipo
          if (retencion.tipo_impuesto === 'IVA') {
            totalRetencionIva += parseFloat(retencion.valor_retenido);
          } else if (retencion.tipo_impuesto === 'RENTA') {
            totalRetencionRenta += parseFloat(retencion.valor_retenido);
          }
        }

        // Actualizar los totales de retención en la compra
        await compra.update({
          valor_retencion_iva: parseFloat(totalRetencionIva.toFixed(2)),
          valor_retencion_renta: parseFloat(totalRetencionRenta.toFixed(2))
        }, { transaction });
      }

      // Confirmar transacción
      await transaction.commit();

      // Cargar la compra con sus retenciones
      const compraCompleta = await this.obtenerPorId(compra.id, datosCompra.empresa_id);

      return compraCompleta;
    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Actualizar compra con retenciones
   * @param {number} id - ID de la compra
   * @param {number} empresaId - ID de la empresa
   * @param {Object} datos - Datos a actualizar
   * @param {Array} datos.retenciones - Array de retenciones (reemplazará las existentes)
   * @returns {Object} Compra actualizada
   */
  async actualizar(id, empresaId, datos) {
    const transaction = await sequelize.transaction();

    try {
      const compra = await Compra.findOne({
        where: { id, empresa_id: empresaId },
        transaction
      });

      if (!compra) {
        throw new AppError('Compra no encontrada', 404);
      }

      // No permitir actualizar si ya está incluida en ATS
      if (compra.estado === 'INCLUIDO_ATS') {
        throw new AppError('No se puede modificar una compra ya incluida en el ATS', 400);
      }

      // Extraer retenciones del objeto de datos
      const { retenciones, ...datosCompra } = datos;

      // Validar totales si se modifican
      if (datosCompra.total_compra) {
        this.validarTotales({ ...compra.toJSON(), ...datosCompra });
      }

      // Actualizar la compra
      await compra.update(datosCompra, { transaction });

      // Si se proporcionan retenciones, actualizar
      if (retenciones !== undefined) {
        // Eliminar retenciones existentes
        await Retencion.destroy({
          where: { compra_id: id },
          transaction
        });

        // Crear nuevas retenciones si existen
        if (Array.isArray(retenciones) && retenciones.length > 0) {
          let totalRetencionIva = 0;
          let totalRetencionRenta = 0;

          for (const retencionData of retenciones) {
            const retencionCompleta = {
              ...retencionData,
              empresa_id: empresaId,
              usuario_id: compra.usuario_id,
              compra_id: compra.id,
              periodo: compra.periodo,
              identificacion_proveedor: compra.identificacion_proveedor,
              razon_social_proveedor: compra.razon_social_proveedor,
              tipo_identificacion: compra.tipo_identificacion
            };

            // Validar campos requeridos
            if (!retencionCompleta.fecha_emision) {
              throw new AppError('La fecha de emisión de la retención es requerida', 400);
            }
            if (!retencionCompleta.establecimiento) {
              throw new AppError('El establecimiento de retención es requerido', 400);
            }
            if (!retencionCompleta.punto_emision) {
              throw new AppError('El punto de emisión de retención es requerido', 400);
            }
            if (!retencionCompleta.secuencial) {
              throw new AppError('El secuencial de retención es requerido', 400);
            }
            if (!retencionCompleta.numero_autorizacion) {
              throw new AppError('El número de autorización de retención es requerido', 400);
            }
            if (!retencionCompleta.tipo_impuesto) {
              throw new AppError('El tipo de impuesto de retención es requerido', 400);
            }
            if (!retencionCompleta.codigo_retencion) {
              throw new AppError('El código de retención es requerido', 400);
            }
            if (retencionCompleta.base_imponible === undefined || retencionCompleta.base_imponible === null) {
              throw new AppError('La base imponible de retención es requerida', 400);
            }
            if (retencionCompleta.porcentaje_retencion === undefined || retencionCompleta.porcentaje_retencion === null) {
              throw new AppError('El porcentaje de retención es requerido', 400);
            }
            if (retencionCompleta.valor_retenido === undefined || retencionCompleta.valor_retenido === null) {
              throw new AppError('El valor retenido es requerido', 400);
            }

            const retencion = await Retencion.create(retencionCompleta, { transaction });

            if (retencion.tipo_impuesto === 'IVA') {
              totalRetencionIva += parseFloat(retencion.valor_retenido);
            } else if (retencion.tipo_impuesto === 'RENTA') {
              totalRetencionRenta += parseFloat(retencion.valor_retenido);
            }
          }

          // Actualizar totales de retención en la compra
          await compra.update({
            valor_retencion_iva: parseFloat(totalRetencionIva.toFixed(2)),
            valor_retencion_renta: parseFloat(totalRetencionRenta.toFixed(2))
          }, { transaction });
        } else {
          // Si no hay retenciones, poner en cero
          await compra.update({
            valor_retencion_iva: 0,
            valor_retencion_renta: 0
          }, { transaction });
        }
      }

      await transaction.commit();

      // Cargar la compra con sus retenciones
      const compraCompleta = await this.obtenerPorId(id, empresaId);
      return compraCompleta;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Eliminar compra
   * @param {number} id - ID de la compra
   * @param {number} empresaId - ID de la empresa
   */
  async eliminar(id, empresaId) {
    const compra = await Compra.findOne({
      where: { id, empresa_id: empresaId }
    });

    if (!compra) {
      throw new AppError('Compra no encontrada', 404);
    }

    // No permitir eliminar si ya está incluida en ATS
    if (compra.estado === 'INCLUIDO_ATS') {
      throw new AppError('No se puede eliminar una compra ya incluida en el ATS', 400);
    }

    // Cambiar estado a ANULADO
    await compra.update({ estado: 'ANULADO' });

    return { mensaje: 'Compra anulada correctamente' };
  }

  /**
   * Validar compra
   * @param {number} id - ID de la compra
   * @param {number} empresaId - ID de la empresa
   * @returns {Object} Compra validada
   */
  async validar(id, empresaId) {
    const compra = await Compra.findOne({
      where: { id, empresa_id: empresaId }
    });

    if (!compra) {
      throw new AppError('Compra no encontrada', 404);
    }

    // Validar totales
    this.validarTotales(compra);

    await compra.update({ estado: 'VALIDADO' });
    return compra;
  }

  /**
   * Validar múltiples compras en estado BORRADOR
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros opcionales (periodo, proveedor, etc.)
   * @returns {Object} Resultado de la validación masiva
   */
  async validarMasivo(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: 'BORRADOR'
    };

    // Aplicar filtros adicionales si existen
    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.identificacion_proveedor) {
      where.identificacion_proveedor = { [Op.like]: `%${filtros.identificacion_proveedor}%` };
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    // Obtener todas las compras en BORRADOR
    const compras = await Compra.findAll({ where });

    if (compras.length === 0) {
      throw new AppError('No hay compras en estado BORRADOR para validar', 404);
    }

    const resultados = {
      total: compras.length,
      validadas: 0,
      errores: []
    };

    // Validar cada compra
    for (const compra of compras) {
      try {
        // Validar totales
        this.validarTotales(compra);

        // Actualizar estado
        await compra.update({ estado: 'VALIDADO' });
        resultados.validadas++;
      } catch (error) {
        resultados.errores.push({
          id: compra.id,
          proveedor: compra.razon_social_proveedor,
          fecha: compra.fecha_emision,
          error: error.message
        });
      }
    }

    return resultados;
  }

  /**
   * Eliminar permanentemente todas las compras en estado ANULADO
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros opcionales (periodo, proveedor, etc.)
   * @returns {Object} Resultado de la eliminación
   */
  async eliminarAnulados(empresaId, filtros = {}) {
    const transaction = await sequelize.transaction();

    try {
      const where = {
        empresa_id: empresaId,
        estado: 'ANULADO'
      };

      // Aplicar filtros adicionales si existen
      if (filtros.periodo) {
        where.periodo = filtros.periodo;
      }

      if (filtros.identificacion_proveedor) {
        where.identificacion_proveedor = { [Op.like]: `%${filtros.identificacion_proveedor}%` };
      }

      if (filtros.fecha_desde && filtros.fecha_hasta) {
        where.fecha_emision = {
          [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
        };
      }

      console.log('Buscando compras anuladas con filtros:', where);

      // Obtener todas las compras ANULADAS que cumplan los filtros
      const comprasAnuladas = await Compra.findAll({
        where,
        transaction
      });

      console.log(`Encontradas ${comprasAnuladas.length} compras anuladas`);

      if (comprasAnuladas.length === 0) {
        await transaction.rollback();
        return {
          mensaje: 'No hay compras anuladas para eliminar',
          eliminados: 0
        };
      }

      // Extraer IDs de las compras a eliminar
      const compraIds = comprasAnuladas.map(c => c.id);
      console.log('IDs de compras a eliminar:', compraIds);

      // Eliminar retenciones asociadas primero (por la foreign key)
      console.log('Eliminando retenciones asociadas...');
      const retencionesEliminadas = await Retencion.destroy({
        where: { compra_id: { [Op.in]: compraIds } },
        transaction
      });
      console.log(`${retencionesEliminadas} retenciones eliminadas`);

      // Eliminar las compras
      console.log('Eliminando compras...');
      const eliminados = await Compra.destroy({
        where: { id: { [Op.in]: compraIds } },
        transaction
      });
      console.log(`${eliminados} compras eliminadas`);

      await transaction.commit();

      return {
        mensaje: `${eliminados} compra(s) anulada(s) eliminada(s) permanentemente`,
        eliminados
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error detallado al eliminar compras anuladas:', {
        mensaje: error.message,
        stack: error.stack,
        nombre: error.name,
        sql: error.sql
      });
      throw new AppError(`Error al eliminar compras anuladas: ${error.message}`, 500);
    }
  }

  /**
   * Validación de totales (lógica de negocio)
   * @param {Object} datos - Datos de la compra
   * @throws {AppError} Si los totales no cuadran
   */
  validarTotales(datos) {
    const baseTotal =
      parseFloat(datos.base_imponible_0 || 0) +
      parseFloat(datos.base_imponible_iva || 0) +
      parseFloat(datos.base_imponible_no_objeto_iva || 0) +
      parseFloat(datos.base_imponible_exento_iva || 0);

    const totalCalculado = baseTotal +
      parseFloat(datos.monto_iva || 0) +
      parseFloat(datos.monto_ice || 0);

    const totalRegistrado = parseFloat(datos.total_compra || 0);
    const diferencia = Math.abs(totalCalculado - totalRegistrado);

    // Permitir diferencia de 0.50 por redondeo (más flexible para importaciones XML)
    // El SRI a veces tiene diferencias de redondeo en los XML
    if (diferencia > 0.50) {
      console.error('Error de validación de totales:', {
        baseTotal: baseTotal.toFixed(2),
        monto_iva: parseFloat(datos.monto_iva || 0).toFixed(2),
        monto_ice: parseFloat(datos.monto_ice || 0).toFixed(2),
        totalCalculado: totalCalculado.toFixed(2),
        totalRegistrado: totalRegistrado.toFixed(2),
        diferencia: diferencia.toFixed(2)
      });
      throw new AppError(
        `El total de la compra no cuadra. Calculado: ${totalCalculado.toFixed(2)}, Registrado: ${totalRegistrado.toFixed(2)}. Diferencia: ${diferencia.toFixed(2)}. Revise las bases imponibles y los impuestos.`,
        400
      );
    }

    // Si hay diferencia pero es menor a 0.50, registrar advertencia en consola
    if (diferencia > 0.01) {
      console.warn('Advertencia: Pequeña diferencia en totales:', {
        diferencia: diferencia.toFixed(2),
        totalCalculado: totalCalculado.toFixed(2),
        totalRegistrado: totalRegistrado.toFixed(2)
      });
    }

    return true;
  }

  /**
   * Obtener resumen de compras por periodo
   * @param {number} empresaId - ID de la empresa
   * @param {string} periodo - Periodo formato MM/AAAA
   * @returns {Object} Resumen de compras
   */
  async obtenerResumenPorPeriodo(empresaId, periodo) {
    const compras = await Compra.findAll({
      where: {
        empresa_id: empresaId,
        periodo,
        estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
      }
    });

    const resumen = {
      total_compras: compras.length,
      base_imponible_0: 0,
      base_imponible_iva: 0,
      total_iva: 0,
      total_retenciones_iva: 0,
      total_retenciones_renta: 0,
      total_general: 0
    };

    compras.forEach(compra => {
      resumen.base_imponible_0 += parseFloat(compra.base_imponible_0 || 0);
      resumen.base_imponible_iva += parseFloat(compra.base_imponible_iva || 0);
      resumen.total_iva += parseFloat(compra.monto_iva || 0);
      resumen.total_retenciones_iva += parseFloat(compra.valor_retencion_iva || 0);
      resumen.total_retenciones_renta += parseFloat(compra.valor_retencion_renta || 0);
      resumen.total_general += parseFloat(compra.total_compra || 0);
    });

    // Redondear a 2 decimales
    Object.keys(resumen).forEach(key => {
      if (typeof resumen[key] === 'number' && key !== 'total_compras') {
        resumen[key] = parseFloat(resumen[key].toFixed(2));
      }
    });

    return resumen;
  }

  /**
   * Reporte de compras agrupadas por tipo de crédito tributario
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros (periodo, fecha_desde, fecha_hasta)
   * @returns {Array} Compras agrupadas por tipo de crédito tributario
   */
  async reportePorCreditoTributario(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const compras = await Compra.findAll({
      where,
      order: [['tipo_credito_tributario', 'ASC'], ['fecha_emision', 'DESC']]
    });

    // Agrupar por tipo de crédito tributario
    const agrupado = {};
    compras.forEach(compra => {
      const tipo = compra.tipo_credito_tributario || 'SIN_CREDITO';
      if (!agrupado[tipo]) {
        agrupado[tipo] = {
          tipo_credito: tipo,
          cantidad: 0,
          total_compras: 0,
          total_iva: 0,
          total_ice: 0,
          compras: []
        };
      }

      agrupado[tipo].cantidad++;
      agrupado[tipo].total_compras += parseFloat(compra.total_compra || 0);
      agrupado[tipo].total_iva += parseFloat(compra.monto_iva || 0);
      agrupado[tipo].total_ice += parseFloat(compra.monto_ice || 0);
      agrupado[tipo].compras.push(compra);
    });

    return Object.values(agrupado);
  }

  /**
   * Reporte de compras agrupadas por proveedor
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros
   * @returns {Array} Compras agrupadas por proveedor
   */
  async reportePorProveedor(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const compras = await Compra.findAll({
      where,
      order: [['razon_social_proveedor', 'ASC'], ['fecha_emision', 'DESC']]
    });

    // Agrupar por proveedor
    const agrupado = {};
    compras.forEach(compra => {
      const key = compra.identificacion_proveedor;
      if (!agrupado[key]) {
        agrupado[key] = {
          identificacion: compra.identificacion_proveedor,
          razon_social: compra.razon_social_proveedor,
          cantidad_compras: 0,
          total_compras: 0,
          total_iva: 0,
          total_retenciones_iva: 0,
          total_retenciones_renta: 0,
          compras: []
        };
      }

      agrupado[key].cantidad_compras++;
      agrupado[key].total_compras += parseFloat(compra.total_compra || 0);
      agrupado[key].total_iva += parseFloat(compra.monto_iva || 0);
      agrupado[key].compras.push(compra);
    });

    // Ordenar por total compras descendente
    return Object.values(agrupado).sort((a, b) => b.total_compras - a.total_compras);
  }

  /**
   * Reporte de compras agrupadas por porcentaje de IVA
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros
   * @returns {Array} Compras agrupadas por porcentaje de IVA
   */
  async reportePorPorcentajeIVA(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const compras = await Compra.findAll({ where });

    // Categorizar por porcentaje de IVA
    const categorias = {
      '0%': { porcentaje: '0%', cantidad: 0, base_imponible: 0, monto_iva: 0, compras: [] },
      '12%': { porcentaje: '12%', cantidad: 0, base_imponible: 0, monto_iva: 0, compras: [] },
      '15%': { porcentaje: '15%', cantidad: 0, base_imponible: 0, monto_iva: 0, compras: [] },
      'NO_OBJETO': { porcentaje: 'No Objeto IVA', cantidad: 0, base_imponible: 0, monto_iva: 0, compras: [] },
      'EXENTO': { porcentaje: 'Exento IVA', cantidad: 0, base_imponible: 0, monto_iva: 0, compras: [] }
    };

    compras.forEach(compra => {
      if (parseFloat(compra.base_imponible_0 || 0) > 0) {
        categorias['0%'].cantidad++;
        categorias['0%'].base_imponible += parseFloat(compra.base_imponible_0);
        categorias['0%'].compras.push(compra);
      }
      if (parseFloat(compra.base_imponible_iva || 0) > 0) {
        const porcentaje_iva = parseFloat(compra.monto_iva) / parseFloat(compra.base_imponible_iva) * 100;
        if (porcentaje_iva >= 14 && porcentaje_iva <= 16) {
          categorias['15%'].cantidad++;
          categorias['15%'].base_imponible += parseFloat(compra.base_imponible_iva);
          categorias['15%'].monto_iva += parseFloat(compra.monto_iva);
          categorias['15%'].compras.push(compra);
        } else {
          categorias['12%'].cantidad++;
          categorias['12%'].base_imponible += parseFloat(compra.base_imponible_iva);
          categorias['12%'].monto_iva += parseFloat(compra.monto_iva);
          categorias['12%'].compras.push(compra);
        }
      }
      if (parseFloat(compra.base_imponible_no_objeto_iva || 0) > 0) {
        categorias['NO_OBJETO'].cantidad++;
        categorias['NO_OBJETO'].base_imponible += parseFloat(compra.base_imponible_no_objeto_iva);
        categorias['NO_OBJETO'].compras.push(compra);
      }
      if (parseFloat(compra.base_imponible_exento_iva || 0) > 0) {
        categorias['EXENTO'].cantidad++;
        categorias['EXENTO'].base_imponible += parseFloat(compra.base_imponible_exento_iva);
        categorias['EXENTO'].compras.push(compra);
      }
    });

    return Object.values(categorias).filter(cat => cat.cantidad > 0);
  }

  /**
   * Reporte de compras sin retenciones
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros
   * @returns {Array} Compras sin retenciones
   */
  async reporteComprasSinRetenciones(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    // Obtener compras con retenciones
    const compras = await Compra.findAll({
      where,
      include: [{
        model: Retencion,
        as: 'retenciones',
        required: false
      }],
      order: [['fecha_emision', 'DESC']]
    });

    // Filtrar las que no tienen retenciones
    const comprasSinRetenciones = compras.filter(compra =>
      !compra.retenciones || compra.retenciones.length === 0
    );

    return {
      cantidad: comprasSinRetenciones.length,
      total_compras: comprasSinRetenciones.reduce((sum, c) => sum + parseFloat(c.total_compra || 0), 0),
      compras: comprasSinRetenciones
    };
  }

  /**
   * Reporte de compras agrupadas por porcentaje de retención de IVA
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros
   * @returns {Array} Compras agrupadas por porcentaje de retención IVA
   */
  async reportePorRetencionIVA(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const compras = await Compra.findAll({
      where,
      include: [{
        model: Retencion,
        as: 'retenciones',
        where: { tipo_impuesto: 'IVA' },
        required: true
      }],
      order: [['fecha_emision', 'DESC']]
    });

    // Agrupar por porcentaje de retención
    const agrupado = {};
    compras.forEach(compra => {
      if (compra.retenciones) {
        compra.retenciones.forEach(ret => {
          const porcentaje = parseFloat(ret.porcentaje_retencion || 0);
          const key = `${porcentaje}%`;

          if (!agrupado[key]) {
            agrupado[key] = {
              porcentaje_retencion: porcentaje,
              cantidad: 0,
              base_imponible_total: 0,
              total_retenido: 0,
              compras: []
            };
          }

          agrupado[key].cantidad++;
          agrupado[key].base_imponible_total += parseFloat(ret.base_imponible || 0);
          agrupado[key].total_retenido += parseFloat(ret.valor_retenido || 0);

          const compraExistente = agrupado[key].compras.find(c => c.id === compra.id);
          if (!compraExistente) {
            agrupado[key].compras.push(compra);
          }
        });
      }
    });

    return Object.values(agrupado).sort((a, b) => b.porcentaje_retencion - a.porcentaje_retencion);
  }

  /**
   * Reporte de compras agrupadas por porcentaje de retención de Renta
   * @param {number} empresaId - ID de la empresa
   * @param {Object} filtros - Filtros
   * @returns {Array} Compras agrupadas por porcentaje de retención IR
   */
  async reportePorRetencionRenta(empresaId, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const compras = await Compra.findAll({
      where,
      include: [{
        model: Retencion,
        as: 'retenciones',
        where: { tipo_impuesto: 'RENTA' },
        required: true
      }],
      order: [['fecha_emision', 'DESC']]
    });

    // Agrupar por porcentaje de retención
    const agrupado = {};
    compras.forEach(compra => {
      if (compra.retenciones) {
        compra.retenciones.forEach(ret => {
          const porcentaje = parseFloat(ret.porcentaje_retencion || 0);
          const key = `${porcentaje}%`;

          if (!agrupado[key]) {
            agrupado[key] = {
              porcentaje_retencion: porcentaje,
              cantidad: 0,
              base_imponible_total: 0,
              total_retenido: 0,
              compras: []
            };
          }

          agrupado[key].cantidad++;
          agrupado[key].base_imponible_total += parseFloat(ret.base_imponible || 0);
          agrupado[key].total_retenido += parseFloat(ret.valor_retenido || 0);

          const compraExistente = agrupado[key].compras.find(c => c.id === compra.id);
          if (!compraExistente) {
            agrupado[key].compras.push(compra);
          }
        });
      }
    });

    return Object.values(agrupado).sort((a, b) => b.porcentaje_retencion - a.porcentaje_retencion);
  }

  /**
   * Reporte detallado de compras de un proveedor específico
   * @param {number} empresaId - ID de la empresa
   * @param {string} identificacionProveedor - RUC/Cédula del proveedor
   * @param {Object} filtros - Filtros (periodo_inicio, periodo_fin, fecha_desde, fecha_hasta)
   * @returns {Object} Detalle completo de compras del proveedor
   */
  async reporteDetalladoProveedor(empresaId, identificacionProveedor, filtros = {}) {
    const where = {
      empresa_id: empresaId,
      identificacion_proveedor: identificacionProveedor,
      estado: { [Op.in]: ['VALIDADO', 'INCLUIDO_ATS'] }
    };

    // Filtro por rango de periodos
    if (filtros.periodo_inicio && filtros.periodo_fin) {
      // Generar lista de periodos en el rango
      const periodos = this.generarRangoPeriodos(filtros.periodo_inicio, filtros.periodo_fin);
      where.periodo = { [Op.in]: periodos };
    } else if (filtros.periodo) {
      where.periodo = filtros.periodo;
    }

    // Filtro alternativo por fechas
    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_emision = {
        [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
      };
    }

    const compras = await Compra.findAll({
      where,
      include: [{
        model: Retencion,
        as: 'retenciones',
        required: false
      }],
      order: [['fecha_emision', 'DESC']]
    });

    // Calcular totales
    const resumen = {
      proveedor: {
        identificacion: identificacionProveedor,
        razon_social: compras.length > 0 ? compras[0].razon_social_proveedor : '',
      },
      periodo_inicio: filtros.periodo_inicio || filtros.periodo,
      periodo_fin: filtros.periodo_fin || filtros.periodo,
      cantidad_compras: compras.length,
      totales: {
        base_0: 0,
        base_iva: 0,
        base_no_objeto: 0,
        base_exento: 0,
        total_iva: 0,
        total_ice: 0,
        total_compras: 0,
        total_retenciones_iva: 0,
        total_retenciones_renta: 0
      },
      compras: []
    };

    // Procesar cada compra
    compras.forEach(compra => {
      resumen.totales.base_0 += parseFloat(compra.base_imponible_0 || 0);
      resumen.totales.base_iva += parseFloat(compra.base_imponible_iva || 0);
      resumen.totales.base_no_objeto += parseFloat(compra.base_imponible_no_objeto_iva || 0);
      resumen.totales.base_exento += parseFloat(compra.base_imponible_exento_iva || 0);
      resumen.totales.total_iva += parseFloat(compra.monto_iva || 0);
      resumen.totales.total_ice += parseFloat(compra.monto_ice || 0);
      resumen.totales.total_compras += parseFloat(compra.total_compra || 0);

      // Sumar retenciones
      let retenciones_iva = 0;
      let retenciones_renta = 0;
      if (compra.retenciones) {
        compra.retenciones.forEach(ret => {
          if (ret.tipo_impuesto === 'IVA') {
            retenciones_iva += parseFloat(ret.valor_retenido || 0);
          } else if (ret.tipo_impuesto === 'RENTA') {
            retenciones_renta += parseFloat(ret.valor_retenido || 0);
          }
        });
      }

      resumen.totales.total_retenciones_iva += retenciones_iva;
      resumen.totales.total_retenciones_renta += retenciones_renta;

      // Agregar al detalle
      resumen.compras.push({
        id: compra.id,
        periodo: compra.periodo,
        fecha_emision: compra.fecha_emision,
        tipo_comprobante: compra.tipo_comprobante,
        establecimiento: compra.establecimiento,
        punto_emision: compra.punto_emision,
        secuencial: compra.secuencial,
        numero_autorizacion: compra.numero_autorizacion,
        base_0: parseFloat(compra.base_imponible_0 || 0),
        base_iva: parseFloat(compra.base_imponible_iva || 0),
        monto_iva: parseFloat(compra.monto_iva || 0),
        total_compra: parseFloat(compra.total_compra || 0),
        retenciones_iva: retenciones_iva,
        retenciones_renta: retenciones_renta,
        retenciones: compra.retenciones || []
      });
    });

    // Redondear totales
    Object.keys(resumen.totales).forEach(key => {
      if (typeof resumen.totales[key] === 'number') {
        resumen.totales[key] = parseFloat(resumen.totales[key].toFixed(2));
      }
    });

    return resumen;
  }

  /**
   * Generar lista de periodos en un rango
   * @param {string} inicio - Periodo inicio (MM/YYYY)
   * @param {string} fin - Periodo fin (MM/YYYY)
   * @returns {Array} Lista de periodos
   */
  generarRangoPeriodos(inicio, fin) {
    const periodos = [];
    const [mesInicio, anioInicio] = inicio.split('/').map(Number);
    const [mesFin, anioFin] = fin.split('/').map(Number);

    let mes = mesInicio;
    let anio = anioInicio;

    while (anio < anioFin || (anio === anioFin && mes <= mesFin)) {
      periodos.push(`${mes.toString().padStart(2, '0')}/${anio}`);
      mes++;
      if (mes > 12) {
        mes = 1;
        anio++;
      }
    }

    return periodos;
  }
}

module.exports = new CompraService();
