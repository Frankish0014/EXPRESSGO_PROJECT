"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("bookings", "trip_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "trips",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("bookings", ["trip_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("bookings", ["trip_id"]);
    await queryInterface.removeColumn("bookings", "trip_id");
  },
};

