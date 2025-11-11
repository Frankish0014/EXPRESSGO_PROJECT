"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "bus_companies",
      [
        {
          name: "Volcano Express",
          contact_phone: "+250788123456",
          contact_email: "info@volcanoexpress.rw",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Ritco Express",
          contact_phone: "+250788234567",
          contact_email: "contact@ritco.rw",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Virunga Express",
          contact_phone: "+250788345678",
          contact_email: "info@virungaexpress.rw",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Yahoo Car Express",
          contact_phone: "+250788456789",
          contact_email: "info@yahoocar.rw",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("bus_companies", null, {});
  },
};
