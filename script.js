// Modal functionality for deletion confirmation
let itemToDelete = null; // Store the item to delete temporarily

// Show confirmation modal
function showConfirmationModal(index) {
    itemToDelete = index; // Store the index of the item to delete
    const modal = document.getElementById("confirmationModal");
    modal.style.display = "flex"; // Show the modal
}

// Close the modal
function closeConfirmationModal() {
    const modal = document.getElementById("confirmationModal");
    modal.style.display = "none"; // Hide the modal
}

// Handle item removal after confirmation
function confirmDelete() {
    if (itemToDelete !== null) {
        console.log("Deleting item at index:", itemToDelete); // Debugging: Check if the index is correct before deletion
        // Remove the item from cartData
        cartData.items.splice(itemToDelete, 1);

        // Save updated cart data to local storage
        saveCartToLocalStorage();

        // Re-render the cart items
        renderCartItems();
    }

    itemToDelete = null; // Reset the index to avoid accidental deletion in the future
    closeConfirmationModal(); // Close the modal after deletion
}

// Handle cancellation of deletion
function cancelDelete() {
    console.log("Delete action cancelled"); // Debugging: Confirm cancellation
    closeConfirmationModal(); // Simply close the modal without deletion
}

// Attach event listeners for modal buttons
document.getElementById("confirmDelete").addEventListener("click", confirmDelete);
document.getElementById("cancelDelete").addEventListener("click", cancelDelete);

// Cart data initialization
let cartData = {
    items: [],
    original_total_price: 0
};

// Load cart data from local storage if available
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem("cartData");
    if (storedCart) {
        cartData = JSON.parse(storedCart);
    }
}

// Save cart data to local storage
function saveCartToLocalStorage() {
    localStorage.setItem("cartData", JSON.stringify(cartData));
}

// Fetch cart data
async function fetchData() {
    try {
        const res = await fetch("https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889");
        if (!res.ok) throw new Error("Failed to fetch cart data");
        const fetchedCartData = await res.json();
        if (!fetchedCartData || !fetchedCartData.items) throw new Error("Invalid cart data");

        // Load from local storage or use fetched data
        loadCartFromLocalStorage();
        if (!cartData.items.length) {
            cartData = fetchedCartData;
        }

        renderCartItems();
    } catch (err) {
        console.error(err);
        cartData = { items: [], original_total_price: 0 }; 
    }
}

// Render cart items in the table
function renderCartItems() {
    const cartBody = document.getElementById("cart-body");
    cartBody.innerHTML = ""; // Clear the cart before re-rendering

    cartData.items.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="cart-img"><img src="${item.image}" alt="${item.title}" width="50"></td>
            <td class="text-gray">${item.title}</td>
            <td class="item-price text-gray" data-price="${item.price}">Rs. ${item.price}</td>
            <td>
                <input type="number" class="quantity-input" data-index="${index}" value="${item.quantity}" min="1">
            </td>
            <td class="item-subtotal">Rs. ${item.price * item.quantity}</td>
            <td>
                <button class="remove-item" data-index="${index}">
                    <i class="fi fi-rs-trash"></i>
                </button>
            </td>
        `;
        cartBody.appendChild(row);
    });

    updateTotal(); // Update total price

    // Attach event listeners to quantity inputs
    document.querySelectorAll(".quantity-input").forEach(input => {
        input.addEventListener("change", handleQuantityChange);
    });

    // Attach event listeners to remove buttons
    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", handleRemoveItem); // Trigger the confirmation modal
    });
}

// Handle quantity change
function handleQuantityChange(event) {
    const index = event.target.getAttribute("data-index");
    const newQuantity = parseInt(event.target.value);

    if (newQuantity < 1) {
        event.target.value = 1; // Prevent negative or zero values
        return;
    }

    // Update quantity in cart data
    cartData.items[index].quantity = newQuantity;

    // Update subtotal for this row
    const itemPrice = cartData.items[index].price;
    const newSubtotal = itemPrice * newQuantity;
    event.target.closest("tr").querySelector(".item-subtotal").textContent = `Rs. ${newSubtotal}`;

    // Save updated cart data to local storage
    saveCartToLocalStorage();

    updateTotal();
}


// Handle item removal (this will trigger the modal)
function handleRemoveItem(event) {
    const button = event.target.closest(".remove-item"); // Ensure you're getting the button, not the icon
    const index = button ? button.getAttribute("data-index") : null; // Ensure you're getting the index from the button
    if (index !== null) {
        console.log("Remove item at index:", index); 
        showConfirmationModal(index); // Show the modal instead of directly removing the item
    } else {
        console.error("No index found!");
    }
}


// Update total price
function updateTotal() {
    let total = 0;

    document.querySelectorAll(".item-subtotal").forEach(subtotalElement => {
        total += parseInt(subtotalElement.textContent.replace("Rs. ", ""));
    });

    document.querySelector(".Subtotal").textContent = `Rs. ${total}`;
    document.querySelector(".total").textContent = `Rs. ${total}`;

    // Save updated total price to local storage
    saveCartToLocalStorage();
}


fetchData();
