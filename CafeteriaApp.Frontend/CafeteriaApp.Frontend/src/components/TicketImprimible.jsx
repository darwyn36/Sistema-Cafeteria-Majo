import React from 'react';

// Usamos forwardRef para que react-to-print pueda acceder al elemento DOM
export const TicketImprimible = React.forwardRef(({ venta }, ref) => {
  if (!venta) return null;

  return (
    <div ref={ref} style={ticketContainerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>COFFEE SHOP</h2>
        <p style={textSm}>Nit: 123456789-0</p>
        <p style={textSm}>Calle Ficticia #123</p>
        <p style={{ ...textSm, marginTop: '5px' }}>
          <b>Ticket: #{venta.id}</b>
        </p>
        <p style={textSm}>{new Date(venta.fecha).toLocaleString()}</p>
      </div>

      <div style={dividerStyle}>--------------------------------</div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            <th align="left">Cant</th>
            <th align="left">Producto</th>
            <th align="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {venta.detalles?.map((d, i) => (
            <tr key={i}>
              <td style={{ verticalAlign: 'top' }}>{d.cantidad}</td>
              <td style={{ verticalAlign: 'top' }}>
                {d.producto?.nombre || 'Producto'}
              </td>
              <td align="right" style={{ verticalAlign: 'top' }}>
                ${(d.precioUnitario * d.cantidad).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={dividerStyle}>--------------------------------</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
        <span>TOTAL:</span>
        <span>${venta.total.toFixed(2)}</span>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={textSm}>¡Gracias por su compra!</p>
        <p style={{ fontSize: '9px' }}>Software de Gestión v1.0</p>
      </div>
    </div>
  );
});

// Estilos locales para el Ticket
const ticketContainerStyle = {
  padding: '15px',
  width: '80mm',
  fontFamily: '"Courier New", Courier, monospace',
  color: '#000',
  backgroundColor: '#fff'
};

const textSm = { margin: 0, fontSize: '11px' };
const dividerStyle = { textAlign: 'center', margin: '10px 0', letterSpacing: '-1px' };