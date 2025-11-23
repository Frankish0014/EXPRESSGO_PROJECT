/* global ApiClient, AppState, Chart */

// Modal Management Functions
function showModal(modalId) {
  const overlay = document.getElementById("modalOverlay");
  const modal = document.getElementById(modalId);
  if (overlay && modal) {
    overlay.classList.remove("hidden");
    overlay.classList.add("show");
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }
}

function hideModal(modalId) {
  const overlay = document.getElementById("modalOverlay");
  const modal = document.getElementById(modalId);
  if (overlay && modal) {
    overlay.classList.remove("show");
    setTimeout(() => {
      overlay.classList.add("hidden");
      modal.classList.add("hidden");
      document.body.style.overflow = ""; // Restore scrolling
    }, 300);
  }
}

function hideAllModals() {
  hideModal("routeModal");
  hideModal("scheduleModal");
  hideModal("deleteModal");
  hideModal("logoutModal");
}

// Close modals when clicking overlay
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        hideAllModals();
      }
    });
  }

  // Close modals with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideAllModals();
    }
  });
});

const statsRefs = {
  total: document.getElementById("statTotalBookings"),
  completed: document.getElementById("statCompletedBookings"),
  pending: document.getElementById("statPendingBookings"),
  cancelled: document.getElementById("statCancelledBookings"),
};

const revenueRefs = {
  current: document.getElementById("revenueCurrentMonth"),
  trend: document.getElementById("revenueTrend"),
  average: document.getElementById("revenueAverageDaily"),
};

const recentBookingsBody = document.getElementById("recentBookingsBody");
const popularRoutesList = document.getElementById("popularRoutesList");
const adminBookingsTableBody = document.getElementById(
  "adminBookingsTableBody"
);
const bookingsTableFooter = document.getElementById("bookingsTableFooter");
const adminMessageEl = document.getElementById("adminMessage");

let performanceChart;
let latestChartData = null;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "RWF",
  minimumFractionDigits: 0,
});

function formatCurrency(amount) {
  if (Number.isNaN(Number(amount))) return "RWF 0";
  return currencyFormatter.format(Number(amount)).replace("RWF", "RWF ");
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function showAdminMessage(message, variant = "info") {
  if (!adminMessageEl) return;
  adminMessageEl.textContent = message;
  adminMessageEl.classList.add("show");
  adminMessageEl.classList.toggle("error", variant === "error");
  adminMessageEl.classList.toggle("success", variant === "success");
}

function clearAdminMessage() {
  if (!adminMessageEl) return;
  adminMessageEl.textContent = "";
  adminMessageEl.classList.remove("show", "error", "success");
}

function showSection(sectionName) {
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active");
  });
  const target = document.getElementById(`${sectionName}-section`);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("data-section") === sectionName
    );
  });

  // Load data when section is shown
  if (sectionName === "routes") {
    setTimeout(() => {
      loadRoutes();
      initRoutesForm();
    }, 100);
  } else if (sectionName === "schedules") {
    setTimeout(() => {
      loadSchedules();
      initSchedulesForm();
    }, 100);
  } else if (sectionName === "bus-companies") {
    setTimeout(() => {
      loadBusCompanies();
      initBusCompaniesForm();
      initBusForm();
      initBusCompanyProfileModal();
    }, 100);
  } else if (sectionName === "statistics") {
    setTimeout(() => loadStatistics(), 100);
  } else if (sectionName === "offers") {
    setTimeout(() => {
      loadOffers();
      initOffersForm();
    }, 100);
  } else if (sectionName === "settings") {
    setTimeout(() => initSettings(), 100);
  } else if (sectionName === "help") {
    setTimeout(() => initHelpForm(), 100);
  }
}

function initNavigation() {
  document.querySelectorAll(".nav-link[data-section]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");
      if (section) showSection(section);
    });
  });

  const viewAllLink = document.querySelector(".view-all[data-section]");
  if (viewAllLink) {
    viewAllLink.addEventListener("click", (e) => {
      e.preventDefault();
      showSection("bookings");
    });
  }

  if (!document.querySelector(".content-section.active")) {
    showSection("overview");
  }
}

function initFAQ() {
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.nextElementSibling;
      button.classList.toggle("active");
      if (button.classList.contains("active")) {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      } else {
        answer.style.maxHeight = 0;
      }
    });
  });
}

function initProfileDropdown(
  profileBtnId,
  dropdownId,
  logoutBtnId,
  logoutHandler
) {
  const profileBtn = document.getElementById(profileBtnId);
  const dropdown = document.getElementById(dropdownId);
  const logoutBtn = document.getElementById(logoutBtnId);

  if (profileBtn && dropdown) {
    profileBtn.addEventListener("click", () =>
      dropdown.classList.toggle("hidden")
    );
    window.addEventListener("click", (event) => {
      if (
        !profileBtn.contains(event.target) &&
        !dropdown.contains(event.target)
      ) {
        dropdown.classList.add("hidden");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      dropdown?.classList.add("hidden");
      await logoutHandler();
    });
  }
}

function updateStats(stats) {
  if (!stats) return;
  if (statsRefs.total) statsRefs.total.textContent = stats.total ?? 0;
  if (statsRefs.completed)
    statsRefs.completed.textContent = stats.completed ?? 0;
  if (statsRefs.pending) statsRefs.pending.textContent = stats.pending ?? 0;
  if (statsRefs.cancelled)
    statsRefs.cancelled.textContent = stats.cancelled ?? 0;
}

function updateRevenue(revenue) {
  if (!revenue) return;
  if (revenueRefs.current)
    revenueRefs.current.textContent = formatCurrency(revenue.currentMonth || 0);
  if (revenueRefs.average)
    revenueRefs.average.textContent = formatCurrency(revenue.averageDaily || 0);

  if (revenueRefs.trend) {
    const trendValue = revenue.trend || 0;
    const trendText = `${trendValue > 0 ? "+" : ""}${trendValue.toFixed(1)}%`;
    revenueRefs.trend.textContent = trendText;
    revenueRefs.trend.classList.toggle("positive", trendValue >= 0);
    revenueRefs.trend.classList.toggle("negative", trendValue < 0);
  }
}

function renderRecentBookings(bookings = []) {
  if (!recentBookingsBody) return;
  if (bookings.length === 0) {
    recentBookingsBody.innerHTML =
      '<tr><td colspan="4">No recent bookings found.</td></tr>';
    return;
  }

  recentBookingsBody.innerHTML = bookings
    .map(
      (booking) => `
      <tr>
        <td>#${booking.code}</td>
        <td>${booking.passenger || "—"}</td>
        <td>${booking.route || "—"}</td>
        <td><span class="status ${
          booking.status
        }">${booking.status.toUpperCase()}</span></td>
      </tr>
    `
    )
    .join("");
}

function renderPopularRoutes(routes = []) {
  if (!popularRoutesList) return;
  if (!routes.length) {
    popularRoutesList.innerHTML = "<li>No route data available</li>";
    return;
  }

  popularRoutesList.innerHTML = routes
    .map(
      (route) =>
        `<li>${route.route} <span>(${route.count} bookings)</span></li>`
    )
    .join("");
}

function renderChart(chartData) {
  const ctx = document.getElementById("performanceChart");
  if (!ctx || !chartData) return;

  if (performanceChart) {
    performanceChart.destroy();
  }

  performanceChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: "Bookings",
          data: chartData.bookings,
          borderColor: "#0055ff",
          backgroundColor: "rgba(0, 85, 255, 0.1)",
          fill: true,
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Revenue (RWF)",
          data: chartData.revenue,
          borderColor: "#ff8c00",
          backgroundColor: "rgba(255, 140, 0, 0.1)",
          fill: true,
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: { display: true, text: "Bookings" },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: { display: true, text: "Revenue (RWF)" },
          grid: { drawOnChartArea: false },
        },
      },
    },
  });
}

