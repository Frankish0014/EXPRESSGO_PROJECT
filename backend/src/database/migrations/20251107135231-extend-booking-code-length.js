"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("bookings", "booking_code", {
      type: Sequelize.STRING(25),
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("bookings", "booking_code", {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
    });
  },
};
