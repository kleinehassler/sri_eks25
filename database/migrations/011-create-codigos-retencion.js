'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('codigos_retencion', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      codigo: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
        comment: 'Código de retención en la fuente (ej: 303, 304A, etc.)'
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Descripción del concepto de retención'
      },
      porcentaje: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Porcentaje de retención (puede ser numérico o descripción como "varios porcentajes")'
      },
      estado: {
        type: Sequelize.ENUM('ACTIVO', 'INACTIVO'),
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

    await queryInterface.addIndex('codigos_retencion', ['codigo'], {
      unique: true
    });
    await queryInterface.addIndex('codigos_retencion', ['estado']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('codigos_retencion');
  }
};
