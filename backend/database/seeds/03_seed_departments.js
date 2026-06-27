exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('departments').del();

  // Inserts seed entries
  await knex('departments').insert([
    {
      id: 1,
      name: 'Tunnel A',
      description: 'Main storage tunnel for cement and materials',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Tunnel B',
      description: 'Secondary storage tunnel for finished products',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Warehouse',
      description: 'Main warehouse for bulk storage',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Quality Control',
      description: 'Quality testing and inspection center',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