function renderBookingsTable(bookings = []) {
  if (!adminBookingsTableBody) return;

  if (!bookings.length) {
    adminBookingsTableBody.innerHTML =
      '<tr><td colspan="7">No bookings found.</td></tr>';
    bookingsTableFooter.textContent = "Showing 0 bookings";
    return;
  }

  adminBookingsTableBody.innerHTML = bookings
    .map((booking) => {
      const route = booking.schedule?.route
        ? `${booking.schedule.route.departure_city} → ${booking.schedule.route.arrival_city}`
        : "—";
      const amount = Number(booking.schedule?.price || 0);
      return `
        <tr>
          <td>#${booking.id}</td>
          <td>${booking.user?.full_name || "—"}<br><small>${
        booking.user?.email || ""
      }</small></td>
          <td>${route}</td>
          <td>${formatDate(booking.travel_date)}</td>
          <td>${formatCurrency(amount)}</td>
          <td><span class="status ${
            booking.status
          }">${booking.status.toUpperCase()}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary" data-booking-id="${
                booking.id
              }" data-status="confirmed" ${
        booking.status === "confirmed" ? "disabled" : ""
      }>Confirm</button>
              <button class="btn btn-primary" data-booking-id="${
                booking.id
              }" data-status="completed" ${
        booking.status === "completed" ? "disabled" : ""
      }>Complete</button>
              <button class="btn btn-danger" data-booking-id="${
                booking.id
              }" data-status="cancelled" ${
        booking.status === "cancelled" ? "disabled" : ""
      }>Cancel</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  bookingsTableFooter.textContent = `Showing ${bookings.length} bookings`;
}

async function loadOverview() {
  try {
    const data = await ApiClient.get("/admin/overview", {}, true);
    updateStats(data.stats);
    updateRevenue(data.revenue);
    latestChartData = data.chart;
    renderChart(latestChartData);
    renderRecentBookings(data.recentBookings);
    renderPopularRoutes(data.popularRoutes);
  } catch (error) {
    console.error(error);
    showAdminMessage(error.message || "Failed to load overview data", "error");
  }
}

async function loadBookingsTable() {
  try {
    clearAdminMessage();
    const response = await ApiClient.get("/bookings", {}, true);
    renderBookingsTable(response.bookings || []);
  } catch (error) {
    console.error(error);
    showAdminMessage(error.message || "Failed to load bookings", "error");
  }
}

async function updateBookingStatus(bookingId, status) {
  try {
    await ApiClient.put(`/bookings/${bookingId}/status`, { status }, true);
    showAdminMessage(`Booking #${bookingId} updated to ${status}.`, "success");
    await Promise.all([loadOverview(), loadBookingsTable()]);
  } catch (error) {
    console.error(error);
    showAdminMessage(error.message || "Failed to update booking", "error");
  }
}

function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      document.body.classList.toggle("dark-mode", themeToggle.checked);
    });
  }
}

function hydrateProfileInfo(user) {
  document.querySelectorAll(".profile-info").forEach((profileInfo) => {
    profileInfo.innerHTML = `
      <p><strong>${
        user.full_name || user.company_name || "ExpressGo Admin"
      }</strong></p>
      <p class="email">${user.email}</p>
    `;
  });
}

async function loadStatistics() {
  try {
    const overview = await ApiClient.get("/admin/overview", {}, true);
    const stats = overview.data?.stats || {};
    const revenue = overview.data?.revenue || {};

    // Update revenue statistics
    document.getElementById("statTotalRevenue")?.replaceWith(
      Object.assign(document.createElement("p"), {
        id: "statTotalRevenue",
        textContent: formatCurrency(revenue.currentMonth || 0),
      })
    );

    document.getElementById("statMonthRevenue")?.replaceWith(
      Object.assign(document.createElement("p"), {
        id: "statMonthRevenue",
        textContent: formatCurrency(revenue.currentMonth || 0),
      })
    );

    const avgRevenue =
      stats.total > 0 ? (revenue.currentMonth || 0) / stats.total : 0;
    document.getElementById("statAvgRevenue")?.replaceWith(
      Object.assign(document.createElement("p"), {
        id: "statAvgRevenue",
        textContent: formatCurrency(avgRevenue),
      })
    );

    // Update booking statistics
    document.getElementById("statTotalBookingsStats")?.replaceWith(
      Object.assign(document.createElement("p"), {
        id: "statTotalBookingsStats",
        textContent: stats.total || 0,
      })
    );

    document.getElementById("statMonthBookings")?.replaceWith(
      Object.assign(document.createElement("p"), {
        id: "statMonthBookings",
        textContent: stats.completed || 0,
      })
    );

    const completionRate =
      stats.total > 0
        ? ((stats.completed / stats.total) * 100).toFixed(1) + "%"
        : "0%";
    document.getElementById("statCompletionRate")?.replaceWith(
      Object.assign(document.createElement("p"), {
        id: "statCompletionRate",
        textContent: completionRate,
      })
    );

    // Update route performance
    const popularRoutes = overview.data?.popularRoutes || [];
    const routeListEl = document.getElementById("routePerformanceList");
    if (routeListEl) {
      if (popularRoutes.length === 0) {
        routeListEl.innerHTML = "<p>No route data available.</p>";
      } else {
        routeListEl.innerHTML = popularRoutes
          .map(
            (route) => `
          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
            <span>${route.route}</span>
            <strong>${route.count} bookings</strong>
          </div>
        `
          )
          .join("");
      }
    }
  } catch (error) {
    console.error("Failed to load statistics:", error);
    showAdminMessage("Failed to load statistics", "error");
  }
}

