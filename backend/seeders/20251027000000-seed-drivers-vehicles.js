
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert sample drivers
    await queryInterface.bulkInsert('drivers', [
      {
        name: 'John Doe',
        phone: '123-456-7890',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Jane Smith',
        phone: '234-567-8901',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Michael Johnson',
        phone: '345-678-9012',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});

    // Insert sample vehicles
    await queryInterface.bulkInsert('vehicles', [
      {
        plate: 'ABC123',
        capacity: 50,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        plate: 'XYZ789',
        capacity: 45,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        plate: 'DEF456',
        capacity: 55,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Remove seeded data
    await queryInterface.bulkDelete('vehicles', null, {});
    await queryInterface.bulkDelete('drivers', null, {});
  },
};
