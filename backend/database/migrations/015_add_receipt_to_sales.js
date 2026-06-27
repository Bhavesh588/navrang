exports.up = async function(knex) {
  const hasReceiptUrl = await knex.schema.hasColumn('sales', 'receipt_url');
  const hasReceiptUploadedBy = await knex.schema.hasColumn('sales', 'receipt_uploaded_by');
  const hasReceiptUploadedAt = await knex.schema.hasColumn('sales', 'receipt_uploaded_at');

  await knex.schema.alterTable('sales', function(table) {
    if (!hasReceiptUrl) {
      table.text('receipt_url').nullable().after('description');
    }

    if (!hasReceiptUploadedBy) {
      table.integer('receipt_uploaded_by').unsigned().nullable().after('receipt_url');
    }

    if (!hasReceiptUploadedAt) {
      table.timestamp('receipt_uploaded_at').nullable().after('receipt_uploaded_by');
    }
  });

  if (!hasReceiptUploadedBy) {
    await knex.schema.alterTable('sales', function(table) {
      table.foreign('receipt_uploaded_by').references('id').inTable('users');
    });
  }
};

exports.down = async function(knex) {
  const hasReceiptUrl = await knex.schema.hasColumn('sales', 'receipt_url');
  const hasReceiptUploadedBy = await knex.schema.hasColumn('sales', 'receipt_uploaded_by');
  const hasReceiptUploadedAt = await knex.schema.hasColumn('sales', 'receipt_uploaded_at');

  await knex.schema.alterTable('sales', function(table) {
    if (hasReceiptUploadedBy) {
      table.dropForeign(['receipt_uploaded_by']);
      table.dropColumn('receipt_uploaded_by');
    }

    if (hasReceiptUploadedAt) {
      table.dropColumn('receipt_uploaded_at');
    }

    if (hasReceiptUrl) {
      table.dropColumn('receipt_url');
    }
  });
};
