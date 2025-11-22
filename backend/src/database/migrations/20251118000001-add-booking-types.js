"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add booking_type enum to bookings table
    await queryInterface.addColumn("bookings", "booking_type", {
      type: Sequelize.ENUM("one-way", "round-trip", "multi-city"),
      allowNull: false,
      defaultValue: "one-way",
    });

    // Add parent_booking_id for linked bookings (round-trip and multi-city)
    await queryInterface.addColumn("bookings", "parent_booking_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "bookings",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add leg_sequence for multi-city bookings
    await queryInterface.addColumn("bookings", "leg_sequence", {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "Order of journey leg in multi-city booking (1, 2, 3...)",
    });

    // Add return_travel_date for round-trip bookings
    await queryInterface.addColumn("bookings", "return_travel_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: "Return date for round-trip bookings",
    });

    // Add indexes
    await queryInterface.addIndex("bookings", ["booking_type"]);
    await queryInterface.addIndex("bookings", ["parent_booking_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("bookings", ["parent_booking_id"]);
    await queryInterface.removeIndex("bookings", ["booking_type"]);
    await queryInterface.removeColumn("bookings", "return_travel_date");
    await queryInterface.removeColumn("bookings", "leg_sequence");
    await queryInterface.removeColumn("bookings", "parent_booking_id");
    await queryInterface.removeColumn("bookings", "booking_type");
  },
};
