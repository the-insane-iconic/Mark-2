// Initialize Firebase (compat version)
const firebaseConfig = {
  apiKey: "AIzaSyA_NU0Cz5XqDyBQehpYiuTlUjCXFWx4bsM",
  authDomain: "insane-gaming-setup.firebaseapp.com",
  projectId: "insane-gaming-setup",
  storageBucket: "insane-gaming-setup.appspot.com",
  messagingSenderId: "472778417206",
  appId: "1:472778417206:web:b1cca04cf9d19f897c6497",
  measurementId: "G-3KC6TVL9DV"
};

// Initialize Firebase services
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const db = firebase.firestore();

// Global cart variable with localStorage persistence
let cart = JSON.parse(localStorage.getItem('cart')) || {};
let cartCount = Object.keys(cart).length;

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function formatDate(timestamp) {
  if (!timestamp) return "Just now";
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, icon = "⚡", duration = 3000) {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = "toast show";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}


function updateCartStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  cartCount = Object.keys(cart).length;
  const cartCounter = document.getElementById('cart-count');
  if (cartCounter) cartCounter.textContent = cartCount;
}

function highlightProduct(card) {
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.style.outline = '3px solid #007bff';
  setTimeout(() => card.style.outline = '', 1500);
}

// Main DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  // ----- MOBILE MENU -----
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // ----- THEME TOGGLE -----
  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      // Inside your existing toggle function, after dark mode is applied:
