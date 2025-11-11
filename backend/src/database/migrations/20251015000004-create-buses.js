"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("buses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      bus_company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "bus_companies",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      plate_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      bus_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      total_seats: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "maintenance"),
        defaultValue: "active",
        allowNull: false,
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

    await queryInterface.addIndex("buses", ["bus_company_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("buses");
  },
};