async function loadOffers() {
  try {
    // For now, show placeholder - offers would need a backend endpoint
    const offersListEl = document.getElementById("activeOffersList");
    if (offersListEl) {
      offersListEl.innerHTML =
        '<p>No active offers. Click "Create Offer" to add one.</p>';
    }

    // Load routes for offer form
    const routesResponse = await ApiClient.get("/routes");
    const routes = routesResponse?.routes || [];
    const routeSelect = document.getElementById("offerRoute");
    if (routeSelect) {
      routeSelect.innerHTML =
        '<option value="">All Routes</option>' +
        routes
          .map(
            (route) =>
              `<option value="${route.id}">${route.departure_city} → ${route.arrival_city}</option>`
          )
          .join("");
    }
  } catch (error) {
    console.error("Failed to load offers:", error);
  }
}

function initOffersForm() {
  const createBtn = document.getElementById("createOfferBtn");
  const cancelBtn = document.getElementById("cancelOfferBtn");
  const formCard = document.getElementById("offerFormCard");
  const offerForm = document.getElementById("offerForm");
  const offersMessage = document.getElementById("offersMessage");

  if (createBtn) {
    createBtn.addEventListener("click", () => {
      if (formCard) {
        formCard.classList.remove("hidden");
        document.getElementById("offerFormTitle").textContent =
          "Create New Offer";
        if (offerForm) offerForm.reset();
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (formCard) formCard.classList.add("hidden");
    });
  }

  if (offerForm) {
    offerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(offerForm);

      // For now, just show a message - would need backend endpoint
      if (offersMessage) {
        offersMessage.textContent =
          "Offer feature coming soon! Backend endpoint needed.";
        offersMessage.classList.add("show");
        setTimeout(() => {
          offersMessage.classList.remove("show");
        }, 3000);
      }

      // In a real implementation, you would call:
      // await ApiClient.post('/admin/offers', {...}, true);
    });
  }
}

function initSettings() {
  const user = ApiClient.getUser();
  if (!user) return;

  // Populate profile form
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("settingsEmail");

  if (fullNameInput) {
    fullNameInput.value = user.full_name || "";
  }
  if (emailInput) {
    emailInput.value = user.email || "";
  }

  // Profile update form
  const profileForm = document.querySelector("#settings-section form");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const response = await ApiClient.put(
          "/auth/profile",
          {
            full_name: fullNameInput?.value || "",
          },
          true
        );

        if (response.data) {
          ApiClient.setSession({ user: response.data.user });
          showAdminMessage("Profile updated successfully", "success");
        }
      } catch (error) {
        console.error("Profile update failed:", error);
        showAdminMessage("Failed to update profile", "error");
      }
    });
  }

  // Password change form
  const passwordForm = document.querySelector(
    "#settings-section .card:nth-of-type(3) form"
  );
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById("currentPassword")?.value;
      const newPassword = document.getElementById("newPassword")?.value;

      if (!currentPassword || !newPassword) {
        showAdminMessage("Please fill in all password fields", "error");
        return;
      }

      try {
        // Note: This would need a password change endpoint
        showAdminMessage("Password change feature coming soon", "info");
        // await ApiClient.put('/auth/password', { currentPassword, newPassword }, true);
      } catch (error) {
        console.error("Password change failed:", error);
        showAdminMessage("Failed to change password", "error");
      }
    });
  }
}

function initHelpForm() {
  const helpForm = document.querySelector("#help-section form");
  if (helpForm) {
    helpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(helpForm);
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
        subject: "Admin Support Request",
      };

      try {
        // For now, just log - would need backend endpoint
        console.log("Help form submission:", data);
        alert("Support request submitted! We will get back to you soon.");
        helpForm.reset();
      } catch (error) {
        console.error("Help form error:", error);
        alert("Failed to submit support request. Please try again.");
      }
    });
  }
}

// Routes Management Functions
let editingRouteId = null;

