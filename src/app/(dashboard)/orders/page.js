"use client";

import { useCart } from "../../../../context/cartContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

export default function OrdersPage() {
  const { user } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previousPath, setPreviousPath] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // NEW: State for pagination
  const [pageNumber, setPageNumber] = useState({
    all: 1, successful: 1, pending: 1, failed: 1,
    'being delivered': 1, 'delivered': 1, 'cancelled': 1,
  });
  const ordersPerPage = 10;

  // Set up previous path for breadcrumbs
  useEffect(() => {
    const lastPath = sessionStorage.getItem("currentPath");
    if (lastPath) setPreviousPath(lastPath);
    sessionStorage.setItem("lastPath", pathname);
  }, [pathname]);

  // Fetch user-specific orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) {
        router.push("/authentication");
        toast.error("Please log in to view your orders.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/order?userId=${user._id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch orders.");
        }

        setOrders(data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load your orders.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, router]);

  // Helper to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper to get status styling
  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "dispatched":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "successful":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "being delivered":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // NEW: Filter and paginate orders based on selected status
  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.paymentStatus === selectedStatus);

  const currentPage = pageNumber[selectedStatus] || 1;
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (direction) => {
    setPageNumber(prev => {
      const newPage = direction === 'next' ? prev[selectedStatus] + 1 : prev[selectedStatus] - 1;
      return { ...prev, [selectedStatus]: newPage };
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} newestOnTop={true} />

      <div className="bg-white py-8 md:py-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-700">My Orders</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Your Order History</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-xl font-medium">You haven't placed any orders yet.</p>
            <Link href="/products" className="mt-6 inline-block text-blue-600 font-semibold hover:underline transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap space-x-2 mb-6">
              {['all', 'successful', 'pending', 'failed'].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {currentOrders.length === 0 ? (
                <p className="text-center text-gray-600">No {selectedStatus} orders found.</p>
              ) : (
                currentOrders.map((order) => (
                  <div key={order._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <div className="flex justify-between items-start mb-4 border-b pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Order #{order._id.substring(0, 8)}</h2>
                        <p className="text-sm text-gray-500">Placed on: {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end space-y-1">
                        <p className="text-xs text-gray-500 mt-1">
                          Delivery Status: <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(order.orderStatus)}`}>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Payment Status: <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(order.paymentStatus)}`}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>
    
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-700 mb-2">Items:</h3>
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Image
                              src={item.image || `/placeholder-image.png`}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="rounded mr-3 object-cover"
                            />
                            <span>{item.name} ({item.quantity} pcs) - ₦{item.price.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
    
                    <div className="flex justify-between items-center border-t pt-4">
                      <p className="text-lg font-bold text-gray-900">Total: ₦{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                )))}

              </div>
              
              {/* NEW: Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
        )}
        </div>
      </div>

  );
}