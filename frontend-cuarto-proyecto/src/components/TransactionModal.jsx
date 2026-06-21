import { CATEGORIES } from '../utils/constants';

export default function TransactionModal({ formik, editingTx, closeModal, showModal }) {
  if (!showModal) return null;

  const filteredCats = CATEGORIES.filter(c =>
    !formik.values.type || c.type === formik.values.type || c.type === 'both'
  );

  return (
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
          <form onSubmit={formik.handleSubmit}>
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
                        className={`flex-fill py-2 px-3 rounded fw-semibold border-0 ${formik.values.type === t
                          ? t === 'income' ? 'bg-success text-white' : 'bg-danger text-white'
                          : 'btn-ff-ghost'
                        }`}
                        style={{ fontSize: '0.88rem', cursor: 'pointer' }}
                        onClick={() => {
                          formik.setFieldValue('type', t);
                          formik.setFieldValue('category_id', '');
                        }}
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
                    name="description"
                    className={`ff-form-control ${formik.touched.description && formik.errors.description ? 'border-danger' : ''}`}
                    placeholder="Ej: Súper del mes"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    id="form-description"
                  />
                  {formik.touched.description && formik.errors.description && (
                    <small className="text-danger">{formik.errors.description}</small>
                  )}
                </div>

                {/* Monto y Fecha */}
                <div className="col-6">
                  <label className="ff-label">Monto *</label>
                  <input
                    type="number"
                    name="amount"
                    className={`ff-form-control ${formik.touched.amount && formik.errors.amount ? 'border-danger' : ''}`}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    id="form-amount"
                  />
                  {formik.touched.amount && formik.errors.amount && (
                    <small className="text-danger">{formik.errors.amount}</small>
                  )}
                </div>
                <div className="col-6">
                  <label className="ff-label">Fecha *</label>
                  <input
                    type="date"
                    name="date"
                    className={`ff-form-control ${formik.touched.date && formik.errors.date ? 'border-danger' : ''}`}
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    id="form-date"
                  />
                  {formik.touched.date && formik.errors.date && (
                    <small className="text-danger">{formik.errors.date}</small>
                  )}
                </div>

                {/* Categoría */}
                <div className="col-12">
                  <label className="ff-label">Categoría *</label>
                  <select
                    name="category_id"
                    className={`ff-select ${formik.touched.category_id && formik.errors.category_id ? 'border-danger' : ''}`}
                    value={formik.values.category_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    id="form-category"
                  >
                    <option value="">Selecciona una categoría</option>
                    {filteredCats.map(c => (
                      <option key={c.id} value={c.id}>{(c.icon || '').replace('bi-', '')} {c.name}</option>
                    ))}
                  </select>
                  {formik.touched.category_id && formik.errors.category_id && (
                    <small className="text-danger">{formik.errors.category_id}</small>
                  )}
                </div>

                {/* Notas */}
                <div className="col-12">
                  <label className="ff-label">Notas <span style={{ opacity: 0.5 }}>(opcional)</span></label>
                  <textarea
                    name="notes"
                    className="ff-form-control"
                    rows="2"
                    placeholder="Comentario adicional..."
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
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
                disabled={formik.isSubmitting}
                id="btn-submit-tx"
              >
                {formik.isSubmitting
                  ? <><span className="spinner-border spinner-border-sm me-1" />Guardando...</>
                  : <><i className={`bi ${editingTx ? 'bi-check-lg' : 'bi-plus-lg'}`} /> {editingTx ? 'Actualizar' : 'Crear'}</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
