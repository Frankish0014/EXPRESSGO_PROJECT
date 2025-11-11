// src/database/migrations/[timestamp]-increase-available-days-length.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("bus_schedules", "available_days", {
      type: Sequelize.STRING(100), // Changed from 50 to 100
      defaultValue: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("bus_schedules", "available_days", {
      type: Sequelize.STRING(50),
      defaultValue: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
    });
  },
};
