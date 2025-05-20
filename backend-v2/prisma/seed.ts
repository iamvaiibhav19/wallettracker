// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. Users
  await prisma.user.createMany({
    data: [
      { id: "sample-user-1", email: "ramesh@example.com", name: "Ramesh", currency: "INR" },
      { id: "sample-user-2", email: "suresh@example.com", name: "Suresh", currency: "USD" },
    ],
    skipDuplicates: true,
  });

  // 2. Accounts
  await prisma.account.createMany({
    data: [
      // Ramesh's accounts
      { id: "acc-ramesh-wallet", name: "Ramesh Wallet", type: "cash", balance: 1200, userId: "sample-user-1" },
      { id: "acc-ramesh-bank", name: "Ramesh Bank", type: "savings", balance: 15000, userId: "sample-user-1" },
      { id: "acc-ramesh-credit", name: "Ramesh Credit Card", type: "credit", balance: -500, userId: "sample-user-1" },
      // Suresh's accounts
      { id: "acc-suresh-wallet", name: "Suresh Wallet", type: "cash", balance: 800, userId: "sample-user-2" },
      { id: "acc-suresh-bank", name: "Suresh Bank", type: "checking", balance: 20000, userId: "sample-user-2" },
      { id: "acc-suresh-credit", name: "Suresh Credit Card", type: "credit", balance: -1200, userId: "sample-user-2" },
    ],
    skipDuplicates: true,
  });

  // 3. Categories
  await prisma.category.createMany({
    data: [
      // Ramesh's categories
      { id: "cat-groceries", name: "Groceries", userId: "sample-user-1" },
      { id: "cat-entertainment", name: "Entertainment", userId: "sample-user-1" },
      { id: "cat-transport", name: "Transport", userId: "sample-user-1" },
      { id: "cat-rent", name: "Rent", userId: "sample-user-1" },
      { id: "cat-salary", name: "Salary", userId: "sample-user-1" },
      { id: "cat-lend", name: "Lending", userId: "sample-user-1" },
      // Suresh's categories
      { id: "cat-suresh-dining", name: "Dining Out", userId: "sample-user-2" },
      { id: "cat-suresh-fuel", name: "Fuel", userId: "sample-user-2" },
      { id: "cat-suresh-salary", name: "Salary", userId: "sample-user-2" },
      { id: "cat-suresh-utilities", name: "Utilities", userId: "sample-user-2" },
    ],
    skipDuplicates: true,
  });

  // 4. Budgets (for May and June 2025)
  await prisma.budget.createMany({
    data: [
      // Ramesh budgets May
      { userId: "sample-user-1", categoryId: "cat-groceries", limit: 2000, startDate: new Date("2025-05-01"), endDate: new Date("2025-05-31") },
      { userId: "sample-user-1", categoryId: "cat-entertainment", limit: 1000, startDate: new Date("2025-05-01"), endDate: new Date("2025-05-31") },
      { userId: "sample-user-1", categoryId: "cat-transport", limit: 500, startDate: new Date("2025-05-01"), endDate: new Date("2025-05-31") },
      // Ramesh budgets June
      { userId: "sample-user-1", categoryId: "cat-groceries", limit: 2200, startDate: new Date("2025-06-01"), endDate: new Date("2025-06-30") },
      { userId: "sample-user-1", categoryId: "cat-entertainment", limit: 1200, startDate: new Date("2025-06-01"), endDate: new Date("2025-06-30") },
      // Suresh budgets May
      { userId: "sample-user-2", categoryId: "cat-suresh-dining", limit: 800, startDate: new Date("2025-05-01"), endDate: new Date("2025-05-31") },
      { userId: "sample-user-2", categoryId: "cat-suresh-fuel", limit: 600, startDate: new Date("2025-05-01"), endDate: new Date("2025-05-31") },
    ],
    skipDuplicates: true,
  });

  // 5. Transactions
  await prisma.transaction.createMany({
    data: [
      // Ramesh transactions May
      {
        amount: 25000,
        type: "income",
        categoryId: "cat-salary",
        description: "May salary",
        accountId: "acc-ramesh-bank",
        userId: "sample-user-1",
        date: new Date("2025-05-01"),
      },
      {
        amount: 1800,
        type: "expense",
        categoryId: "cat-groceries",
        description: "Supermarket shopping",
        accountId: "acc-ramesh-wallet",
        userId: "sample-user-1",
        date: new Date("2025-05-03"),
      },
      {
        amount: 250,
        type: "expense",
        categoryId: "cat-transport",
        description: "Uber rides",
        accountId: "acc-ramesh-wallet",
        userId: "sample-user-1",
        date: new Date("2025-05-05"),
      },
      {
        amount: 120,
        type: "expense",
        categoryId: "cat-entertainment",
        description: "Movie night",
        accountId: "acc-ramesh-wallet",
        userId: "sample-user-1",
        date: new Date("2025-05-07"),
      },
      {
        amount: 1000,
        type: "transfer",
        categoryId: "cat-groceries",
        description: "Move to credit for rewards",
        accountId: "acc-ramesh-bank",
        destinationAccountId: "acc-ramesh-credit",
        userId: "sample-user-1",
        date: new Date("2025-05-10"),
      },
      {
        amount: 500,
        type: "lend",
        categoryId: "cat-lend",
        description: "Lent to Priya",
        accountId: "acc-ramesh-wallet",
        userId: "sample-user-1",
        targetName: "Priya Sharma",
        reminderDate: new Date("2025-06-15"),
        date: new Date("2025-05-12"),
      },
      // Ramesh transactions June
      {
        amount: 26000,
        type: "income",
        categoryId: "cat-salary",
        description: "June salary",
        accountId: "acc-ramesh-bank",
        userId: "sample-user-1",
        date: new Date("2025-06-01"),
      },
      {
        amount: 2000,
        type: "expense",
        categoryId: "cat-groceries",
        description: "Monthly groceries",
        accountId: "acc-ramesh-bank",
        userId: "sample-user-1",
        date: new Date("2025-06-04"),
      },

      // Suresh transactions May
      {
        amount: 4000,
        type: "income",
        categoryId: "cat-suresh-salary",
        description: "May salary",
        accountId: "acc-suresh-bank",
        userId: "sample-user-2",
        date: new Date("2025-05-02"),
      },
      {
        amount: 600,
        type: "expense",
        categoryId: "cat-suresh-dining",
        description: "Dinner at restaurant",
        accountId: "acc-suresh-credit",
        userId: "sample-user-2",
        date: new Date("2025-05-06"),
      },
      {
        amount: 300,
        type: "expense",
        categoryId: "cat-suresh-fuel",
        description: "Gas station",
        accountId: "acc-suresh-wallet",
        userId: "sample-user-2",
        date: new Date("2025-05-08"),
      },
      {
        amount: 150,
        type: "expense",
        categoryId: "cat-suresh-utilities",
        description: "Electricity bill",
        accountId: "acc-suresh-bank",
        userId: "sample-user-2",
        date: new Date("2025-05-10"),
      },
    ],
    skipDuplicates: true,
  });

  console.log("🌱 Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
