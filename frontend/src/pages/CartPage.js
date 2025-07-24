import React from 'react';
import StarRating from '../components/StarRating';
import { Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import { useNavigate } from 'react-router-dom';

const CartPage = ({ cartItems, removeFromCart }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 font-semibold">
            Keep Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
                <img src={item.imageUrl} alt={item.title} className="w-32 h-20 object-cover rounded" />
                <div className="flex-grow">
                  <h3 className="text-md font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-xs text-gray-500">By {item.instructor}</p>
                  <StarRating rating={item.rating} reviews={item.reviews} />
                </div>
                <div className="text-right pr-4">
                  <p className="text-lg font-semibold text-purple-600">{formatPrice(item.price)}</p>
                  {item.originalPrice && <p className="text-sm text-gray-500 line-through">{formatPrice(item.originalPrice)}</p>}
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                  aria-label={`Remove ${item.title} from cart`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Total:</h2>
              <p className="text-3xl font-bold text-gray-900 mb-6">{formatPrice(subtotal)}</p>
              <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-md hover:bg-purple-700 transition duration-200">
                Checkout
              </button>
              <div className="mt-6">
                <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <div className="flex">
                  <input type="text" id="coupon" name="coupon" className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-purple-500 focus:border-purple-500" placeholder="Enter coupon" />
                  <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-r-md hover:bg-gray-400">Apply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;