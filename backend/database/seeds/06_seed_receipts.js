exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('receipts').del();

  // Inserts seed entries
  await knex('receipts').insert([
    {
      id: 1,
      file_url: 'https://storage.example.com/receipts/receipt_001.pdf',
      uploaded_by: 1,
      uploaded_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      file_url: 'https://storage.example.com/receipts/receipt_002.pdf',
      uploaded_by: 2,
      uploaded_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      file_url: 'https://storage.example.com/receipts/receipt_003.pdf',
      uploaded_by: 3,
      uploaded_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      file_url: 'https://storage.example.com/receipts/receipt_004.pdf',
      uploaded_by: 2,
      uploaded_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