async function loadRoutes() {
  try {
    const response = await ApiClient.get("/routes");
    const routes = response?.routes || [];
    const tbody = document.getElementById("routesTableBody");

    if (!tbody) return;

    if (routes.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6">No routes found. Create your first route!</td></tr>';
      return;
    }

    tbody.innerHTML = routes
      .map(
        (route) => `
      <tr>
        <td>${route.id}</td>
        <td>${route.departure_city}</td>
        <td>${route.arrival_city}</td>
        <td>${route.distance_km || "—"}</td>
        <td>${route.estimated_duration_minutes || "—"}</td>
        <td>
          <button class="icon-btn icon-btn-edit" data-route-id="${
            route.id
          }" data-action="edit" title="Edit route">
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn icon-btn-delete" data-route-id="${
            route.id
          }" data-action="delete" title="Delete route">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    // Attach event listeners
    tbody.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", () =>
        editRoute(parseInt(btn.dataset.routeId))
      );
    });

    tbody.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", () =>
        deleteRoute(parseInt(btn.dataset.routeId))
      );
    });
  } catch (error) {
    console.error("Failed to load routes:", error);
    showRoutesMessage("Failed to load routes", "error");
  }
}

function populateDistrictDropdowns() {
  const departureSelect = document.getElementById("modalRouteDepartureCity");
  const arrivalSelect = document.getElementById("modalRouteArrivalCity");

  if (!window.RWANDAN_DISTRICTS) {
    console.warn("RWANDAN_DISTRICTS not loaded");
    return;
  }

  const districts = window.RWANDAN_DISTRICTS;

  // Populate departure dropdown
  if (departureSelect) {
    districts.forEach((district) => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      departureSelect.appendChild(option);
    });
  }

  // Populate arrival dropdown
  if (arrivalSelect) {
    districts.forEach((district) => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      arrivalSelect.appendChild(option);
    });
  }
}

function initRoutesForm() {
  const createBtn = document.getElementById("createRouteBtn");
  const cancelBtn = document.getElementById("cancelRouteModal");
  const closeBtn = document.getElementById("closeRouteModal");
  const routeForm = document.getElementById("routeModalForm");

  // Populate district dropdowns
  populateDistrictDropdowns();

  if (createBtn) {
    createBtn.addEventListener("click", () => {
      editingRouteId = null;
      document.getElementById("routeModalTitle").textContent =
        "Create New Route";
      if (routeForm) routeForm.reset();
      showModal("routeModal");
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      hideModal("routeModal");
      editingRouteId = null;
      if (routeForm) routeForm.reset();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hideModal("routeModal");
      editingRouteId = null;
      if (routeForm) routeForm.reset();
    });
  }

  if (routeForm) {
    routeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(routeForm);
      const data = {
        departure_city: formData.get("departure_city")?.toString().trim() || "",
        arrival_city: formData.get("arrival_city")?.toString().trim() || "",
        distance_km: formData.get("distance_km")
          ? parseFloat(formData.get("distance_km"))
          : null,
        estimated_duration_minutes: formData.get("estimated_duration_minutes")
          ? parseInt(formData.get("estimated_duration_minutes"))
          : null,
      };

      // Validate that cities are selected
      if (!data.departure_city || !data.arrival_city) {
        showRoutesMessage(
          "Please select both departure and arrival cities",
          "error"
        );
        return;
      }

      if (data.departure_city === data.arrival_city) {
        showRoutesMessage(
          "Departure and arrival cities must be different",
          "error"
        );
        return;
      }

      try {
        const isEditing = editingRouteId !== null;
        if (isEditing) {
          await ApiClient.put(`/routes/${editingRouteId}`, data, true);
          showRoutesMessage("Route updated successfully!", "success");
        } else {
          await ApiClient.post("/routes", data, true);
          showRoutesMessage("Route created successfully!", "success");
        }

        hideModal("routeModal");
        editingRouteId = null;
        routeForm.reset();
        await loadRoutes();
      } catch (error) {
        console.error("Route save failed:", error);
        showRoutesMessage(error.message || "Failed to save route", "error");
      }
    });
  }
}

async function editRoute(routeId) {
  try {
    const response = await ApiClient.get(`/routes/${routeId}`);
    const route = response?.route;

    if (!route) {
      showRoutesMessage("Route not found", "error");
      return;
    }

    editingRouteId = routeId;
    document.getElementById("modalRouteDepartureCity").value =
      route.departure_city || "";
    document.getElementById("modalRouteArrivalCity").value =
      route.arrival_city || "";
    document.getElementById("modalRouteDistance").value =
      route.distance_km || "";
    document.getElementById("modalRouteDuration").value =
      route.estimated_duration_minutes || "";

    document.getElementById("routeModalTitle").textContent = "Edit Route";
    showModal("routeModal");
  } catch (error) {
    console.error("Failed to load route:", error);
    showRoutesMessage("Failed to load route details", "error");
  }
}

async function deleteRoute(routeId) {
  document.getElementById("deleteModalTitle").textContent = "Delete Route";
  document.getElementById("deleteModalMessage").textContent =
    "Are you sure you want to delete this route? This action cannot be undone.";

  const confirmBtn = document.getElementById("confirmDeleteModal");
  const cancelBtn = document.getElementById("cancelDeleteModal");
  const closeBtn = document.getElementById("closeDeleteModal");

  // Remove existing listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener("click", async () => {
    try {
      await ApiClient.delete(`/routes/${routeId}`, true);
      showRoutesMessage("Route deleted successfully", "success");
      hideModal("deleteModal");
      await loadRoutes();
    } catch (error) {
      console.error("Failed to delete route:", error);
      showRoutesMessage(error.message || "Failed to delete route", "error");
      hideModal("deleteModal");
    }
  });

  cancelBtn.onclick = () => hideModal("deleteModal");
  closeBtn.onclick = () => hideModal("deleteModal");

  showModal("deleteModal");
}

function showRoutesMessage(message, variant = "info") {
  const msgEl = document.getElementById("routesMessage");
  if (msgEl) {
    msgEl.textContent = message;
    msgEl.classList.add("show");
    msgEl.classList.toggle("error", variant === "error");
    msgEl.classList.toggle("success", variant === "success");
    setTimeout(() => {
      msgEl.classList.remove("show", "error", "success");
    }, 3000);
  }
}

// Schedules Management Functions
let editingScheduleId = null;

async function loadSchedules() {
  try {
    const response = await ApiClient.get("/schedules");
    const schedules = response?.schedules || [];
    const tbody = document.getElementById("schedulesTableBody");

    if (!tbody) return;

    if (schedules.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8">No schedules found. Create your first schedule!</td></tr>';
      return;
    }

    tbody.innerHTML = schedules
      .map((schedule) => {
        const route = schedule.route || {};
        const bus = schedule.bus || {};
        const routeName =
          route.departure_city && route.arrival_city
            ? `${route.departure_city} → ${route.arrival_city}`
            : "—";
        const busName = bus.plate_number || "—";

        return `
        <tr>
          <td>${schedule.id}</td>
          <td>${routeName}</td>
          <td>${busName}</td>
          <td>${schedule.departure_time || "—"}</td>
          <td>${schedule.arrival_time || "—"}</td>
          <td>${formatCurrency(schedule.price || 0)}</td>
          <td><span class="status ${
            schedule.is_active ? "confirmed" : "cancelled"
          }">${schedule.is_active ? "Active" : "Inactive"}</span></td>
          <td>
            <button class="icon-btn icon-btn-edit" data-schedule-id="${
              schedule.id
            }" data-action="edit" title="Edit schedule">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn icon-btn-delete" data-schedule-id="${
              schedule.id
            }" data-action="delete" title="Delete schedule">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
      })
      .join("");

    // Attach event listeners
    tbody.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", () =>
        editSchedule(parseInt(btn.dataset.scheduleId))
      );
    });

    tbody.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", () =>
        deleteSchedule(parseInt(btn.dataset.scheduleId))
      );
    });
  } catch (error) {
    console.error("Failed to load schedules:", error);
    showSchedulesMessage("Failed to load schedules", "error");
  }
}

// Shared function to load routes and buses for schedule form
async function loadRoutesAndBusesForSchedule() {
  try {
    const [routesResponse, busesResponse] = await Promise.all([
      ApiClient.get("/routes"),
      ApiClient.get("/buses"),
    ]);

    const routes = routesResponse?.routes || [];
    const buses = busesResponse?.buses || [];

    const routeSelect = document.getElementById("modalScheduleRoute");
    const busSelect = document.getElementById("modalScheduleBus");

    if (routeSelect) {
      routeSelect.innerHTML =
        '<option value="">Select a route</option>' +
        routes
          .map(
            (route) =>
              `<option value="${route.id}">${route.departure_city} → ${route.arrival_city}</option>`
          )
          .join("");
    }

    if (busSelect) {
      busSelect.innerHTML =
        '<option value="">Select a bus</option>' +
        buses
          .map(
            (bus) =>
              `<option value="${bus.id}">${bus.plate_number} - ${
                bus.company?.name || "Unknown Company"
              } (${bus.bus_type}, ${bus.total_seats} seats)</option>`
          )
          .join("");
    }
  } catch (error) {
    console.error("Failed to load routes/buses:", error);
    showSchedulesMessage("Failed to load routes or buses", "error");
  }
}

