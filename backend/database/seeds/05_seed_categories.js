exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del();

  // Inserts seed entries
  await knex('categories').insert([
    {
      id: 1,
      department_id: 1,
      parent_id: null,
      name: 'Cement',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      department_id: 1,
      parent_id: 1,
      name: 'Portland Cement',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      department_id: 1,
      parent_id: 1,
      name: 'White Cement',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      department_id: 2,
      parent_id: null,
      name: 'Aggregates',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      department_id: 2,
      parent_id: 4,
      name: 'Sand',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      department_id: 2,
      parent_id: 4,
      name: 'Gravel',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      department_id: 3,
      parent_id: null,
      name: 'Raw Materials',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      department_id: 4,
      parent_id: null,
      name: 'Test Samples',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
