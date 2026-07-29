// ==========================================
// FASTAPI URL
// ==========================================

// LOCAL DEVELOPMENT
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

const periodSelect =
    document.getElementById("periodSelect");

const chartBars =
    document.getElementById("chartBars");


// ==========================================
// VARIABLES
// ==========================================

let subscriptions = [];

let editingId = null;


// ==========================================
// LOAD SUBSCRIPTIONS
// GET
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

        updateChart();

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


        // First letter becomes profile icon

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
// CALCULATE TOTAL
// ==========================================

function calculateTotal() {

    let subscriptionsToCalculate =
        subscriptions;


    // THIS MONTH

    if (periodSelect.value === "month") {

        const today =
            new Date();


        const currentMonth =
            today.getMonth();


        const currentYear =
            today.getFullYear();


        subscriptionsToCalculate =
            subscriptions.filter(
                subscription => {

                    const date =
                        new Date(
                            subscription.billingDate +
                            "T00:00:00"
                        );


                    return (
                        date.getMonth() ===
                        currentMonth
                        &&
                        date.getFullYear() ===
                        currentYear
                    );

                }
            );

    }


    const total =
        subscriptionsToCalculate.reduce(
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
// DYNAMIC CHART
// ==========================================

function updateChart() {

    // Clear existing chart

    chartBars.innerHTML = "";


    const today =
        new Date();


    const months = [];


    // ======================================
    // GENERATE LAST 6 MONTHS
    // ======================================

    for (let i = 5; i >= 0; i--) {

        const date =
            new Date(
                today.getFullYear(),
                today.getMonth() - i,
                1
            );


        months.push({

            month:
                date.getMonth(),

            year:
                date.getFullYear(),

            name:
                date.toLocaleDateString(
                    "en-US",
                    {
                        month: "short"
                    }
                ),

            total: 0

        });

    }


    // ======================================
    // ADD SUBSCRIPTIONS TO THEIR MONTHS
    // ======================================

    subscriptions.forEach(
        subscription => {

            const subscriptionDate =
                new Date(
                    subscription.billingDate +
                    "T00:00:00"
                );


            const subscriptionMonth =
                subscriptionDate.getMonth();


            const subscriptionYear =
                subscriptionDate.getFullYear();


            const matchingMonth =
                months.find(
                    month => {

                        return (
                            month.month ===
                            subscriptionMonth
                            &&
                            month.year ===
                            subscriptionYear
                        );

                    }
                );


            if (matchingMonth) {

                matchingMonth.total +=
                    Number(
                        subscription.price
                    );

            }

        }
    );


    // ======================================
    // FIND HIGHEST MONTH
    // ======================================

    const highestAmount =
        Math.max(
            ...months.map(
                month => month.total
            )
        );


    // ======================================
    // CREATE BARS
    // ======================================

    months.forEach(month => {

        let height = 0;


        if (highestAmount > 0) {

            height =
                (
                    month.total /
                    highestAmount
                ) * 100;

        }


        // Small spending should still
        // produce a visible bar

        if (
            month.total > 0 &&
            height < 8
        ) {

            height = 8;

        }


        const isHighest =
            month.total === highestAmount &&
            highestAmount > 0;


        const wrapper =
            document.createElement("div");


        wrapper.classList.add(
            "bar-wrapper"
        );


        wrapper.innerHTML = `

            <div
                class="bar ${isHighest ? "active" : ""}"

                style="
                    height: ${height}%;
                "

                title="
                    ${month.name} ${month.year}:
                    $${month.total.toFixed(2)}
                "
            ></div>


            <span
                class="
                    ${isHighest ? "active-month" : ""}
                "
            >

                ${month.name}

            </span>

        `;


        chartBars.appendChild(
            wrapper
        );

    });

}


// ==========================================
// PERIOD SELECT
// ==========================================

periodSelect.addEventListener(
    "change",
    function () {

        calculateTotal();

    }
);


// ==========================================
// OPEN ADD MODAL
// ==========================================

addBtn.addEventListener(
    "click",
    function () {

        editingId = null;


        modalTitle.textContent =
            "Add Subscription";


        saveBtn.textContent =
            "Save";


        // Clear inputs

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


// Click background to close

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
            Number(
                priceInput.value
            );


        const billingDate =
            dateInput.value;


        // VALIDATION

        if (
            !service ||
            !plan ||
            price <= 0 ||
            !billingDate
        ) {

            alert(
                "Please complete all fields."
            );

            return;

        }


        const subscriptionData = {

            service: service,

            plan: plan,

            price: price,

            billingDate: billingDate

        };


        // EDIT

        if (editingId !== null) {

            await updateSubscription(
                editingId,
                subscriptionData
            );

        }


        // ADD

        else {

            await addSubscription(
                subscriptionData
            );

        }

    }
);


// ==========================================
// ADD SUBSCRIPTION
// POST
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


        closeModal();


        // Reload from FastAPI / database

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
// UPDATE SUBSCRIPTION
// PUT
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


        // Reload latest database data

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


        // Reload latest database data

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


    // Pre-fill form

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