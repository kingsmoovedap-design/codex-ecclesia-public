(function() {
  'use strict';
  
  window._CODEX_PROTECTED = {
    version: '2.0.0',
    status: 'ACTIVE',
    jurisdiction: 'SOVEREIGN_TERRITORY'
  };
  
  document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('copy', function(e) {
      const selection = window.getSelection().toString();
      if (selection.length > 500) {
        e.clipboardData.setData('text/plain', 
          'Source: Codex Ecclesia - Borders Ecclesia Earth Trust\n' +
          'Protected under 508(c)(1)(A)\n\n' + 
          selection.substring(0, 500) + '...'
        );
        e.preventDefault();
      }
    });
    
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit')) {
      document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.protected-content')) {
          e.preventDefault();
        }
      });
    }
    
    var marker = document.createElement('div');
    marker.style.display = 'none';
    marker.setAttribute('data-protection', 'codex-ecclesia-sovereign');
    document.body.appendChild(marker);
  });
  
  window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('ChunkLoadError')) {
      window.location.reload();
    }
  });
  
  window.CodexShield = {
    verify: function() {
      return {
        protected: true,
        timestamp: new Date().toISOString(),
        hash: btoa(window.location.href + Date.now())
      };
    },
    status: function() {
      return window._CODEX_PROTECTED;
    }
  };
})();
