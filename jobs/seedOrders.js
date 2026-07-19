require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Order = require("../models/order.model");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../utils/orderStatus");
const { v4: uuidv4 } = require("uuid");

const CUSTOMERS = [
  "Aria Montgomery",
  "Ezra Fitz",
  "Spencer Hastings",
  "Toby Cavanaugh",
  "Hanna Marin",
  "Caleb Rivers",
  "Emily Fields",
  "Alison DiLaurentis",
  "Mona Vanderwaal",
  "Jenna Marshall",
  "Lucas Gottesman",
  "Noel Kahn",
];

const PRODUCTS = [
  "Wireless Earbuds Pro",
  "Mechanical Gaming Keyboard",
  "Ergonomic Office Chair",
  'UltraWide 34" Monitor',
  "Portable SSD 1TB",
  "USB-C Docking Station",
  "Smart Fitness Watch",
  "Noise Cancelling Headphones",
  "HD Webcam 1080p",
  "LED Desk Lamp with Qi Charger",
  "Premium Yoga Mat",
  "Double-Walled Travel Mug",
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhoneNumber() {
  const digits = "0123456789";
  let phone = "+91 ";
  for (let i = 0; i < 10; i++) {
    phone += digits[Math.floor(Math.random() * 10)];
  }
  return phone;
}

async function seedOrders() {
  console.log("Connecting to database...");
  await connectDB();

  console.log(
    "Clearing existing orders (optional - skipped to preserve existing data)...",
  );
  const orders = [];
  const now = Date.now();

  console.log("Generating 50 mock orders...");
  for (let i = 1; i <= 50; i++) {
    let orderStatus = ORDER_STATUS.PLACED;
    let paymentStatus = PAYMENT_STATUS.PENDING;
    let timeOffsetMinutes = 0;

    if (i <= 10) {
      orderStatus = ORDER_STATUS.PLACED;
      paymentStatus = PAYMENT_STATUS.PAID;
      timeOffsetMinutes = 15;
    } else if (i <= 20) {
      orderStatus = ORDER_STATUS.PLACED;
      paymentStatus = PAYMENT_STATUS.PENDING;
      timeOffsetMinutes = 2;
    } else if (i <= 30) {
      orderStatus = ORDER_STATUS.PROCESSING;
      paymentStatus = PAYMENT_STATUS.PAID;
      timeOffsetMinutes = 25;
    } else if (i <= 40) {
      orderStatus = ORDER_STATUS.PROCESSING;
      paymentStatus = PAYMENT_STATUS.PAID;
      timeOffsetMinutes = 5;
    } else {
      const remainingStatuses = [
        ORDER_STATUS.READY_TO_SHIP,
        ORDER_STATUS.SHIPPED,
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.CANCELLED,
      ];
      orderStatus = getRandomElement(remainingStatuses);
      paymentStatus =
        orderStatus === ORDER_STATUS.CANCELLED
          ? PAYMENT_STATUS.FAILED
          : PAYMENT_STATUS.PAID;
      timeOffsetMinutes = Math.floor(Math.random() * 120);
    }

    const timestamp = new Date(now - timeOffsetMinutes * 60 * 1000);

    orders.push({
      orderId: `ORD-${uuidv4().slice(0, 8).toUpperCase()}-${1000 + i}`,
      idempotencyKey: uuidv4(),
      customerName: getRandomElement(CUSTOMERS),
      phoneNumber: getRandomPhoneNumber(),
      productName: getRandomElement(PRODUCTS),
      amount: Math.floor(Math.random() * 8000) + 500,
      paymentStatus,
      orderStatus,
      statusUpdatedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  console.log("Inserting orders...");
  const result = await Order.insertMany(orders);
  console.log(`Successfully seeded ${result.length} orders into the database.`);

  console.log("Disconnecting from database...");
  await mongoose.connection.close();
  console.log("Seeding process complete.");
}

seedOrders().catch((err) => {
  console.error("Error seeding orders:", err);
  mongoose.connection.close();
  process.exit(1);
});
