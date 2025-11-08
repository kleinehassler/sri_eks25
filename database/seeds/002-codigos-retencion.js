'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Códigos de retención en la fuente de Impuesto a la Renta
    await queryInterface.bulkInsert('codigos_retencion', [
      {
        codigo: '303',
        descripcion: 'Honorarios profesionales y demás pagos por servicios relacionados con el título profesional',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '303A',
        descripcion: 'Servicios profesionales prestados por sociedades residentes',
        porcentaje: '3',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '304',
        descripcion: 'Servicios predomina el intelecto no relacionados con el título profesional',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '304A',
        descripcion: 'Comisiones y demás pagos por servicios predomina intelecto no relacionados con el título profesional',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '304B',
        descripcion: 'Pagos a notarios y registradores de la propiedad y mercantil por sus actividades ejercidas como tales',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '304C',
        descripcion: 'Pagos a deportistas, entrenadores, árbitros, miembros del cuerpo técnico por sus actividades ejercidas como tales',
        porcentaje: '8',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '304D',
        descripcion: 'Pagos a artistas por sus actividades ejercidas como tales',
        porcentaje: '8',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '304E',
        descripcion: 'Honorarios y demás pagos por servicios de docencia',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '307',
        descripcion: 'Servicios predomina la mano de obra',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '308',
        descripcion: 'Utilización o aprovechamiento de la imagen o renombre (personas naturales, sociedades, "influencers")',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '309',
        descripcion: 'Servicios prestados por medios de comunicación y agencias de publicidad',
        porcentaje: '2.75',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '310',
        descripcion: 'Servicio de transporte privado de pasajeros o transporte público o privado de carga',
        porcentaje: '1',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '311',
        descripcion: 'Pagos a través de liquidación de compra (nivel cultural o rusticidad)',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '312',
        descripcion: 'Transferencia de bienes muebles de naturaleza corporal',
        porcentaje: '1.75',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '312A',
        descripcion: 'COMPRAS AL PRODUCTOR: de bienes de origen bioacuático, forestal y los descritos  el art.27.1 de LRTI',
        porcentaje: '1',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '312C',
        descripcion: 'COMPRAS AL COMERCIALIZADOR: de bienes de origen bioacuático, forestal y los descritos  el art.27.1 de LRTI',
        porcentaje: '1.75',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '314A',
        descripcion: 'Regalías por concepto de franquicias de acuerdo al Código INGENIOS (COESCCI) - pago a personas naturales',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '314B',
        descripcion: 'Cánones, derechos de autor,  marcas, patentes y similares de acuerdo  al Código INGENIOS (COESCCI) – pago a personas naturales',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '314C',
        descripcion: 'Regalías por concepto de franquicias de acuerdo al Código INGENIOS (COESCCI) - pago a sociades',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '314D',
        descripcion: 'Cánones, derechos de autor,  marcas, patentes y similares de acuerdo  al Código INGENIOS (COESCCI)',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '319',
        descripcion: 'Cuotas de arrendamiento mercantil (prestado por sociedades), inclusive la de opción de compra',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '320',
        descripcion: 'Arrendamiento bienes inmuebles',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '322',
        descripcion: 'Seguros y reaseguros (primas y cesiones)',
        porcentaje: '1',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323',
        descripcion: 'Rendimientos financieros pagados a naturales y sociedades  (No a IFIs)',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323A',
        descripcion: 'Rendimientos financieros depósitos Cta. Corriente',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323B1',
        descripcion: 'Rendimientos financieros  depósitos Cta. Ahorros Sociedades',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323E',
        descripcion: 'Rendimientos financieros depósito a plazo fijo  gravados',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323E2',
        descripcion: 'Rendimientos financieros depósito a plazo fijo exentos',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323F',
        descripcion: 'Rendimientos financieros operaciones de reporto - repos',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323G',
        descripcion: 'Inversiones (captaciones) rendimientos distintos de aquellos pagados a IFIs',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323H',
        descripcion: 'Rendimientos financieros  obligaciones',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323I',
        descripcion: 'Rendimientos financieros  bonos convertible en acciones',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323M',
        descripcion: 'Rendimientos financieros : Inversiones en títulos valores en renta fija gravados',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323N',
        descripcion: 'Rendimientos financieros  Inversiones en títulos valores en renta fija exentos',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323O',
        descripcion: 'Intereses y demás rendimientos financieros pagados a bancos y otras entidades sometidas al control de la Superintendencia de Bancos y de la Economía Popular y Solidaria',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323P',
        descripcion: 'Intereses pagados por entidades del sector público a favor de sujetos pasivos',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323Q',
        descripcion: 'Otros intereses y rendimientos financieros gravados',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323R',
        descripcion: 'Otros intereses y rendimientos financieros exentos',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323S',
        descripcion: 'Pagos y créditos en cuenta efectuados por el BCE y los depósitos centralizados de valores, en calidad de intermediarios, a instituciones del sistema financiero por cuenta de otras personas naturales y sociedades',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323T',
        descripcion: 'Rendimientos financieros originados en la deuda pública ecuatoriana',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '323U',
        descripcion: 'Rendimientos financieros originados en títulos valores de obligaciones de 360 días o más para el financiamiento de proyectos públicos en asociación público-privada',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '324A',
        descripcion: 'Intereses en operaciones de crédito entre instituciones del sistema financiero y entidades economía popular y solidaria.',
        porcentaje: '1',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '324B',
        descripcion: 'Inversiones entre instituciones del sistema financiero y entidades economía popular y solidaria',
        porcentaje: '1',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '324C',
        descripcion: 'Pagos y créditos en cuenta efectuados por el BCE y los depósitos centralizados de valores, en calidad de intermediarios, a instituciones del sistema financiero por cuenta de otras instituciones del sistema financiero',
        porcentaje: '1',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '325',
        descripcion: 'Anticipo dividendos',
        porcentaje: '25',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '325A',
        descripcion: 'Préstamos accionistas, beneficiarios o partícipes residentes o establecidos en el Ecuador',
        porcentaje: '25',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '3250',
        descripcion: 'Dividendos exentos (por no llegar a franja exenta o beneficio de otras leyes)',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '326',
        descripcion: 'Dividendos distribuidos que correspondan al impuesto a la renta único establecido en el art. 27 de la LRTI',
        porcentaje: '12 o 14',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '327',
        descripcion: 'Dividendos distribuidos a personas naturales residentes',
        porcentaje: '12 o 14',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '328',
        descripcion: 'Dividendos distribuidos a sociedades residentes',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '329',
        descripcion: 'dividendos distribuidos a fideicomisos residentes',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '331',
        descripcion: 'Dividendos en acciones (capitalización de utilidades)',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '332',
        descripcion: 'Otras compras de bienes y servicios no sujetas a retención (incluye régimen RIMPE - Negocios Populares, para este caso aplica con cualquier forma de pago inclusive los pagos que deban realizar las tarjetas de crédito/débito)',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '332B',
        descripcion: 'Compra de bienes inmuebles',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '332C',
        descripcion: 'Transporte público de pasajeros',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '332D',
        descripcion: 'Pagos en el país por transporte de pasajeros o transporte internacional de carga, a compañías nacionales o extranjeras de aviación o marítimas',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '332E',
        descripcion: 'Valores entregados por las cooperativas de transporte a sus socios',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '332F',
        descripcion: 'Compraventa de divisas distintas al dólar de los Estados Unidos de América',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '332G',
        descripcion: 'Pagos con tarjeta de crédito',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '332H',
        descripcion: 'Pago al exterior tarjeta de crédito reportada por la Emisora de tarjeta de crédito, solo recap',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '332I',
        descripcion: 'Pago a través de convenio de debito (Clientes IFI`s)',
        porcentaje: '0',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '333',
        descripcion: 'Ganancia en la enajenación de derechos representativos de capital u otros derechos que permitan la exploración, explotación, concesión o similares de sociedades, que se coticen en bolsa de valores del Ecuador',
        porcentaje: '10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '334',
        descripcion: 'Contraprestación producida por la enajenación de derechos representativos de capital u otros derechos que permitan la exploración, explotación, concesión o similares de sociedades, no cotizados en bolsa de valores del Ecuador',
        porcentaje: '1',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '335',
        descripcion: 'Loterías, rifas, pronósticos deportivos, apuestas y similares',
        porcentaje: '15',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '336',
        descripcion: 'Venta de combustibles a comercializadoras',
        porcentaje: '2/mil',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '337',
        descripcion: 'Venta de combustibles a distribuidores',
        porcentaje: '3/mil',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '338',
        descripcion: 'Producción y venta local de banano producido o no por el mismo sujeto pasivo',
        porcentaje: '1 a 2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '340',
        descripcion: 'Impuesto único a la exportación de banano',
        porcentaje: '3',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '343',
        descripcion: 'Otras retenciones aplicables el 1% (incluye régimen RIMPE - Emprendedores, para este caso aplica con cualquier forma de pago inclusive los pagos que deban realizar las tarjetas de crédito/débito)',
        porcentaje: '1',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '343A',
        descripcion: 'Energía eléctrica',
        porcentaje: '1',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '343B',
        descripcion: 'Actividades de construcción de obra material inmueble, urbanización, lotización o actividades similares',
        porcentaje: '1.75',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '343C',
        descripcion: 'Recepción de botellas plásticas no retornables de PET',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '3440',
        descripcion: 'Otras retenciones aplicables el 2,75%',
        porcentaje: '2.75',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '344A',
        descripcion: 'Pago local tarjeta de crédito /débito reportada por la Emisora de tarjeta de crédito / entidades del sistema financiero',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '344B',
        descripcion: 'Adquisición de sustancias minerales dentro del territorio nacional',
        porcentaje: '2',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '346',
        descripcion: 'Otras retenciones aplicables a otros porcentajes',
        porcentaje: 'varios porcentajes',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '346A',
        descripcion: 'Otras ganancias de capital distintas de enajenación de derechos representativos de capital',
        porcentaje: 'varios porcentajes',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '346B',
        descripcion: 'Donaciones en dinero -Impuesto a las donaciones',
        porcentaje: 'Conforme Art 36 LRTI literal d)',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '346C',
        descripcion: 'Retención a cargo del propio sujeto pasivo por la producción y/o comercialización de minerales y otros bienes',
        porcentaje: '0 o 10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '346D',
        descripcion: 'Retención a cargo del propio sujeto pasivo por la comercialización de productos forestales',
        porcentaje: '0 o 10',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '350',
        descripcion: 'Otras autorretenciones (inciso 1 y 2 Art.92.1 RLRTI)',
        porcentaje: '1,50 o 1,75',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '3480',
        descripcion: 'Impuesto a la renta único sobre los ingresos percibidos por los operadores de pronósticos deportivos',
        porcentaje: '15',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '3481',
        descripcion: 'Autorretenciones Sociedades Grandes Contribuyentes',
        porcentaje: 'Conforme  Nro. NAC-DGERCGC24-00000003 , del 12 de enero de 2024',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      },
      {
        codigo: '3482',
        descripcion: 'Comisiones  a sociedades, nacionales o extranjeras residentes y establecimientos permanentes domiciliados en el país',
        porcentaje: '3',
        estado: 'ACTIVO',
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('codigos_retencion', null, {});
  }
};
