(function () {
  const ESTADOS = [
    { nombre: 'Recibido', icono: '📝' },
    { nombre: 'En preparación', icono: '👨‍🍳' },
    { nombre: 'En camino', icono: '🛵' },
    { nombre: 'Entregado', icono: '🎉' }
  ];
  let pedidos = [];
  let idMontado = null;
  let intervalo = null;

  window.addEventListener('pedido:confirmado', (e) => {
    const nuevoPedido = { id: Date.now().toString().slice(-4), total: e.detail.total, estadoIndex: 0 };
    pedidos.push(nuevoPedido);
    if (idMontado) renderizar();
  });

  function iniciarCiclo() {
    if (intervalo) return;
    intervalo = setInterval(() => {
      let huboCambio = false;
      pedidos.forEach(p => {
        if (p.estadoIndex < ESTADOS.length - 1) {
          p.estadoIndex++;
          huboCambio = true;
          window.dispatchEvent(new CustomEvent('pedido:estado', { detail: { estado: ESTADOS[p.estadoIndex].nombre } }));
        }
      });
      if (huboCambio && idMontado) renderizar();
    }, 5000);
  }

  function renderizar() {
    const raiz = document.getElementById(idMontado);
    if (!raiz) return;
    
    let html = `
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="color: var(--color-primario); font-size: 22px; font-weight: 800; margin-bottom: 20px; text-align: center;">📍 Seguimiento de Pedidos en Vivo</h2>`;
        
    if (pedidos.length === 0) {
      html += `
        <div style="background: white; border-radius: var(--radio-md); padding: 40px; text-align: center; border: 1px solid var(--color-borde);">
          <p style="font-size: 40px; margin-bottom: 8px;">🚴‍♂️</p>
          <p style="color: var(--color-texto-suave); font-weight: 600;">No tienes ningún pedido en curso en este momento.</p>
        </div>`;
    } else {
      html += `<div style="display: flex; flex-direction: column; gap: 20px;">`;
      pedidos.slice().reverse().forEach(p => {
        html += `
          <div style="background: white; border-radius: var(--radio-md); padding: 24px; border: 1px solid var(--color-borde); box-shadow: var(--sombra-md);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--color-borde); padding-bottom: 10px;">
              <span style="font-weight: 800; font-size: 16px;">Pedido #${p.id}</span>
              <span style="font-weight: 700; color: var(--color-primario); font-size: 16px;">Total: $${p.total.toLocaleString('es-CO')}</span>
            </div>

            <!-- Stepper Timeline -->
            <div style="display: flex; justify-content: space-between; position: relative;">
              ${ESTADOS.map((est, idx) => {
                const activo = idx <= p.estadoIndex;
                return `
                  <div style="flex: 1; text-align: center; z-index: 1;">
                    <div style="width: 44px; height: 44px; margin: 0 auto 8px auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; background: ${activo ? 'var(--color-primario)' : '#edf2f7'}; color: ${activo ? 'white' : '#a0aec0'}; transition: var(--transicion);">
                      ${est.icono}
                    </div>
                    <span style="font-size: 12px; font-weight: ${activo ? '700' : '500'}; color: ${activo ? 'var(--color-texto)' : 'var(--color-texto-suave)'};">
                      ${est.nombre}
                    </span>
                  </div>`;
              }).join('')}
            </div>
          </div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
    raiz.innerHTML = html;
  }

  window.renderSeguimiento = function (id) {
    idMontado = id;
    renderizar();
    iniciarCiclo();
  };

  window.unmountSeguimiento = function (id) {
    document.getElementById(id).innerHTML = '';
    idMontado = null;
  };
})();