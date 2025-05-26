// Manejo avanzado del calendario
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.initializeControls();
    }
    
    initializeControls() {
        document.getElementById('prev-week').addEventListener('click', () => {
            this.currentDate.setDate(this.currentDate.getDate() - 7);
            this.updateWeekDisplay();
            loadAvailability();
        });
        
        document.getElementById('next-week').addEventListener('click', () => {
            this.currentDate.setDate(this.currentDate.getDate() + 7);
            this.updateWeekDisplay();
            loadAvailability();
        });
        
        this.updateWeekDisplay();
    }
    
    updateWeekDisplay() {
        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Ajuste para que la semana empiece en lunes
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 4); // Solo días laborables (L-V)
        
        const options = { day: 'numeric', month: 'long' };
        const startStr = startOfWeek.toLocaleDateString('es-ES', options);
        const endStr = endOfWeek.toLocaleDateString('es-ES', options);
        
        document.getElementById('current-week').textContent = `Semana del ${startStr} al ${endStr}`;
    }
    
    getCurrentWeekRange() {
        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Lunes
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 4); // Viernes
        
        return { start: startOfWeek, end: endOfWeek };
    }
}

// Inicializar calendario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.calendar = new Calendar();
});