exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('user_departments').del();

  // Inserts seed entries
  await knex('user_departments').insert([
    {
      id: 1,
      user_id: 1,
      department_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      user_id: 1,
      department_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      user_id: 1,
      department_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      user_id: 1,
      department_id: 4,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      user_id: 2,
      department_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      user_id: 2,
      department_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      user_id: 3,
      department_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      user_id: 4,
      department_id: 4,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
