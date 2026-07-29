// ==========================================
// FASTAPI URL
// ==========================================

const API_URL = "https://subscription-tracker-backend-tspm.onrender.com";


// ==========================================
// HTML ELEMENTS
// ==========================================

const subscriptionList =
    document.getElementById("subscriptionList");

const totalSpending =
    document.getElementById("totalSpending");

const addBtn =
    document.getElementById("addBtn");

const modal =
    document.getElementById("subscriptionModal");

const modalTitle =
    document.getElementById("modalTitle");

const serviceInput =
    document.getElementById("serviceInput");

const planInput =
    document.getElementById("planInput");

const priceInput =
    document.getElementById("priceInput");

const dateInput =
    document.getElementById("dateInput");

const saveBtn =
    document.getElementById("saveBtn");

const cancelBtn =
    document.getElementById("cancelBtn");


// ==========================================
// VARIABLES
// ==========================================

// Subscriptions received from FastAPI
let subscriptions = [];

// null = adding
// number = editing
let editingId = null;


// ==========================================
// GET SUBSCRIPTIONS FROM FASTAPI
// ==========================================

async function loadSubscriptions() {

    try {

        const response = await fetch(
            `${API_URL}/subscriptions`
        );


        if (!response.ok) {

            throw new Error(
                "Could not load subscriptions"
            );

        }


        subscriptions =
            await response.json();


        displaySubscriptions();

        calculateTotal();

    }

    catch (error) {

        console.error(error);


        subscriptionList.innerHTML = `
            <div class="empty-state">
                Could not connect to FastAPI.
            </div>
        `;

    }

}


// ==========================================
// DISPLAY SUBSCRIPTIONS
// ==========================================

function displaySubscriptions() {

    subscriptionList.innerHTML = "";


    if (subscriptions.length === 0) {

        subscriptionList.innerHTML = `
            <div class="empty-state">
                No subscriptions yet.
            </div>
        `;

        return;

    }


    subscriptions.forEach(subscription => {

        const card =
            document.createElement("div");


        card.classList.add(
            "subscription-card"
        );


        // First letter becomes icon

        const initial =
            subscription.service
                .charAt(0)
                .toUpperCase();


        // Format billing date

        const date =
            new Date(
                subscription.billingDate +
                "T00:00:00"
            );


        const formattedDate =
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric"
                }
            );


        card.innerHTML = `

            <div class="subscription-left">

                <div class="service-icon">
                    ${initial}
                </div>


                <div class="service-info">

                    <h3>
                        ${subscription.service}
                    </h3>

                    <p>
                        ${subscription.plan}
                    </p>

                </div>

            </div>


            <div class="subscription-right">

                <div class="subscription-price">
                    -$${Number(
                        subscription.price
                    ).toFixed(2)}
                </div>

                <div class="subscription-date">
                    ${formattedDate}
                </div>

            </div>


            <div class="subscription-actions">

                <button
                    class="action-button edit-button"
                    data-id="${subscription.id}"
                    title="Edit"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>


                <button
                    class="action-button delete-button"
                    data-id="${subscription.id}"
                    title="Delete"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

        `;


        subscriptionList.appendChild(card);

    });

}


// ==========================================
// CALCULATE TOTAL SPENDING
// ==========================================

function calculateTotal() {

    const total =
        subscriptions.reduce(
            (sum, subscription) => {

                return (
                    sum +
                    Number(subscription.price)
                );

            },
            0
        );


    totalSpending.textContent =
        `$${total.toFixed(2)}`;

}


// ==========================================
// CHART
// ==========================================

function setupChart() {

    const bars =
        document.querySelectorAll(".bar");


    bars.forEach(bar => {

        const height =
            bar.dataset.height;


        bar.style.height =
            `${height}%`;

    });

}


// ==========================================
// OPEN ADD MODAL
// ==========================================

