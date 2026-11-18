/* Standalone shim.
   Inside Claude the page can call window.claude (downloads + AI). On your own hosting that object does not exist.
   - "downloads": falls back to a normal browser file download (poster PNG/SVG, name list).
   - "sample" (AI name ideas): returns null, so the tool shows its built-in quick ideas instead.
   If window.claude already exists, nothing here runs. */
(function () {
  if (window.claude) return;
  const MIME = { png: 'image/png', svg: 'image/svg+xml', txt: 'text/plain', pdf: 'application/pdf', csv: 'text/csv', json: 'application/json', html: 'text/html' };
  async function save(opts) {
    const name = opts.filename || 'download', ext = (name.split('.').pop() || '').toLowerCase();
    const blob = opts.data instanceof Blob ? opts.data : new Blob([opts.data], { type: (MIME[ext] || 'application/octet-stream') + ';charset=utf-8' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return { ok: true };
  }
  window.claude = { use: async name => (name === 'downloads' ? { save } : null) };
})();
