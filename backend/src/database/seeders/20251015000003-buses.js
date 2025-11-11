"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "buses",
      [
        {
          bus_company_id: 1,
          plate_number: "RAC 001 A",
          bus_type: "Coaster",
          total_seats: 30,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_company_id: 1,
          plate_number: "RAC 002 B",
          bus_type: "Coaster",
          total_seats: 30,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_company_id: 2,
          plate_number: "RAD 003 C",
          bus_type: "Bus",
          total_seats: 50,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_company_id: 2,
          plate_number: "RAD 004 D",
          bus_type: "Coaster",
          total_seats: 30,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_company_id: 3,
          plate_number: "RAE 005 E",
          bus_type: "Coaster",
          total_seats: 30,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_company_id: 3,
          plate_number: "RAE 006 F",
          bus_type: "Bus",
          total_seats: 50,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_company_id: 4,
          plate_number: "RAF 007 G",
          bus_type: "Coaster",
          total_seats: 30,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_company_id: 4,
          plate_number: "RAF 008 H",
          bus_type: "Bus",
          total_seats: 50,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("buses", null, {});
  },
};
