document.addEventListener('DOMContentLoaded', () => {
    const appState = {
        currentStart: 1,
        pageSize: 5,        // Number of items displayed per page
        totalItems: 7,       // Total available records
        activeView: 'list'
    };

    // Computed helper for current end
    function getCurrentEnd() {
        return Math.min(appState.currentStart + appState.pageSize - 1, appState.totalItems);
    }

    // Try It Yourself Animation
    const tryItBtn = document.getElementById('tryItBtn');
    const container = document.getElementById('appContainer');

    if (tryItBtn && container) {
        tryItBtn.addEventListener('click', () => {
            tryItBtn.style.backgroundColor = '#fdfdfd';
            tryItBtn.style.color = '#714B67';
            tryItBtn.style.boxShadow = '0 4px 12px rgba(113, 75, 103, 0.15)';
            tryItBtn.style.border = '1px solid #714B67';

            container.style.border = '2px solid #714B67';
            container.style.boxShadow = '0 0 15px rgba(113, 75, 103, 0.25)';

            setTimeout(() => {
                tryItBtn.style.backgroundColor = '#714B67';
                tryItBtn.style.color = '#ffffff';
                tryItBtn.style.boxShadow = 'none';
                tryItBtn.style.border = '1px solid #714B67';

                container.style.border = '1px solid #dee2e6';
                container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }, 1000);
        });
    }

    // Device Switcher Logic
    function setDevice(type, userClicked = false) {
        const buttons = document.querySelectorAll('.device-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        if (type === 'phone') {
            if (userClicked && container) container.style.width = '380px';
            document.getElementById('btnPhone')?.classList.add('active');
        } else if (type === 'tab') {
            if (userClicked && container) container.style.width = '640px';
            document.getElementById('btnTab')?.classList.add('active');
        } else {
            if (userClicked && container) container.style.width = '100%';
            document.getElementById('btnLaptop')?.classList.add('active');
        }
    }

    document.getElementById('btnPhone')?.addEventListener('click', () => setDevice('phone', true));
    document.getElementById('btnTab')?.addEventListener('click', () => setDevice('tab', true));
    document.getElementById('btnLaptop')?.addEventListener('click', () => setDevice('laptop', true));

    if (container) {
        setDevice('phone', false);
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const currentWidth = entry.contentRect.width;
                if (currentWidth >= 360 && currentWidth <= 540) {
                    setDevice('phone', false);
                } else if (currentWidth > 540 && currentWidth <= 720) {
                    setDevice('tab', false);
                } else if (currentWidth > 720) {
                    setDevice('laptop', false);
                }
            }
        });
        resizeObserver.observe(container);
    }

    // Pagination Controls
    const pageIndicator = document.getElementById('pageIndicator');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    function updateUI() {
        const currentEnd = getCurrentEnd();
        if (pageIndicator) pageIndicator.textContent = `${appState.currentStart}-${currentEnd} / ${appState.totalItems}`;
        if (prevBtn) prevBtn.style.opacity = appState.currentStart === 1 ? '0.5' : '1';
        if (nextBtn) nextBtn.style.opacity = currentEnd >= appState.totalItems ? '0.5' : '1';
    }

    updateUI();

    nextBtn?.addEventListener('click', () => {
        const currentEnd = getCurrentEnd();
        if (currentEnd < appState.totalItems) {
            appState.currentStart += appState.pageSize;
            if (appState.currentStart > appState.totalItems) {
                appState.currentStart = appState.totalItems;
            }
            updateUI();
        }
    });

    prevBtn?.addEventListener('click', () => {
        if (appState.currentStart > 1) {
            appState.currentStart = Math.max(1, appState.currentStart - appState.pageSize);
            updateUI();
        }
    });

    // View Switcher (List vs Kanban)
    const listView = document.getElementById('listView');
    const kanbanView = document.getElementById('kanbanView');

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.getAttribute('data-view');
            appState.activeView = type;

            if (type === 'kanban') {
                if (listView) listView.style.display = 'none';
                if (kanbanView) kanbanView.style.display = 'flex';
            } else {
                if (kanbanView) kanbanView.style.display = 'none';
                if (listView) listView.style.display = 'block';
            }
        });
    });

    // Selection & Toolbar Logic
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const searchInput = document.getElementById('searchInput');
    const selectionToolbar = document.getElementById('selectionToolbar');
    const selectionCount = document.getElementById('selectedCount');

    function updateSelectionState() {
        const checkedBoxes = Array.from(rowCheckboxes).filter(cb => cb.checked);
        const checkedCount = checkedBoxes.length;

        if (checkedCount > 0) {
            if (searchInput) searchInput.style.display = 'none';
            if (selectionToolbar) selectionToolbar.style.display = 'flex';
            if (selectionCount) selectionCount.textContent = checkedCount;
        } else {
            if (selectionToolbar) selectionToolbar.style.display = 'none';
            if (searchInput) searchInput.style.display = 'block';
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
        }
    }

    selectAllCheckbox?.addEventListener('change', (e) => {
        rowCheckboxes.forEach(cb => cb.checked = e.target.checked);
        updateSelectionState();
    });

    rowCheckboxes.forEach(cb => {
        cb.addEventListener('click', (e) => e.stopPropagation());
        cb.addEventListener('change', updateSelectionState);
    });

    document.getElementById('clearSelection')?.addEventListener('click', () => {
        rowCheckboxes.forEach(cb => cb.checked = false);
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        updateSelectionState();
    });

    // Search Filter Logic
    searchInput?.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        document.querySelectorAll('#listView tbody tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
        document.querySelectorAll('.kanban-card').forEach(card => {
            card.style.display = card.textContent.toLowerCase().includes(query) ? 'block' : 'none';
        });
    });

    // Helper function to dynamically load html2pdf if not already loaded
    function loadHtml2PdfScript(callback) {
        if (typeof html2pdf !== 'undefined') {
            callback();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Print & PDF Download functionality for Selected Patients
    document.getElementById('printBtn')?.addEventListener('click', () => {
        const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
        if (checkedBoxes.length === 0) {
            alert("Please select at least one patient record.");
            return;
        }

        let printContent = `
            <html>
            <head>
                <title>Patient_Management_Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 30px; color: #212529; }
                    .hospital-header { border-bottom: 2px solid #714B67; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
                    .hospital-title { font-size: 20px; font-weight: bold; color: #714B67; }
                    .patient-document { page-break-after: always; margin-bottom: 40px; border: 1px solid #dee2e6; padding: 20px; border-radius: 6px; }
                    .patient-name { font-size: 22px; font-weight: bold; margin-bottom: 15px; color: #212529; }
                    .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; margin-bottom: 10px; }
                    .page-footer { font-size: 11px; color: #777; margin-top: 20px; text-align: right; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
        `;

        checkedBoxes.forEach((cb, index) => {
            const row = cb.closest('tr');
            const cells = row.querySelectorAll('td');
            
            const fullName = cells[1] ? cells[1].textContent.trim() : 'N/A';
            const gender = cells[2] ? cells[2].textContent.trim() : 'N/A';
            const age = cells[3] ? cells[3].textContent.trim() : 'N/A';
            const status = cells[4] ? cells[4].textContent.trim() : 'N/A';
            const isMinor = cells[5] ? cells[5].textContent.trim() : 'N/A';
            const isActive = cells[6] ? cells[6].textContent.trim() : 'N/A';

            printContent += `
                <div class="patient-document">
                    <div class="hospital-header">
                        <div class="hospital-title">🏥 Hospital Management System</div>
                        <div>Official Patient Record</div>
                    </div>
                    <div class="patient-name">${fullName}</div>
                    <div class="patient-grid">
                        <div><strong>Gender:</strong> ${gender}</div>
                        <div><strong>Age:</strong> ${age}</div>
                        <div><strong>Status:</strong> ${status}</div>
                        <div><strong>Is Minor:</strong> ${isMinor}</div>
                        <div><strong>Active Record:</strong> ${isActive}</div>
                    </div>
                    <div class="page-footer">Record Report ${index + 1} of ${checkedBoxes.length}</div>
                </div>
            `;
        });

        printContent += `</body></html>`;

        // 1. Open Print Window / Dialog in a new tab immediately
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 500);
        }

        // 2. Dynamically load library and trigger PDF download file
        loadHtml2PdfScript(() => {
            const element = document.createElement('div');
            element.innerHTML = printContent;
            const opt = {
                margin:       10,
                filename:     'patient_records_report.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().from(element).set(opt).save();
        });
    });

    // Row clicks & record interaction handlers
    document.querySelectorAll('#listView tbody tr').forEach(row => {
        row.addEventListener('click', () => {
            const cells = row.querySelectorAll('td');
            const name = cells[1] ? cells[1].textContent.trim() : 'Record';
            alert(`Opening Odoo Form View for: "${name}"`);
        });
    });

    document.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.card-title')?.textContent.trim() || 'Record';
            alert(`Opening Odoo Form View for: "${title}"`);
        });
    });
});