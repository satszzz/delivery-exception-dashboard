document.addEventListener('DOMContentLoaded', function () {

    // ============================
    // DOM Element References
    // ============================
    var form = document.getElementById('exception-form');
    var tableBody = document.getElementById('table-body');
    var emptyState = document.getElementById('empty-state');

    // Filter Elements
    var filterIssue = document.getElementById('filter-issue');
    var filterStatus = document.getElementById('filter-status');

    // Stat Counter Elements
    var countOpen = document.getElementById('count-open');
    var countResolved = document.getElementById('count-resolved');

    // ============================
    // Initialization
    // ============================
    updateStats();

    // ============================
    // Event Listeners
    // ============================

    // 1. Form Submission — validate, create row, reset
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Collect field values
        var deliveryId = document.getElementById('delivery-id').value.trim();
        var customerName = document.getElementById('customer-name').value.trim();
        var issueType = document.getElementById('issue-type').value;
        var priorityEl = document.querySelector('input[name="priority"]:checked');

        // Validate all required fields
        if (!deliveryId || !customerName || !issueType || !priorityEl) {
            alert('Please fill out all required fields (Delivery ID, Customer Name, Issue Type, and Priority).');
            return;
        }

        var priority = priorityEl.value;

        // Create the new table row
        addExceptionRow(deliveryId, customerName, issueType, priority, 'Open');

        // Reset and refresh UI
        form.reset();
        applyFilters();
        updateStats();
    });

    // 2. Table Actions — Event Delegation (single listener on tbody)
    tableBody.addEventListener('click', function (e) {
        var resolveBtn = e.target.closest('.btn-resolve');
        var deleteBtn = e.target.closest('.btn-delete');

        if (resolveBtn) {
            resolveIssue(resolveBtn.closest('tr'), resolveBtn);
            return;
        }

        if (deleteBtn) {
            deleteIssue(deleteBtn.closest('tr'));
        }
    });

    // 3. Filter Dropdowns
    filterIssue.addEventListener('change', applyFilters);
    filterStatus.addEventListener('change', applyFilters);

    // ============================
    // Core Functions
    // ============================

    /**
     * Creates a new <tr> element and appends it to the table body.
     * Applies priority badge colours and high-priority row highlighting.
     */
    function addExceptionRow(id, name, issue, priority, status) {
        var tr = document.createElement('tr');

        // Data attributes used for filtering
        tr.dataset.issue = issue;
        tr.dataset.status = status;

        // Highlight high-priority open issues with a warning background
        if (priority === 'High') {
            tr.classList.add('row-high-priority');
        }

        // Build cell content
        tr.innerHTML =
            '<td><strong>' + id + '</strong></td>' +
            '<td>' + name + '</td>' +
            '<td>' + issue + '</td>' +
            '<td><span class="badge badge-' + priority.toLowerCase() + '">' + priority + '</span></td>' +
            '<td><span class="badge badge-' + status.toLowerCase() + ' status-badge">' + status + '</span></td>' +
            '<td class="actions-cell">' +
            '<button type="button" class="btn btn-sm btn-success btn-resolve" title="Mark as Resolved">Resolve</button>' +
            '<button type="button" class="btn btn-sm btn-danger btn-delete" title="Delete Exception">Delete</button>' +
            '</td>';

        tableBody.appendChild(tr);
    }

    /**
     * Marks a row as resolved:
     * - Updates data attribute for filtering
     * - Adds "resolved-row" CSS class (light green bg + reduced opacity)
     * - Updates the status badge text and colour
     * - Disables the Resolve button (turns grey via CSS)
     */
    function resolveIssue(row, btn) {
        // Update data state
        row.dataset.status = 'Resolved';

        // Swap CSS classes
        row.classList.remove('row-high-priority');
        row.classList.add('resolved-row');

        // Update status badge
        var statusBadge = row.querySelector('.status-badge');
        statusBadge.className = 'badge badge-resolved status-badge';
        statusBadge.textContent = 'Resolved';

        // Disable the Resolve button (CSS makes it grey)
        btn.disabled = true;

        // Refresh counters and visible rows
        applyFilters();
        updateStats();
    }

    /**
     * Deletes a row after user confirms the action.
     */
    function deleteIssue(row) {
        if (confirm('Are you sure you want to delete this delivery exception?')) {
            row.remove();
            applyFilters();
            updateStats();
        }
    }

    /**
     * Shows or hides rows based on the selected Issue Type and Status filters.
     * Rows are NOT deleted — only toggled via the "hidden" CSS class.
     */
    function applyFilters() {
        var selectedIssue = filterIssue.value;
        var selectedStatus = filterStatus.value;
        var rows = tableBody.querySelectorAll('tr');
        var visibleCount = 0;

        rows.forEach(function (row) {
            var matchesIssue = (selectedIssue === 'All') || (row.dataset.issue === selectedIssue);
            var matchesStatus = (selectedStatus === 'All') || (row.dataset.status === selectedStatus);

            if (matchesIssue && matchesStatus) {
                row.classList.remove('hidden');
                visibleCount++;
            } else {
                row.classList.add('hidden');
            }
        });

        // Show empty-state message when filters produce zero visible rows
        if (visibleCount === 0 && rows.length > 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }

    /**
     * Recalculates and updates the Open / Resolved counters.
     * Called after every add, resolve, or delete action.
     */
    function updateStats() {
        var rows = tableBody.querySelectorAll('tr');
        var openCount = 0;
        var resolvedCount = 0;

        rows.forEach(function (row) {
            if (row.dataset.status === 'Open') {
                openCount++;
            } else if (row.dataset.status === 'Resolved') {
                resolvedCount++;
            }
        });

        countOpen.textContent = openCount;
        countResolved.textContent = resolvedCount;
    }
});
