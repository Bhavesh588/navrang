exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('stocks').del();

  // Inserts seed entries
  await knex('stocks').insert([
    {
      id: 1,
      department_id: 1,
      category_id: 2,
      name: 'Portland Cement - Bag 50kg',
      current_quantity: 500,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      department_id: 1,
      category_id: 3,
      name: 'White Cement - Bag 50kg',
      current_quantity: 150,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      department_id: 2,
      category_id: 5,
      name: 'Fine Sand - Ton',
      current_quantity: 1200,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      department_id: 2,
      category_id: 6,
      name: 'Coarse Gravel - Ton',
      current_quantity: 800,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      department_id: 3,
      category_id: 7,
      name: 'Limestone - Ton',
      current_quantity: 450,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      department_id: 3,
      category_id: 7,
      name: 'Fly Ash - Ton',
      current_quantity: 300,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      department_id: 4,
      category_id: 8,
      name: 'Cement Test Samples - Box',
      current_quantity: 50,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
