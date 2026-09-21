// ======================================
// GLADEX MATERIAL REQUISITION SYSTEM
// Project 1
// ======================================

let editingIndex = null;

// ======================================
// DATE: DD/MM/YYYY
// ======================================

function formatDateInput(input) {
    let value = input.value.replace(/\D/g, "").slice(0, 8);

    if (value.length > 4) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
    } else if (value.length > 2) {
        value = value.slice(0, 2) + "/" + value.slice(2);
    }

    input.value = value;
}

function isValidDate(value) {
    if (!value) return false;

    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return false;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
}

function setupDateInputs() {
    document.querySelectorAll(".date-input").forEach(function(input) {
        input.addEventListener("input", function() {
            formatDateInput(input);
        });
    });
}

// ======================================
// CALCULATE TOTAL
// ======================================

function calculateTotal() {
    const rows = document.querySelectorAll("#materialRows tr");
    let grandTotal = 0;

    rows.forEach(function(row) {
        const quantityInput = row.querySelector(".quantity-input");
        const costInput = row.querySelector(".cost-input");
        const amountCell = row.querySelector(".amount-cell");

        const quantity = parseFloat(quantityInput.value) || 0;
        const unitCost = parseFloat(costInput.value) || 0;
        const amount = quantity * unitCost;

        amountCell.textContent = amount.toFixed(2);
        grandTotal += amount;
    });

    document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
}

// ======================================
// MESSAGE
// ======================================

function showMessage(message, type = "success") {
    const existing = document.getElementById("systemMessage");
    if (existing) existing.remove();

    const box = document.createElement("div");
    box.id = "systemMessage";
    box.className = "system-message " + type;
    box.textContent = message;
    document.body.appendChild(box);

    setTimeout(function() {
        box.classList.add("hide");
        setTimeout(() => box.remove(), 300);
    }, 3000);
}

// ======================================
// VALIDATION
// Compulsory:
// Date of request, Requested By, Project Title,
// Department, Material Description and Quantity.
// ======================================

function validateRequisition() {
    const form = document.getElementById("requisitionForm");

    const dateOfRequest = form.querySelector('.left-info .info-row:nth-child(1) input').value.trim();
    const requestedBy = form.querySelector('.left-info .info-row:nth-child(2) input').value.trim();
    const projectTitle = form.querySelector('.left-info .info-row:nth-child(3) input').value.trim();
    const department = form.querySelector('.right-info .info-row:nth-child(3) input').value.trim();

    if (!dateOfRequest) {
        showMessage("Please enter the Date of Request.", "error");
        return false;
    }

    if (!isValidDate(dateOfRequest)) {
        showMessage("Please enter a valid date in DD/MM/YYYY format.", "error");
        return false;
    }

    if (!requestedBy) {
        showMessage("Please enter the Requested By (Name).", "error");
        return false;
    }

    if (!projectTitle) {
        showMessage("Please enter the Project Title.", "error");
        return false;
    }

    if (!department) {
        showMessage("Please enter the Department.", "error");
        return false;
    }

    const rows = document.querySelectorAll("#materialRows tr");
    let hasCompleteMaterial = false;

    for (let i = 0; i < rows.length; i++) {
        const material = rows[i].querySelector(".material").value.trim();
        const quantityValue = rows[i].querySelector(".quantity-input").value.trim();
        const quantity = Number(quantityValue);

        // Completely empty rows are allowed.
        if (!material && (!quantityValue || quantity === 0)) {
            continue;
        }

        if (!material) {
            showMessage("Please enter a Material Description for item " + (i + 1) + ".", "error");
            return false;
        }

        if (!quantityValue || !Number.isFinite(quantity) || quantity <= 0) {
            showMessage("Please enter a valid Quantity for item " + (i + 1) + ".", "error");
            return false;
        }

        hasCompleteMaterial = true;
    }

    if (!hasCompleteMaterial) {
        showMessage("Please enter at least one Material Description and Quantity.", "error");
        return false;
    }

    return true;
}

// ======================================
// NEW REQUISITION
// ======================================

