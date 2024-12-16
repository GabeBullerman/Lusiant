import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StarRatings from 'react-star-ratings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';



function App() {
    //Setting Views
    const [product, setProduct] = useState([]);
    const [viewer1, setViewer1] = useState(false);
    const [viewer2, setViewer2] = useState(false);
    //Filtering
    const [searchInput, setSearchInput] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
     // New state for storing image URLs
    const [imageUrls, setImageUrls] = useState({});
    // Navigation State
    const [view, setView] = useState('home');
    // Cart State
    const [cart, setCart] = useState([]);
    // Checkout Form
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        card: '',
        address1: '',
        city: '',
        state: '',
        zip: '',
        address2: '',
        
    });
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [errors, setErrors] = useState({}); 
  // Contact Form
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Dropdown
const DropdownMenu = ({ handleDropdownChange }) => {
  return (
    <select value="catalog" onChange={handleDropdownChange} className="text-white bg-black border border-white rounded px-3 py-2 mb-4">
      <option value="home">HOME</option>
      <option value="catalog">CATALOG</option>
      <option value="ContactUs">CONTACT US</option>
      <option value="ShippingPolicy">SHIPPING POLICY</option>
      <option value="PrivacyPolicy">PRIVACY POLICY</option>
      <option value="AuthorInfo">AUTHOR INFO</option>
    </select>
  );
};




    useEffect(() => {
        getAllProducts();
        console.log(`Current view is: ${view}`);
    }, [view]);

    const handleContactSubmit = (event) => {
      event.preventDefault();
    setFormSubmitted(true);
  };

  function handlePlaceOrder() {
  setOrderPlaced(true);
}

const handleInputChange = (event) => {
  setForm({
    ...form,
    [event.target.name]: event.target.value
  });
};

