import { formatCurrency, CATEGORIES } from '../utils/constants';

export default function TransactionTable({ transactions, loading, openEdit, handleDelete }) {
  const getCategoryDetails = (id) => {
    const cat = CATEGORIES.find(c => c.id === id);
    return cat || { name: 'Sin categoría', icon: 'bi-question', color: '#94a3b8' };
  };

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="table ff-table mb-0">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th className="text-end">Monto</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <div className="spinner-border text-primary" role="status" />
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <i className="bi bi-inbox" />
                    No hay transacciones con estos filtros
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map(tx => {
                const catDetails = getCategoryDetails(tx.category_id);
                return (
                  <tr key={tx.id} className="fade-in-up">
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(tx.date + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    </td>
                    <td>
                      <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{tx.description}</div>
                      {tx.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.notes}</div>}
                    </td>
                    <td>
                      <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.85rem' }}>
                        <span className="cat-dot" style={{ background: catDetails.color }} />
                        {catDetails.name}
                      </span>
                    </td>
                    <td>
                      <span className={`tx-badge tx-badge-${tx.type}`}>
                        <i className={`bi ${tx.type === 'income' ? 'bi-arrow-up' : 'bi-arrow-down'}`} />
                        {tx.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className={`text-end fw-bold amount-${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        <button className="btn-ff-edit" onClick={() => openEdit(tx)} title="Editar">
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn-ff-danger" onClick={() => handleDelete(tx.id)} title="Eliminar">
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
