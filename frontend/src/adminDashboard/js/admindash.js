document.addEventListener('DOMContentLoaded', async () => {
  // In a real application, you would leave this check active.
  // For development, you can comment it out to work on the page without logging in.
  /*
  if (!requireAuth()) { // First, check if the user is logged in at all.
    return;
  }
  */

  // Next, check if the logged-in user is an admin.
  const user = getUser();
  if (!user || user.role !== 'admin') {
    // If not an admin, redirect them away.
    // You can show an "Access Denied" message or redirect to the homepage.
    console.error('Access Denied: User is not an admin.');
    // window.location.href = 'index.html'; 
    // return; // Uncomment the two lines above to enforce admin-only access.
  }

  const profileMenuBtn = document.getElementById('profileMenuBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  if (profileMenuBtn) {
    profileMenuBtn.addEventListener('click', () => {
      profileDropdown.classList.toggle('hidden');
    });
  }

  // Close dropdown if clicking outside
  window.addEventListener('click', (event) => {
    if (!profileMenuBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
      profileDropdown.classList.add('hidden');
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Hide dropdown before logging out
      profileDropdown.classList.add('hidden');
      await logout();
    });
  }

  // You can add functions here to fetch admin data and populate the dashboard
  // Example: Populate admin info in the dropdown
  if (user) {
    const profileInfo = document.querySelector('.profile-info');
    if (profileInfo) {
      profileInfo.innerHTML = `
        <p><strong>${user.company_name || 'ExpressGo'}</strong></p>
        <p class="email">${user.email}</p>
      `;
    }
  }
});