fetch('scrollhashregistry.json')
  .then(response => response.json())
  .then(data => {
    const tableBody = document.querySelector('tbody');
    data.forEach(entry => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.title}</td>
        <td><a href="../${entry.file}" target="_blank">View</a></td>
        <td class="hash">${entry.hash}</td>
        <td class="status ${entry.status.toLowerCase()}">${entry.status}</td>
      `;

      tableBody.appendChild(row);
    });
  })
  .catch(error => {
    console.error('Error loading scroll registry:', error);
  });