async function initSchedulesForm() {
  const createBtn = document.getElementById("createScheduleBtn");
  const cancelBtn = document.getElementById("cancelScheduleModal");
  const closeBtn = document.getElementById("closeScheduleModal");
  const scheduleForm = document.getElementById("scheduleModalForm");

  // Populate dropdowns when form initializes
  await loadRoutesAndBusesForSchedule();

  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      editingScheduleId = null;
      document.getElementById("scheduleModalTitle").textContent =
        "Create New Schedule";
      if (scheduleForm) scheduleForm.reset();
      const isActiveCheckbox = document.getElementById("modalScheduleIsActive");
      if (isActiveCheckbox) isActiveCheckbox.checked = true;

      // Refresh dropdowns in case routes/buses were added
      await loadRoutesAndBusesForSchedule();

      showModal("scheduleModal");
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      hideModal("scheduleModal");
      editingScheduleId = null;
      if (scheduleForm) scheduleForm.reset();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hideModal("scheduleModal");
      editingScheduleId = null;
      if (scheduleForm) scheduleForm.reset();
    });
  }

  if (scheduleForm) {
    scheduleForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(scheduleForm);
      const data = {
        route_id: parseInt(formData.get("route_id")),
        bus_id: parseInt(formData.get("bus_id")),
        departure_time: formData.get("departure_time"),
        arrival_time: formData.get("arrival_time"),
        price: parseFloat(formData.get("price")),
        available_days:
          formData.get("available_days") ||
          "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
        is_active: document.getElementById("modalScheduleIsActive").checked,
      };

      try {
        const isEditing = editingScheduleId !== null;
        if (isEditing) {
          await ApiClient.put(`/schedules/${editingScheduleId}`, data, true);
          showSchedulesMessage("Schedule updated successfully!", "success");
        } else {
          await ApiClient.post("/schedules", data, true);
          showSchedulesMessage("Schedule created successfully!", "success");
        }

        hideModal("scheduleModal");
        editingScheduleId = null;
        scheduleForm.reset();
        await loadSchedules();
      } catch (error) {
        console.error("Schedule save failed:", error);
        showSchedulesMessage(
          error.message || "Failed to save schedule",
          "error"
        );
      }
    });
  }
}

async function editSchedule(scheduleId) {
  try {
    const response = await ApiClient.get(`/schedules/${scheduleId}`);
    const schedule = response?.schedule;

    if (!schedule) {
      showSchedulesMessage("Schedule not found", "error");
      return;
    }

    // Load routes and buses
    await loadRoutesAndBusesForSchedule();

    editingScheduleId = scheduleId;
    document.getElementById("modalScheduleRoute").value =
      schedule.route_id || "";
    document.getElementById("modalScheduleBus").value = schedule.bus_id || "";

    // Format time for input (HH:MM)
    const departureTime = schedule.departure_time
      ? schedule.departure_time.substring(0, 5)
      : "";
    const arrivalTime = schedule.arrival_time
      ? schedule.arrival_time.substring(0, 5)
      : "";

    document.getElementById("modalScheduleDepartureTime").value = departureTime;
    document.getElementById("modalScheduleArrivalTime").value = arrivalTime;
    document.getElementById("modalSchedulePrice").value = schedule.price || "";
    document.getElementById("modalScheduleAvailableDays").value =
      schedule.available_days || "";
    document.getElementById("modalScheduleIsActive").checked =
      schedule.is_active !== false;

    document.getElementById("scheduleModalTitle").textContent = "Edit Schedule";
    showModal("scheduleModal");
  } catch (error) {
    console.error("Failed to load schedule:", error);
    showSchedulesMessage("Failed to load schedule details", "error");
  }
}

async function deleteSchedule(scheduleId) {
  document.getElementById("deleteModalTitle").textContent = "Delete Schedule";
  document.getElementById("deleteModalMessage").textContent =
    "Are you sure you want to delete this schedule? This action cannot be undone.";

  const confirmBtn = document.getElementById("confirmDeleteModal");
  const cancelBtn = document.getElementById("cancelDeleteModal");
  const closeBtn = document.getElementById("closeDeleteModal");

  // Remove existing listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener("click", async () => {
    try {
      await ApiClient.delete(`/schedules/${scheduleId}`, true);
      showSchedulesMessage("Schedule deleted successfully", "success");
      hideModal("deleteModal");
      await loadSchedules();
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      showSchedulesMessage(
        error.message || "Failed to delete schedule",
        "error"
      );
      hideModal("deleteModal");
    }
  });

  cancelBtn.onclick = () => hideModal("deleteModal");
  closeBtn.onclick = () => hideModal("deleteModal");

  showModal("deleteModal");
}

function showSchedulesMessage(message, variant = "info") {
  const msgEl = document.getElementById("schedulesMessage");
  if (msgEl) {
    msgEl.textContent = message;
    msgEl.classList.add("show");
    msgEl.classList.toggle("error", variant === "error");
    msgEl.classList.toggle("success", variant === "success");
    setTimeout(() => {
      msgEl.classList.remove("show", "error", "success");
    }, 3000);
  }
}

// Bus Companies Management Functions
let editingBusCompanyId = null;
let editingBusId = null;
let currentCompanyId = null;
let busCompaniesFormInitialized = false;
let busFormInitialized = false;

