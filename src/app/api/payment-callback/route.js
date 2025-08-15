
import Order from '../../../../models/Order';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { order_id, status } = req.body; 

      if (status === 'successful') {
        const order = await Order.findByIdAndUpdate(order_id, {
          paymentStatus: 'successful',
          orderStatus: 'pending', // Order is now confirmed, but not yet processed
        }, { new: true });

        

        res.status(200).json({ success: true, message: 'Order updated successfully' });
      } else {
        res.status(200).json({ success: true, message: 'Payment status not successful' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}