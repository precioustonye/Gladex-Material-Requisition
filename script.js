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
    resetSignatures();
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
    const approvalSignatureIds = ["requested", "reviewed", "approved"];
    const approvals = Array.from(approvalRows).map(function(row, index) {
        const inputs = row.querySelectorAll("input");
        return {
            name: inputs[0]?.value.trim() || "",
            date: inputs[1]?.value.trim() || "",
            sign: document.getElementById("signature-" + approvalSignatureIds[index])?.getAttribute("src") || ""
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
        signatures: getCurrentFormSignatures(),
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
        if (inputs[0]) inputs[0].value = a.name || "";
        if (inputs[1]) inputs[1].value = a.date || "";
    });

    restoreFormSignatures(r.signatures || {
        requested: r.approvals?.[0]?.sign || "",
        reviewed: r.approvals?.[1]?.sign || "",
        approved: r.approvals?.[2]?.sign || ""
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
// SIGNATURE SYSTEM
// ======================================

let activeSignatureId = null;
let signatureDrawing = false;
let signatureCanvasContext = null;
let signatureCanvas = null;

const SIGNATURE_STORAGE_KEY = "gladexSavedSignatures";

function getSavedSignatures() {
    try {
        return JSON.parse(localStorage.getItem(SIGNATURE_STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function setSavedSignatures(signatures) {
    localStorage.setItem(SIGNATURE_STORAGE_KEY, JSON.stringify(signatures));
}

function resizeSignatureCanvas() {
    if (!signatureCanvas) return;

    const rect = signatureCanvas.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    signatureCanvas.width = Math.round(rect.width * ratio);
    signatureCanvas.height = Math.round(rect.height * ratio);

    signatureCanvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    signatureCanvasContext.lineWidth = 2;
    signatureCanvasContext.lineCap = "round";
    signatureCanvasContext.lineJoin = "round";
    signatureCanvasContext.strokeStyle = "#111";
}

function getCanvasPoint(event) {
    const rect = signatureCanvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function startSignatureDrawing(event) {
    if (!signatureCanvasContext) return;

    event.preventDefault();
    signatureDrawing = true;

    const point = getCanvasPoint(event);

    signatureCanvasContext.beginPath();
    signatureCanvasContext.moveTo(point.x, point.y);

    if (signatureCanvas.setPointerCapture) {
        try {
            signatureCanvas.setPointerCapture(event.pointerId);
        } catch (error) {
            // Pointer capture is optional.
        }
    }
}

function drawSignature(event) {
    if (!signatureDrawing || !signatureCanvasContext) return;

    event.preventDefault();

    const point = getCanvasPoint(event);
    signatureCanvasContext.lineTo(point.x, point.y);
    signatureCanvasContext.stroke();
}

function stopSignatureDrawing(event) {
    if (!signatureDrawing) return;

    event.preventDefault();
    signatureDrawing = false;

    if (signatureCanvas && signatureCanvas.releasePointerCapture) {
        try {
            signatureCanvas.releasePointerCapture(event.pointerId);
        } catch (error) {
            // Pointer capture is optional.
        }
    }
}

function clearSignaturePad() {
    if (!signatureCanvas || !signatureCanvasContext) return;

    const rect = signatureCanvas.getBoundingClientRect();

    signatureCanvasContext.clearRect(0, 0, rect.width, rect.height);
}

function openSignaturePad(signatureId) {
    activeSignatureId = signatureId;

    const modal = document.getElementById("signatureModal");
    const title = document.getElementById("signatureModalTitle");

    if (!modal || !title) return;

    const titles = {
        requested: "Sign — Requested By",
        reviewed: "Sign — Reviewed By (Procurement)",
        approved: "Sign — Approved By (Head of Dept.)"
    };

    title.textContent = titles[signatureId] || "Add Signature";

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("signature-modal-open");

    requestAnimationFrame(function() {
        if (!signatureCanvas) {
            signatureCanvas = document.getElementById("signatureCanvas");
            if (signatureCanvas) {
                signatureCanvasContext = signatureCanvas.getContext("2d");
            }
        }

        resizeSignatureCanvas();
        clearSignaturePad();
        renderRecentSignatures();

        const panel = document.getElementById("recentSignaturesPanel");
        if (panel) panel.hidden = true;
    });
}

function closeSignaturePad() {
    const modal = document.getElementById("signatureModal");

    if (modal) {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
    }

    document.body.classList.remove("signature-modal-open");
    activeSignatureId = null;
    signatureDrawing = false;
}

function isCanvasBlank() {
    if (!signatureCanvas || !signatureCanvasContext) return true;

    const pixelData = signatureCanvasContext.getImageData(
        0,
        0,
        signatureCanvas.width,
        signatureCanvas.height
    ).data;

    for (let i = 3; i < pixelData.length; i += 4) {
        if (pixelData[i] !== 0) {
            return false;
        }
    }

    return true;
}

function askSignatureName() {
    let name = prompt("Enter a name for this saved signature:");

    if (name === null) return null;

    name = name.trim();

    if (!name) {
        showMessage("Please enter a name for the signature.", "error");
        return null;
    }

    return name.slice(0, 60);
}

function saveDrawnSignature() {
    if (!activeSignatureId || !signatureCanvas) return;

    if (isCanvasBlank()) {
        showMessage("Please draw a signature first.", "error");
        return;
    }

    const name = askSignatureName();
    if (!name) return;

    const dataUrl = signatureCanvas.toDataURL("image/png");

    const signatures = getSavedSignatures();

    signatures.unshift({
        id: Date.now().toString(),
        name: name,
        dataUrl: dataUrl
    });

    // Keep the most recent 20 named signatures.
    setSavedSignatures(signatures.slice(0, 20));

    applySignatureToBox(activeSignatureId, dataUrl);

    closeSignaturePad();
    showMessage('Signature "' + name + '" saved and added to the form.');
}

function applySignatureToBox(signatureId, dataUrl) {
    const box = document.querySelector('.signature-box[data-signature-id="' + signatureId + '"]');
    const image = document.getElementById("signature-" + signatureId);

    if (!box || !image) return;

    if (dataUrl) {
        image.src = dataUrl;
        image.style.display = "block";
        box.classList.add("has-signature");
    } else {
        image.removeAttribute("src");
        image.style.display = "none";
        box.classList.remove("has-signature");
    }
}

function getCurrentFormSignatures() {
    function getSignature(signatureId) {
        const box = document.querySelector('.signature-box[data-signature-id="' + signatureId + '"]');
        const image = document.getElementById("signature-" + signatureId);

        if (!box || !image || !box.classList.contains("has-signature")) {
            return "";
        }

        return image.getAttribute("src") || "";
    }

    return {
        requested: getSignature("requested"),
        reviewed: getSignature("reviewed"),
        approved: getSignature("approved")
    };
}

function resetSignatures() {
    ["requested", "reviewed", "approved"].forEach(function(signatureId) {
        applySignatureToBox(signatureId, "");
    });
}

function restoreFormSignatures(signatures) {
    const data = signatures || {};

    applySignatureToBox("requested", data.requested || "");
    applySignatureToBox("reviewed", data.reviewed || "");
    applySignatureToBox("approved", data.approved || "");
}

function toggleRecentSignatures() {
    const panel = document.getElementById("recentSignaturesPanel");
    if (!panel) return;

    panel.hidden = !panel.hidden;

    if (!panel.hidden) {
        renderRecentSignatures();
    }
}

function renderRecentSignatures() {
    const list = document.getElementById("recentSignaturesList");
    if (!list) return;

    const signatures = getSavedSignatures();

    list.innerHTML = "";

    if (signatures.length === 0) {
        const empty = document.createElement("p");
        empty.className = "no-signatures";
        empty.textContent = "No saved signatures yet.";
        list.appendChild(empty);
        return;
    }

    signatures.forEach(function(signature) {
        const item = document.createElement("div");
        item.className = "recent-signature-item";

        const useButton = document.createElement("button");
        useButton.type = "button";
        useButton.className = "recent-signature-use";
        useButton.title = "Use " + signature.name;

        const preview = document.createElement("img");
        preview.className = "recent-signature-preview";
        preview.src = signature.dataUrl;
        preview.alt = signature.name;

        const name = document.createElement("span");
        name.className = "recent-signature-name";
        name.textContent = signature.name;

        useButton.append(preview, name);

        useButton.onclick = function() {
            if (!activeSignatureId) return;

            applySignatureToBox(activeSignatureId, signature.dataUrl);
            closeSignaturePad();
            showMessage('Saved signature "' + signature.name + '" added to the form.');
        };

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-saved-signature";
        deleteButton.textContent = "Delete";
        deleteButton.title = "Delete " + signature.name;

        deleteButton.onclick = function() {
            if (!confirm('Delete saved signature "' + signature.name + '"?')) {
                return;
            }

            const remaining = getSavedSignatures().filter(function(item) {
                return item.id !== signature.id;
            });

            setSavedSignatures(remaining);
            renderRecentSignatures();
            showMessage('Saved signature "' + signature.name + '" deleted.', "info");
        };

        item.append(useButton, deleteButton);
        list.appendChild(item);
    });
}

window.addEventListener("beforeprint", function() {
    closeSignaturePad();
});

function initializeSignatureSystem() {
    signatureCanvas = document.getElementById("signatureCanvas");

    if (!signatureCanvas) return;

    signatureCanvasContext = signatureCanvas.getContext("2d");

    signatureCanvas.addEventListener("pointerdown", startSignatureDrawing);
    signatureCanvas.addEventListener("pointermove", drawSignature);
    signatureCanvas.addEventListener("pointerup", stopSignatureDrawing);
    signatureCanvas.addEventListener("pointercancel", stopSignatureDrawing);
    signatureCanvas.addEventListener("pointerleave", stopSignatureDrawing);

    window.addEventListener("resize", function() {
        const modal = document.getElementById("signatureModal");
        if (modal && modal.classList.contains("open")) {
            // Do not resize while actively drawing because canvas resizing clears it.
            if (!signatureDrawing) {
                resizeSignatureCanvas();
            }
        }
    });

    const modal = document.getElementById("signatureModal");

    if (modal) {
        modal.addEventListener("click", function(event) {
            if (event.target === modal) {
                closeSignaturePad();
            }
        });
    }

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            const currentModal = document.getElementById("signatureModal");

            if (currentModal && currentModal.classList.contains("open")) {
                closeSignaturePad();
            }
        }
    });
}


// ======================================
// STARTUP
// ======================================

document.addEventListener("DOMContentLoaded", function() {
    initializeSignatureSystem();
    setupDateInputs();

    document.querySelectorAll(".quantity-input, .cost-input").forEach(function(input) {
        input.addEventListener("input", calculateTotal);
    });

    displayRequisitions();
    calculateTotal();
});
