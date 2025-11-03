"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("routes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      departure_city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      arrival_city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      distance_km: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
      },
      estimated_duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

    // Add unique constraint for route combination
    await queryInterface.addConstraint("routes", {
      fields: ["departure_city", "arrival_city"],
      type: "unique",
      name: "unique_route",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("routes");
  },
};
