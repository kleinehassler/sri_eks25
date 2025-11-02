'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('log_actividad', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      empresa_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'empresas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      accion: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      modulo: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entidad: {
        type: Sequelize.STRING(50)
      },
      entidad_id: {
        type: Sequelize.INTEGER
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      ip_address: {
        type: Sequelize.STRING(45)
      },
      user_agent: {
        type: Sequelize.STRING(500)
      },
      datos_antes: {
        type: Sequelize.TEXT,
        comment: 'JSON con datos antes del cambio'
      },
      datos_despues: {
        type: Sequelize.TEXT,
        comment: 'JSON con datos después del cambio'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('log_actividad', ['empresa_id']);
    await queryInterface.addIndex('log_actividad', ['usuario_id']);
    await queryInterface.addIndex('log_actividad', ['accion']);
    await queryInterface.addIndex('log_actividad', ['modulo']);
    await queryInterface.addIndex('log_actividad', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('log_actividad');
  }
};
