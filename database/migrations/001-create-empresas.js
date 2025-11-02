'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ruc: {
        type: Sequelize.STRING(13),
        allowNull: false,
        unique: true
      },
      razon_social: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      nombre_comercial: {
        type: Sequelize.STRING(300)
      },
      regimen_tributario: {
        type: Sequelize.ENUM('RISE', 'GENERAL', 'RIMPE'),
        allowNull: false,
        defaultValue: 'GENERAL'
      },
      contribuyente_especial: {
        type: Sequelize.STRING(10)
      },
      obligado_contabilidad: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      direccion: {
        type: Sequelize.STRING(500)
      },
      telefono: {
        type: Sequelize.STRING(20)
      },
      email: {
        type: Sequelize.STRING(100)
      },
      estado: {
        type: Sequelize.ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO'),
        allowNull: false,
        defaultValue: 'ACTIVO'
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

    await queryInterface.addIndex('empresas', ['ruc']);
    await queryInterface.addIndex('empresas', ['estado']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('empresas');
  }
};
