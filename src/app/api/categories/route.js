import Product from '../../../../models/product';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const categories = await Product.distinct('category');
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching categories' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}