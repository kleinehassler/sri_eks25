'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exportaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      empresa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empresas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      periodo: {
        type: Sequelize.STRING(7),
        allowNull: false,
        comment: 'Formato MM/AAAA'
      },
      tipo_comprobante: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      fecha_emision: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      establecimiento: {
        type: Sequelize.STRING(3),
        allowNull: false
      },
      punto_emision: {
        type: Sequelize.STRING(3),
        allowNull: false
      },
      secuencial: {
        type: Sequelize.STRING(9),
        allowNull: false
      },
      numero_autorizacion: {
        type: Sequelize.STRING(49),
        allowNull: false
      },
      tipo_cliente: {
        type: Sequelize.ENUM('01', '02'),
        allowNull: false,
        comment: '01=Persona Natural, 02=Sociedad'
      },
      tipo_identificacion: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      identificacion_cliente: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      razon_social_cliente: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      pais_destino: {
        type: Sequelize.STRING(3),
        allowNull: false,
        comment: 'Código país ISO 3166'
      },
      pais_efect_pago: {
        type: Sequelize.STRING(3),
        comment: 'Código país ISO 3166'
      },
      tipo_regimen_fiscal: {
        type: Sequelize.STRING(2)
      },
      pais_regimen_fiscal: {
        type: Sequelize.STRING(3),
        comment: 'Código país ISO 3166'
      },
      valor_fob_comprobante: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      valor_fob_compensacion: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      forma_pago: {
        type: Sequelize.STRING(2)
      },
      distrito_exportacion: {
        type: Sequelize.STRING(3)
      },
      anio_exportacion: {
        type: Sequelize.INTEGER
      },
      regimen_exportacion: {
        type: Sequelize.STRING(2)
      },
      correo_electronico: {
        type: Sequelize.STRING(100)
      },
      estado: {
        type: Sequelize.ENUM('BORRADOR', 'VALIDADO', 'INCLUIDO_ATS', 'ANULADO'),
        allowNull: false,
        defaultValue: 'BORRADOR'
      },
      observaciones: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('exportaciones', ['empresa_id', 'periodo']);
    await queryInterface.addIndex('exportaciones', ['usuario_id']);
    await queryInterface.addIndex('exportaciones', ['estado']);
    await queryInterface.addIndex('exportaciones', ['fecha_emision']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('exportaciones');
  }
};
