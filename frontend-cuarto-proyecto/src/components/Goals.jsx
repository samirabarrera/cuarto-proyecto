import { useState, useEffect } from 'react'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../api/financeApi'
import '../styles/goals.css'

const fmt = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

const COLORS = [
  '#6366f1','#22c55e','#ef4444','#f59e0b',
  '#06b6d4','#ec4899','#8b5cf6','#f97316',
]

const EMPTY_FORM = {
  name: '', target_amount: '', current_amount: '0',
  deadline: '', color: '#6366f1',
}

export default function Goals({ socketEvents, onToast }) {
  const [goals,      setGoals]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editingGoal,setEditingGoal]= useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  /* ── Cargar metas ─────────────────────────────────── */
  useEffect(() => {
    fetchGoals()
  }, [])

  /* ── Re-cargar con socket ─────────────────────────── */
  useEffect(() => {
    if (!socketEvents) return
    fetchGoals()
  }, [socketEvents])

  async function fetchGoals() {
    setLoading(true)
    try {
      const res = await getGoals()
      setGoals(res.data.data)
    } catch (err) {
      console.error('Error cargando metas:', err)
    } finally {
      setLoading(false)
    }
  }

  /* ── Modal helpers ────────────────────────────────── */
  function openCreate() {
    setEditingGoal(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowModal(true)
  }

  function openEdit(goal) {
    setEditingGoal(goal)
    setForm({
      name:           goal.name,
      target_amount:  goal.target_amount,
      current_amount: goal.current_amount,
      deadline:       goal.deadline || '',
      color:          goal.color,
    })
    setFormErrors({})
    setShowModal(true)
  }

  function validate() {
    const errs = {}
    if (!form.name.trim())                           errs.name          = 'Requerido'
    if (!form.target_amount || parseFloat(form.target_amount) <= 0) errs.target_amount = 'Monto inválido'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, form)
        onToast('✏️ Meta actualizada', 'success')
      } else {
        await createGoal(form)
        onToast('🎯 Meta creada', 'success')
      }
      setShowModal(false)
      fetchGoals()
    } catch {
      onToast('❌ Error al guardar', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta meta?')) return
    try {
      await deleteGoal(id)
      onToast('🗑️ Meta eliminada', 'warning')
      fetchGoals()
    } catch {
      onToast('❌ Error al eliminar', 'danger')
    }
  }

  return (
    <div className="ff-page">
      <div className="container-xl">

        {/* ── Header ──────────────────────────────── */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem' }}>
              Metas de ahorro <span style={{ color: 'var(--primary-light)' }}>🎯</span>
            </h1>
            <p className="text-secondary mb-0" style={{ fontSize: '0.88rem' }}>
              {goals.length} meta{goals.length !== 1 ? 's' : ''} activa{goals.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn-ff-primary" onClick={openCreate} id="btn-nueva-meta">
            <i className="bi bi-plus-lg" /> Nueva meta
          </button>
        </div>

        {/* ── Cards de metas ──────────────────────── */}
        {loading ? (
          <div className="ff-spinner"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="row g-3">
            {goals.map(goal => {
              const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
              return (
                <div className="col-12 col-sm-6 col-xl-4" key={goal.id}>
                  <div className="goal-card h-100 fade-in-up">
                    {/* Barra de color superior */}
                    <div className="goal-card-accent" style={{ background: goal.color }} />

                    {/* Cabecera */}
                    <div className="d-flex align-items-start justify-content-between gap-2 mt-1">
                      <span className="goal-name">{goal.name}</span>
                      <div className="d-flex gap-1 flex-shrink-0">
                        <button className="btn-ff-edit" onClick={() => openEdit(goal)} title="Editar">
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn-ff-danger" onClick={() => handleDelete(goal.id)} title="Eliminar">
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </div>

                    {/* Progreso */}
                    <div className="ff-progress mt-3">
                      <div
                        className="ff-progress-bar"
                        style={{ width: `${pct}%`, background: goal.color }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>

                    {/* Montos */}
                    <div className="goal-amounts mt-1">
                      <span style={{ color: goal.color, fontWeight: 700 }}>{fmt(goal.current_amount)}</span>
                      <span>de {fmt(goal.target_amount)}</span>
                    </div>

                    {/* Footer */}
                    <div className="d-flex align-items-center justify-content-between mt-2">
                      {goal.deadline && (
                        <span className="goal-deadline">
                          <i className="bi bi-calendar3" />
                          {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span className="goal-pct ms-auto" style={{ color: goal.color }}>{pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Card para agregar nueva meta */}
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="add-goal-card" onClick={openCreate} id="add-goal-card">
                <i className="bi bi-plus-circle" />
                <span className="fw-semibold">Nueva meta de ahorro</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal ───────────────────────────────── */}
        {showModal && (
          <div className="modal fade show d-block ff-modal" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-bullseye me-2" style={{ color: 'var(--primary-light)' }} />
                    {editingGoal ? 'Editar meta' : 'Nueva meta de ahorro'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">

                      {/* Nombre */}
                      <div className="col-12">
                        <label className="ff-label">Nombre de la meta *</label>
                        <input
                          type="text"
                          className={`ff-form-control ${formErrors.name ? 'border-danger' : ''}`}
                          placeholder="Ej: Fondo de emergencia"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          id="goal-name"
                        />
                        {formErrors.name && <small className="text-danger">{formErrors.name}</small>}
                      </div>

                      {/* Meta y Actual */}
                      <div className="col-6">
                        <label className="ff-label">Monto objetivo *</label>
                        <input
                          type="number"
                          className={`ff-form-control ${formErrors.target_amount ? 'border-danger' : ''}`}
                          placeholder="0"
                          min="1"
                          value={form.target_amount}
                          onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
                          id="goal-target"
                        />
                        {formErrors.target_amount && <small className="text-danger">{formErrors.target_amount}</small>}
                      </div>
                      <div className="col-6">
                        <label className="ff-label">Monto actual</label>
                        <input
                          type="number"
                          className="ff-form-control"
                          placeholder="0"
                          min="0"
                          value={form.current_amount}
                          onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))}
                          id="goal-current"
                        />
                      </div>

                      {/* Fecha límite */}
                      <div className="col-12">
                        <label className="ff-label">Fecha límite <span style={{ opacity: 0.5 }}>(opcional)</span></label>
                        <input
                          type="date"
                          className="ff-form-control"
                          value={form.deadline}
                          onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                          id="goal-deadline"
                        />
                      </div>

                      {/* Color */}
                      <div className="col-12">
                        <label className="ff-label">Color</label>
                        <div className="color-picker-strip">
                          {COLORS.map(c => (
                            <div
                              key={c}
                              className={`color-swatch ${form.color === c ? 'selected' : ''}`}
                              style={{ background: c }}
                              onClick={() => setForm(f => ({ ...f, color: c }))}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-ff-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn-ff-primary" disabled={submitting} id="btn-submit-goal">
                      {submitting
                        ? <><span className="spinner-border spinner-border-sm me-1" />Guardando...</>
                        : <><i className="bi bi-check-lg" /> {editingGoal ? 'Actualizar' : 'Crear meta'}</>
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
