exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('stock_transactions').del();

  // Inserts seed entries
  await knex('stock_transactions').insert([
    {
      id: 1,
      stock_id: 1,
      department_id: 1,
      user_id: 2,
      action_type: 'ADD',
      quantity: 200,
      receipt_id: 1,
      remarks: 'Received from supplier ABC',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      stock_id: 1,
      department_id: 1,
      user_id: 2,
      action_type: 'ADD',
      quantity: 300,
      receipt_id: 2,
      remarks: 'Received from supplier XYZ',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      stock_id: 1,
      department_id: 1,
      user_id: 2,
      action_type: 'REMOVE',
      quantity: 50,
      receipt_id: null,
      remarks: 'Used in production batch #001',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      stock_id: 2,
      department_id: 1,
      user_id: 2,
      action_type: 'ADD',
      quantity: 100,
      receipt_id: 3,
      remarks: 'Premium white cement stock',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      id: 5,
      stock_id: 3,
      department_id: 2,
      user_id: 3,
      action_type: 'ADD',
      quantity: 500,
      receipt_id: null,
      remarks: 'Sand delivery from mining site',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 6,
      stock_id: 3,
      department_id: 2,
      user_id: 3,
      action_type: 'REMOVE',
      quantity: 300,
      receipt_id: null,
      remarks: 'Dispatched to project site A',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 7,
      stock_id: 4,
      department_id: 2,
      user_id: 3,
      action_type: 'ADD',
      quantity: 800,
      receipt_id: 4,
      remarks: 'Gravel shipment received',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
