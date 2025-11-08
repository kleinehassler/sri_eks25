'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ventas', 'tipo_emision', {
      type: Sequelize.STRING(1),
      allowNull: false,
      defaultValue: 'E',
      comment: 'Tipo de emisión: E=Electrónica, F=Física'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ventas', 'tipo_emision');
  }
};
