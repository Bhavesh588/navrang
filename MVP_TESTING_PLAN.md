# Navrang MVP Testing Plan

## Goal

Give the client a clear MVP build to test the main stock and sales workflow:

- Login by role
- View stocks
- Create single-stock and multi-stock sales
- Upload one optional receipt per sale
- View grouped sale details
- Remove mistaken sales and restore stock
- Verify employee-created sales notify admins

## Pre-Testing Setup

### Backend

1. Configure the backend `.env`.

Required database values:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
```

Required S3 values for receipt upload:

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
AWS_S3_PUBLIC_BASE_URL=
```

2. Run all database migrations.

Important recent migrations:

- `013_add_stock_and_quantity_to_sales.js`
- `014_add_sale_group_id_to_sales.js`
- `015_add_receipt_to_sales.js`

3. Start the backend API.

```bash
cd backend
npm start
```

### Automated MVP Test Script

Run this before sharing the MVP build with the client:

```bash
cd backend
npm run test:mvp
```

This script verifies:

- Sale creation requires login.
- Single-stock sale creation still works.
- Multi-stock sale creation stores separate rows with one `sale_group_id`.
- Stock quantity is reduced for every selected stock.
- Category and department are derived from the selected stock.
- One receipt URL is saved for the sale group.
- Employee-created sales notify admins.
- Admin-created sales do not notify admins.
- Employees cannot sell stock outside their assigned departments.
- Insufficient stock rolls back the full grouped sale.
- Removing a sale group restores stock and removes the grouped sale.
- Admin can remove employee sales, but other employees cannot.

### Mobile App

1. Install dependencies.

```bash
cd apps/mobile
npm install
```

2. Start the app.

```bash
npm start
```

3. Confirm the mobile app points to the correct backend API URL.

## Test Accounts

Prepare at least these users before testing:

| Role | Purpose |
| --- | --- |
| Admin | Can view all sales, receive employee sale notifications, manage master data |
| Employee | Can create sales for assigned departments/stocks |

## Client Test Scenarios

### 1. Login

Steps:

1. Open the app.
2. Login as Admin.
3. Logout.
4. Login as Employee.

Expected:

- User can login successfully.
- App shows correct role-based screens/data.
- Employee should only see assigned department stock.

### 2. Stock Visibility

Steps:

1. Login as Employee.
2. Open Stocks.
3. Review available stock list.

Expected:

- Employee sees only allowed stock.
- Stock name and current quantity are clear.

### 3. Create Sale With One Stock

Steps:

1. Open Sales.
2. Tap `+`.
3. Select one stock.
4. Enter quantity.
5. Enter amount.
6. Add optional description.
7. Do not upload receipt.
8. Tap `Create Sales`.

Expected:

- Sale is created.
- App opens Sale Details.
- Sale Details shows one stock row.
- Stock quantity is reduced by the sold quantity.
- Admin receives notification if sale was created by Employee.
- Admin does not receive notification if Admin created the sale.

### 4. Create Sale With Multiple Stocks

Steps:

1. Open Create Sale.
2. Fill first stock sale.
3. Tap `+ Add more`.
4. Fill second stock sale.
5. Tap `Create Sales`.

Expected:

- Two sale rows are created in the database.
- Both rows share the same `sale_group_id`.
- All Sales UI shows this as one sale, not two separate cards.
- Sale Details shows both stock rows.
- Each selected stock quantity is reduced correctly.

### 5. Upload Receipt During Sale

Steps:

1. Open Create Sale.
2. Fill sale details.
3. Tap `Upload image`.
4. Select receipt image from gallery.
5. Confirm upload completes.
6. Tap `Create Sales`.

Expected:

- Receipt uploads to S3.
- Receipt URL is saved in the database.
- Sale Details displays the receipt image.
- Only one receipt is attached to the sale group.

### 6. View Grouped Sales

Steps:

1. Login as Admin.
2. Open All Sales.
3. Find a sale created with multiple stocks.
4. Tap the sale card.

Expected:

- All Sales shows grouped sale as one card.
- Sale Details opens.
- Sale Details shows all stock rows in that group.
- Total quantity and total amount are shown.
- Receipt is shown if uploaded.

### 7. Remove Mistaken Sale

Steps:

1. Open Sale Details.
2. Tap `Remove Sale`.
3. Confirm removal.

Expected:

- All sale rows in the group are removed from `sales`.
- Sold quantity is added back to each respective stock.
- Stock transaction audit records are created with `ADD`.
- App returns to previous screen.
- Removed sale no longer appears in Sales list.

### 8. Permission Check For Removing Sale

Steps:

1. Login as Employee A.
2. Create a sale.
3. Login as Employee B.
4. Try to remove Employee A's sale.

Expected:

- Employee B cannot remove the sale.
- Admin can remove any sale.
- Employee can remove only their own sale.

### 9. Receipt Optional Check

Steps:

1. Create a sale without uploading receipt.
2. Open Sale Details.

Expected:

- Sale is created successfully.
- Sale Details shows `No receipt uploaded`.
- No error occurs.

## Regression Checks

Before giving the MVP to the client, verify:

- Existing stock add/remove still works.
- Existing sales list still loads.
- Reports still load.
- Notifications screen still loads.
- Receipt upload fails gracefully if S3 env values are missing.
- App does not create a sale if receipt upload fails and user has not retried or skipped upload.

## Known MVP Notes

- Receipt upload currently supports image upload from gallery.
- Receipt is one per sale group, not one per stock row.
- Removing a sale deletes the sale rows and restores stock.
- Stock restore is recorded through stock transaction entries.
- S3 bucket/object permissions must allow the saved receipt URL to be viewed in the mobile app.

## MVP Acceptance Criteria

The MVP is ready for client testing when:

- Admin and Employee can login.
- Employee can create one-stock sale.
- Employee can create multi-stock grouped sale.
- Sale group appears as one item in All Sales.
- Sale Details shows every stock row in the group.
- Optional receipt upload works and image displays.
- Removing a sale restores stock.
- Admin notification behavior works for employee-created sales.
