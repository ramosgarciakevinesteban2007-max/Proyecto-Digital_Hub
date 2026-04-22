const Pagination = ({ page, total, perPage, onChange }) => {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  // Genera el rango de páginas con ellipsis
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (page > 4) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 3) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="pagination">
      <button className="pag-btn pag-nav" onClick={() => onChange(1)} disabled={page === 1} title="Primera">
        «
      </button>
      <button className="pag-btn pag-nav" onClick={() => onChange(page - 1)} disabled={page === 1} title="Anterior">
        ‹
      </button>

      {getPages().map((p, i) =>
        p === '...'
          ? <span key={`ellipsis-${i}`} className="pag-ellipsis">…</span>
          : <button
              key={p}
              className={`pag-btn ${p === page ? 'pag-active' : ''}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
      )}

      <button className="pag-btn pag-nav" onClick={() => onChange(page + 1)} disabled={page === totalPages} title="Siguiente">
        ›
      </button>
      <button className="pag-btn pag-nav" onClick={() => onChange(totalPages)} disabled={page === totalPages} title="Última">
        »
      </button>

      <span className="pag-info">
        {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} de {total}
      </span>
    </div>
  );
};

export default Pagination;