function openNewRequisition() {
    const hasData = Array.from(document.querySelectorAll("#requisitionForm input")).some(function(input) {
        return input.id !== "requisitionNumber" && input.value.trim() !== "" && input.value !== "0";
    });

    if (hasData && !confirm("Start a new Material Requisition?\n\nAny information currently entered in this form will be cleared.")) {
        return;
    }

    editingIndex = null;

    document.querySelectorAll('#requisitionForm input[type="text"]').forEach(function(input) {
        input.value = "";
    });

    document.querySelectorAll('#requisitionForm input[type="number"]').forEach(function(input) {
        input.value = "0";
    });

    let counter = parseInt(localStorage.getItem("requisitionCounter")) || 0;
    counter++;
    localStorage.setItem("requisitionCounter", counter);

    document.getElementById("requisitionNumber").value =
        "GDRL-PL-MRF-2026"

    resetMaterialRows();
    resetApprovalRows();
    calculateTotal();
    setSaveMode(false);

    document.getElementById("requisitionForm").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function resetMaterialRows() {
    document.querySelectorAll("#materialRows tr").forEach(function(row) {
        row.querySelector(".material").value = "";
        row.querySelector(".quantity-input").value = "0";
        row.querySelector(".cost-input").value = "";
        row.querySelector(".remarks").value = "";
        row.querySelector(".amount-cell").textContent = "0.00";
    });
}

function resetApprovalRows() {
    document.querySelectorAll(".approval-table tbody tr").forEach(function(row) {
        row.querySelectorAll("input").forEach(function(input) {
            input.value = "";
        });
    });
}

// ======================================
// GET FORM DATA
// ======================================

function getFormData() {
    const form = document.getElementById("requisitionForm");

    const dateOfRequest = form.querySelector('.left-info .info-row:nth-child(1) input').value.trim();
    const requestedBy = form.querySelector('.left-info .info-row:nth-child(2) input').value.trim();
    const projectTitle = form.querySelector('.left-info .info-row:nth-child(3) input').value.trim();
    const client = form.querySelector('.right-info .info-row:nth-child(1) input').value.trim();
    const requisitionNumber = document.getElementById("requisitionNumber").value.trim();
    const department = form.querySelector('.right-info .info-row:nth-child(3) input').value.trim();
    const projectJobNo = form.querySelector('.right-info .info-row:nth-child(4) input').value.trim();

    const materials = [];

    document.querySelectorAll("#materialRows tr").forEach(function(row) {
        const material = row.querySelector(".material").value.trim();
        const quantity = row.querySelector(".quantity-input").value;
        const unitCost = row.querySelector(".cost-input").value;
        const amount = row.querySelector(".amount-cell").textContent;
        const remarks = row.querySelector(".remarks").value.trim();

        if (material || quantity !== "0" || unitCost !== "0" || remarks) {
            materials.push({ material, quantity, unitCost, amount, remarks });
        }
    });

    const approvalRows = document.querySelectorAll(".approval-table tbody tr");
    const approvals = Array.from(approvalRows).map(function(row) {
        const inputs = row.querySelectorAll("input");
        return {
            name: inputs[0]?.value.trim() || "",
            date: inputs[1]?.value.trim() || "",
            sign: inputs[2]?.value.trim() || ""
        };
    });

    return {
        requisitionNumber,
        dateOfRequest,
        requestedBy,
        projectTitle,
        client,
        department,
        projectJobNo,
        materials,
        total: document.getElementById("grandTotal").textContent,
        approvals,
        dateSaved: new Date().toLocaleString()
    };
}

// ======================================
// SAVE / UPDATE
// ======================================

function saveRequisition() {
    calculateTotal();

    if (!validateRequisition()) return;

    const requisition = getFormData();
    let requisitions = JSON.parse(localStorage.getItem("requisitions")) || [];

    if (editingIndex !== null) {
        requisition.dateSaved = requisitions[editingIndex]?.dateSaved || new Date().toLocaleString();
        requisitions[editingIndex] = requisition;
        localStorage.setItem("requisitions", JSON.stringify(requisitions));
        displayRequisitions();
        showMessage("Requisition " + requisition.requisitionNumber + " updated successfully.");
        setSaveMode(false);
        editingIndex = null;
        return;
    }

    requisitions.push(requisition);
    localStorage.setItem("requisitions", JSON.stringify(requisitions));
    displayRequisitions();
    showMessage("Requisition " + requisition.requisitionNumber + " saved successfully.");
}

function setSaveMode(isEditing) {
    const saveButton = document.getElementById("saveButton");
    const cancelButton = document.getElementById("cancelEditButton");

    if (isEditing) {
        saveButton.textContent = "Update Requisition";
        cancelButton.style.display = "inline-block";
    } else {
        saveButton.textContent = "Save Requisition";
        cancelButton.style.display = "none";
    }
}

function cancelEdit() {
    editingIndex = null;
    setSaveMode(false);
    showMessage("Edit cancelled.", "info");
}

// ======================================
// DISPLAY SAVED REQUISITIONS
// ======================================

function displayRequisitions() {
    const list = document.getElementById("requisitionList");
    if (!list) return;

    const searchInput = document.getElementById("searchRequisition");
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const requisitions = JSON.parse(localStorage.getItem("requisitions")) || [];

    list.innerHTML = "";

    const filtered = requisitions.map(function(requisition, index) {
        return { requisition, index };
    }).filter(function(item) {
        const r = item.requisition;
        const searchable = [
            r.requisitionNumber,
            r.dateOfRequest,
            r.requestedBy,
            r.projectTitle,
            r.department,
            r.client,
            r.projectJobNo,
            ...(r.materials || []).map(m => m.material)
        ].join(" ").toLowerCase();

        return searchable.includes(searchTerm);
    }).reverse();

    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 3;
        cell.textContent = searchTerm ? "No matching requisitions found." : "No saved requisitions found.";
        row.appendChild(cell);
        list.appendChild(row);
        return;
    }

    filtered.forEach(function(item) {
        const r = item.requisition;
        const row = document.createElement("tr");

        const noCell = document.createElement("td");
        noCell.textContent = r.requisitionNumber || "";

        const dateCell = document.createElement("td");
        dateCell.textContent = r.dateSaved || "";

        const actionCell = document.createElement("td");

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.textContent = "View";
        viewButton.onclick = () => viewRequisition(item.index);

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.onclick = () => editRequisition(item.index);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.onclick = () => deleteRequisition(item.index);

        actionCell.append(viewButton, editButton, deleteButton);
        row.append(noCell, dateCell, actionCell);
        list.appendChild(row);
    });
}

