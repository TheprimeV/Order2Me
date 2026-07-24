let cart = [];

async function loadMenu() {
    const { data, error } = await supabaseClient
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching menu:", error);
        const container = document.getElementById("menu-container");
        container.innerHTML = "<p class='text-danger'>Error loading menu. Please refresh.</p>";
        return;
    }

    if (data.length === 0) {
        const container = document.getElementById("menu-container");
        container.innerHTML = "<p class='text-muted'>No items available today.</p>";
        return;
    }

    displayMenuItems(data);
}

function displayMenuItems(items) {
    const container = document.getElementById("menu-container");
    container.innerHTML = "";

    items.forEach(food => {
        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";
        card.innerHTML = `
            <div class="card shadow-sm h-100">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${food.name}</h5>
                    <p class="card-text text-muted flex-grow-1">
                        ${food.description || "Delicious item"}
                    </p>
                    <h6 class="text-primary mb-3">${food.price} MMK</h6>
                    <button class="btn btn-primary w-100" onclick="addToCart(${food.id}, '${escapeHtml(food.name)}', ${food.price})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function addToCart(itemId, itemName, price) {
    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: itemId,
            name: itemName,
            price: price,
            quantity: 1
        });
    }

    alert(`${itemName} added to cart!`);
    console.log("Cart:", cart);
}

loadMenu();