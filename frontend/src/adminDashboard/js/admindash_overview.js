document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('performanceChart');

  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['June', 'July', 'August', 'September', 'October', 'November'],
        datasets: [
          {
            label: 'Bookings',
            data: [120, 190, 150, 250, 220, 300],
            borderColor: '#0055ff',
            backgroundColor: 'rgba(0, 85, 255, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
          },
          {
            label: 'Revenue (in RWF)',
            data: [300000, 450000, 400000, 600000, 550000, 720000],
            borderColor: '#ff8c00',
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Number of Bookings' },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Revenue (RWF)' },
            grid: {
              drawOnChartArea: false, // only draw grid for first Y axis
            },
          },
        },
      },
    });
  }
});