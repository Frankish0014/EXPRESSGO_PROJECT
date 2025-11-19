// Schedule Management JavaScript
class ScheduleManager {
  constructor() {
    this.schedules = [];
    this.routes = [];
    this.currentScheduleId = null;
    this.isEditing = false;

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadInitialData();
  }

  bindEvents() {
    // Modal events
    document.getElementById('addScheduleBtn').addEventListener('click', () => this.openScheduleModal());
    document.getElementById('closeModalBtn').addEventListener('click', () => this.closeScheduleModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeScheduleModal());

    // Form events
    document.getElementById('scheduleForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Filter events
    document.getElementById('routeFilter').addEventListener('change', () => this.applyFilters());
    document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
    document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());
    document.getElementById('refreshBtn').addEventListener('click', () => this.loadSchedules());

    // Delete modal events
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal());
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());

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
      await Promise.all([
        this.loadRoutes(),
        this.loadSchedules()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showError('Failed to load initial data');
    }
  }

  async loadRoutes() {
    try {
      // Get routes from API - replace with your backend endpoint
      const response = await fetch('/api/routes');
      if (response.ok) {
        this.routes = await response.json();
      } else {
        // Fallback to mock data if API fails
        this.routes = [
          { id: 1, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Musanze' },
          { id: 2, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rubavu' },
          { id: 3, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Huye' },
          { id: 4, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rusizi' },
          { id: 5, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rwamagana' },
          { id: 6, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Nyagatare' },
          { id: 7, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Karongi' },
          { id: 8, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Muhanga' }
        ];
      }

      this.populateRouteSelects();
    } catch (error) {
      console.error('Error loading routes:', error);
      // Use fallback data
      this.routes = [
        { id: 1, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Musanze' },
        { id: 2, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rubavu' },
        { id: 3, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Huye' },
        { id: 4, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rusizi' },
        { id: 5, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rwamagana' },
        { id: 6, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Nyagatare' },
        { id: 7, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Karongi' },
        { id: 8, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Muhanga' }
      ];
      this.populateRouteSelects();
    }
  }

  populateRouteSelects() {
    const routeSelects = ['routeSelect', 'routeFilter'];
    
    routeSelects.forEach(selectId => {
      const select = document.getElementById(selectId);
      
      // Clear existing options except the first one
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

  async loadSchedules() {
    try {
      this.showLoading();

      // Get schedules from API - replace with your backend endpoint
      const response = await fetch('/api/schedules');
      
      if (response.ok) {
        this.schedules = await response.json();
      } else {
        // Fallback to mock data if API fails
        this.schedules = [
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
          },
          {
            id: 4,
            bus_id: 4,
            route_id: 4,
            departure_time: '06:30:00',
            arrival_time: '12:00:00',
            price: 7500,
            available_days: 'Monday,Wednesday,Friday,Sunday',
            is_active: true,
            bus: { plate_number: 'RAD 004 D', company_name: 'City Express' },
            route: { departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rusizi' }
          },
          {
            id: 5,
            bus_id: 5,
            route_id: 5,
            departure_time: '14:00:00',
            arrival_time: '16:30:00',
            price: 2000,
            available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            is_active: true,
            bus: { plate_number: 'RAD 005 E', company_name: 'Matunda Express' },
            route: { departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rwamagana' }
          }
        ];
      }

      this.hideLoading();
      this.renderSchedules(this.schedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
      this.hideLoading();
      // Use fallback data
      this.schedules = [
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
      this.renderSchedules(this.schedules);
    }
  }

  showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('schedulesTable').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
  }

  hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('schedulesTable').style.display = 'table';
  }

  renderSchedules(schedules) {
    const tbody = document.getElementById('schedulesTableBody');
    
    if (schedules.length === 0) {
      document.getElementById('schedulesTable').style.display = 'none';
      document.getElementById('emptyState').style.display = 'block';
      return;
    }

    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('schedulesTable').style.display = 'table';

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
    
    if (days.length === 7 && allDays.every(day => days.includes(day))) {
      return 'Daily';
    } else if (days.length === 5 && !days.includes('Saturday') && !days.includes('Sunday')) {
      return 'Weekdays';
    } else if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) {
      return 'Weekends';
    } else {
      return days.map(day => day.substring(0, 3)).join(', ');
    }
  }

  openScheduleModal(schedule = null) {
    this.isEditing = !!schedule;
    this.currentScheduleId = schedule ? schedule.id : null;

    const modal = document.getElementById('scheduleModal');
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveBtn');

    modalTitle.textContent = this.isEditing ? 'Edit Schedule' : 'Add New Schedule';
    saveBtn.querySelector('.btn-text').textContent = this.isEditing ? 'Update Schedule' : 'Save Schedule';

    if (schedule) {
      this.populateForm(schedule);
    } else {
      this.resetForm();
    }

    modal.classList.add('show');
  }

  populateForm(schedule) {
    document.getElementById('busSelect').value = schedule.bus_id;
    document.getElementById('routeSelect').value = schedule.route_id;
    document.getElementById('departureTime').value = schedule.departure_time.substring(0, 5);
    document.getElementById('arrivalTime').value = schedule.arrival_time.substring(0, 5);
    document.getElementById('priceInput').value = schedule.price;
    document.getElementById('statusSelect').value = schedule.is_active.toString();

    // Set available days
    const availableDays = schedule.available_days.split(',');
    const dayCheckboxes = document.querySelectorAll('input[name="days"]');
    
    dayCheckboxes.forEach(checkbox => {
      checkbox.checked = availableDays.includes(checkbox.value);
    });
  }

  resetForm() {
    document.getElementById('scheduleForm').reset();
    
    // Check all days by default
    const dayCheckboxes = document.querySelectorAll('input[name="days"]');
    dayCheckboxes.forEach(checkbox => {
      checkbox.checked = true;
    });
  }

  closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('show');
    this.resetForm();
    this.currentScheduleId = null;
    this.isEditing = false;
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const selectedDays = Array.from(document.querySelectorAll('input[name="days"]:checked'))
      .map(cb => cb.value);

    if (selectedDays.length === 0) {
      this.showError('Please select at least one available day');
      return;
    }

    const scheduleData = {
      bus_id: parseInt(formData.get('bus_id')),
      route_id: parseInt(formData.get('route_id')),
      departure_time: formData.get('departure_time') + ':00',
      arrival_time: formData.get('arrival_time') + ':00',
      price: parseFloat(formData.get('price')),
      available_days: selectedDays.join(','),
      is_active: formData.get('is_active') === 'true'
    };

    // Validate times
    if (scheduleData.departure_time >= scheduleData.arrival_time) {
      this.showError('Arrival time must be after departure time');
      return;
    }

    try {
      this.showButtonLoading(true);

      if (this.isEditing) {
        await this.updateSchedule(this.currentScheduleId, scheduleData);
      } else {
        await this.createSchedule(scheduleData);
      }

      this.closeScheduleModal();
      await this.loadSchedules();
      this.showSuccess(this.isEditing ? 'Schedule updated successfully' : 'Schedule created successfully');
    } catch (error) {
      console.error('Error saving schedule:', error);
      this.showError('Failed to save schedule');
    } finally {
      this.showButtonLoading(false);
    }
  }

  async createSchedule(scheduleData) {
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token if needed
        },
        body: JSON.stringify(scheduleData)
      });

      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Simulate API call for demo
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Creating schedule:', scheduleData);
          resolve({ id: Date.now(), ...scheduleData });
        }, 1000);
      });
    }
  }

  async updateSchedule(id, scheduleData) {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token if needed
        },
        body: JSON.stringify(scheduleData)
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Simulate API call for demo
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Updating schedule:', id, scheduleData);
          resolve({ id, ...scheduleData });
        }, 1000);
      });
    }
  }

  editSchedule(id) {
    const schedule = this.schedules.find(s => s.id === id);
    if (schedule) {
      this.openScheduleModal(schedule);
    }
  }

  deleteSchedule(id) {
    this.currentScheduleId = id;
    document.getElementById('deleteModal').classList.add('show');
  }

  closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    this.currentScheduleId = null;
  }

  async confirmDelete() {
    try {
      await this.performDelete(this.currentScheduleId);
      this.closeDeleteModal();
      await this.loadSchedules();
      this.showSuccess('Schedule deleted successfully');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      this.showError('Failed to delete schedule');
    }
  }

  async performDelete(id) {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token if needed
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Simulate API call for demo
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Deleting schedule:', id);
          resolve();
        }, 500);
      });
    }
  }

  applyFilters() {
    const routeFilter = document.getElementById('routeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    let filteredSchedules = [...this.schedules];

    if (routeFilter) {
      filteredSchedules = filteredSchedules.filter(s => s.route_id.toString() === routeFilter);
    }

    if (statusFilter) {
      const isActive = statusFilter === 'active';
      filteredSchedules = filteredSchedules.filter(s => s.is_active === isActive);
    }

    if (searchTerm) {
      filteredSchedules = filteredSchedules.filter(s => {
        const route = `${s.route.departure_city} ${s.route.arrival_city}`;
        const busInfo = `${s.bus.company_name} ${s.bus.plate_number}`;
        return route.toLowerCase().includes(searchTerm) || 
               busInfo.toLowerCase().includes(searchTerm);
      });
    }

    this.renderSchedules(filteredSchedules);
  }

  showButtonLoading(loading) {
    const saveBtn = document.getElementById('saveBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const spinner = saveBtn.querySelector('.spinner');

    if (loading) {
      saveBtn.disabled = true;
      btnText.style.display = 'none';
      spinner.style.display = 'inline-block';
    } else {
      saveBtn.disabled = false;
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
    }
  }

  showSuccess(message) {
    // Simple alert - replace with a more sophisticated notification system
    alert('✅ ' + message);
  }

  showError(message) {
    // Simple alert - replace with a more sophisticated notification system
    alert('❌ ' + message);
  }
}

// Initialize the Schedule Manager when the page loads
let scheduleManager;

document.addEventListener('DOMContentLoaded', () => {
  scheduleManager = new ScheduleManager();
});

// Global function to open modal (for the empty state button)
function openScheduleModal() {
  if (scheduleManager) {
    scheduleManager.openScheduleModal();
  }
}