if (document.body.classList.contains("dark-mode")) {
  darkModeSound.currentTime = 0.1;
  darkModeSound.volume = 0.5;
  darkModeSound.muted = false;

  darkModeSound.play().catch(e => {
    console.log("Autoplay blocked: ", e);
  });
}

      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
    
    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }

  // ----- SEARCH FUNCTIONALITY -----
  const searchInput = document.getElementById('search-bar');
  const suggestionsBox = document.getElementById('suggestions');
  
  if (searchInput && suggestionsBox) {
    searchInput.addEventListener('input', debounce(function() {
      const query = this.value.trim().toLowerCase();
      suggestionsBox.innerHTML = '';
      
      if (query.length < 1) {
        suggestionsBox.style.display = 'none';
        return;
      }

      const products = Array.from(document.querySelectorAll('.add-to-cart'))
        .map(btn => ({
          name: btn.dataset.name,
          price: btn.dataset.price,
          element: btn.closest('.card')
        }));

      const matches = products.filter(product => 
        product.name.toLowerCase().includes(query)
      );

      if (matches.length) {
        matches.forEach(product => {
          const li = document.createElement('li');
          li.textContent = `${product.name} (₹${product.price})`;
          li.addEventListener('click', () => {
            searchInput.value = product.name;
            suggestionsBox.style.display = 'none';
            highlightProduct(product.element);
          });
          suggestionsBox.appendChild(li);
        });
        suggestionsBox.style.display = 'block';
      } else {
        suggestionsBox.style.display = 'none';
      }
    }, 300));


        document.getElementById("sort-by").addEventListener("change", function () {
    const sortOption = this.value;
    const grid = document.querySelector(".grid"); // where .card elements live
    const cards = Array.from(grid.querySelectorAll(".card"));

    // Function to extract numerical price from ₹999 or similar
    const getPrice = (card) => {
      const priceText = card.querySelector(".price").innerText;
      const price = parseFloat(priceText.replace(/[^\d.]/g, ""));
      return isNaN(price) ? 0 : price;
    };

    if (sortOption === "low-high") {
      cards.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortOption === "high-low") {
      cards.sort((a, b) => getPrice(b) - getPrice(a));
    } else {
      return; // Do nothing on default
    }

    // Remove old cards and re-append sorted ones
    cards.forEach(card => grid.appendChild(card));
  });


    // Close suggestions when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (e.target !== searchInput) {
        suggestionsBox.style.display = 'none';
      }
    });
  }

  // ----- CART LOGIC -----
  updateCartCount();
  const cartCounter = document.getElementById('cart-count');
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartBox = document.getElementById("cart-box");
  const cartIcon = document.getElementById("cart-icon");
  const cartCloseBtn = document.getElementById("cart-close-btn");

  // Adding items to cart
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const productName = button.dataset.name;
      const price = parseInt(button.dataset.price);
      const card = button.closest('.card');
      const image = card.querySelector('img').src;

      // Update cart object
      if (cart[productName]) {
        cart[productName].qty += 1;
      } else {
        cart[productName] = { name: productName, price, qty: 1, image };
      }

      updateCartStorage();
      updateCartDisplay();
      showToast(`${productName} added to cart`, "🛒");
    });
  });

  function updateCartDisplay() {
    if (!cartItemsEl || !cartTotalEl) return;
    
    cartItemsEl.innerHTML = '';
    let total = 0;

    for (let name in cart) {
      const item = cart[name];
      const li = document.createElement("li");
      li.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div>
          <h4>${item.name}</h4>
          <p>₹${item.price} x ${item.qty} = ₹${item.price * item.qty}</p>
          <button class="remove-item" data-name="${name}">Remove</button>
        </div>
      `;
      cartItemsEl.appendChild(li);
      total += item.price * item.qty;
    }

    cartTotalEl.textContent = `Total: ₹${total}`;

    // Add remove item functionality
    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', (e) => {
        const name = e.target.dataset.name;
        delete cart[name];
        updateCartStorage();
        updateCartDisplay();
        showToast(`${name} removed from cart`, "❌");
      });
    });
  }

  // ----- CART MODAL -----
  if (cartIcon && cartBox && cartCloseBtn) {
    cartIcon.addEventListener('click', () => {
      updateCartDisplay();
      cartBox.style.display = 'block';
    });

    cartCloseBtn.addEventListener('click', () => {
      cartBox.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
      if (e.target === cartBox) {
        cartBox.style.display = 'none';
      }
    });
  }

  // ----- PRODUCT MODAL -----
  const productModal = document.getElementById('product-modal');
  if (productModal) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) return;
        
        const imgSrc = card.querySelector('img').src;
        const productName = card.querySelector('.add-to-cart').dataset.name;
        const price = card.querySelector('.add-to-cart').dataset.price;
        const description = card.querySelector('.add-to-cart').dataset.description;
        document.getElementById('modal-desc').textContent = description;
        document.getElementById('modal-img').src = imgSrc;
        document.getElementById('modal-title').textContent = productName;
        document.getElementById('modal-price').textContent = `₹${price}`;
        
        productModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      });
    });

    document.querySelector('#product-modal .close').addEventListener('click', () => {
      productModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
      if (e.target === productModal) {
        productModal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  }
  
  // ----- CATEGORY FILTER -----
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      const selected = this.value;
      document.querySelectorAll('.card').forEach(card => {
        const category = card.dataset.category;
        card.style.display = selected === 'all' || category === selected ? 'block' : 'none';
      });
    });
  }

  // ----- ORDER TRACKING SYSTEM -----
  setupOrderTracking();

  // ----- COMMENTS SYSTEM -----
  setupCommentsSystem();

  // ----- LOAD MORE COMMENTS -----
  const loadMoreBtn = document.querySelector('.load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      const commentsContainer = document.querySelector('.comments-container');
      if (commentsContainer) {
        commentsContainer.classList.toggle('expanded');
        this.textContent = commentsContainer.classList.contains('expanded') 
          ? 'Show Less' 
          : 'Load More';
      }
    });
  }

  // ----- LOGOUT FUNCTIONALITY -----
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await auth.signOut();
        window.location.href = "login2.html";
      } catch (err) {
        console.error("Error logging out:", err);
      }
    });
  }

  // ----- HEADER SCROLL EFFECT -----
  window.addEventListener('scroll', function() {
    const header = document.querySelector('.site-header');
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // ----- CHECKOUT FUNCTIONALITY -----
  setupCheckout();
});

// Order Tracking System
function setupOrderTracking() {
  const trackOrderBtn = document.getElementById("trackOrderBtn");
  const setupzoneClose = document.getElementsByClassName("setupzone-close")[0];
  const trackingModal = document.getElementById("setupzoneTrackingModal");
  const setupzoneSearchBtn = document.getElementById("setupzoneSearchOrderBtn");
  const setupzoneOrderIdInput = document.getElementById("setupzoneOrderIdInput");

  if (trackOrderBtn && trackingModal) {
    trackOrderBtn.addEventListener("click", function() {
      trackingModal.style.display = "block";
    });
  }

  if (setupzoneClose && trackingModal) {
    setupzoneClose.addEventListener("click", function() {
      trackingModal.style.display = "none";
      resetTrackingModal();
    });
  }

  if (trackingModal) {
    window.addEventListener("click", function(event) {
      if (event.target === trackingModal) {
        trackingModal.style.display = "none";
        resetTrackingModal();
      }
    });
  }

  if (setupzoneSearchBtn) {
    setupzoneSearchBtn.addEventListener("click", searchSetupzoneOrder);
  }

  if (setupzoneOrderIdInput) {
    setupzoneOrderIdInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        searchSetupzoneOrder();
      }
    });
  }

  function resetTrackingModal() {
    const setupzoneOrderDetails = document.getElementById("setupzoneOrderDetails");
    const setupzoneOrderNotFound = document.getElementById("setupzoneOrderNotFound");
    const setupzoneOrderIdInput = document.getElementById("setupzoneOrderIdInput");
    
    if (setupzoneOrderDetails) setupzoneOrderDetails.classList.add("hidden");
    if (setupzoneOrderNotFound) setupzoneOrderNotFound.classList.add("hidden");
    if (setupzoneOrderIdInput) setupzoneOrderIdInput.value = "";
  }

  function searchSetupzoneOrder() {
    const setupzoneOrderIdInput = document.getElementById("setupzoneOrderIdInput");
    const setupzoneSearchBtn = document.getElementById("setupzoneSearchOrderBtn");
    const setupzoneOrderDetails = document.getElementById("setupzoneOrderDetails");
    const setupzoneOrderNotFound = document.getElementById("setupzoneOrderNotFound");
    
    if (!setupzoneOrderIdInput || !setupzoneSearchBtn) return;
    
  let orderId = setupzoneOrderIdInput.value.trim().toUpperCase();

  const darkModeSound = document.getElementById("darkModeSound");


// Ensure it starts with "ORD-"
if (!orderId.startsWith("ORD-")) {
  orderId = "ORD-" + orderId;
}

    if (!orderId) {
      showToast("Please enter an order ID", "⚠️");
      return;
    }
    
    // Show loading state
    setupzoneSearchBtn.disabled = true;
    setupzoneSearchBtn.textContent = "Searching...";
    
    // Query Firestore for the order
    db.collection("orders").doc(orderId).get()
      .then((doc) => {
        if (doc.exists) {
          const orderData = doc.data();
          displaySetupzoneOrderDetails(orderId, orderData);
          if (setupzoneOrderDetails) setupzoneOrderDetails.classList.remove("hidden");
          if (setupzoneOrderNotFound) setupzoneOrderNotFound.classList.add("hidden");
        } else {
          if (setupzoneOrderDetails) setupzoneOrderDetails.classList.add("hidden");
          if (setupzoneOrderNotFound) setupzoneOrderNotFound.classList.remove("hidden");
        }
      })
      .catch((error) => {
        console.error("Error getting order:", error);
    
  showToast("Please log in to track your order");

      })
      .finally(() => {
        if (setupzoneSearchBtn) {
          setupzoneSearchBtn.disabled = false;
          setupzoneSearchBtn.textContent = "Search";
        }
      });
  }

  function displaySetupzoneOrderDetails(orderId, orderData) {
    // Set basic order info
    const orderNumberEl = document.getElementById("setupzoneOrderNumber");
    const carrierEl = document.getElementById("setupzoneCarrier");
    const trackingNumberEl = document.getElementById("setupzoneTrackingNumber");
    const estimatedDeliveryEl = document.getElementById("setupzoneEstimatedDelivery");
    
    if (orderNumberEl) orderNumberEl.textContent = orderId;
    if (carrierEl) carrierEl.textContent = orderData.shipping?.carrier || "Standard Shipping";
    if (trackingNumberEl) trackingNumberEl.textContent = orderData.shipping?.trackingNumber || "Not available";
    
    // Format and display estimated delivery
    if (estimatedDeliveryEl) {
      if (orderData.shipping?.estimatedDelivery) {
        const deliveryDate = new Date(orderData.shipping.estimatedDelivery);

        estimatedDeliveryEl.textContent = deliveryDate.toLocaleDateString();
      } else {
        estimatedDeliveryEl.textContent = "Calculating...";
      }
    }
    
    // Update status timeline
    const statusSteps = {
      "ordered": orderData.orderDate,
      "processed": orderData.processDate,
      "shipped": orderData.shipDate,
      "delivered": orderData.deliveryDate
    };
    
    let currentStatus = "ordered";
    
    // Determine current status
    if (orderData.status === "processing") {
      currentStatus = "processed";
    } else if (orderData.status === "shipped") {
      currentStatus = "shipped";
    } else if (orderData.status === "delivered") {
      currentStatus = "delivered";
    }
    
    // Update each step
    for (const [step, date] of Object.entries(statusSteps)) {
      const stepElement = document.getElementById(`setupzone-step-${step}`);
      if (!stepElement) continue;
      
      const dateElement = stepElement.querySelector(".setupzone-status-date");
      
      if (date) {
    const formattedDate = new Date(date).toLocaleDateString();

        if (dateElement) dateElement.textContent = formattedDate;
      }
      
      // Mark previous steps as completed
      if (step === currentStatus) {
        stepElement.classList.add("active");
      } else if (isSetupzoneStepBefore(step, currentStatus)) {
        stepElement.classList.add("completed");
      }
    }
  }

  function isSetupzoneStepBefore(step, currentStep) {
    const stepsOrder = ["ordered", "processed", "shipped", "delivered"];
    return stepsOrder.indexOf(step) < stepsOrder.indexOf(currentStep);
  }

}



// Comments System
function setupCommentsSystem() {
  const commentInput = document.getElementById('comment-input');
  const submitComment = document.getElementById('submit-comment');
  const commentsContainer = document.querySelector('.comments-container');
  const loginPrompt = document.querySelector('.login-prompt');
  const charCounter = document.querySelector('.char-counter');

  if (commentInput && submitComment && commentsContainer) {
    const commentsRef = database.ref('comments');

    // Handle auth state
    auth.onAuthStateChanged(user => {
      if (user) {
        // User is logged in
        if (loginPrompt) loginPrompt.style.display = 'none';
        commentInput.disabled = false;
        loadComments();
      } else {
        // User is logged out
        if (loginPrompt) loginPrompt.style.display = 'block';
        commentInput.disabled = true;
      }
    });

    // Submit comment
    submitComment.addEventListener('click', () => {
      const user = auth.currentUser;
      const text = commentInput.value.trim();
      
      if (!user) {
        showToast("Please sign in to comment", "🔒");
        return;
      }
      
      if (text.length === 0) {
        showToast("Comment cannot be empty", "⚠️");
        return;
      }
      
      if (text.length > 250) {
        showToast("Comment too long (max 250 chars)", "⚠️");
        return;
      }
      
      // Push new comment to database
      commentsRef.push({
        text: text,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userEmail: user.email,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      }).then(() => {
        commentInput.value = "";
        if (charCounter) charCounter.textContent = '0/250';
      }).catch(error => {
        console.error("Error posting comment:", error);
        showToast("Failed to post comment", "❌");
      });
    });

    // Character counter
    commentInput.addEventListener('input', function() {
      if (charCounter) charCounter.textContent = `${this.value.length}/250`;
    });

    // Load comments function
    function loadComments() {
      commentsRef.orderByChild('timestamp').on('value', (snapshot) => {
        commentsContainer.innerHTML = '';
        const comments = [];
        
        snapshot.forEach(childSnapshot => {
          const comment = childSnapshot.val();
          comments.push({
            id: childSnapshot.key,
            ...comment
          });
        });
        
        // Display comments in reverse chronological order
        comments.reverse().forEach(comment => {
          const commentEl = document.createElement('div');
          commentEl.className = 'comment';
          commentEl.innerHTML = `
            <div class="comment-header">
              <span class="comment-author">${escapeHtml(comment.userName)}</span>
              <span class="comment-date">${formatDate(comment.timestamp)}</span>
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
          `;
          commentsContainer.appendChild(commentEl);
        });
      });
    }
  }
}
// Add this near the top of setupCheckout():
auth.onAuthStateChanged(user => {
  const checkoutAuthStatus = document.getElementById('checkout-auth-status');
  if (checkoutAuthStatus) {
    if (user) {
      checkoutAuthStatus.innerHTML = `
        <span class="auth-status logged-in">
          ✔️ Logged in as ${user.email || 'user'}
        </span>
      `;
    } else {
      checkoutAuthStatus.innerHTML = `
        <span class="auth-status logged-out">
          🔒 Please sign in to checkout
        </span>
        <a href="login2.html" class="login-link">Login</a>
      `;
    }
  }
});

function placeOrder(paymentMethod, paymentId = null) {
  // Check authentication again before placing order
  const user = auth.currentUser;
  if (!user) {
    showToast("Please sign in to place an order", "🔒");
    return;
  }

  const shippingInfo = getShippingInfo();
  const cartItems = getCartItems();
  const total = calculateTotal();
  
  // Rest of your existing placeOrder code...
}
// Checkout System
function setupCheckout() {
  // DOM Elements
  const checkoutBtn = document.getElementById('checkout');
  const checkoutModal = document.getElementById('checkout-modal');
  const closeCheckoutBtn = document.querySelector('#checkout-modal .close');
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  const nextToPaymentBtn = document.getElementById('next-to-payment');
  const backToShippingBtn = document.getElementById('back-to-shipping');
  const placeCodOrderBtn = document.getElementById('place-cod-order');
  const rzpButton = document.getElementById('rzp-button');
  const enableCodCheckbox = document.getElementById('enable-cod');
  const continueShoppingBtn = document.getElementById('continue-shopping');
  const trackOrderBtn = document.getElementById('track-order');
  const progressSteps = document.querySelectorAll('.progress-step');
  const toastContainer = document.getElementById('toast-container');
  
  // Open checkout modal when "PROCEED TO CHECKOUT" is clicked
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      const cartBox = document.getElementById('cart-box');
      if (cartBox) cartBox.style.display = 'none';
      
      if (checkoutModal) {
        checkoutModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Reset to first step
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        document.getElementById('step-1').classList.add('active');
        
        document.querySelectorAll('.progress-step').forEach(step => {
          step.classList.remove('active', 'completed');
        });
        document.querySelector('.progress-step[data-step="1"]').classList.add('active');
        
        updateOrderSummary();
      } else {
        console.error("Checkout modal not found!");
      }
    });
  }

  
  // Close checkout modal
  if (closeCheckoutBtn && checkoutModal) {
    closeCheckoutBtn.addEventListener('click', function() {
      checkoutModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  }
  
  // Progress to Payment step
  if (nextToPaymentBtn) {
    nextToPaymentBtn.addEventListener('click', function() {
      if (validateShippingForm()) {
        // Update progress indicators
        step1.classList.remove('active');
        step2.classList.add('active');
        
        // Update progress steps if they exist
        if (progressSteps.length > 0) {
          progressSteps[0].classList.add('completed');
          progressSteps[1].classList.add('active');
        }
        
        // Update order summary with shipping info
        updateOrderSummary();
      }
    });
  }
  
  // Back to Shipping step
  if (backToShippingBtn) {
    backToShippingBtn.addEventListener('click', function() {
      step2.classList.remove('active');
      step1.classList.add('active');
      
      // Update progress steps if they exist
      if (progressSteps.length > 0) {
        progressSteps[1].classList.remove('active');
        progressSteps[0].classList.remove('completed');
        progressSteps[0].classList.add('active');
      }
    });
  }
  
  // COD checkbox toggle
  if (enableCodCheckbox) {
    enableCodCheckbox.addEventListener('change', function() {
      if (this.checked) {
        rzpButton.style.opacity = '0.5';
        placeCodOrderBtn.style.display = 'block';
      } else {
        rzpButton.style.opacity = '1';
        placeCodOrderBtn.style.display = 'none';
      }
      updateOrderSummary();
    });
  }
  
  // Razorpay payment button
  if (rzpButton) {
    rzpButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (!validateShippingForm()) {
        return;
      }
      
      const shippingInfo = getShippingInfo();
      const total = calculateTotal();
      
      // Initialize Razorpay payment
      const options = {
        key: "YOUR_RAZORPAY_KEY", // Replace with your actual Razorpay key
        amount: total * 100, // Razorpay uses paise
        currency: "INR",
        name: "SetupZone",
        description: "Gaming Room Decor Purchase",
        image: "https://example.com/logo.png", // Replace with your actual logo URL
        handler: function(response) {
          // Process order after successful payment
          placeOrder('razorpay', response.razorpay_payment_id);
        },
        prefill: {
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          contact: shippingInfo.phone
        },
        notes: {
          address: shippingInfo.address
        },
        theme: {
          color: "#3399cc"
        }
      };
      
      const rzp = new Razorpay(options);
      rzp.open();
    });
  }
  
  // Place COD Order button
if (placeCodOrderBtn) {
  placeCodOrderBtn.addEventListener("click", function () {
    if (!validateShippingForm()) {
      return;
    }

    // Place order via your function (this saves it to Firestore, etc.)
    placeOrder("cod");

    // Get user email
    const email = document.querySelector("input[type=email]").value;

    // Create order ID
    const orderId = "ORD" + Math.floor(Math.random() * 1000000);
    const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString(); // 5 days later

    // Prepare orders array from cart
    const orders = Object.values(cart).map(item => ({
      name: item.name,
      price: item.price,
      units: item.qty,
      image_url: item.image
    }));

    // Calculate totals
    const total = orders.reduce((sum, i) => sum + (i.price * i.units), 0);

    const templateParams = {
      order_id: orderId,
      delivery_date: deliveryDate,
      email: email,
      orders: orders,
      cost: {
        shipping: "Free",
        tax: 0,
        total: total
      }
    };

    emailjs.send("service_cryo_byte", "template_cryo_byte", templateParams)
      .then(function (response) {
        console.log("✅ Email sent!", response.status, response.text);
      }, function (error) {
        console.error("❌ Email failed:", error);
      });



  // Proceed to confirmation screen
  document.getElementById("order-id-display").innerText = orderId;
  document.getElementById("order-email-display").innerText = email;
  document.getElementById("order-delivery-display").innerText = deliveryDate;
  document.querySelector("#step-2").classList.remove("active");
  document.querySelector("#step-3").classList.add("active");
});

}
  
  // Continue Shopping button
  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', function() {
      checkoutModal.style.display = 'none';
      document.body.style.overflow = 'auto';
      clearCart();
    });
  }
  
  // Track Order button
if (trackOrderBtn) {
  trackOrderBtn.addEventListener('click', function () {
    const modal = document.getElementById('setupzoneTrackingModal');
    if (modal) {
      modal.style.display = 'block';
      document.getElementById('setupzoneOrderIdInput').value = document.getElementById('order-id-display').textContent;
    }
  });
}

  // Form validation function
  function validateShippingForm() {
    const form = document.querySelector('#step-1 .checkout-form');
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = '#ef4444';
        isValid = false;
      } else {
        input.style.borderColor = '#cbd5e1';
      }
    });
    
    if (!isValid) {
      showToast('Please fill all required fields', 'error');
    }
    
    return isValid;
  }
  
  // Get shipping info from form
  function getShippingInfo() {
    const form = document.querySelector('#step-1 .checkout-form');
    const inputs = form.querySelectorAll('input, textarea');
    
    return {
      fullName: inputs[0].value.trim(),
      email: inputs[1].value.trim(),
      address: inputs[2].value.trim(),
      city: inputs[3].value.trim(),
      zip: inputs[4].value.trim(),
      phone: inputs[5].value.trim()
    };
  }
  
  // Get cart items
  function getCartItems() {
    const items = [];
    for (const productName in cart) {
      const item = cart[productName];
      items.push({
        name: productName,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.qty) || 1,
        image: item.image || 'feww'
      });
    }
    return items;
  }
  
  // Calculate order total
  function calculateTotal() {
    const cartItems = getCartItems();
    let subtotal = 0;
    
    cartItems.forEach(item => {
      subtotal += item.price * item.quantity;
    });
    
    // Add COD fee if applicable
    if (document.getElementById('enable-cod')?.checked) {
      return subtotal + 50;
    }
    
    return subtotal;
  }
  
  // Update order summary in checkout
  function updateOrderSummary() {
    const cartItems = getCartItems();
    const container = document.getElementById('checkout-items');
    if (!container) {
      console.error('Checkout items container not found');
      return;
    }
    
    container.innerHTML = '';
    let subtotal = 0;
    
    if (cartItems.length === 0) {
      container.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
      updateTotals(0, 0);
      return;
    }
    
    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      const itemElement = document.createElement('div');
      itemElement.className = 'checkout-item';
      itemElement.innerHTML = `
        <div class="checkout-item-image-container">
          <img src="${item.image}" alt="${item.name}" class="checkout-item-image" onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
        </div>
        <div class="checkout-item-details">
          <h4 class="checkout-item-name">${item.name}</h4>
          <div class="checkout-item-meta">
            <span class="checkout-item-price">₹${item.price.toFixed(2)}</span>
            <span class="checkout-item-quantity">× ${item.quantity}</span>
          </div>
        </div>
        <div class="checkout-item-total">₹${itemTotal.toFixed(2)}</div>
      `;
      container.appendChild(itemElement);
    });
    
    const isCOD = document.getElementById('enable-cod')?.checked;
    const shippingFee = isCOD ? 50 : 0;
    updateTotals(subtotal, shippingFee);
  }
  
  function updateTotals(subtotal, shippingFee) {
    const total = subtotal + shippingFee;
    
    document.getElementById('checkout-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').textContent = shippingFee ? '₹50.00' : 'Free';
    document.getElementById('checkout-total-amount').textContent = `₹${total.toFixed(2)}`;
    
    // Also update the payment button amounts
    const rzpButton = document.getElementById('rzp-button');
    if (rzpButton) {
      rzpButton.textContent = `Pay ₹${total.toFixed(2)} with Razorpay 🔐`;
    }
    
    const placeCodOrderBtn = document.getElementById('place-cod-order');
    if (placeCodOrderBtn) {
      placeCodOrderBtn.textContent = `Place COD Order (₹${total.toFixed(2)})`;
    }
  }
  
  // Place order in Firebase
  function placeOrder(paymentMethod, paymentId = null) {
    const shippingInfo = getShippingInfo();
    const cartItems = getCartItems();
    const total = calculateTotal();
    
    // Generate order ID
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const orderDate = new Date().toISOString();
    
    // Create order object
    const order = {
      orderId,
      orderDate,
      customer: {
        name: shippingInfo.fullName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          zip: shippingInfo.zip
        }
      },
      items: cartItems,
      subtotal: total - (paymentMethod === 'cod' ? 50 : 0),
      shippingFee: paymentMethod === 'cod' ? 50 : 0,
      total,
      paymentMethod,
      paymentId,
      status: paymentMethod === 'cod' ? 'processing' : 'paid',
      shippingStatus: 'processing',
      statusTimeline: {
        ordered: new Date().toISOString(),
        processed: null,
        shipped: null,
        delivered: null
      },
      carrier: 'FastTrack Logistics',
      trackingNumber: 'TRK' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      estimatedDelivery: getEstimatedDeliveryDate()
    };
    
    // Save to Firebase
    if (window.firebase && firebase.firestore) {
      const db = firebase.firestore();
      
      db.collection('orders').doc(orderId).set(order)
        .then(() => {
          // Show confirmation
          moveToConfirmation(order);
          
          // Show success message
          showToast('Order placed successfully!', '✅ Email sent!');
          
          // Also save locally for order tracking
          saveOrderLocally(order);
        })
        .catch(error => {
          console.error('Error saving order: ', error);
          showToast('Error placing order. Please try again.', 'error');
        });
    } 
  }



  // Move to confirmation step
  function moveToConfirmation(order) {
    // Update steps
    step2.classList.remove('active');
    step3.classList.add('active');
    
    // Update progress steps if they exist
    if (progressSteps.length > 0) {
      progressSteps[1].classList.add('completed');
      progressSteps[2].classList.add('active');
    }
    
    // Update confirmation details
    document.getElementById('order-id-display').textContent = order.orderId;
    document.getElementById('order-email-display').textContent = order.customer.email;
    document.getElementById('order-delivery-display').textContent = 'Estimated 3-5 business days';
  }
  
  // Save order to localStorage for tracking
  function saveOrderLocally(order) {
    let orders = JSON.parse(localStorage.getItem('setupzoneOrders')) || [];
    orders.push(order);
    localStorage.setItem('setupzoneOrders', JSON.stringify(orders));
  }
  
  // Get estimated delivery date
  function getEstimatedDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 3) + 3); // 3-5 days from now
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Clear cart after successful purchase
  function clearCart() {
    cart = {};
    localStorage.removeItem('cart');
    updateCartCount();
    
    // Clear cart items in UI
    const cartItemsElement = document.getElementById('cart-items');
    if (cartItemsElement) {
      cartItemsElement.innerHTML = '';
    }
    
    // Update cart total in UI
    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
      cartTotalElement.textContent = 'Total: ₹0';
    }
  }
}


// particles-config.js
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
      "particles": {
        "number": {
          "value": 80,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#00f0ff" // Cyber blue color
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          }
        },
        "opacity": {
          "value": 0.5,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 3,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 2,
            "size_min": 0.1,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#00f0ff",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 2,
          "direction": "none",
          "random": true,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": true,
            "rotateX": 600,
            "rotateY": 1200
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true,
            "mode": "grab"
          },
          "onclick": {
            "enable": true,
            "mode": "push"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 140,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 400,
            "size": 40,
            "duration": 2,
            "opacity": 8,
            "speed": 3
          },
          "repulse": {
            "distance": 200,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    });
  }
});
