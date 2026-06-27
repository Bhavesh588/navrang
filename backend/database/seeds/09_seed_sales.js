exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('sales').del();

  // Inserts seed entries
  await knex('sales').insert([
    {
      id: 1,
      sale_group_id: 'seed-sale-1',
      stock_id: 1,
      department_id: 1,
      category_id: 2,
      quantity: 100,
      amount: 5000,
      description: 'Sold 100 bags Portland Cement to ABC Construction',
      created_by: 2,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      sale_group_id: 'seed-sale-2',
      stock_id: 2,
      department_id: 1,
      category_id: 3,
      quantity: 50,
      amount: 3500,
      description: 'Sold 50 bags White Cement to XYZ Builders',
      created_by: 2,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      sale_group_id: 'seed-sale-3',
      stock_id: 3,
      department_id: 2,
      category_id: 5,
      quantity: 400,
      amount: 8000,
      description: 'Sold 400 tons Sand for commercial use',
      created_by: 3,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      sale_group_id: 'seed-sale-4',
      stock_id: 4,
      department_id: 2,
      category_id: 6,
      quantity: 300,
      amount: 6500,
      description: 'Sold 300 tons Gravel to road construction project',
      created_by: 3,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 5,
      sale_group_id: 'seed-sale-5',
      stock_id: 5,
      department_id: 3,
      category_id: 7,
      quantity: 200,
      amount: 12000,
      description: 'Sold 200 tons Limestone to chemical plant',
      created_by: 3,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