async function loadBusCompanies() {
  try {
    const response = await ApiClient.get("/buses/companies/all");
    const companies = response?.companies || [];
    const tbody = document.getElementById("busCompaniesTableBody");

    if (!tbody) return;

    if (companies.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6">No bus companies found. Create your first company!</td></tr>';
      return;
    }

    tbody.innerHTML = companies
      .map(
        (company) => `
        <tr>
          <td>${company.id}</td>
          <td>${company.name}</td>
          <td>${company.contact_phone || "—"}</td>
          <td>${company.contact_email || "—"}</td>
          <td>${company.buses ? company.buses.length : 0}</td>
          <td>
            <button class="icon-btn icon-btn-edit" data-company-id="${
              company.id
            }" data-action="view" title="View company profile">
              <i class="fas fa-eye"></i>
            </button>
            <button class="icon-btn icon-btn-edit" data-company-id="${
              company.id
            }" data-action="edit" title="Edit company">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn icon-btn-delete" data-company-id="${
              company.id
            }" data-action="delete" title="Delete company">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    // Attach event listeners
    tbody.querySelectorAll('button[data-action="view"]').forEach((btn) => {
      btn.addEventListener("click", () =>
        viewBusCompanyProfile(parseInt(btn.dataset.companyId))
      );
    });

    tbody.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", () =>
        editBusCompany(parseInt(btn.dataset.companyId))
      );
    });

    tbody.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", () =>
        deleteBusCompany(parseInt(btn.dataset.companyId))
      );
    });
  } catch (error) {
    console.error("Failed to load bus companies:", error);
    showBusCompaniesMessage("Failed to load bus companies", "error");
  }
}

async function initBusCompaniesForm() {
  // Prevent duplicate initialization
  if (busCompaniesFormInitialized) {
    return;
  }

  const createBtn = document.getElementById("createBusCompanyBtn");
  const cancelBtn = document.getElementById("cancelBusCompanyModal");
  const closeBtn = document.getElementById("closeBusCompanyModal");
  const companyForm = document.getElementById("busCompanyModalForm");

  // Define handler functions
  const handleCreateClick = () => {
    editingBusCompanyId = null;
    document.getElementById("busCompanyModalTitle").textContent =
      "Create New Bus Company";
    if (companyForm) companyForm.reset();
    showModal("busCompanyModal");
  };

  const handleCancelClick = () => {
    hideModal("busCompanyModal");
    editingBusCompanyId = null;
    if (companyForm) companyForm.reset();
  };

  const handleCloseClick = () => {
    hideModal("busCompanyModal");
    editingBusCompanyId = null;
    if (companyForm) companyForm.reset();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(companyForm);
    const data = {
      name: formData.get("name")?.toString().trim() || "",
      contact_phone: formData.get("contact_phone")?.toString().trim() || "",
      contact_email: formData.get("contact_email")?.toString().trim() || "",
    };

    try {
      const isEditing = editingBusCompanyId !== null;
      if (isEditing) {
        await ApiClient.put(
          `/buses/companies/${editingBusCompanyId}`,
          data,
          true
        );
        showBusCompaniesMessage("Company updated successfully!", "success");
      } else {
        await ApiClient.post("/buses/companies", data, true);
        showBusCompaniesMessage("Company created successfully!", "success");
      }

      hideModal("busCompanyModal");
      editingBusCompanyId = null;
      companyForm.reset();
      await loadBusCompanies();
    } catch (error) {
      console.error("Company save failed:", error);
      showBusCompaniesMessage(
        error.message || "Failed to save company",
        "error"
      );
    }
  };

  if (createBtn) {
    createBtn.addEventListener("click", handleCreateClick);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", handleCancelClick);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", handleCloseClick);
  }

  if (companyForm) {
    companyForm.addEventListener("submit", handleFormSubmit);
  }

  busCompaniesFormInitialized = true;
}

async function editBusCompany(companyId) {
  try {
    const response = await ApiClient.get(`/buses/companies/${companyId}`);
    const company = response?.company;

    if (!company) {
      showBusCompaniesMessage("Company not found", "error");
      return;
    }

    editingBusCompanyId = companyId;
    document.getElementById("busCompanyModalTitle").textContent =
      "Edit Bus Company";
    document.getElementById("modalBusCompanyName").value = company.name || "";
    document.getElementById("modalBusCompanyPhone").value =
      company.contact_phone || "";
    document.getElementById("modalBusCompanyEmail").value =
      company.contact_email || "";

    showModal("busCompanyModal");
  } catch (error) {
    console.error("Failed to load company:", error);
    showBusCompaniesMessage("Failed to load company details", "error");
  }
}

async function viewBusCompanyProfile(companyId) {
  try {
    const response = await ApiClient.get(`/buses/companies/${companyId}`);
    const company = response?.company;

    if (!company) {
      showBusCompaniesMessage("Company not found", "error");
      return;
    }

    currentCompanyId = companyId;

    // Populate company info
    document.getElementById("profileCompanyName").textContent =
      company.name || "—";
    document.getElementById("profileCompanyPhone").textContent =
      company.contact_phone || "—";
    document.getElementById("profileCompanyEmail").textContent =
      company.contact_email || "—";

    // Load and display buses
    await loadCompanyBuses(companyId);

    showModal("busCompanyProfileModal");
  } catch (error) {
    console.error("Failed to load company profile:", error);
    showBusCompaniesMessage("Failed to load company profile", "error");
  }
}

async function loadCompanyBuses(companyId) {
  try {
    const response = await ApiClient.get(`/buses/company/${companyId}`);
    const buses = response?.buses || [];
    const tbody = document.getElementById("companyBusesTableBody");

    if (!tbody) return;

    if (buses.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5">No buses found. Click "Add Bus" to add one.</td></tr>';
      return;
    }

    tbody.innerHTML = buses
      .map(
        (bus) => `
        <tr>
          <td>${bus.plate_number}</td>
          <td>${bus.bus_type}</td>
          <td>${bus.total_seats}</td>
          <td><span class="status ${
            bus.status === "active"
              ? "confirmed"
              : bus.status === "maintenance"
              ? "pending"
              : "cancelled"
          }">${bus.status.toUpperCase()}</span></td>
          <td>
            <button class="icon-btn icon-btn-edit" data-bus-id="${
              bus.id
            }" data-action="edit-bus" title="Edit bus">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn icon-btn-delete" data-bus-id="${
              bus.id
            }" data-action="delete-bus" title="Delete bus">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    // Attach event listeners
    tbody.querySelectorAll('button[data-action="edit-bus"]').forEach((btn) => {
      btn.addEventListener("click", () => editBus(parseInt(btn.dataset.busId)));
    });

    tbody
      .querySelectorAll('button[data-action="delete-bus"]')
      .forEach((btn) => {
        btn.addEventListener("click", () =>
          deleteBus(parseInt(btn.dataset.busId))
        );
      });
  } catch (error) {
    console.error("Failed to load company buses:", error);
    showBusCompaniesMessage("Failed to load buses", "error");
  }
}

