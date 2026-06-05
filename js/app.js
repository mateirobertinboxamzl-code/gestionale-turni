// Gestionale Turni - Main Application

class TurniApp {
    constructor() {
        this.currentWeekStart = this.getWeekStart(new Date());
        this.selectedCell = null;
        
        this.data = this.loadData();
        
        this.init();
    }

    getDefaultData() {
        return {
            employees: ['Jessica', 'Filippo', 'Valentina', 'Erika', 'Rosanna', 'Marina', 'Alessandro', 'Noemi'],
            shifts: {
                mattina: ['7:00 - 12:00', '7:30 - 12:00', '7:30 - 13:00', '8:00 - 12:00', '8:30 - 14:00'],
                pomeriggio: ['14:00 - 18:00', '14:00 - 21:30', '15:00 - 21:30'],
                sera: ['18:00 - 21:30', '18:00 - 22:00']
            },
            schedule: {}
        };
    }

    loadData() {
        const saved = localStorage.getItem('turniApp');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return this.getDefaultData();
            }
        }
        return this.getDefaultData();
    }

    saveData() {
        localStorage.setItem('turniApp', JSON.stringify(this.data));
    }

    init() {
        this.bindEvents();
        this.renderWeek();
        this.renderSchedule();
        this.renderShiftOptions();
        this.renderEmployeeList();
        this.renderPresets();
        this.registerServiceWorker();
    }

    bindEvents() {
        // Week navigation
        document.getElementById('btnPrevWeek').addEventListener('click', () => this.changeWeek(-7));
        document.getElementById('btnNextWeek').addEventListener('click', () => this.changeWeek(7));
        document.getElementById('btnToday').addEventListener('click', () => this.goToToday());

        // Settings modal
        document.getElementById('btnSettings').addEventListener('click', () => this.openModal('modalSettings'));
        document.getElementById('btnCloseSettings').addEventListener('click', () => this.closeModal('modalSettings'));

        // Shift modal
        document.getElementById('btnCloseModal').addEventListener('click', () => this.closeModal('modalShift'));
        document.getElementById('btnRemoveShift').addEventListener('click', () => this.removeShift());
        document.getElementById('btnAddCustomShift').addEventListener('click', () => this.addCustomShift());

        // Modal overlay click to close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });

        // Settings tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Add employee
        document.getElementById('btnAddEmployee').addEventListener('click', () => this.addEmployee());
        document.getElementById('newEmployeeName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addEmployee();
        });

        // Add presets
        document.querySelectorAll('.btn-add-preset').forEach(btn => {
            btn.addEventListener('click', (e) => this.addPreset(e.target.dataset.category));
        });
        document.querySelectorAll('.add-preset input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addPreset(input.dataset.category);
            });
        });

        // Data management
        document.getElementById('btnExportData').addEventListener('click', () => this.exportData());
        document.getElementById('btnImportData').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });
        document.getElementById('importFileInput').addEventListener('change', (e) => this.importData(e));
        document.getElementById('btnResetData').addEventListener('click', () => this.resetData());

        // Export button - opens export modal
        document.getElementById('btnExport').addEventListener('click', () => this.openModal('modalExport'));
        document.getElementById('btnCloseExport').addEventListener('click', () => this.closeModal('modalExport'));
        
        // Export options
        document.getElementById('btnExportImage').addEventListener('click', () => this.exportAsImage());
        document.getElementById('btnExportPDF').addEventListener('click', () => this.exportAsPDF());
        document.getElementById('btnShareWhatsApp').addEventListener('click', () => this.shareWhatsApp());

        // Shift buttons click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('shift-btn') && !e.target.classList.contains('btn-remove-shift')) {
                this.assignShift(e.target.dataset.shift, e.target.dataset.type || this.getShiftType(e.target));
            }
        });
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatDateDisplay(date) {
        return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    }

    changeWeek(days) {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + days);
        this.renderWeek();
        this.renderSchedule();
    }

    goToToday() {
        this.currentWeekStart = this.getWeekStart(new Date());
        this.renderWeek();
        this.renderSchedule();
    }

    renderWeek() {
        const endDate = new Date(this.currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);
        
        const startStr = this.formatDateDisplay(this.currentWeekStart);
        const endStr = this.formatDateDisplay(endDate);
        
        document.getElementById('weekRange').textContent = `${startStr} - ${endStr}`;
    }

    renderSchedule() {
        const table = document.getElementById('scheduleTable');
        const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        const today = this.formatDate(new Date());
        
        let html = '<div class="schedule-cell header-cell"></div>';
        
        // Header row with days
        for (let i = 0; i < 7; i++) {
            const date = new Date(this.currentWeekStart);
            date.setDate(date.getDate() + i);
            const dateStr = this.formatDate(date);
            const isToday = dateStr === today;
            const dayNum = date.getDate();
            
            html += `<div class="schedule-cell header-cell ${isToday ? 'today' : ''}" data-date="${dateStr}">
                ${days[i]}<br>${dayNum}
            </div>`;
        }
        
        // Employee rows
        this.data.employees.forEach(employee => {
            html += `<div class="schedule-cell employee-cell">${employee}</div>`;
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(this.currentWeekStart);
                date.setDate(date.getDate() + i);
                const dateStr = this.formatDate(date);
                const key = `${employee}_${dateStr}`;
                const shift = this.data.schedule[key];
                
                let cellClass = 'schedule-cell shift-cell';
                let content = '';
                
                if (shift) {
                    cellClass += ` ${shift.type}`;
                    content = shift.label;
                } else {
                    cellClass += ' empty';
                }
                
                html += `<div class="${cellClass}" data-employee="${employee}" data-date="${dateStr}">${content}</div>`;
            }
        });
        
        table.innerHTML = html;
        
        // Add click events to shift cells
        table.querySelectorAll('.shift-cell').forEach(cell => {
            cell.addEventListener('click', () => this.openShiftModal(cell));
        });
    }

    renderShiftOptions() {
        const mattinaContainer = document.getElementById('shiftsMattina');
        const pomeriggioContainer = document.getElementById('shiftsPomeriggio');
        const seraContainer = document.getElementById('shiftsSera');
        
        mattinaContainer.innerHTML = this.data.shifts.mattina
            .map(s => `<button class="shift-btn mattina" data-shift="${s}" data-type="mattina">${s}</button>`)
            .join('');
            
        pomeriggioContainer.innerHTML = this.data.shifts.pomeriggio
            .map(s => `<button class="shift-btn pomeriggio" data-shift="${s}" data-type="pomeriggio">${s}</button>`)
            .join('');
            
        seraContainer.innerHTML = this.data.shifts.sera
            .map(s => `<button class="shift-btn sera" data-shift="${s}" data-type="sera">${s}</button>`)
            .join('');
    }

    openShiftModal(cell) {
        this.selectedCell = {
            employee: cell.dataset.employee,
            date: cell.dataset.date
        };
        
        const modalTitle = document.getElementById('modalTitle');
        const date = new Date(this.selectedCell.date);
        const dayName = date.toLocaleDateString('it-IT', { weekday: 'long' });
        modalTitle.textContent = `${this.selectedCell.employee} - ${dayName}`;
        
        this.openModal('modalShift');
    }

    assignShift(label, type) {
        if (!this.selectedCell) return;
        
        const key = `${this.selectedCell.employee}_${this.selectedCell.date}`;
        this.data.schedule[key] = { label, type };
        this.saveData();
        this.renderSchedule();
        this.closeModal('modalShift');
        this.showToast('Turno assegnato!');
    }

    removeShift() {
        if (!this.selectedCell) return;
        
        const key = `${this.selectedCell.employee}_${this.selectedCell.date}`;
        delete this.data.schedule[key];
        this.saveData();
        this.renderSchedule();
        this.closeModal('modalShift');
        this.showToast('Turno rimosso');
    }

    addCustomShift() {
        const input = document.getElementById('customShiftInput');
        const select = document.getElementById('customShiftType');
        const value = input.value.trim();
        
        if (!value) {
            this.showToast('Inserisci un orario');
            return;
        }
        
        this.assignShift(value, select.value);
        input.value = '';
    }

    getShiftType(button) {
        if (button.classList.contains('mattina')) return 'mattina';
        if (button.classList.contains('pomeriggio')) return 'pomeriggio';
        if (button.classList.contains('sera')) return 'sera';
        if (button.classList.contains('riposo')) return 'riposo';
        if (button.classList.contains('ferie')) return 'ferie';
        if (button.classList.contains('malattia')) return 'malattia';
        if (button.classList.contains('permesso')) return 'permesso';
        return 'mattina';
    }

    // Settings - Employees
    renderEmployeeList() {
        const list = document.getElementById('employeeList');
        list.innerHTML = this.data.employees
            .map(emp => `
                <li>
                    <span>${emp}</span>
                    <button class="btn-delete" data-employee="${emp}">×</button>
                </li>
            `)
            .join('');
        
        list.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => this.removeEmployee(btn.dataset.employee));
        });
    }

    addEmployee() {
        const input = document.getElementById('newEmployeeName');
        const name = input.value.trim();
        
        if (!name) {
            this.showToast('Inserisci un nome');
            return;
        }
        
        if (this.data.employees.includes(name)) {
            this.showToast('Dipendente già esistente');
            return;
        }
        
        this.data.employees.push(name);
        this.saveData();
        this.renderEmployeeList();
        this.renderSchedule();
        input.value = '';
        this.showToast('Dipendente aggiunto!');
    }

    removeEmployee(name) {
        if (!confirm(`Rimuovere ${name}?`)) return;
        
        this.data.employees = this.data.employees.filter(e => e !== name);
        
        // Remove all shifts for this employee
        Object.keys(this.data.schedule).forEach(key => {
            if (key.startsWith(name + '_')) {
                delete this.data.schedule[key];
            }
        });
        
        this.saveData();
        this.renderEmployeeList();
        this.renderSchedule();
        this.showToast('Dipendente rimosso');
    }

    // Settings - Presets
    renderPresets() {
        ['mattina', 'pomeriggio', 'sera'].forEach(category => {
            const container = document.getElementById(`preset${category.charAt(0).toUpperCase() + category.slice(1)}`);
            container.innerHTML = this.data.shifts[category]
                .map(shift => `
                    <div class="preset-item ${category}">
                        <span>${shift}</span>
                        <button data-category="${category}" data-shift="${shift}">×</button>
                    </div>
                `)
                .join('');
            
            container.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => this.removePreset(btn.dataset.category, btn.dataset.shift));
            });
        });
    }

    addPreset(category) {
        const input = document.querySelector(`.add-preset input[data-category="${category}"]`);
        const value = input.value.trim();
        
        if (!value) {
            this.showToast('Inserisci un orario');
            return;
        }
        
        if (this.data.shifts[category].includes(value)) {
            this.showToast('Turno già esistente');
            return;
        }
        
        this.data.shifts[category].push(value);
        this.saveData();
        this.renderPresets();
        this.renderShiftOptions();
        input.value = '';
        this.showToast('Turno aggiunto!');
    }

    removePreset(category, shift) {
        this.data.shifts[category] = this.data.shifts[category].filter(s => s !== shift);
        this.saveData();
        this.renderPresets();
        this.renderShiftOptions();
    }

    // Data Management
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `turni_backup_${this.formatDate(new Date())}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Dati esportati!');
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.employees && imported.shifts && imported.schedule) {
                    this.data = imported;
                    this.saveData();
                    this.renderSchedule();
                    this.renderEmployeeList();
                    this.renderPresets();
                    this.renderShiftOptions();
                    this.showToast('Dati importati con successo!');
                } else {
                    this.showToast('File non valido');
                }
            } catch (err) {
                this.showToast('Errore durante l\'importazione');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    resetData() {
        if (!confirm('Sei sicuro di voler cancellare tutti i dati? Questa azione non può essere annullata.')) return;
        
        this.data = this.getDefaultData();
        this.saveData();
        this.renderSchedule();
        this.renderEmployeeList();
        this.renderPresets();
        this.renderShiftOptions();
        this.showToast('Dati cancellati');
    }

    // Export Functions
    createExportableElement() {
        const wrapper = document.createElement('div');
        wrapper.className = 'export-wrapper';
        wrapper.style.cssText = 'background: white; padding: 20px; width: fit-content;';
        
        // Header
        const header = document.createElement('div');
        header.className = 'export-header';
        header.style.cssText = 'text-align: center; margin-bottom: 16px;';
        
        const title = document.createElement('h2');
        title.style.cssText = 'font-size: 1.4rem; color: #6366f1; margin-bottom: 4px;';
        title.textContent = '📅 Turni Settimanali';
        
        const subtitle = document.createElement('p');
        subtitle.style.cssText = 'font-size: 0.95rem; color: #64748b;';
        const endDate = new Date(this.currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);
        subtitle.textContent = `${this.formatDateDisplay(this.currentWeekStart)} - ${this.formatDateDisplay(endDate)}`;
        
        header.appendChild(title);
        header.appendChild(subtitle);
        wrapper.appendChild(header);
        
        // Clone and style the table
        const tableClone = document.getElementById('scheduleTable').cloneNode(true);
        tableClone.style.cssText = `
            display: grid;
            grid-template-columns: 120px repeat(7, 90px);
            gap: 2px;
            background: #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Style all cells
        tableClone.querySelectorAll('.schedule-cell').forEach(cell => {
            cell.style.cssText = `
                padding: 12px 8px;
                text-align: center;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 50px;
            `;
            
            if (cell.classList.contains('header-cell')) {
                cell.style.cssText += 'background: #6366f1; color: white; font-weight: 600;';
            } else if (cell.classList.contains('employee-cell')) {
                cell.style.cssText += 'background: #f1f5f9; font-weight: 600; justify-content: flex-start; padding-left: 10px;';
            } else if (cell.classList.contains('mattina')) {
                cell.style.cssText += 'background: #fef3c7; color: #92400e; font-weight: 600;';
            } else if (cell.classList.contains('pomeriggio')) {
                cell.style.cssText += 'background: #d1fae5; color: #065f46; font-weight: 600;';
            } else if (cell.classList.contains('sera')) {
                cell.style.cssText += 'background: #dbeafe; color: #1e40af; font-weight: 600;';
            } else if (cell.classList.contains('riposo')) {
                cell.style.cssText += 'background: #fee2e2; color: #991b1b; font-weight: 600;';
            } else if (cell.classList.contains('ferie')) {
                cell.style.cssText += 'background: #ede9fe; color: #5b21b6; font-weight: 600;';
            } else if (cell.classList.contains('malattia')) {
                cell.style.cssText += 'background: #ffedd5; color: #9a3412; font-weight: 600;';
            } else if (cell.classList.contains('permesso')) {
                cell.style.cssText += 'background: #f1f5f9; color: #334155; font-weight: 600;';
            } else {
                cell.style.cssText += 'background: white;';
            }
            
            // Remove empty cell pseudo-element content
            if (cell.classList.contains('empty')) {
                cell.textContent = '';
            }
        });
        
        wrapper.appendChild(tableClone);
        
        // Legend
        const legend = document.createElement('div');
        legend.style.cssText = 'display: flex; justify-content: center; gap: 20px; margin-top: 16px; flex-wrap: wrap;';
        
        const legendItems = [
            { color: '#fbbf24', label: 'Mattina' },
            { color: '#34d399', label: 'Pomeriggio' },
            { color: '#60a5fa', label: 'Sera' },
            { color: '#f87171', label: 'Riposo' }
        ];
        
        legendItems.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 0.8rem;';
            
            const dot = document.createElement('span');
            dot.style.cssText = `width: 14px; height: 14px; border-radius: 4px; background: ${item.color};`;
            
            const label = document.createElement('span');
            label.textContent = item.label;
            
            legendItem.appendChild(dot);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        });
        
        wrapper.appendChild(legend);
        
        return wrapper;
    }

    showLoading(show, text = 'Generazione in corso...') {
        let overlay = document.getElementById('loadingOverlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay hidden';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">${text}</div>
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.querySelector('.loading-text').textContent = text;
        overlay.classList.toggle('hidden', !show);
    }

    async exportAsImage() {
        this.showLoading(true, 'Generazione immagine...');
        this.closeModal('modalExport');
        
        try {
            const wrapper = this.createExportableElement();
            document.body.appendChild(wrapper);
            
            const canvas = await html2canvas(wrapper, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            document.body.removeChild(wrapper);
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `turni_${this.formatDate(this.currentWeekStart)}.png`;
                a.click();
                URL.revokeObjectURL(url);
                
                this.showLoading(false);
                this.showToast('Immagine scaricata!');
            }, 'image/png');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showLoading(false);
            this.showToast('Errore durante l\'export');
        }
    }

    async exportAsPDF() {
        this.showLoading(true, 'Generazione PDF...');
        this.closeModal('modalExport');
        
        try {
            const wrapper = this.createExportableElement();
            document.body.appendChild(wrapper);
            
            const canvas = await html2canvas(wrapper, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            document.body.removeChild(wrapper);
            
            // Create PDF using canvas
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            // A4 dimensions in pixels at 96 DPI
            const a4Width = 595;
            const a4Height = 842;
            
            // Calculate scaling to fit A4
            const scale = Math.min(a4Width / imgWidth, a4Height / imgHeight) * 0.9;
            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;
            
            // Create a simple PDF using HTML
            const pdfWindow = window.open('', '_blank');
            pdfWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Turni ${this.formatDate(this.currentWeekStart)}</title>
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { margin: 0; display: flex; justify-content: center; padding-top: 20px; }
                        img { max-width: 100%; height: auto; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <img src="${imgData}" />
                    <script>
                        window.onload = function() { 
                            setTimeout(function() { window.print(); }, 500);
                        };
                    </script>
                </body>
                </html>
            `);
            pdfWindow.document.close();
            
            this.showLoading(false);
            this.showToast('Stampa/Salva come PDF dal browser');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showLoading(false);
            this.showToast('Errore durante l\'export');
        }
    }

    async shareWhatsApp() {
        this.showLoading(true, 'Preparazione condivisione...');
        this.closeModal('modalExport');
        
        try {
            const wrapper = this.createExportableElement();
            document.body.appendChild(wrapper);
            
            const canvas = await html2canvas(wrapper, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            document.body.removeChild(wrapper);
            
            // Try using Web Share API if available
            if (navigator.share && navigator.canShare) {
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], `turni_${this.formatDate(this.currentWeekStart)}.png`, { type: 'image/png' });
                    
                    if (navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                title: 'Turni Settimanali',
                                text: `Turni dal ${this.formatDateDisplay(this.currentWeekStart)}`,
                                files: [file]
                            });
                            this.showLoading(false);
                            this.showToast('Condivisione completata!');
                        } catch (shareError) {
                            if (shareError.name !== 'AbortError') {
                                this.fallbackShare(canvas);
                            } else {
                                this.showLoading(false);
                            }
                        }
                    } else {
                        this.fallbackShare(canvas);
                    }
                }, 'image/png');
            } else {
                this.fallbackShare(canvas);
            }
            
        } catch (error) {
            console.error('Share error:', error);
            this.showLoading(false);
            this.showToast('Errore durante la condivisione');
        }
    }

    fallbackShare(canvas) {
        // Fallback: download the image and show instructions
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `turni_${this.formatDate(this.currentWeekStart)}.png`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showLoading(false);
            this.showToast('Immagine scaricata! Condividila su WhatsApp');
        }, 'image/png');
    }

    // Modal Management
    openModal(id) {
        document.getElementById(id).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(id) {
        document.getElementById(id).classList.remove('active');
        document.body.style.overflow = '';
        this.selectedCell = null;
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
        });
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered');
            } catch (err) {
                console.log('Service Worker registration failed:', err);
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TurniApp();
});