// ======================================
// VIEW / EDIT
// ======================================

function loadRequisition(index) {
    const requisitions = JSON.parse(localStorage.getItem("requisitions")) || [];
    const r = requisitions[index];

    if (!r) {
        showMessage("Requisition not found.", "error");
        return false;
    }

    const form = document.getElementById("requisitionForm");

    form.querySelector('.left-info .info-row:nth-child(1) input').value = r.dateOfRequest || "";
    form.querySelector('.left-info .info-row:nth-child(2) input').value = r.requestedBy || "";
    form.querySelector('.left-info .info-row:nth-child(3) input').value = r.projectTitle || "";
    form.querySelector('.right-info .info-row:nth-child(1) input').value = r.client || "";
    document.getElementById("requisitionNumber").value = r.requisitionNumber || "";
    form.querySelector('.right-info .info-row:nth-child(3) input').value = r.department || "";
    form.querySelector('.right-info .info-row:nth-child(4) input').value = r.projectJobNo || "";

    resetMaterialRows();

    const rows = document.querySelectorAll("#materialRows tr");
    (r.materials || []).forEach(function(m, index) {
        if (!rows[index]) return;
        rows[index].querySelector(".material").value = m.material || "";
        rows[index].querySelector(".quantity-input").value = m.quantity || "0";
        rows[index].querySelector(".cost-input").value = m.unitCost || "0";
        rows[index].querySelector(".remarks").value = m.remarks || "";
    });

    resetApprovalRows();
    (r.approvals || []).forEach(function(a, index) {
        const row = document.querySelectorAll(".approval-table tbody tr")[index];
        if (!row) return;
        const inputs = row.querySelectorAll("input");
        inputs[0].value = a.name || "";
        inputs[1].value = a.date || "";
        inputs[2].value = a.sign || "";
    });

    calculateTotal();
    setupDateInputs();

    form.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
}

function viewRequisition(index) {
    if (loadRequisition(index)) {
        editingIndex = null;
        setSaveMode(false);
        showMessage("Requisition loaded for viewing.", "info");
    }
}

function editRequisition(index) {
    if (loadRequisition(index)) {
        editingIndex = index;
        setSaveMode(true);
        showMessage("Edit mode enabled. Make your changes and click Update Requisition.", "info");
    }
}

// ======================================
// DELETE
// ======================================

function deleteRequisition(index) {
    const requisitions = JSON.parse(localStorage.getItem("requisitions")) || [];
    const r = requisitions[index];

    if (!r) {
        showMessage("Requisition not found.", "error");
        return;
    }

    if (!confirm("Are you sure you want to delete " + r.requisitionNumber + "?")) {
        return;
    }

    requisitions.splice(index, 1);
    localStorage.setItem("requisitions", JSON.stringify(requisitions));

    if (editingIndex === index) {
        editingIndex = null;
        setSaveMode(false);
    }

    displayRequisitions();
    showMessage("Requisition deleted successfully.");
}

// ======================================
// STARTUP
// ======================================

document.addEventListener("DOMContentLoaded", function() {
    setupDateInputs();

    document.querySelectorAll(".quantity-input, .cost-input").forEach(function(input) {
        input.addEventListener("input", calculateTotal);
    });

    displayRequisitions();
    calculateTotal();
});
