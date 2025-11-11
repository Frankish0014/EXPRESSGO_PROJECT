"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "bus_schedules",
      [
        // Kigali to Musanze (route_id: 1)
        {
          bus_id: 1,
          route_id: 1,
          departure_time: "06:00:00",
          arrival_time: "08:00:00",
          price: 3000.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_id: 2,
          route_id: 1,
          departure_time: "09:00:00",
          arrival_time: "11:00:00",
          price: 3000.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_id: 3,
          route_id: 1,
          departure_time: "12:00:00",
          arrival_time: "14:00:00",
          price: 2500.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_id: 4,
          route_id: 1,
          departure_time: "15:00:00",
          arrival_time: "17:00:00",
          price: 3000.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Kigali to Huye (route_id: 2)
        {
          bus_id: 5,
          route_id: 2,
          departure_time: "07:00:00",
          arrival_time: "09:30:00",
          price: 3500.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_id: 6,
          route_id: 2,
          departure_time: "10:00:00",
          arrival_time: "12:30:00",
          price: 3000.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_id: 7,
          route_id: 2,
          departure_time: "13:00:00",
          arrival_time: "15:30:00",
          price: 3500.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Kigali to Rubavu (route_id: 3)
        {
          bus_id: 8,
          route_id: 3,
          departure_time: "06:30:00",
          arrival_time: "09:30:00",
          price: 4000.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_id: 1,
          route_id: 3,
          departure_time: "11:00:00",
          arrival_time: "14:00:00",
          price: 4000.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_id: 3,
          route_id: 3,
          departure_time: "16:00:00",
          arrival_time: "19:00:00",
          price: 3500.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Kigali to Rusizi (route_id: 4)
        {
          bus_id: 2,
          route_id: 4,
          departure_time: "06:00:00",
          arrival_time: "10:00:00",
          price: 5000.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          bus_id: 4,
          route_id: 4,
          departure_time: "14:00:00",
          arrival_time: "18:00:00",
          price: 5000.0,
          available_days:
            "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("bus_schedules", null, {});
  },
};
