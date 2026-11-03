export const Chip = ({ c, children }) => <span className={`chip ${c}`}>{children}</span>

export const Barra = ({ pct }) => (
  <div className="bar"><i style={{ width: `${pct}%` }} /></div>
)

export const Progresso = ({ nome, valor, pct }) => (
  <>
    <div className="row"><span>{nome}</span><b>{valor}</b></div>
    <Barra pct={pct} />
  </>
)