async function initBusForm() {
  // Prevent duplicate initialization
  if (busFormInitialized) {
    return;
  }

  const addBusBtn = document.getElementById("addBusToCompanyBtn");
  const cancelBtn = document.getElementById("cancelBusModal");
  const closeBtn = document.getElementById("closeBusModal");
  const busForm = document.getElementById("busModalForm");

  // Define handler functions
  const handleAddBusClick = () => {
    if (!currentCompanyId) {
      showBusCompaniesMessage("No company selected", "error");
      return;
    }
    editingBusId = null;
    document.getElementById("busModalTitle").textContent =
      "Add Bus to Company";
    document.getElementById("modalBusCompanyId").value = currentCompanyId;
    if (busForm) busForm.reset();
    document.getElementById("modalBusStatus").value = "active";
    showModal("busModal");
  };

  const handleCancelClick = () => {
    hideModal("busModal");
    editingBusId = null;
    if (busForm) busForm.reset();
  };

  const handleCloseClick = () => {
    hideModal("busModal");
    editingBusId = null;
    if (busForm) busForm.reset();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(busForm);
    const data = {
      bus_company_id: parseInt(formData.get("bus_company_id")),
      plate_number: formData.get("plate_number")?.toString().trim() || "",
      bus_type: formData.get("bus_type")?.toString().trim() || "",
      total_seats: parseInt(formData.get("total_seats")),
      status: formData.get("status") || "active",
    };

    try {
      const isEditing = editingBusId !== null;
      if (isEditing) {
        await ApiClient.put(`/buses/${editingBusId}`, data, true);
        showBusCompaniesMessage("Bus updated successfully!", "success");
      } else {
        await ApiClient.post("/buses", data, true);
        showBusCompaniesMessage("Bus created successfully!", "success");
      }

      hideModal("busModal");
      editingBusId = null;
      busForm.reset();
      await loadCompanyBuses(currentCompanyId);
      await loadBusCompanies(); // Refresh companies list
    } catch (error) {
      console.error("Bus save failed:", error);
      showBusCompaniesMessage(error.message || "Failed to save bus", "error");
    }
  };

  if (addBusBtn) {
    addBusBtn.addEventListener("click", handleAddBusClick);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", handleCancelClick);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", handleCloseClick);
  }

  if (busForm) {
    busForm.addEventListener("submit", handleFormSubmit);
  }

  busFormInitialized = true;
}

async function editBus(busId) {
  try {
    const response = await ApiClient.get(`/buses/${busId}`);
    const bus = response?.bus;

    if (!bus) {
      showBusCompaniesMessage("Bus not found", "error");
      return;
    }

    editingBusId = busId;
    document.getElementById("busModalTitle").textContent = "Edit Bus";
    document.getElementById("modalBusCompanyId").value = bus.bus_company_id;
    document.getElementById("modalBusPlateNumber").value =
      bus.plate_number || "";
    document.getElementById("modalBusType").value = bus.bus_type || "";
    document.getElementById("modalBusTotalSeats").value = bus.total_seats || "";
    document.getElementById("modalBusStatus").value = bus.status || "active";

    showModal("busModal");
  } catch (error) {
    console.error("Failed to load bus:", error);
    showBusCompaniesMessage("Failed to load bus details", "error");
  }
}

async function deleteBus(busId) {
  document.getElementById("deleteModalTitle").textContent = "Delete Bus";
  document.getElementById("deleteModalMessage").textContent =
    "Are you sure you want to delete this bus? This action cannot be undone.";

  const confirmBtn = document.getElementById("confirmDeleteModal");
  const cancelBtn = document.getElementById("cancelDeleteModal");
  const closeBtn = document.getElementById("closeDeleteModal");

  // Remove existing listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener("click", async () => {
    try {
      await ApiClient.delete(`/buses/${busId}`, true);
      showBusCompaniesMessage("Bus deleted successfully", "success");
      hideModal("deleteModal");
      await loadCompanyBuses(currentCompanyId);
      await loadBusCompanies();
    } catch (error) {
      console.error("Failed to delete bus:", error);
      showBusCompaniesMessage(error.message || "Failed to delete bus", "error");
      hideModal("deleteModal");
    }
  });

  cancelBtn.onclick = () => hideModal("deleteModal");
  closeBtn.onclick = () => hideModal("deleteModal");

  showModal("deleteModal");
}

async function deleteBusCompany(companyId) {
  document.getElementById("deleteModalTitle").textContent =
    "Delete Bus Company";
  document.getElementById("deleteModalMessage").textContent =
    "Are you sure you want to delete this bus company? This will also delete all buses belonging to this company. This action cannot be undone.";

  const confirmBtn = document.getElementById("confirmDeleteModal");
  const cancelBtn = document.getElementById("cancelDeleteModal");
  const closeBtn = document.getElementById("closeDeleteModal");

  // Remove existing listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener("click", async () => {
    try {
      await ApiClient.delete(`/buses/companies/${companyId}`, true);
      showBusCompaniesMessage("Company deleted successfully", "success");
      hideModal("deleteModal");
      await loadBusCompanies();
    } catch (error) {
      console.error("Failed to delete company:", error);
      showBusCompaniesMessage(
        error.message || "Failed to delete company",
        "error"
      );
      hideModal("deleteModal");
    }
  });

  cancelBtn.onclick = () => hideModal("deleteModal");
  closeBtn.onclick = () => hideModal("deleteModal");

  showModal("deleteModal");
}

function showBusCompaniesMessage(message, variant = "info") {
  const msgEl = document.getElementById("busCompaniesMessage");
  if (msgEl) {
    msgEl.textContent = message;
    msgEl.classList.add("show");
    msgEl.classList.toggle("error", variant === "error");
    msgEl.classList.toggle("success", variant === "success");
    setTimeout(() => {
      msgEl.classList.remove("show", "error", "success");
    }, 3000);
  }
}

// Initialize bus company profile modal close buttons
function initBusCompanyProfileModal() {
  const closeBtn = document.getElementById("closeBusCompanyProfileBtn");
  const closeXBtn = document.getElementById("closeBusCompanyProfileModal");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hideModal("busCompanyProfileModal");
      currentCompanyId = null;
    });
  }

  if (closeXBtn) {
    closeXBtn.addEventListener("click", () => {
      hideModal("busCompanyProfileModal");
      currentCompanyId = null;
    });
  }
}

function initLogoutModal() {
  const logoutButtons = document.querySelectorAll(
    "#logoutBtn, #logoutBtnBookings, #logoutBtnRoutes, #logoutBtnSchedules, #logoutBtnStats, #logoutBtnOffers, #logoutBtnBusCompanies"
  );
  const confirmBtn = document.getElementById("confirmLogoutModal");
  const cancelBtn = document.getElementById("cancelLogoutModal");
  const closeBtn = document.getElementById("closeLogoutModal");

  logoutButtons.forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        showModal("logoutModal");
      });
    }
  });

  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      try {
        await ApiClient.post("/auth/logout", {}, true);
      } catch (error) {
        console.warn("Logout failed", error);
      } finally {
        ApiClient.clearSession();
        hideModal("logoutModal");
        window.location.href = "../../index.html";
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      hideModal("logoutModal");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hideModal("logoutModal");
    });
  }
}

