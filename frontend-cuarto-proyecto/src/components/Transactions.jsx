import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  getTransactions,
  createTransaction, updateTransaction, deleteTransaction,
  setAuthToken,
} from '../api/financeApi';
import TransactionTable from './TransactionTable';
import TransactionModal from './TransactionModal';
import { CATEGORIES, EMPTY_FORM } from '../utils/constants';
import '../styles/Transaction.css';

const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function Transactions({ socketEvents, onToast, accessToken }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterMonth, setFilterMonth] = useState(currentMonth());
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const formik = useFormik({
    initialValues: EMPTY_FORM,
    validationSchema: Yup.object({
      description: Yup.string().required('Requerido'),
      amount: Yup.number().positive('Monto inválido').required('Monto inválido'),
      type: Yup.string().oneOf(['income', 'expense']).required('Requerido'),
      category_id: Yup.string().required('Selecciona categoría'),
      date: Yup.string().required('Requerido'),
      notes: Yup.string(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (editingTx) {
          await updateTransaction(editingTx.id, values);
          onToast('✏️ Transacción actualizada', 'success');
        } else {
          await createTransaction(values);
          onToast('✅ Transacción creada', 'success');
        }
        closeModal();
        fetchTransactions();
      } catch (err) {
        onToast('❌ Error al guardar', 'danger');
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Aplicar el token cada vez que cambie y luego cargar las transacciones
  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
      fetchTransactions();
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;   // no buscar sin token
    fetchTransactions();
  }, [filterMonth, filterType, filterCategory]);

  useEffect(() => {
    if (!socketEvents || !accessToken) return;
    fetchTransactions();
  }, [socketEvents]);

  async function fetchTransactions() {
    if (!accessToken) return;   // Nunca llamar sin token
    setLoading(true);
    try {
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterType) params.type = filterType;
      if (filterCategory) params.category_id = filterCategory;
      const res = await getTransactions(params);
      setTransactions(res.data.data);
    } catch (err) {
      console.error('Error cargando transacciones:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingTx(null);
    formik.resetForm({ values: EMPTY_FORM });
    setShowModal(true);
  }

  function openEdit(tx) {
    setEditingTx(tx);
    formik.setValues({
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      category_id: tx.category_id,
      date: tx.date,
      notes: tx.notes || '',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    formik.resetForm();
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta transacción?')) return;
    try {
      await deleteTransaction(id);
      onToast('🗑️ Transacción eliminada', 'warning');
      fetchTransactions();
    } catch {
      onToast('❌ Error al eliminar', 'danger');
    }
  }

  return (
    <div className="ff-page">
      <div className="container-xl">
        {/* Header */}
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

        {/* Filtros */}
        <div className="filter-bar mb-3">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-sm-4 col-md-3">
              <label className="ff-label">Mes</label>
              <input type="month" className="ff-form-control" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
            </div>
            <div className="col-12 col-sm-4 col-md-3">
              <label className="ff-label">Tipo</label>
              <select className="ff-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">Todos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>
            <div className="col-12 col-sm-4 col-md-3">
              <label className="ff-label">Categoría</label>
              <select className="ff-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="">Todas</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <button className="btn-ff-ghost w-100" onClick={fetchTransactions}>
                <i className="bi bi-arrow-clockwise me-1" /> Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <TransactionTable 
          transactions={transactions} 
          loading={loading} 
          openEdit={openEdit} 
          handleDelete={handleDelete} 
        />

        {/* Modal */}
        <TransactionModal 
          showModal={showModal} 
          closeModal={closeModal} 
          formik={formik} 
          editingTx={editingTx} 
        />
      </div>
    </div>
  );
}
