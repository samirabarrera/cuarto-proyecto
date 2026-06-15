import { useState, useEffect } from 'react'
import {
  getTransactions, getCategories,
  createTransaction, updateTransaction, deleteTransaction,
} from '../api/financeApi'
import '../styles/transactions.css'

const fmt = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const currentMonth = () => new Date().toISOString().slice(0, 7)

const EMPTY_FORM = {
  description: '', amount: '', type: 'expense',
  category_id: '', date: new Date().toISOString().slice(0, 10), notes: '',
}

export default function Transactions({ socketEvents, onToast }) {
  const [transactions, setTransactions] = useState([])
  const [categories,   setCategories]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [submitting,   setSubmitting]   = useState(false)

  // Filtros
  const [filterMonth,    setFilterMonth]    = useState(currentMonth())
  const [filterType,     setFilterType]     = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  // Modal
  const [showModal,  setShowModal]  = useState(false)
  const [editingTx,  setEditingTx]  = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})

  /* ── Cargar categorías (solo una vez) ──────────── */
  useEffect(() => {
    getCategories()
      .then(r => setCategories(r.data.data))
      .catch(err => console.error(err))
  }, [])

  /* ── Cargar transacciones (con filtros) ─────────── */
  useEffect(() => {
    fetchTransactions()
  }, [filterMonth, filterType, filterCategory])

  /* ── Re-cargar cuando llega evento socket ────────── */
  useEffect(() => {
    if (!socketEvents) return
    fetchTransactions()
  }, [socketEvents])

  async function fetchTransactions() {
    setLoading(true)
    try {
      const params = {}
      if (filterMonth)    params.month       = filterMonth
      if (filterType)     params.type        = filterType
      if (filterCategory) params.category_id = filterCategory
      const res = await getTransactions(params)
      setTransactions(res.data.data)
    } catch (err) {
      console.error('Error cargando transacciones:', err)
    } finally {
      setLoading(false)
    }
  }

  /* ── Modal helpers ───────────────────────────────── */
  function openCreate() {
    setEditingTx(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowModal(true)
  }

  function openEdit(tx) {
    setEditingTx(tx)
    setForm({
      description: tx.description,
      amount:      tx.amount,
      type:        tx.type,
      category_id: tx.category_id,
      date:        tx.date,
      notes:       tx.notes || '',
    })
    setFormErrors({})
    setShowModal(true)
  }

  function closeModal() { setShowModal(false) }

  function validate() {
    const errs = {}
    if (!form.description.trim()) errs.description = 'Requerido'
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) errs.amount = 'Monto inválido'
    if (!form.category_id) errs.category_id = 'Selecciona categoría'
    if (!form.date) errs.date = 'Requerido'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      if (editingTx) {
        await updateTransaction(editingTx.id, form)
        onToast('✏️ Transacción actualizada', 'success')
      } else {
        await createTransaction(form)
        onToast('✅ Transacción creada', 'success')
      }
      closeModal()
      fetchTransactions()
    } catch (err) {
      onToast('❌ Error al guardar', 'danger')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta transacción?')) return
    try {
      await deleteTransaction(id)
      onToast('🗑️ Transacción eliminada', 'warning')
      fetchTransactions()
    } catch {
      onToast('❌ Error al eliminar', 'danger')
    }
  }

  const filteredCats = categories.filter(c =>
    !form.type || c.type === form.type || c.type === 'both'
  )

  return (
    <div className="ff-page">
      <div className="container-xl">

        {/* ── Header ──────────────────────────────── */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem' }}>
              Transacciones <span style={{ color: 'var(--primary-light)' }}>💳</span>
            </h1>
            <p className="text-secondary mb-0" style={{ fontSize: '0.88rem' }}>
              {transactions.length} movimiento{transactions.length !== 1 ? 's' : ''} encontrado{transactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn-ff-primary" onClick={openCreate} id="btn-nueva-transaccion">
            <i className="bi bi-plus-lg" /> Nueva transacción
          </button>
        </div>

        {/* ── Filtros ──────────────────────────────── */}
        <div className="filter-bar mb-3">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-sm-4 col-md-3">
              <label className="ff-label">Mes</label>
              <input
                type="month"
                className="ff-form-control"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                id="filter-month"
              />
            </div>
            <div className="col-12 col-sm-4 col-md-3">
              <label className="ff-label">Tipo</label>
              <select className="ff-select" value={filterType} onChange={e => setFilterType(e.target.value)} id="filter-type">
                <option value="">Todos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>
            <div className="col-12 col-sm-4 col-md-3">
              <label className="ff-label">Categoría</label>
              <select className="ff-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} id="filter-category">
                <option value="">Todas</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <button className="btn-ff-ghost w-100" onClick={fetchTransactions} id="btn-refresh">
                <i className="bi bi-arrow-clockwise me-1" /> Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabla ────────────────────────────────── */}
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
                  transactions.map(tx => (
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
                          <span className="cat-dot" style={{ background: tx.category_color }} />
                          {tx.category_name}
                        </span>
                      </td>
                      <td>
                        <span className={`tx-badge tx-badge-${tx.type}`}>
                          <i className={`bi ${tx.type === 'income' ? 'bi-arrow-up' : 'bi-arrow-down'}`} />
                          {tx.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td className={`text-end fw-bold amount-${tx.type}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Modal Crear/Editar ───────────────────── */}
        {showModal && (
          <div className="modal fade show d-block ff-modal" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className={`bi ${editingTx ? 'bi-pencil-square' : 'bi-plus-circle-fill'} me-2`} style={{ color: 'var(--primary-light)' }} />
                    {editingTx ? 'Editar transacción' : 'Nueva transacción'}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal} />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">

                      {/* Tipo */}
                      <div className="col-12">
                        <label className="ff-label">Tipo</label>
                        <div className="d-flex gap-2">
                          {['income', 'expense'].map(t => (
                            <button
                              key={t}
                              type="button"
                              className={`flex-fill py-2 px-3 rounded fw-semibold border-0 ${form.type === t
                                ? t === 'income' ? 'bg-success text-white' : 'bg-danger text-white'
                                : 'btn-ff-ghost'
                              }`}
                              style={{ fontSize: '0.88rem', cursor: 'pointer' }}
                              onClick={() => setForm(f => ({ ...f, type: t, category_id: '' }))}
                              id={`type-${t}`}
                            >
                              <i className={`bi ${t === 'income' ? 'bi-arrow-up-circle' : 'bi-arrow-down-circle'} me-1`} />
                              {t === 'income' ? 'Ingreso' : 'Gasto'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="col-12">
                        <label className="ff-label">Descripción *</label>
                        <input
                          type="text"
                          className={`ff-form-control ${formErrors.description ? 'border-danger' : ''}`}
                          placeholder="Ej: Súper del mes"
                          value={form.description}
                          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                          id="form-description"
                        />
                        {formErrors.description && <small className="text-danger">{formErrors.description}</small>}
                      </div>

                      {/* Monto y Fecha */}
                      <div className="col-6">
                        <label className="ff-label">Monto *</label>
                        <input
                          type="number"
                          className={`ff-form-control ${formErrors.amount ? 'border-danger' : ''}`}
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          value={form.amount}
                          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                          id="form-amount"
                        />
                        {formErrors.amount && <small className="text-danger">{formErrors.amount}</small>}
                      </div>
                      <div className="col-6">
                        <label className="ff-label">Fecha *</label>
                        <input
                          type="date"
                          className={`ff-form-control ${formErrors.date ? 'border-danger' : ''}`}
                          value={form.date}
                          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                          id="form-date"
                        />
                        {formErrors.date && <small className="text-danger">{formErrors.date}</small>}
                      </div>

                      {/* Categoría */}
                      <div className="col-12">
                        <label className="ff-label">Categoría *</label>
                        <select
                          className={`ff-select ${formErrors.category_id ? 'border-danger' : ''}`}
                          value={form.category_id}
                          onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                          id="form-category"
                        >
                          <option value="">Selecciona una categoría</option>
                          {filteredCats.map(c => (
                            <option key={c.id} value={c.id}>{c.icon.replace('bi-', '')} {c.name}</option>
                          ))}
                        </select>
                        {formErrors.category_id && <small className="text-danger">{formErrors.category_id}</small>}
                      </div>

                      {/* Notas */}
                      <div className="col-12">
                        <label className="ff-label">Notas <span style={{ opacity: 0.5 }}>(opcional)</span></label>
                        <textarea
                          className="ff-form-control"
                          rows="2"
                          placeholder="Comentario adicional..."
                          value={form.notes}
                          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                          id="form-notes"
                          style={{ resize: 'none' }}
                        />
                      </div>

                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-ff-ghost" onClick={closeModal}>Cancelar</button>
                    <button
                      type="submit"
                      className={editingTx ? 'btn-ff-primary' : 'btn-ff-success'}
                      disabled={submitting}
                      id="btn-submit-tx"
                    >
                      {submitting
                        ? <><span className="spinner-border spinner-border-sm me-1" />Guardando...</>
                        : <><i className={`bi ${editingTx ? 'bi-check-lg' : 'bi-plus-lg'}`} /> {editingTx ? 'Actualizar' : 'Crear'}</>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
