// Schedule Management JavaScript
class ScheduleManager {
  constructor() {
    this.schedules = [];
    this.routes = [];
    this.currentScheduleId = null;
    this.isEditing = false;

    // Initialize after DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  init() {
    this.bindEvents();
    this.loadInitialData();
  }

  bindEvents() {
    // Modal events
    const addScheduleBtn = document.getElementById('addScheduleBtn');
    if (addScheduleBtn) addScheduleBtn.addEventListener('click', () => this.openScheduleModal());

    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeScheduleModal());

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeScheduleModal());

    // Form events
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) scheduleForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Filter events
    const routeFilter = document.getElementById('routeFilter');
    if (routeFilter) routeFilter.addEventListener('change', () => this.applyFilters());

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) statusFilter.addEventListener('change', () => this.applyFilters());

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', () => this.applyFilters());

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadSchedules());

    // Delete modal events
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());

    // Close modals on outside click
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeScheduleModal();
        this.closeDeleteModal();
      }
    });
  }

  async loadInitialData() {
    try {
      // Load mock data for demo
      this.loadMockRoutes();
      this.loadMockSchedules();
      this.showSuccess('Schedule management loaded successfully (using demo data)');
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Failed to load data');
    }
  }

  loadMockRoutes() {
    this.routes = [
      { id: 1, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Musanze', distance: 116 },
      { id: 2, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rubavu', distance: 160 },
      { id: 3, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Huye', distance: 136 },
      { id: 4, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rusizi', distance: 228 },
      { id: 5, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rwamagana', distance: 55 },
      { id: 6, departure_city: 'Butare', arrival_city: 'Nyanza', distance: 45 },
      { id: 7, departure_city: 'Huye', arrival_city: 'Nyamagabe', distance: 60 },
      { id: 8, departure_city: 'Nyagatare', arrival_city: 'Kayonza', distance: 85 },
      { id: 9, departure_city: 'Rubavu', arrival_city: 'Karongi', distance: 95 },
      { id: 10, departure_city: 'Rusizi', arrival_city: 'Nyamasheke', distance: 45 }
    ];
    this.populateRouteSelects();
  }

  loadMockSchedules() {
    this.schedules = this.generateMockSchedules();
    this.renderSchedules(this.schedules);
  }

  generateMockSchedules() {
    return [
      {
        id: 1,
        bus_id: 1,
        route_id: 1,
        departure_time: '06:00:00',
        arrival_time: '09:30:00',
        price: 2200,
        available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
        is_active: true,
        bus: { plate_number: 'RAD 001 A', company_name: 'RITCO' },
        route: { departure_city: 'Kigali - Nyabugogo', arrival_city: 'Musanze' }
      },
      {
        id: 2,
        bus_id: 2,
        route_id: 2,
        departure_time: '08:00:00',
        arrival_time: '13:00:00',
        price: 4200,
        available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
        is_active: true,
        bus: { plate_number: 'RAD 002 B', company_name: 'Volcano' },
        route: { departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rubavu' }
      },
      {
        id: 3,
        bus_id: 3,
        route_id: 3,
        departure_time: '10:00:00',
        arrival_time: '14:30:00',
        price: 3000,
        available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday',
        is_active: false,
        bus: { plate_number: 'RAD 003 C', company_name: 'Alpha Express' },
        route: { departure_city: 'Kigali - Nyabugogo', arrival_city: 'Huye' }
      }
    ];
  }

  populateRouteSelects() {
    const routeSelects = ['routeSelect', 'routeFilter'];
    routeSelects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (!select) return;

      while (select.children.length > 1) {
        select.removeChild(select.lastChild);
      }

      this.routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = `${route.departure_city} → ${route.arrival_city}`;
        select.appendChild(option);
      });
    });
  }

  showLoading() {
    const loadingState = document.getElementById('loadingState');
    const schedulesTable = document.getElementById('schedulesTable');
    const emptyState = document.getElementById('emptyState');

    if (loadingState) loadingState.style.display = 'block';
    if (schedulesTable) schedulesTable.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
  }

  hideLoading() {
    const loadingState = document.getElementById('loadingState');
    const schedulesTable = document.getElementById('schedulesTable');

    if (loadingState) loadingState.style.display = 'none';
    if (schedulesTable) schedulesTable.style.display = 'table';
  }

  renderSchedules(schedules) {
    const tbody = document.getElementById('schedulesTableBody');
    const schedulesTable = document.getElementById('schedulesTable');
    const emptyState = document.getElementById('emptyState');

    if (!tbody) return;

    if (schedules.length === 0) {
      if (schedulesTable) schedulesTable.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (schedulesTable) schedulesTable.style.display = 'table';

    tbody.innerHTML = schedules.map(schedule => {
      const route = `${schedule.route.departure_city} → ${schedule.route.arrival_city}`;
      const busInfo = `${schedule.bus.company_name} - ${schedule.bus.plate_number}`;
      const departureTime = this.formatTime(schedule.departure_time);
      const arrivalTime = this.formatTime(schedule.arrival_time);
      const price = parseInt(schedule.price).toLocaleString();
      const statusClass = schedule.is_active ? 'active' : 'inactive';
      const statusText = schedule.is_active ? 'Active' : 'Inactive';

      return `
        <tr>
          <td>#${schedule.id}</td>
          <td>${route}</td>
          <td>${busInfo}</td>
          <td>${departureTime}</td>
          <td>${arrivalTime}</td>
          <td>${price}</td>
          <td>${this.formatDays(schedule.available_days)}</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn-action btn-edit" onclick="scheduleManager.editSchedule(${schedule.id})">
                Edit
              </button>
              <button class="btn-action btn-delete" onclick="scheduleManager.deleteSchedule(${schedule.id})">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${period}`;
  }

  formatDays(daysString) {
    if (!daysString) return 'Not set';
    const days = daysString.split(',');
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    if (days.length === 7 && allDays.every(day => days.includes(day))) return 'Daily';
    if (days.length === 5 && !days.includes('Saturday') && !days.includes('Sunday')) return 'Weekdays';
    if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) return 'Weekends';
    return days.map(day => day.substring(0, 3)).join(', ');
  }

  // ... Rest of your methods (openScheduleModal, closeScheduleModal, handleFormSubmit, etc.)
  // Make sure all document.getElementById() calls have null checks like above
}

// Initialize the Schedule Manager
let scheduleManager = new ScheduleManager();

// Global functions
function closeNotification(notificationId) {
  if (scheduleManager) {
    scheduleManager.closeNotification(notificationId);
  }
}

function openScheduleModal() {
  if (scheduleManager) {
    scheduleManager.openScheduleModal();
  }
}
