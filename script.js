const ticketForm = document.getElementById("ticketForm");
const ticketList = document.getElementById("ticketList");
const filterStatus = document.getElementById("filterStatus");
const searchInput = document.getElementById("searchInput");

const totalTicketsEl = document.getElementById("totalTickets");
const openTicketsEl = document.getElementById("openTickets");
const resolvedTicketsEl = document.getElementById("resolvedTickets");

function getTickets() {
    const tickets = localStorage.getItem("helpdeskTickets");
    return tickets ? JSON.parse(tickets) : [];
}

function saveTickets(tickets) {
    localStorage.setItem("helpdeskTickets", JSON.stringify(tickets));
}

function createTicket(ticketData) {
    return {
        id: `TICK-${Date.now()}`,
        name: ticketData.name,
        category: ticketData.category,
        issue: ticketData.issue,
        priority: ticketData.priority,
        status: "Open",
        createdAt: new Date().toLocaleString()
    };
}

function updateDashboard(tickets) {
    totalTicketsEl.textContent = tickets.length;
    openTicketsEl.textContent = tickets.filter(ticket => ticket.status === "Open").length;
    resolvedTicketsEl.textContent = tickets.filter(ticket => ticket.status === "Resolved").length;
}

function renderTickets() {
    const tickets = getTickets();
    const selectedFilter = filterStatus.value;
    const searchTerm = searchInput.value.toLowerCase().trim();

    updateDashboard(tickets);

    const filteredTickets = tickets.filter((ticket) => {
        const matchesStatus =
            selectedFilter === "All" || ticket.status === selectedFilter;

        const matchesSearch =
            ticket.name.toLowerCase().includes(searchTerm) ||
            ticket.issue.toLowerCase().includes(searchTerm) ||
            ticket.category.toLowerCase().includes(searchTerm) ||
            ticket.id.toLowerCase().includes(searchTerm);

        return matchesStatus && matchesSearch;
    });

    if (filteredTickets.length === 0) {
        ticketList.innerHTML = `<p class="empty-state">No tickets found.</p>`;
        return;
    }

    ticketList.innerHTML = filteredTickets
        .map((ticket) => {
            const priorityClass = ticket.priority.toLowerCase();
            const statusClass =
                ticket.status === "Resolved" ? "status-resolved" : "status-open";

            return `
        <article class="ticket-item">
          <div class="ticket-top">
            <div>
              <p class="ticket-id">${ticket.id}</p>
              <span class="ticket-name">${ticket.name}</span>
              <span class="badge category-badge">${ticket.category}</span>
            </div>
            <span class="badge ${priorityClass}">${ticket.priority}</span>
          </div>

          <p class="ticket-meta">
            Status: <strong class="${statusClass}">${ticket.status}</strong> | Created: ${ticket.createdAt}
          </p>

          <p class="ticket-issue">${ticket.issue}</p>

          <div class="ticket-actions">
            ${ticket.status === "Open"
                    ? `<button onclick="markResolved('${ticket.id}')">Mark Resolved</button>`
                    : ""
                }
            <button onclick="deleteTicket('${ticket.id}')">Delete</button>
          </div>
        </article>
      `;
        })
        .join("");
}

function markResolved(ticketId) {
    const tickets = getTickets().map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: "Resolved" } : ticket
    );
    saveTickets(tickets);
    renderTickets();
}

function deleteTicket(ticketId) {
    const tickets = getTickets().filter((ticket) => ticket.id !== ticketId);
    saveTickets(tickets);
    renderTickets();
}

ticketForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(ticketForm);
    const newTicket = createTicket({
        name: formData.get("userName").trim(),
        category: formData.get("category"),
        issue: formData.get("issue").trim(),
        priority: formData.get("priority")
    });

    const tickets = getTickets();
    tickets.push(newTicket);
    saveTickets(tickets);

    ticketForm.reset();
    renderTickets();
});

filterStatus.addEventListener("change", renderTickets);
searchInput.addEventListener("input", renderTickets);

renderTickets();