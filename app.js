function renderPendientes() {
  const lista = document.getElementById("listaPendientes");
  const { dia } = getDia();

  lista.innerHTML = "";

  dia.pendientes.forEach(p => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="item ${p.done ? 'done' : ''}">
        <input type="checkbox" ${p.done ? "checked" : ""}
          onchange="togglePendiente(${p.id})">
        <span>${p.texto}</span>
      </div>

      <button onclick="eliminarPendiente(${p.id})">❌</button>
    `;

    lista.appendChild(li);
  });
}
