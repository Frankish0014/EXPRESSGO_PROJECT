"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          full_name: "System Admin",
          email: "admin@busbooking.rw",
          phone_number: "+250788000000",
          password_hash: hashedPassword,
          role: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "users",
      {
        email: "admin@busbooking.rw",
      },
      {}
    );
  },
};
