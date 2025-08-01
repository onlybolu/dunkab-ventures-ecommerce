export default async function ProductPage({ params }) {
  const { id } = params;

  const res = await fetch(`/api/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return <h1 className="text-center text-2xl font-semibold text-red-600">Product not found</h1>;
  }

  const product = await res.json();

  return (
    <main className="p-6 md:flex w-full md:gap-10 max-w-7xl mx-auto">
      <img
        src={product.image}
        alt={product.title}
        className="w-full md:w-[50%] max-w-md my-4 rounded-lg shadow-md"
      />
      <div className="flex flex-col justify-center md:w-[50%] space-y-4 px-4 py-4 rounded-md">
        <h1 className="text-3xl font-bold text-gray-800">{product.title}</h1>
        <p className="text-xl text-gray-700 mb-2">₦{product.price.toLocaleString()}</p>
        <p className="text-gray-500">{product.description}</p>
        <button className="bg-blue-600 hover:bg-blue-700 rounded-md py-3 px-6 cursor-pointer text-white transition duration-200">
          Add to Cart
        </button>
      </div>
    </main>
  );
}
