const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Transaction = require('./src/models/Transaction');
const Payment = require('./src/models/Payment');
const Order = require('./src/models/Order');

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Test Population - EXACT match with Controller
        // Finding one transaction that definitely has an Order
        const populated = await Transaction.findOne({
            _id: "69623c922ef1314a49dd9890" // Using the ID from user output which we know has order
        }).populate({
            path: "paymentId",
            select: "orderId paymentMethod amount status",
            populate: {
                path: "orderId",
                select: "orderNumber customer"
            }
        });

        if (populated && populated.paymentId) {
            console.log('Populated Payment ID:', populated.paymentId._id);
            console.log('Populated Payment OrderId type:', typeof populated.paymentId.orderId);
            console.log('Populated Payment OrderId value:', JSON.stringify(populated.paymentId.orderId, null, 2));
        } else {
            console.log('No transaction found or payment missing');
        }

        // Also try one generic find
        const any = await Transaction.findOne().populate({
            path: "paymentId",
            select: "orderId paymentMethod amount status",
            populate: {
                path: "orderId",
                select: "orderNumber customer"
            }
        });
        console.log('Generic find populate result:', any && any.paymentId ? typeof any.paymentId.orderId : 'null');

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
