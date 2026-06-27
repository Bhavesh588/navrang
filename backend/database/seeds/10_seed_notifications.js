exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('notifications').del();

  // Inserts seed entries
  await knex('notifications').insert([
    {
      id: 1,
      type: 'STOCK_ADD',
      reference_id: 1,
      message: 'Portland Cement stock increased by 200 bags (Supplier ABC)',
      is_read: true,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      type: 'STOCK_ADD',
      reference_id: 2,
      message: 'Portland Cement stock increased by 300 bags (Supplier XYZ)',
      is_read: true,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      type: 'STOCK_REMOVE',
      reference_id: 3,
      message: 'Portland Cement stock decreased by 50 bags (Production batch #001)',
      is_read: true,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      type: 'SALE_CREATED',
      reference_id: 1,
      message: 'New sale: 100 bags Portland Cement sold to ABC Construction (₹5000)',
      is_read: true,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
      id: 5,
      type: 'STOCK_ADD',
      reference_id: 7,
      message: 'Gravel stock increased by 800 tons',
      is_read: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      type: 'REPORT_GENERATED',
      reference_id: 1,
      message: 'Monthly stock report generated for January 2026',
      is_read: false,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]);
};
