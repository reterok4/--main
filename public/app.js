const API_URL = "/api";

let tickets = [];
let users = [];
let statuses = [];
let editingId = null; 

let searchQuery = "";
let filterStatusId = "";
let sortOption = "";

const form = document.getElementById("ticketForm");
const tbody = document.getElementById("ticketsTableBody");
const resetBtn = document.getElementById("resetBtn");
const submitBtn = document.getElementById("submitBtn");

const searchInput = document.getElementById("searchInput");
const filterStatusSelect = document.getElementById("filterStatus");
const sortPrioritySelect = document.getElementById("sortPriority");
const authorSelect = document.getElementById("authorSelect");
const statusSelect = document.getElementById("statusSelect");


async function fetchInitialData() {
    try {
        const [usersRes, statusesRes] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/statuses`)
        ]);
        
        const usersData = await usersRes.json();
        const statusesData = await statusesRes.json();
        
        users = usersData.items || [];
        statuses = statusesData.items || [];
        
        populateDropdowns();
        await fetchTickets();
    } catch (error) {
        console.error("Помилка завантаження базових даних:", error);
    }
}

async function fetchTickets() {
    try {
        let url = `${API_URL}/tickets?`;
        if (filterStatusId) url += `statusId=${filterStatusId}&`;
        if (sortOption) url += `sort=${sortOption}`;

        const res = await fetch(url);
        const data = await res.json();
        tickets = data.items || [];
        renderTable();
    } catch (error) {
        console.error("Помилка завантаження тікетів:", error);
    }
}

function populateDropdowns() {
    authorSelect.innerHTML = `<option value="">Оберіть автора</option>` + 
        users.map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`).join("");

    statusSelect.innerHTML = `<option value="">Оберіть статус</option>` + 
        statuses.map(s => `<option value="${s.id}">${s.name}</option>`).join("");

    filterStatusSelect.innerHTML = `<option value="">Усі статуси</option>` + 
        statuses.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
}

function renderTable() {
    let processedTickets = tickets.filter(t => 
        t.subject.toLowerCase().includes(searchQuery)
    );

    if (processedTickets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Немає записів</td></tr>`;
        return;
    }

    const rowsHtml = processedTickets.map((t, index) => {
        const author = users.find(u => u.id === t.authorId);
        const authorName = author ? author.name : "Невідомий";
        
        const status = statuses.find(s => s.id === t.statusId);
        const statusHtml = status 
            ? `<span style="color: ${status.colorCode}; font-weight: bold;">${status.name}</span>`
            : "Невідомо";

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${authorName}</td>
                <td>${t.subject}</td>
                <td>${statusHtml}</td>
                <td>${t.priority}</td>
                <td>
                    <button type="button" class="edit-btn" data-id="${t.id}">Редагувати</button>
                    <button type="button" class="delete-btn" data-id="${t.id}">Видалити</button>
                </td>
            </tr>
        `;
    }).join("");

    tbody.innerHTML = rowsHtml;
}


function readForm() {
    return {
        authorId: authorSelect.value,
        subject: document.getElementById("subjectInput").value.trim(),
        statusId: statusSelect.value,
        priority: document.getElementById("prioritySelect").value,
        message: document.getElementById("messageInput").value.trim()
    };
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

function validate(dto) {
    clearAllErrors();
    let isValid = true;

    if (!dto.authorId) { showError("authorSelect", "authorError", "Оберіть автора."); isValid = false; }
    if (!dto.subject) { showError("subjectInput", "subjectError", "Поле є обов’язковим."); isValid = false; }
    if (!dto.statusId) { showError("statusSelect", "statusError", "Оберіть статус."); isValid = false; }
    if (!dto.priority) { showError("prioritySelect", "priorityError", "Оберіть пріоритет."); isValid = false; }
    if (dto.message.length < 5) { showError("messageInput", "messageError", "Мінімум 5 символів."); isValid = false; }

    return isValid;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const dto = readForm();
    if (!validate(dto)) return;

    try {
        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `${API_URL}/tickets/${editingId}` : `${API_URL}/tickets`;

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        if (!response.ok) throw new Error("Помилка збереження");

        editingId = null;
        submitBtn.textContent = "Додати";
        form.reset();
        await fetchTickets();
    } catch (error) {
        console.error(error);
        alert("Не вдалося зберегти тікет");
    }
});


tbody.addEventListener("click", async (event) => {
    const target = event.target;
    const id = target.dataset.id;

    if (target.classList.contains("delete-btn")) {
        if (!confirm("Ви впевнені, що хочете видалити цей тікет?")) return;
        try {
            await fetch(`${API_URL}/tickets/${id}`, { method: "DELETE" });
            await fetchTickets();
        } catch (error) {
            console.error("Помилка видалення", error);
        }
        return;
    }

    if (target.classList.contains("edit-btn")) {
        const ticketToEdit = tickets.find(t => t.id === id);
        if (ticketToEdit) {
            authorSelect.value = ticketToEdit.authorId;
            document.getElementById("subjectInput").value = ticketToEdit.subject;
            statusSelect.value = ticketToEdit.statusId;
            document.getElementById("prioritySelect").value = ticketToEdit.priority;
            document.getElementById("messageInput").value = ticketToEdit.message;
            
            editingId = id;
            submitBtn.textContent = "Зберегти";
            clearAllErrors();
        }
    }
});

resetBtn.addEventListener("click", () => {
    form.reset();
    clearAllErrors();
    editingId = null;
    submitBtn.textContent = "Додати";
});

searchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value.toLowerCase().trim();
    renderTable();
});

filterStatusSelect.addEventListener("change", (event) => {
    filterStatusId = event.target.value;
    fetchTickets();
});

sortPrioritySelect.addEventListener("change", (event) => {
    sortOption = event.target.value;
    fetchTickets();
});

fetchInitialData();