const API_URL = "/api";

let tickets = [];
let users = [];
let statuses = [];
let currentMessages = [];

let editingId = null; 
let openedTicketId = null;

let searchQuery = "";
let filterStatusId = "";
let sortOption = "";

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
    
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        const targetId = e.target.dataset.target;
        document.getElementById(targetId).classList.add('active');
    });
});

document.getElementById('backToTicketsBtn').addEventListener('click', () => {
    document.querySelector('[data-target="tickets-view"]').click();
});

async function fetchAllData() {
    try {
        const [uRes, sRes, tRes] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/statuses`),
            fetch(`${API_URL}/tickets`)
        ]);

        users = (await uRes.json()).items || [];
        statuses = (await sRes.json()).items || [];
        tickets = (await tRes.json()).items || [];

        renderUsersTable();
        renderStatusesTable();
        populateDropdowns();
        renderTicketsTable();
    } catch (err) {
        console.error("Помилка підключення до API", err);
    }
}

function populateDropdowns() {
    const userOpts = `<option value="">Оберіть...</option>` + users.map(u => `<option value="${u.id}">${u.name}</option>`).join("");
    document.getElementById("authorSelect").innerHTML = userOpts;
    document.getElementById("messageAuthorSelect").innerHTML = userOpts;

    const statusOpts = statuses.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
    document.getElementById("statusSelect").innerHTML = `<option value="">Оберіть...</option>` + statusOpts;
    document.getElementById("filterStatus").innerHTML = `<option value="">Усі статуси</option>` + statusOpts;
}

function renderUsersTable() {
    document.getElementById("usersTableBody").innerHTML = users.map(u => `
        <tr>
            <td>${u.name}</td><td>${u.email}</td><td>${u.role}</td>
            <td><button class="delete-btn" onclick="deleteUser('${u.id}')">Видалити</button></td>
        </tr>
    `).join("");
}

function renderStatusesTable() {
    document.getElementById("statusesTableBody").innerHTML = statuses.map(s => `
        <tr>
            <td>${s.name}</td>
            <td><span style="display:inline-block; width:20px; height:20px; background:${s.colorCode}"></span></td>
            <td><button class="delete-btn" onclick="deleteStatus('${s.id}')">Видалити</button></td>
        </tr>
    `).join("");
}

function renderTicketsTable() {
    const tbody = document.getElementById("ticketsTableBody");
    
    let processedTickets = tickets.filter(t => t.subject.toLowerCase().includes(searchQuery));
    if (filterStatusId) processedTickets = processedTickets.filter(t => t.statusId === filterStatusId);

    if (sortOption !== "") {
        const priorityWeight = { "Low": 1, "Medium": 2, "High": 3 };
        processedTickets.sort((a, b) => {
            const wA = priorityWeight[a.priority] || 0;
            const wB = priorityWeight[b.priority] || 0;
            return sortOption === "asc" ? wA - wB : wB - wA;
        });
    }

    if (processedTickets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Немає записів</td></tr>`;
        return;
    }

    tbody.innerHTML = processedTickets.map((t, index) => {
        const u = users.find(user => user.id === t.authorId);
        const s = statuses.find(stat => stat.id === t.statusId);
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${u ? u.name : "Невідомо"}</td>
                <td>${t.subject}</td>
                <td style="color: ${s ? s.colorCode : '#000'}">${s ? s.name : "Невідомо"}</td>
                <td>${t.priority}</td>
                <td>
                    <button class="msg-btn" onclick="openMessages('${t.id}')">Повідомлення</button>
                    <button class="edit-btn" onclick="editTicket('${t.id}')">Редагувати</button>
                    <button class="delete-btn" onclick="deleteTicket('${t.id}')">Видалити</button>
                </td>
            </tr>
        `;
    }).join("");
}

function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add("invalid");
    document.getElementById(errorId).innerHTML = message;
}
function clearError(inputId, errorId) {
    document.getElementById(inputId).classList.remove("invalid");
    document.getElementById(errorId).innerHTML = "";
}
function clearAllErrors() {
    clearError("authorSelect", "authorError");
    clearError("subjectInput", "subjectError");
    clearError("statusSelect", "statusError");
    clearError("prioritySelect", "priorityError");
    clearError("messageInput", "messageError");
}

document.getElementById("ticketForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();
    
    const dto = {
        authorId: document.getElementById("authorSelect").value,
        subject: document.getElementById("subjectInput").value.trim(),
        statusId: document.getElementById("statusSelect").value,
        priority: document.getElementById("prioritySelect").value,
        message: document.getElementById("messageInput").value.trim()
    };

    let isValid = true;
    if (!dto.authorId) { showError("authorSelect", "authorError", "Оберіть автора"); isValid = false; }
    if (!dto.subject) { showError("subjectInput", "subjectError", "Поле обов'язкове"); isValid = false; }
    if (!dto.statusId) { showError("statusSelect", "statusError", "Оберіть статус"); isValid = false; }
    if (!dto.priority) { showError("prioritySelect", "priorityError", "Оберіть пріоритет"); isValid = false; }
    if (dto.message.length < 5) { showError("messageInput", "messageError", "Мінімум 5 символів"); isValid = false; }

    if (!isValid) return;

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/tickets/${editingId}` : `${API_URL}/tickets`;

    await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
    });

    editingId = null;
    document.getElementById("submitBtn").textContent = "Додати";
    document.getElementById("ticketForm").reset();
    fetchAllData();
});

