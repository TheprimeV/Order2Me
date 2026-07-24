// Modal instances
let addFoodModal;
let editFoodModal;

// Initialize application
function initializeApp() {
    console.log("🚀 Initializing application...");
    
    // Check if Supabase is loaded
    if (typeof supabaseClient === 'undefined') {
        console.error("❌ Supabase client not loaded!");
        document.getElementById("menu-list").innerHTML = `<p class='text-danger'>Error: Supabase not initialized</p>`;
        return;
    }
    console.log("✅ Supabase client ready");
    
    // Check if Bootstrap is available
    if (typeof bootstrap === 'undefined') {
        console.error("❌ Bootstrap not loaded!");
        document.getElementById("menu-list").innerHTML = `<p class='text-danger'>Error: Bootstrap not initialized</p>`;
        return;
    }
    console.log("✅ Bootstrap ready");
    
    // Initialize modals
    const addModalEl = document.getElementById("addFoodModal");
    const editModalEl = document.getElementById("editFoodModal");
    
    if (!addModalEl || !editModalEl) {
        console.error("❌ Modal elements not found!");
        return;
    }
    
    addFoodModal = new bootstrap.Modal(addModalEl);
    editFoodModal = new bootstrap.Modal(editModalEl);
    console.log("✅ Modals initialized");
    
    // Attach button event listeners
    const submitBtn = document.getElementById("submit-btn");
    const editSubmitBtn = document.getElementById("edit-submit-btn");
    
    if (!submitBtn) {
        console.error("❌ Submit button not found!");
    } else {
        submitBtn.addEventListener("click", handleAddFood);
        console.log("✅ Add Food button listener attached");
    }
    
    if (!editSubmitBtn) {
        console.error("❌ Edit Submit button not found!");
    } else {
        editSubmitBtn.addEventListener("click", handleEditFood);
        console.log("✅ Edit Food button listener attached");
    }
    
    // Reset modals when closed
    addModalEl.addEventListener("hidden.bs.modal", function() {
        document.getElementById("menu-form").reset();
    });
    
    // Load menu items
    loadMenuItems();
}

// Load menu items from Supabase
async function loadMenuItems() {
    try {
        console.log("📥 Loading menu items from Supabase...");
        
        if (typeof supabaseClient === 'undefined') {
            throw new Error("Supabase client not initialized");
        }
        
        const { data, error } = await supabaseClient
            .from("menu_items")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("❌ Supabase error:", error);
            document.getElementById("menu-list").innerHTML = `<p class='text-danger'>Error: ${error.message}</p>`;
            return;
        }

        console.log(`✅ Loaded ${data.length} items:`, data);
        displayMenuItems(data);
    } catch (err) {
        console.error("❌ Exception:", err);
        document.getElementById("menu-list").innerHTML = `<p class='text-danger'>Error: ${err.message}</p>`;
    }
}

// Display menu items in table
function displayMenuItems(items) {
    const menuList = document.getElementById("menu-list");

    if (!items || items.length === 0) {
        menuList.innerHTML = "<p class='text-muted'>No menu items yet. Click 'Add Food' to get started!</p>";
        return;
    }

    menuList.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price (MMK)</th>
                        <th>Available</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${escapeHtml(item.name)}</td>
                            <td>${escapeHtml(item.description || "-")}</td>
                            <td>${item.price}</td>
                            <td>
                                <div class="form-check form-switch">
                                    <input class="form-check-input toggle-availability" type="checkbox" 
                                           id="toggle-${item.id}" ${item.is_available ? 'checked' : ''} 
                                           data-id="${item.id}">
                                </div>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-warning me-2" onclick="openEditModal(${item.id}, '${escapeHtml(item.name)}', '${escapeHtml(item.description || '')}', ${item.price}, ${item.is_available})">
                                    Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id})">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

    // Add event listeners to toggle switches
    document.querySelectorAll(".toggle-availability").forEach(toggle => {
        toggle.addEventListener("change", toggleAvailability);
    });
    console.log("✅ Table rendered and toggle listeners attached");
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Handle Add Food
async function handleAddFood() {
    try {
        console.log("📝 Adding new food...");
        
        const name = document.getElementById("item-name").value.trim();
        const description = document.getElementById("item-description").value.trim();
        const price = parseFloat(document.getElementById("item-price").value);
        const isAvailable = document.getElementById("item-available").checked;

        if (!name) {
            alert("❌ Please enter food name");
            console.warn("Food name is empty");
            return;
        }

        if (isNaN(price) || price < 0) {
            alert("❌ Please enter valid price");
            console.warn("Invalid price:", price);
            return;
        }

        console.log("📤 Sending to Supabase:", { name, description, price, isAvailable });
        
        const { data, error } = await supabaseClient
            .from("menu_items")
            .insert([{
                name,
                description,
                price,
                is_available: isAvailable
            }])
            .select();

        if (error) {
            console.error("❌ Supabase error:", error);
            alert(`❌ Error: ${error.message}`);
            return;
        }

        console.log("✅ Food added successfully:", data);
        alert("✅ Food added successfully!");
        
        // Reset form and close modal
        document.getElementById("menu-form").reset();
        addFoodModal.hide();
        
        // Reload menu
        loadMenuItems();
    } catch (err) {
        console.error("❌ Exception:", err);
        alert(`❌ Exception: ${err.message}`);
    }
}

