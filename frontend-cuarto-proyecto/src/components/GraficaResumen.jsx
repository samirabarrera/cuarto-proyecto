import '../styles/GraficaResumen.css';

/**
 * GraficaResumen — Gráfica 1: Donut + Barra de rango
 * Props:
 *   totalIngresos  (number) — ingreso total del mes
 *   totalGastos    (number) — gasto acumulado del mes
 */
function GraficaResumen({ totalIngresos = 0, totalGastos = 0 }) {
  const saldoRestante = Math.max(totalIngresos - totalGastos, 0);
  const gastoSeguro   = Math.min(totalGastos, totalIngresos);

  // ── Donut SVG ────────────────────────────────────────────────────────────
  const radio      = 60;
  const grosor     = 22;
  const cx         = 90;
  const cy         = 90;
  const circunf    = 2 * Math.PI * radio;

  const porcentajeGasto   = totalIngresos > 0 ? gastoSeguro / totalIngresos : 0;
  const porcentajeSaldo   = 1 - porcentajeGasto;

  const dashGasto  = porcentajeGasto * circunf;
  const dashSaldo  = porcentajeSaldo * circunf;

  // Donde comienza el arco de la dona (rotación para que inicie en la parte superior)
  const rotacionBase = -90;

  // Barra de rango
  const pctBarra = totalIngresos > 0 ? (gastoSeguro / totalIngresos) * 100 : 0;

  return (
    <div className="gr-card">
      <h2 className="gr-titulo">Comparativa de Gasto y Reserva Acumulada</h2>

      <div className="gr-cuerpo">

        {/* ── Donut ── */}
        <div className="gr-donut-wrapper">
          <svg
            className="gr-donut-svg"
            viewBox="0 0 180 180"
            aria-label="Gráfica donut de gasto vs saldo"
          >
            {/* Fondo del donut (saldo restante — rosa claro) */}
            <circle
              cx={cx} cy={cy} r={radio}
              fill="none"
              stroke="#fbb6ce"
              strokeWidth={grosor}
              strokeDasharray={`${dashSaldo} ${dashGasto}`}
              strokeDashoffset={-dashGasto}
              transform={`rotate(${rotacionBase}, ${cx}, ${cy})`}
              strokeLinecap="butt"
            />
            {/* Gasto — magenta fuerte */}
            <circle
              cx={cx} cy={cy} r={radio}
              fill="none"
              stroke="#b83280"
              strokeWidth={grosor}
              strokeDasharray={`${dashGasto} ${dashSaldo}`}
              strokeDashoffset={0}
              transform={`rotate(${rotacionBase}, ${cx}, ${cy})`}
              strokeLinecap="butt"
            />
            {/* Texto central */}
            <text x={cx} y={cy - 8} textAnchor="middle" className="gr-donut-label-top">
              SALDO
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" className="gr-donut-value">
              ${saldoRestante.toLocaleString()}
            </text>
            <text x={cx} y={cy + 26} textAnchor="middle" className="gr-donut-pct">
              {totalIngresos > 0
                ? `(${(porcentajeSaldo * 100).toFixed(1)}% de $${totalIngresos.toLocaleString()})`
                : '—'}
            </text>
          </svg>

          {/* Leyenda lateral izquierda */}
          <div className="gr-leyenda gr-leyenda-izq">
            <span className="gr-leyenda-dot gr-dot-saldo" />
            <div>
              <div className="gr-leyenda-label">SALDO RESTANTE</div>
              <div className="gr-leyenda-valor saldo">${saldoRestante.toLocaleString()}</div>
              <div className="gr-leyenda-sub">
                ({totalIngresos > 0 ? (porcentajeSaldo * 100).toFixed(1) : 0}% de ${totalIngresos.toLocaleString()})
              </div>
            </div>
          </div>

          {/* Leyenda lateral derecha */}
          <div className="gr-leyenda gr-leyenda-der">
            <span className="gr-leyenda-dot gr-dot-gasto" />
            <div>
              <div className="gr-leyenda-label">GASTO TOTAL</div>
              <div className="gr-leyenda-valor gasto">${totalGastos.toLocaleString()}</div>
              <div className="gr-leyenda-sub">
                ({totalIngresos > 0 ? (porcentajeGasto * 100).toFixed(1) : 0}% de ${totalIngresos.toLocaleString()})
              </div>
            </div>
          </div>
        </div>

        {/* ── Divisor ── */}
        <div className="gr-divisor" aria-hidden="true" />

        {/* ── Barra de rango ── */}
        <div className="gr-rango-wrapper">
          <div className="gr-rango-titulo">VISUALIZACIÓN DE SALDO ACTUALIZADA</div>
          <div className="gr-rango-valor-top">${saldoRestante.toLocaleString()}</div>
          <div className="gr-rango-sublabel-top">(Saldo Restante)</div>

          {/* Barra */}
          <div className="gr-barra-track" role="progressbar" aria-valuenow={pctBarra} aria-valuemin={0} aria-valuemax={100}>
            {/* Segmento gasto */}
            <div
              className="gr-barra-gasto"
              style={{ width: `${pctBarra}%` }}
            />
            {/* Marcador de saldo restante */}
            <div
              className="gr-barra-marcador"
              style={{ left: `${pctBarra}%` }}
              aria-hidden="true"
            />
          </div>

          {/* Etiquetas de la barra */}
          <div className="gr-barra-etiquetas">
            <div className="gr-barra-et-item">
              <span className="gr-barra-et-num">0</span>
            </div>
            <div className="gr-barra-et-item center">
              <span className="gr-barra-et-num">${totalGastos.toLocaleString()}</span>
              <span className="gr-barra-et-desc">(Gasto Total)</span>
            </div>
            <div className="gr-barra-et-item right">
              <span className="gr-barra-et-num">${totalIngresos.toLocaleString()}</span>
              <span className="gr-barra-et-desc">(Ingreso Total)</span>
            </div>
          </div>

          {/* Valor grande debajo */}
          <div className="gr-saldo-grande">${saldoRestante.toLocaleString()}</div>
        </div>

      </div>
    </div>
  );
}

export default GraficaResumen;