window.deleteTicket = async (id) => {
    await fetch(`${API_URL}/tickets/${id}`, { method: "DELETE" });
    fetchAllData();
};

window.editTicket = (id) => {
    const t = tickets.find(x => x.id === id);
    if (!t) return;
    document.getElementById("authorSelect").value = t.authorId;
    document.getElementById("subjectInput").value = t.subject;
    document.getElementById("statusSelect").value = t.statusId;
    document.getElementById("prioritySelect").value = t.priority;
    document.getElementById("messageInput").value = t.message;
    editingId = id;
    document.getElementById("submitBtn").textContent = "Зберегти";
    clearAllErrors();
    window.scrollTo(0, 0);
};

document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const dto = {
        name: document.getElementById("userNameInput").value.trim(),
        email: document.getElementById("userEmailInput").value.trim(),
        role: document.getElementById("userRoleInput").value
    };
    await fetch(`${API_URL}/users`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dto) });
    document.getElementById("userForm").reset();
    fetchAllData();
});

window.deleteUser = async (id) => {
    await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
    fetchAllData();
};

document.getElementById("statusForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const dto = {
        name: document.getElementById("statusNameInput").value.trim(),
        colorCode: document.getElementById("statusColorInput").value
    };
    await fetch(`${API_URL}/statuses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dto) });
    document.getElementById("statusForm").reset();
    fetchAllData();
});

window.deleteStatus = async (id) => {
    await fetch(`${API_URL}/statuses/${id}`, { method: "DELETE" });
    fetchAllData();
};

window.openMessages = async (ticketId) => {
    openedTicketId = ticketId;
    const ticket = tickets.find(t => t.id === ticketId);
    document.getElementById("chatTicketSubject").textContent = "Тема: " + ticket.subject;
    
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById("messages-view").classList.add('active');
    
    await loadMessages();
};

async function loadMessages() {
    const res = await fetch(`${API_URL}/messages?ticketId=${openedTicketId}`);
    const data = await res.json();
    currentMessages = data.items || [];
    
    document.getElementById("messagesContainer").innerHTML = currentMessages.map(m => {
        const u = users.find(x => x.id === m.authorId);
        return `
            <div class="message-card">
                <div class="message-meta">${u ? u.name : 'Невідомо'}</div>
                <div>${m.text}</div>
            </div>
        `;
    }).join("");
}

document.getElementById("messageForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const dto = {
        ticketId: openedTicketId,
        authorId: document.getElementById("messageAuthorSelect").value,
        text: document.getElementById("newMessageText").value.trim()
    };
    await fetch(`${API_URL}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dto) });
    document.getElementById("messageForm").reset();
    await loadMessages();
});

document.getElementById("searchInput").addEventListener("input", (e) => { searchQuery = e.target.value.toLowerCase().trim(); renderTicketsTable(); });
document.getElementById("filterStatus").addEventListener("change", (e) => { filterStatusId = e.target.value; renderTicketsTable(); });
document.getElementById("sortPriority").addEventListener("change", (e) => { sortOption = e.target.value; renderTicketsTable(); });
document.getElementById("resetBtn").addEventListener("click", () => { document.getElementById("ticketForm").reset(); editingId = null; document.getElementById("submitBtn").textContent = "Додати"; clearAllErrors(); });

fetchAllData();