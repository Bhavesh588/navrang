exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@navrang.com',
      password_hash: '$2b$10$4.EqCp4IlR2r5O2xHB/uaOxY5Z9X8m7K3J6L5M4N9P0Q1R2S3T4U5V',
      role_id: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      email: 'rajesh@navrang.com',
      password_hash: '$2b$10$4.EqCp4IlR2r5O2xHB/uaOxY5Z9X8m7K3J6L5M4N9P0Q1R2S3T4U5V',
      role_id: 2,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Priya Singh',
      email: 'priya@navrang.com',
      password_hash: '$2b$10$4.EqCp4IlR2r5O2xHB/uaOxY5Z9X8m7K3J6L5M4N9P0Q1R2S3T4U5V',
      role_id: 2,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Amit Patel',
      email: 'amit@navrang.com',
      password_hash: '$2b$10$4.EqCp4IlR2r5O2xHB/uaOxY5Z9X8m7K3J6L5M4N9P0Q1R2S3T4U5V',
      role_id: 2,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