addBtn.addEventListener(
    "click",
    function () {

        // null means we're adding
        editingId = null;


        modalTitle.textContent =
            "Add Subscription";


        saveBtn.textContent =
            "Save";


        // Clear form

        serviceInput.value = "";

        planInput.value = "";

        priceInput.value = "";

        dateInput.value = "";


        modal.classList.remove(
            "hidden"
        );

    }
);


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    modal.classList.add(
        "hidden"
    );

    editingId = null;

}


cancelBtn.addEventListener(
    "click",
    closeModal
);


// Clicking outside popup closes it

modal.addEventListener(
    "click",
    function (event) {

        if (event.target === modal) {

            closeModal();

        }

    }
);


// ==========================================
// SAVE BUTTON
// ==========================================

saveBtn.addEventListener(
    "click",
    async function () {

        const service =
            serviceInput.value.trim();


        const plan =
            planInput.value.trim();


        const price =
            Number(priceInput.value);


        const billingDate =
            dateInput.value;


        // Validation

        if (
            !service ||
            !plan ||
            !price ||
            !billingDate
        ) {

            alert(
                "Please complete all fields."
            );

            return;

        }


        // Object we'll send to FastAPI

        const subscriptionData = {

            service: service,

            plan: plan,

            price: price,

            billingDate: billingDate

        };


        // Are we editing?

        if (editingId !== null) {

            await updateSubscription(
                editingId,
                subscriptionData
            );

        }

        // Otherwise add new subscription

        else {

            await addSubscription(
                subscriptionData
            );

        }

    }
);


// ==========================================
// POST
// ADD SUBSCRIPTION
// ==========================================

async function addSubscription(
    subscriptionData
) {

    try {

        const response =
            await fetch(
                `${API_URL}/subscriptions`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            subscriptionData
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not add subscription"
            );

        }


        // Close popup

        closeModal();


        // Ask FastAPI for updated data

        await loadSubscriptions();

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not add subscription."
        );

    }

}


// ==========================================
// PUT
// UPDATE SUBSCRIPTION
// ==========================================

async function updateSubscription(
    id,
    subscriptionData
) {

    try {

        const response =
            await fetch(
                `${API_URL}/subscriptions/${id}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            subscriptionData
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not update subscription"
            );

        }


        closeModal();


        // Reload latest data

        await loadSubscriptions();

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not update subscription."
        );

    }

}


// ==========================================
// DELETE SUBSCRIPTION
// ==========================================

async function deleteSubscription(id) {

    const subscription =
        subscriptions.find(
            subscription =>
                subscription.id === id
        );


    if (!subscription) {
        return;
    }


    const confirmed =
        confirm(
            `Delete ${subscription.service}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/subscriptions/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not delete subscription"
            );

        }


        // Get updated subscriptions

        await loadSubscriptions();

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not delete subscription."
        );

    }

}


// ==========================================
// EDIT / DELETE BUTTON CLICKS
// ==========================================

subscriptionList.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".action-button"
            );


        if (!button) {
            return;
        }


        const id =
            Number(
                button.dataset.id
            );


        // DELETE

        if (
            button.classList.contains(
                "delete-button"
            )
        ) {

            deleteSubscription(id);

        }


        // EDIT

        if (
            button.classList.contains(
                "edit-button"
            )
        ) {

            openEditModal(id);

        }

    }
);


// ==========================================
// OPEN EDIT MODAL
// ==========================================

function openEditModal(id) {

    const subscription =
        subscriptions.find(
            subscription =>
                subscription.id === id
        );


    if (!subscription) {
        return;
    }


    editingId = id;


    modalTitle.textContent =
        "Edit Subscription";


    saveBtn.textContent =
        "Update";


    // Fill form with existing values

    serviceInput.value =
        subscription.service;


    planInput.value =
        subscription.plan;


    priceInput.value =
        subscription.price;


    dateInput.value =
        subscription.billingDate;


    modal.classList.remove(
        "hidden"
    );

}


// ==========================================
// START APPLICATION
// ==========================================

loadSubscriptions();

setupChart();