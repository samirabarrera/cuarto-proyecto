const TIPS = [
  { id: 1,  tip: 'Aplica la regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro.',                  icon: '💡' },
  { id: 2,  tip: 'Registra cada gasto por pequeño que sea. Los microgastos destruyen presupuestos.',     icon: '📝' },
  { id: 3,  tip: 'Crea un fondo de emergencia de al menos 3-6 meses de gastos.',                        icon: '🛡️' },
  { id: 4,  tip: 'Antes de comprar algo, espera 24 horas para evitar compras impulsivas.',               icon: '⏰' },
  { id: 5,  tip: 'Cancela suscripciones que no usas regularmente.',                                      icon: '🚫' },
  { id: 6,  tip: 'Invierte en ti mismo: cursos y habilidades son la mejor inversión.',                   icon: '📚' },
  { id: 7,  tip: 'Automatiza tus ahorros transfiriéndolos el día que recibes tu salario.',               icon: '🤖' },
  { id: 8,  tip: 'Compara precios antes de hacer compras grandes.',                                      icon: '🔍' },
  { id: 9,  tip: 'Prepara tu comida en casa; comer fuera puede costar 3x más.',                         icon: '🍱' },
  { id: 10, tip: 'Revisa tus finanzas al menos una vez por semana.',                                     icon: '📊' },
  { id: 11, tip: 'El interés compuesto es tu mejor amigo: empieza a invertir lo antes posible.',         icon: '📈' },
  { id: 12, tip: 'Ten metas financieras claras: sin objetivo, no hay motivación para ahorrar.',          icon: '🎯' },
];

// Devuelve el tip del día basado en el día del año
export const getTipOfTheDay = (req, res) => {
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86_400_000
  );
  const tip = TIPS[dayOfYear % TIPS.length];
  res.json({ success: true, data: tip });
};

// Devuelve un tip aleatorio
export const getRandomTip = (req, res) => {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  res.json({ success: true, data: tip });
};

// Devuelve todos los tips
export const getAllTips = (req, res) => {
  res.json({ success: true, data: TIPS });
};
