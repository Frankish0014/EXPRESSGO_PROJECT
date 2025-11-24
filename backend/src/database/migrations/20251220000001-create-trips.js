"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("trips", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "bus_schedules",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      trip_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      departure_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      arrival_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      total_seats: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      booked_seats: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("scheduled", "in-progress", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "scheduled",
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

    await queryInterface.addIndex("trips", ["schedule_id"]);
    await queryInterface.addIndex("trips", ["trip_date"]);
    await queryInterface.addIndex("trips", ["status"]);

    await queryInterface.addConstraint("trips", {
      fields: ["schedule_id", "trip_date"],
      type: "unique",
      name: "unique_trip",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("trips");
  },
};

