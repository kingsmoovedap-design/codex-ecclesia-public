fetch('manifest.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('scroll-list');
    const search = document.getElementById('search');

    function renderList(filter = '', tag = '') {
      container.innerHTML = '';
      data
        .filter(item =>
          item.title.toLowerCase().includes(filter.toLowerCase()) &&
          (tag === '' || item.tags.includes(tag))
        )
        .forEach(item => {
          const el = document.createElement('div');
          el.innerHTML = `<a href="${item.filename}">${item.title}</a> <small>[${item.category}]</small>`;
          container.appendChild(el);
        });
    }

    search.addEventListener('input', e => renderList(e.target.value));
    renderList();
  });
