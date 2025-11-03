"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bus_schedules", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      bus_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "buses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      route_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "routes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      departure_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      arrival_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      available_days: {
        type: Sequelize.STRING(50),
        defaultValue:
          "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("bus_schedules", ["bus_id"]);
    await queryInterface.addIndex("bus_schedules", ["route_id"]);
    await queryInterface.addIndex("bus_schedules", ["is_active"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("bus_schedules");
  },
};