async function logoutAdmin() {
  // This function is kept for backward compatibility but now uses modal
  showModal("logoutModal");
}

document.addEventListener("DOMContentLoaded", async () => {
  // Longer delay to ensure localStorage is available after redirect
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Debug: Check authentication state - check both ApiClient and localStorage directly
  const token = ApiClient.getToken();
  const user = ApiClient.getUser();
  const directToken = localStorage.getItem("expressgo_auth_token");
  const directUser = localStorage.getItem("expressgo_auth_user");
  const allKeys = Object.keys(localStorage);

  console.log("Admin dashboard loaded - Auth check:", {
    hasToken: !!token,
    hasUser: !!user,
    userRole: user?.role,
    currentPath: window.location.pathname,
    directToken: !!directToken,
    directUser: !!directUser,
    tokensMatch: token === directToken,
    localStorageKeys: allKeys.filter(
      (k) => k.includes("expressgo") || k.includes("auth")
    ),
  });

  if (!ApiClient.isAuthenticated()) {
    console.warn("Not authenticated, redirecting to login");
    console.warn("Token check:", token);
    console.warn("User check:", user);
    // Calculate correct login path based on current location
    const currentPath = window.location.pathname;
    let loginPath;
    if (currentPath.includes("/adminDashboard/")) {
      // From adminDashboard, go up one level to src, then to user-log-in.html
      loginPath = "../user-log-in.html";
    } else {
      // Fallback
      loginPath = "./src/user-log-in.html";
    }
    console.warn("Redirecting to login:", loginPath);
    window.location.href = loginPath;
    return;
  }

  if (!user || user.role !== "admin") {
    console.warn("User is not an admin:", user?.role);
    alert("Admin access required.");
    const currentPath = window.location.pathname;
    const loginPath = currentPath.includes("/adminDashboard/")
      ? "../user-log-in.html"
      : "./src/user-log-in.html";
    window.location.href = loginPath;
    return;
  }

  hydrateProfileInfo(user);
  initNavigation();
  initFAQ();
  initThemeToggle();
  initLogoutModal();

  initProfileDropdown("profileMenuBtn", "profileDropdown", "logoutBtn", () =>
    showModal("logoutModal")
  );
  initProfileDropdown(
    "profileMenuBtnBookings",
    "profileDropdownBookings",
    "logoutBtnBookings",
    () => showModal("logoutModal")
  );
  initProfileDropdown(
    "profileMenuBtnRoutes",
    "profileDropdownRoutes",
    "logoutBtnRoutes",
    () => showModal("logoutModal")
  );
  initProfileDropdown(
    "profileMenuBtnSchedules",
    "profileDropdownSchedules",
    "logoutBtnSchedules",
    () => showModal("logoutModal")
  );
  initProfileDropdown(
    "profileMenuBtnStats",
    "profileDropdownStats",
    "logoutBtnStats",
    () => showModal("logoutModal")
  );
  initProfileDropdown(
    "profileMenuBtnOffers",
    "profileDropdownOffers",
    "logoutBtnOffers",
    () => showModal("logoutModal")
  );
  initProfileDropdown(
    "profileMenuBtnBusCompanies",
    "profileDropdownBusCompanies",
    "logoutBtnBusCompanies",
    () => showModal("logoutModal")
  );

  // Section-specific initialization
  const overviewNavLink = document.querySelector('[data-section="overview"]');
  if (overviewNavLink) {
    overviewNavLink.addEventListener("click", () => {
      setTimeout(() => renderChart(latestChartData), 100);
    });
  }

  const statisticsNavLink = document.querySelector(
    '[data-section="statistics"]'
  );
  if (statisticsNavLink) {
    statisticsNavLink.addEventListener("click", () => {
      setTimeout(() => loadStatistics(), 100);
    });
  }

  const routesNavLink = document.querySelector('[data-section="routes"]');
  if (routesNavLink) {
    routesNavLink.addEventListener("click", () => {
      setTimeout(() => {
        loadRoutes();
        initRoutesForm();
      }, 100);
    });
  }

  const schedulesNavLink = document.querySelector('[data-section="schedules"]');
  if (schedulesNavLink) {
    schedulesNavLink.addEventListener("click", () => {
      setTimeout(() => {
        loadSchedules();
        initSchedulesForm();
      }, 100);
    });
  }

  const busCompaniesNavLink = document.querySelector(
    '[data-section="bus-companies"]'
  );
  if (busCompaniesNavLink) {
    busCompaniesNavLink.addEventListener("click", () => {
      setTimeout(() => {
        loadBusCompanies();
        initBusCompaniesForm();
        initBusForm();
        initBusCompanyProfileModal();
      }, 100);
    });
  }

  const offersNavLink = document.querySelector('[data-section="offers"]');
  if (offersNavLink) {
    offersNavLink.addEventListener("click", () => {
      setTimeout(() => {
        loadOffers();
        initOffersForm();
      }, 100);
    });
  }

  const settingsNavLink = document.querySelector('[data-section="settings"]');
  if (settingsNavLink) {
    settingsNavLink.addEventListener("click", () => {
      setTimeout(() => initSettings(), 100);
    });
  }

  const helpNavLink = document.querySelector('[data-section="help"]');
  if (helpNavLink) {
    helpNavLink.addEventListener("click", () => {
      setTimeout(() => initHelpForm(), 100);
    });
  }

  adminBookingsTableBody?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-booking-id]");
    if (!button) return;
    const bookingId = button.getAttribute("data-booking-id");
    const status = button.getAttribute("data-status");
    if (bookingId && status) {
      updateBookingStatus(bookingId, status);
    }
  });

  // Initialize active section
  const activeSection = document.querySelector(".content-section.active");
  if (activeSection) {
    if (activeSection.id === "overview-section") {
      await loadOverview();
    } else if (activeSection.id === "bookings-section") {
      await loadBookingsTable();
    } else if (activeSection.id === "routes-section") {
      await loadRoutes();
      initRoutesForm();
    } else if (activeSection.id === "schedules-section") {
      await loadSchedules();
      initSchedulesForm();
    } else if (activeSection.id === "bus-companies-section") {
      await loadBusCompanies();
      initBusCompaniesForm();
      initBusForm();
      initBusCompanyProfileModal();
    } else if (activeSection.id === "statistics-section") {
      await loadStatistics();
    } else if (activeSection.id === "offers-section") {
      await loadOffers();
      initOffersForm();
    } else if (activeSection.id === "settings-section") {
      initSettings();
    } else if (activeSection.id === "help-section") {
      initHelpForm();
    }
  } else {
    await Promise.all([loadOverview(), loadBookingsTable()]);
  }
});
