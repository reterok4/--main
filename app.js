const STORAGE_KEY = "tickets_data";
let tickets = [];
let editingId = null; 


let searchQuery = "";
let filterStatus = "";
let sortOption = "";


function loadFromStorage() {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    try {
        const data = JSON.parse(json);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveToStorage(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}


const form = document.getElementById("ticketForm");
const tbody = document.getElementById("ticketsTableBody");
const resetBtn = document.getElementById("resetBtn");
const submitBtn = document.getElementById("submitBtn");

const searchInput = document.getElementById("searchInput");
const filterStatusSelect = document.getElementById("filterStatus");
const sortPrioritySelect = document.getElementById("sortPriority");


function readForm() {
    return {
        author: document.getElementById("authorInput").value.trim(),
        subject: document.getElementById("subjectInput").value.trim(),
        status: document.getElementById("statusSelect").value,
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
    clearError("authorInput", "authorError");
    clearError("subjectInput", "subjectError");
    clearError("statusSelect", "statusError");
    clearError("prioritySelect", "priorityError");
    clearError("messageInput", "messageError");
}

function validate(dto) {
    clearAllErrors();
    let isValid = true;

    if (dto.author === "") {
        showError("authorInput", "authorError", "Поле є обов’язковим.");
        isValid = false;
    } else if (dto.author.length < 3) {
        showError("authorInput", "authorError", "Ім'я має містити щонайменше 3 символи.");
        isValid = false;
    }

    if (dto.subject === "") {
        showError("subjectInput", "subjectError", "Поле є обов’язковим.");
        isValid = false;
    }

    if (dto.status === "") {
        showError("statusSelect", "statusError", "Оберіть статус зі списку.");
        isValid = false;
    }

    if (dto.priority === "") {
        showError("prioritySelect", "priorityError", "Оберіть пріоритет зі списку.");
        isValid = false;
    }

    if (dto.message.length < 5) {
        showError("messageInput", "messageError", "Коментар має містити щонайменше 5 символів.");
        isValid = false;
    }

    return isValid;
}


function renderTable() {
    
    let processedTickets = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery) || 
                              t.author.toLowerCase().includes(searchQuery);
        const matchesStatus = filterStatus === "" || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    
    if (sortOption !== "") {
        
        const priorityWeight = { "Low": 1, "Medium": 2, "High": 3 };
        
        processedTickets.sort((a, b) => {
            const weightA = priorityWeight[a.priority] || 0;
            const weightB = priorityWeight[b.priority] || 0;
            
            if (sortOption === "asc") {
                return weightA - weightB; 
            } else {
                return weightB - weightA; 
            }
        });
    }

    if (processedTickets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Немає записів</td></tr>`;
        return;
    }

    const rowsHtml = processedTickets.map((t, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${t.author}</td>
            <td>${t.subject}</td>
            <td>${t.status}</td>
            <td>${t.priority}</td>
            <td>
                <button type="button" class="edit-btn" data-id="${t.id}">Редагувати</button>
                <button type="button" class="delete-btn" data-id="${t.id}">Видалити</button>
            </td>
        </tr>
    `).join("");

    tbody.innerHTML = rowsHtml;
}


form.addEventListener("submit", (event) => {
    event.preventDefault();

    const dto = readForm();
    const isValid = validate(dto);

    if (!isValid) return;

    if (editingId !== null) {
        const index = tickets.findIndex(t => t.id === editingId);
        if (index !== -1) {
            tickets[index] = { ...tickets[index], ...dto };
        }
        editingId = null;
        submitBtn.textContent = "Додати";
    } else {
        const newId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
        tickets.push({ id: newId, ...dto });
    }

    saveToStorage(tickets);
    renderTable();
    form.reset();
});

tbody.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("delete-btn")) {
        const id = Number(target.dataset.id);
        tickets = tickets.filter(t => t.id !== id);
        saveToStorage(tickets);
        renderTable();
        return;
    }

    if (target.classList.contains("edit-btn")) {
        const id = Number(target.dataset.id);
        const ticketToEdit = tickets.find(t => t.id === id);
        
        if (ticketToEdit) {
            document.getElementById("authorInput").value = ticketToEdit.author;
            document.getElementById("subjectInput").value = ticketToEdit.subject;
            document.getElementById("statusSelect").value = ticketToEdit.status;
            document.getElementById("prioritySelect").value = ticketToEdit.priority;
            document.getElementById("messageInput").value = ticketToEdit.message;
            
            editingId = id;
            submitBtn.textContent = "Зберегти";
            clearAllErrors();
        }
        return;
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
    filterStatus = event.target.value;
    renderTable();
});

sortPrioritySelect.addEventListener("change", (event) => {
    sortOption = event.target.value;
    renderTable();
});


tickets = loadFromStorage();
renderTable();