"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "routes",
      [
        {
          departure_city: "Kigali",
          arrival_city: "Musanze",
          distance_km: 95,
          estimated_duration_minutes: 120,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          departure_city: "Kigali",
          arrival_city: "Huye",
          distance_km: 135,
          estimated_duration_minutes: 150,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          departure_city: "Kigali",
          arrival_city: "Rubavu",
          distance_km: 150,
          estimated_duration_minutes: 180,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          departure_city: "Kigali",
          arrival_city: "Rusizi",
          distance_km: 230,
          estimated_duration_minutes: 240,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          departure_city: "Musanze",
          arrival_city: "Rubavu",
          distance_km: 85,
          estimated_duration_minutes: 90,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          departure_city: "Huye",
          arrival_city: "Rusizi",
          distance_km: 120,
          estimated_duration_minutes: 120,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          departure_city: "Kigali",
          arrival_city: "Nyagatare",
          distance_km: 170,
          estimated_duration_minutes: 180,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          departure_city: "Kigali",
          arrival_city: "Karongi",
          distance_km: 145,
          estimated_duration_minutes: 150,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("routes", null, {});
  },
};
