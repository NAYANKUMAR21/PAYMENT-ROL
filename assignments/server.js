require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json({ extended: false }));
app.use(cors());
console.log(
  "getting key",
  process.env.RAZORPAY_KEY_ID,
  process.env.RAZORPAY_KEY_SECRET
);
const connect = async () => {
  mongoose.set("strictQuery", false);
  return mongoose.connect("mongodb://127.0.0.1:27017/PAY");
};

const file = {
  isPaid: Boolean,
  amount: Number,
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
  },
};

const orderScheam = new mongoose.Schema(file);
const orderModel = mongoose.model("order", orderScheam);

app.get("/get-razorpay-key", async (req, res) => {
  try {
    return res.send({ key: process.env.RAZORPAY_KEY_ID });
  } catch (er) {
    return res.status(404).send(er.message);
  }
});

app.post("/create-order", async (req, res) => {
  try {
    console.log("ceate-orders");
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const options = {
      amount: req.body.amount,
      currency: "INR",
    };
    const order =await instance.orders.create(options);
    if (!order) {
      return res.status(500).send("some error occured");
    }
    console.log(order, "backend amount passage");
    return res.status(200).send({ message: "reached orders", order });
  } catch (er) {
    return res.status(404).send("query Not found");
  }
});

app.post("/pay-order", async (req, res) => {
  try {
    const { amount, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      req.body;
    const newPayment = orderModel({
      isPaid: true,
      amount: amount,
      razorpay: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      },
    });
    await newPayment.save();
    return res.send({ message: "new payment Successfull" });
  } catch (er) {
    console.log(er.message);
    return res.status(500).send("er.message");
  }
});

app.get("/list-order", async (req, res) => {
  try {
    const list = await orderModel.find();
    console.log("backend get orders");
    return res.status(200).send(list);
  } catch (er) {
    return res.status(500).send(er.message);
  }
});

app.listen(8080, async () => {
  await connect();
  console.log("listening on 8080");
});