const validateForm = () => {
  let errors = {};

  if (!form.fullName) errors.fullName = 'Full name is required';
  if (!form.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email is invalid';
  if (!form.card) errors.card = 'Card is required';
    else if (!/^\d{16}$/.test(form.card)) errors.card = 'Card is invalid';
  if (!form.address1) errors.address1 = 'Address is required';
  if (!form.city) errors.city = 'City is required';
  if (!form.state) errors.state = 'State is required';
  if (!form.zip) errors.zip = 'Zip code is required';
    else if (!/^\d{5}$/.test(form.zip)) errors.zip = 'Zip code is invalid';

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleFormSubmit = (event) => {
  event.preventDefault();

  // Validate form entries
  let errors = {};
  if (!form.fullName || !/^[a-zA-Z\s]*$/.test(form.fullName)) {
    errors.fullName = 'Full Name is required and must contain only letters.';
  }
  if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is required and must be a valid email address.';
  }
  if (!form.card || !/^\d+$/.test(form.card)) {
    errors.card = 'Card Number is required and must contain only numbers.';
  }
  if (!form.address1) {
    errors.address1 = 'Address is required.';
  }
  if (!form.city) {
    errors.city = 'City is required.';
  }
  if (!form.state) {
    errors.state = 'State is required.';
  }
  if (!form.zip || !/^\d+$/.test(form.zip)) {
    errors.zip = 'Zip Code is required and must contain only numbers.';
  }
  // Set errors state
  setErrors(errors);
  // Check if there are any errors
  if (Object.keys(errors).length === 0) {
    setView('confirmation'); // Set view to confirmation if no errors
  }
};

const handleReset = () => {
  setForm({});
  setCart([]);
  setView('catalog');
};

  

    function getAllProducts() {
        fetch("http://127.0.0.1:5000/catalog")
            .then((response) => response.json())
            .then((data) => {
                //console.log("Show Catalog of Products :");
                //console.log(data);
                setProduct(data);
                setViewer1(true);
                setSearchInput('');

                // Fetch image URLs for all products
                const promises = data.map((product) =>
                    fetch(`http://127.0.0.1:5000/images/${product.id}`)
                        .then((response) => response.json())
                        .then((json) => {
                            // Modify the URL before storing it
                            const modifiedUrl = json.URL.replace('imgur.com', 'i.imgur.com') + '.jpg';
                            return [product.id, modifiedUrl];
                        })
                );
                Promise.all(promises).then((pairs) => {
                    // Convert the pairs to an object and store it in the state
                    setImageUrls(Object.fromEntries(pairs));
                });
            });
    }

function addToCart(el) {
    // Check if the product is already in the cart
    const existingProduct = cart.find((item) => item.id === el.id);

    if (existingProduct) {
        // If the product is already in the cart, increment its quantity
        setCart(
            cart.map((item) =>
                item.id === el.id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    } else {
        // If the product is not in the cart, add it with a quantity of 1 and the image URL
        setCart([...cart, { ...el, quantity: 1, image: imageUrls[el.id] }]);
    }
}

    function removeFromCart(productId) {
        setCart(oldCart => oldCart.filter(product => product.id !== productId));
    }

    function incrementQuantity(productId) {
        setCart(
            cart.map((item) =>
                item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    }

    function decrementQuantity(productId) {
        setCart(
            cart.map((item) =>
                item.id === productId ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 } : item
            )
        );
    }

function handleFormChange(e) {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
}


    function handleSearchInputChange(e) {
        setSearchInput(e.target.value);
    }


    function handleDropdownChange(e) {
        setView(e.target.value);
    }

    const filteredProducts = product.filter(item => {
        return (item.category === filterCategory || filterCategory === '') &&
            (item.id.toString().includes(searchInput) || 
            item.category.toLowerCase().includes(searchInput.toLowerCase()) || 
            item.description.toLowerCase().includes(searchInput.toLowerCase()));
    });


const showAllItems = filteredProducts.map((el) => (
    <div key={el.id}>
        <div>
            <img src={imageUrls[el.id]} alt={el.title} style={{width: '540px', height: '540px'}} />
            <h3>{el.title}</h3>
            <p className="text-lg font-semibold">{el.description}</p>
            <p>Price: ${Number(el.price).toFixed(2)}</p>
            <p> <span style={{marginRight: '10px'}}>Rating:</span>
                <StarRatings
                rating={Number(el.rating) || 0} // Convert el.rating to a number, use 0 if it's not a number
                starRatedColor="black"
                numberOfStars={5}
                name='rating'
                starDimension="20px"
                starSpacing="2px" />
            </p>
        </div>
    <button onClick={() => addToCart(el)}>Add to Cart</button>
    </div>
));

const handleCheckoutClick = () => {
  setView('checkout');
};

<form onSubmit={handleFormSubmit}>
    <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={form.fullName}
        onChange={handleFormChange}
        className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border-2 border-black rounded shadow appearance-none focus:outline-none focus:shadow-outline mb-4"
    />
    <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleFormChange}
        className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border-2 border-black rounded shadow appearance-none focus:outline-none focus:shadow-outline mb-4"
    />
    <input
        type="text"
        name="card"
        placeholder="Card Number"
        value={form.card}
        onChange={handleFormChange}
        className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border-2 border-black rounded shadow appearance-none focus:outline-none focus:shadow-outline mb-4"
    />
    <input
        type="text"
        name="address1"
        placeholder="Address Line 1"
        value={form.address1}
        onChange={handleFormChange}
        className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border-2 border-black rounded shadow appearance-none focus:outline-none focus:shadow-outline mb-4"
    />
    <input
        type="text"
        name="city"
        placeholder="City"
        value={form.city}
        onChange={handleFormChange}
        className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border-2 border-black rounded shadow appearance-none focus:outline-none focus:shadow-outline mb-4"
    />
    <input
        type="text"
        name="state"
        placeholder="State"
        value={form.state}
        onChange={handleFormChange}
        className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border-2 border-black rounded shadow appearance-none focus:outline-none focus:shadow-outline mb-4"
    />
    <input
        type="text"
        name="zip"
        placeholder="Zip Code"
        value={form.zip}
        onChange={handleFormChange}
        className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border-2 border-black rounded shadow appearance-none focus:outline-none focus:shadow-outline mb-4"
    />
    <input
        type="text"
        name="address2"
        placeholder="Address Line 2"
        value={form.address2}
        onChange={handleFormChange}
        className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border-2 border-black rounded shadow appearance-none focus:outline-none focus:shadow-outline mb-4"
    />
    <button type="submit" className="w-full bg-black text-white px-4 py-2 mt-4">Submit</button>
</form>


// Display the items in the cart
const cartItems = cart.length > 0 && (
    <div className="cart-bubble bg-white rounded p-3 mt-3">
        <h2 className="text-2xl font-bold">CART</h2>
{cart.map((product) => (
    <div key={product.id} className="flex items-center">
        <img src={product.image} alt={product.title} className="w-10 h-10 object-cover mr-2" />
        <p>{product.title} x {product.quantity} = ${(product.price * product.quantity).toFixed(2)}</p>
        <button onClick={() => decrementQuantity(product.id)} className="ml-auto border border-black border-2 px-2 py-1 h-8"> - </button>
        <button onClick={() => incrementQuantity(product.id)} className="ml-auto border border-black border-2 px-2 py-1 h-8"> + </button>
        <button onClick={() => removeFromCart(product.id)} className="ml-auto border border-black border-2 h-8">Remove</button>
    </div>
))}
<p>Total: ${(cart.reduce((total, product) => total + product.price * product.quantity, 0)).toFixed(2)}</p>
{view !== 'checkout' && <button className="w-4/5 mx-auto block bg-black text-white px-4 py-2 mt-4" onClick={() => setView('checkout')}>Checkout</button>}
    </div>
);
// Add this function to handle back button click
const handleBackClick = () => {
  setView('catalog');
};


// Return Statement
return (
 <div style={{display: 'flex'}}>
    {view === 'home' && (
<button 
    className="absolute bottom-0 left-1/2 transform translate-x-1/2 bg-black text-white px-2 py-2 mb-8" // Adjusted positioning
    style={{ zIndex: '10', width: '160px' }} // Adjust the width as needed
    onClick={() => setView('catalog')}
>
    SHOP NOW
</button>
    )}
{view === 'checkout' ? (
  <>
    <div className="min-h-screen bg-black p-3 w-80 flex-none">
      <div className="px-6 py-4 text-center">
        <h1 className="text-5xl mb-2 font-bold text-white">LUSIANT</h1>
        <button onClick={handleBackClick} className="bg-black text-white px-4 py-2 w-full mb-4">Back to Catalog</button>
      </div>
    </div>
    <div className="flex justify-center items-center">
      <div className="text-center text-black w-2/3">
        <h2 className="text-4xl mb-6 font-bold">Cart Summary</h2>
        <div className="flex flex-wrap justify-center">
          {cart.map(item => (
            <div key={item.id} className="m-4 flex items-center">
              <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-md" />
              <p className="ml-6 text-xl">{item.description} x {item.quantity} - ${item.price}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xl font-bold">Total: ${cart.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0).toFixed(2)}</p>
      </div>
      <div className="p-6 bg-black text-white h-screen w-1/3">
        <div className="px-6 py-4 text-center">
          <h1 className="text-3xl mb-6 font-bold text-white">Order Information</h1>
        </div>
        <form onSubmit={handleFormSubmit} className="w-9/10 mx-auto">
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <input name="fullName" onChange={handleInputChange} value={form.fullName || ''} placeholder="Full Name" className="input-field mb-4" />
          <input name="email" onChange={handleInputChange} value={form.email || ''} placeholder="Email" className="input-field mb-4" />
          <input name="card" onChange={handleInputChange} value={form.card || ''} placeholder="Card Number" className="input-field mb-4" />
          <input name="address1" onChange={handleInputChange} value={form.address1 || ''} placeholder="Address" className="input-field mb-4" />
          <input name="city" onChange={handleInputChange} value={form.city || ''} placeholder="City" className="input-field mb-4" />
          <input name="state" onChange={handleInputChange} value={form.state || ''} placeholder="State" className="input-field mb-4" />
          <input name="zip" onChange={handleInputChange} value={form.zip || ''} placeholder="Zip Code" className="input-field mb-4" />
          <input type="text" name="address2" placeholder="Address 2" className="input-field mb-4" />
          <button type="submit" className="w-full bg-white text-black text-sm px-4 py-2 mt-4">Place Order</button>
        </form>
      </div>
    </div>
  </>
) : view === 'confirmation' ? (
<div className="bg-white p-4 shadow-lg flex flex-col items-center justify-center min-h-screen w-full">
  <h2 className="text-xl font-semibold mb-4">Order Confirmation</h2>
  <div className="text-center">
<h3 className="font-bold">Purchased Items:</h3>
{cart.map(item => (
  <div key={item.id} className="text-center">
    <img src={item.image} alt={item.name} className="w-20 h-20" />
    <p>{item.name}</p>
    <p>Quantity: {item.quantity}</p>
    <p>${(item.price * item.quantity).toFixed(2)}</p>
  </div>
))}
<p className="font-bold">Total: ${cart.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0).toFixed(2)}</p>
</div>
<div className="text-center">
  <h3 className="font-bold">Information:</h3>
  <p><strong>Name:</strong> {form.fullName}</p>
  <p><strong>Email:</strong> {form.email}</p>
  <p><strong>Address:</strong> {form.address1}, {form.city}, {form.state}, {form.zip}</p>
  <p><strong>Card:</strong> **** **** **** {form.card.slice(-4)}</p>
</div>
<button onClick={handleReset} className="bg-black text-white px-4 py-2 mt-4">Back to Catalog</button>
      </div>
    ) : (
      <>
<div className="min-h-screen h-auto bg-black p-3 w-80 flex-none">
  <div className="px-6 py-4 text-center">
    <h1 className="text-5xl mb-2 font-bold text-white"> LUSIANT </h1>
    <select value={view} onChange={handleDropdownChange} className="text-white bg-black border border-white rounded px-3 py-2 mb-4">
      <option value="home">HOME</option>
      <option value="catalog">CATALOG</option>
      <option value="ContactUs">CONTACT US</option>
      <option value="ShippingPolicy">SHIPPING POLICY</option>
      <option value="PrivacyPolicy">PRIVACY POLICY</option>
      <option value="AuthorInfo">AUTHOR INFO</option>
    </select>
{view === 'catalog' && (
      <div className="h-screen bg-black p-3 w-80 flex-none fixed top-0 bottom-0 left-0">
        <div className="px-6 py-4 text-center">
          <h1 className="text-5xl mb-2 font-bold text-white">LUSIANT</h1>
          <DropdownMenu handleDropdownChange={handleDropdownChange} />
          <input
            type="text"
            id="searchInput"
            name="searchInput"
            placeholder="Search"
            value={searchInput}
            onChange={handleSearchInputChange}
            className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline mb-4"
          />
          <button className="bg-white text-black px-4 py-2 w-full mb-4" onClick={() => setFilterCategory('')}>Show All</button>
          <button className="bg-white text-black px-2 py-1 rounded-full text-uppercase mb-2 mr-2" onClick={() => setFilterCategory('Hoodies')}>Hoodies</button>
          <button className="bg-white text-black px-2 py-1 rounded-full text-uppercase mb-2 mr-2" onClick={() => setFilterCategory('Pants')}>Pants</button>
          <button className="bg-white text-black px-2 py-1 rounded-full text-uppercase mb-2" onClick={() => setFilterCategory('Shirts')}>Shirts</button>
          {cartItems}
          <div className="absolute top-0 right-0 p-10 cursor-pointer" onClick={() => setView('checkout')}>
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
        </div>
      </div>
    )}
  </div>
</div>
<div className="p-10 flex-grow flex flex-wrap" style={{
    backgroundPosition: 'right', 
    backgroundRepeat: 'no-repeat', 
    backgroundSize: 'cover',
    height: '100vh', // Set a specific height
    backgroundImage: view === 'home' ? "url('https://i.imgur.com/JHctaO3.jpg')" : 'none'
}}>
          {view === 'catalog' && viewer1 && showAllItems}
          {view === 'ShippingPolicy' && (
            <div className="w-full text-center py-10">
              <h2 className="text-6xl font-bold mb-4">SHIPPING POLICY</h2>
              <div className="mx-auto w-3/4 text-3xl">
                <p className="mb-4"><strong>PRE-MADE ORDERS</strong> - Orders are shipped within 1-5 business days</p>
                <p><strong>PRE - ORDERS</strong> - Please allow 3-5 weeks for production once site is closed after a release/drop. Shipping will begin once production is complete</p>
              </div>
            </div>
          )}
          {view === 'PrivacyPolicy' && (
            <div className="w-full text-center py-10">
              <h2 className="text-6xl font-bold mb-4">PRIVACY POLICY</h2>
              <div className="mx-auto w-3/4 text-xl">
                <p className="mb-4"><strong>Privacy Policy for Lusiant</strong></p>
                <p className="mb-4"><strong>Effective Date:</strong> 05/02/2024</p>
                <p className="mb-4"><strong>Introduction</strong> - Welcome to Lusiant. We are committed to protecting your privacy and ensuring the security of your personal information...</p>
                <p className="mb-4"><strong>Information We Collect</strong> - We collect both personal and non-personal information from you to provide and improve our Services...</p>
                <p className="mb-4"><strong>How We Use Your Information</strong> - We use the information we collect to...</p>
                <p className="mb-4"><strong>Data Sharing</strong> - We do not sell or rent your personal information to third parties...</p>
                <p className="mb-4"><strong>Data Security</strong> - We take the security of your personal information seriously and implement appropriate safeguards to protect it...</p>
                <p className="mb-4"><strong>Your Choices</strong> - You have control over the personal information you provide to us...</p>
                <p className="mb-4"><strong>Cookies and Tracking Technologies</strong> - We use cookies and similar tracking technologies to enhance your online experience...</p>
                <p className="mb-4"><strong>Children's Privacy</strong> - Our Services are not intended for individuals under the age of 13...</p>
                <p className="mb-4"><strong>Changes to this Privacy Policy</strong> - We may update this Privacy Policy to reflect changes in our practices or for other operational, legal, or regulatory reasons...</p>
                <p className="mb-4"><strong>Contact Us</strong> - If you have questions or concerns about this Privacy Policy or how we handle your personal information, please contact us at contact@lusiant.co</p>
              </div>
            </div>
          )}
          {view === 'ContactUs' && !formSubmitted && (
            <div className="w-full text-center py-10">
              <h2 className="text-6xl font-bold mb-4">CONTACT US</h2>
              <form className="mx-auto w-3/4 text-xl" onSubmit={handleContactSubmit}>
                <input className="w-full mb-4 p-2 border border-black" type="text" name="name" placeholder="Name" required />
                <input className="w-full mb-4 p-2 border border-black" type="email" name="email" placeholder="Email Address" required />
                <input className="w-full mb-4 p-2 border border-black" type="text" name="orderNumber" placeholder="Order Number (Optional)" />
                <textarea className="w-full mb-4 p-2 h-64 border border-black" name="comment" placeholder="Comment" required></textarea>
                <input className="w-full p-2 bg-black text-white" type="submit" value="Submit" />
              </form>
            </div>
          )}

          {view === 'ContactUs' && formSubmitted && (
            <div className="w-full text-center py-10">
              <h2 className="text-6xl font-bold mb-4">Email sent, we will be in touch with you about your query as soon as possible. Thank you for your patience and patronage!</h2>
            </div>
          )}
          {view === 'AuthorInfo' && (
            <div className="w-full text-center py-10">
              <h2 className="text-2xl font-bold">AUTHOR INFO</h2>
            </div>
          )}
        </div>
      </>
    )}
  </div>
);
}
export default App;