// Open Edit Modal
function openEditModal(id, name, description, price, isAvailable) {
    console.log("📂 Opening edit modal for ID:", id);
    
    document.getElementById("edit-item-id").value = id;
    document.getElementById("edit-item-name").value = name;
    document.getElementById("edit-item-description").value = description;
    document.getElementById("edit-item-price").value = price;
    document.getElementById("edit-item-available").checked = isAvailable;
    
    editFoodModal.show();
}

// Handle Edit Food
async function handleEditFood() {
    try {
        console.log("✏️ Updating food...");
        
        const itemId = document.getElementById("edit-item-id").value;
        const name = document.getElementById("edit-item-name").value.trim();
        const description = document.getElementById("edit-item-description").value.trim();
        const price = parseFloat(document.getElementById("edit-item-price").value);
        const isAvailable = document.getElementById("edit-item-available").checked;

        if (!itemId) {
            alert("❌ Item ID not found");
            console.error("No item ID");
            return;
        }

        if (!name) {
            alert("❌ Please enter food name");
            console.warn("Food name is empty");
            return;
        }

        if (isNaN(price) || price < 0) {
            alert("❌ Please enter valid price");
            console.warn("Invalid price:", price);
            return;
        }

        console.log("📤 Sending update to Supabase:", { itemId, name, description, price, isAvailable });
        
        const { data, error } = await supabaseClient
            .from("menu_items")
            .update({
                name,
                description,
                price,
                is_available: isAvailable
            })
            .eq("id", itemId)
            .select();

        if (error) {
            console.error("❌ Supabase error:", error);
            alert(`❌ Error: ${error.message}`);
            return;
        }

        console.log("✅ Food updated successfully:", data);
        alert("✅ Food updated successfully!");
        
        editFoodModal.hide();
        loadMenuItems();
    } catch (err) {
        console.error("❌ Exception:", err);
        alert(`❌ Exception: ${err.message}`);
    }
}

// Toggle availability
async function toggleAvailability(event) {
    try {
        const itemId = event.target.dataset.id;
        const isAvailable = event.target.checked;

        console.log("🔄 Toggling availability for ID:", itemId, "to:", isAvailable);
        
        const { data, error } = await supabaseClient
            .from("menu_items")
            .update({ is_available: isAvailable })
            .eq("id", itemId)
            .select();

        if (error) {
            console.error("❌ Supabase error:", error);
            alert(`❌ Error: ${error.message}`);
            event.target.checked = !isAvailable; // Revert
            return;
        }

        console.log("✅ Availability toggled successfully:", data);
    } catch (err) {
        console.error("❌ Exception:", err);
        alert(`❌ Exception: ${err.message}`);
        event.target.checked = !isAvailable; // Revert
    }
}

// Delete item
async function deleteItem(id) {
    if (!confirm("❓ Are you sure you want to delete this item?")) {
        console.log("Delete cancelled");
        return;
    }

    try {
        console.log("🗑️ Deleting food with ID:", id);
        
        const { error } = await supabaseClient
            .from("menu_items")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("❌ Supabase error:", error);
            alert(`❌ Error: ${error.message}`);
            return;
        }

        console.log("✅ Food deleted successfully");
        alert("✅ Food deleted successfully!");
        loadMenuItems();
    } catch (err) {
        console.error("❌ Exception:", err);
        alert(`❌ Exception: ${err.message}`);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    console.log("⏳ DOM still loading, waiting for DOMContentLoaded...");
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    console.log("⏳ DOM already loaded, initializing...");
    initializeApp();
}
