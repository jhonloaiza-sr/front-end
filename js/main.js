const BACKEND_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', function() {
    // Inicialización de la aplicación
    initApp();
    
    // Manejadores de eventos
    document.getElementById('login-link').addEventListener('click', showLoginModal);
    document.getElementById('register-link').addEventListener('click', showRegisterModal);
    document.getElementById('logout-link').addEventListener('click', handleLogout);
    document.getElementById('dashboard-link').addEventListener('click', showDashboard);
    
    // Cerrar modal al hacer clic en la X
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('appointment-modal').classList.add('hidden');
        });
    });
    
    // Manejador del formulario de cita
    document.getElementById('appointment-form').addEventListener('submit', handleAppointmentSubmit);
    
    // Cargar disponibilidad inicial
    loadAvailability();
});

function initApp() {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('authToken');
    if (token) {
        updateAuthUI(true);
    } else {
        updateAuthUI(false);
    }
}

function updateAuthUI(isAuthenticated) {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const dashboardLink = document.getElementById('dashboard-link');
    const logoutLink = document.getElementById('logout-link');
    
    if (isAuthenticated) {
        loginLink.classList.add('hidden');
        registerLink.classList.add('hidden');
        dashboardLink.classList.remove('hidden');
        logoutLink.classList.remove('hidden');
    } else {
        loginLink.classList.remove('hidden');
        registerLink.classList.remove('hidden');
        dashboardLink.classList.add('hidden');
        logoutLink.classList.add('hidden');
    }
}

function showLoginModal() {
    // Implementar lógica para mostrar modal de login
    alert('Redirigiendo a la página de login...');
    // En una implementación real, esto cargaría un modal o redirigiría a login.html
}

function showRegisterModal() {
    // Implementar lógica para mostrar modal de registro
    alert('Redirigiendo a la página de registro...');
    // En una implementación real, esto cargaría un modal o redirigiría a register.html
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    updateAuthUI(false);
    alert('Sesión cerrada correctamente.');
}

function showDashboard() {
    const role = localStorage.getItem('userRole');
    if (role === 'staff') {
        // Redirigir al panel de administración
        window.location.href = 'views/admin.html';
    } else {
        // Redirigir al panel de paciente
        window.location.href = 'views/dashboard.html';
    }
}

function loadAvailability() {
    // Cambia la URL por la constante definida
    fetch(`${BACKEND_URL}/api/availability`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            renderCalendar(data);
        })
        .catch(error => {
            console.error('Error al cargar disponibilidad:', error);
            renderCalendar(getSampleAvailability());
            alert('Error cargando disponibilidad. Mostrando datos de ejemplo.');
        });
}

function renderCalendar(availability) {
    const calendarBody = document.getElementById('calendar-body');
    calendarBody.innerHTML = '';
    
    // Generar horas de 8:00 AM a 6:00 PM
    for (let hour = 8; hour <= 18; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = `${hour}:00 - ${hour + 1}:00`;
        calendarBody.appendChild(timeSlot);
        
        // Generar celdas para cada día (L-V)
        for (let day = 1; day <= 5; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            
            // Verificar si hay disponibilidad para esta hora y día
            const slotAvailable = availability.some(slot => {
                return slot.day === day && slot.hour === hour;
            });
            
            if (slotAvailable) {
                cell.classList.add('available');
                cell.addEventListener('click', () => openAppointmentModal(day, hour));
            } else {
                cell.classList.add('booked');
            }
            
            calendarBody.appendChild(cell);
        }
    }
}

function openAppointmentModal(day, hour) {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const modal = document.getElementById('appointment-modal');
    const form = document.getElementById('appointment-form');
    
    document.getElementById('selected-date').value = days[day - 1];
    document.getElementById('selected-time').value = `${hour}:00`;
    
    // Si el usuario está autenticado, rellenar automáticamente nombre y email
    const token = localStorage.getItem('authToken');
    if (token) {
        // En una implementación real, obtendrías estos datos del usuario autenticado
        document.getElementById('patient-name').value = 'Usuario Ejemplo';
        document.getElementById('patient-email').value = 'usuario@ejemplo.com';
    }
    
    modal.classList.remove('hidden');
}

function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    console.log("Iniciando reserva de cita..."); // Mensaje de depuración
    
    const formData = {
        date: document.getElementById('selected-date').value,
        time: document.getElementById('selected-time').value,
        name: document.getElementById('patient-name').value,
        email: document.getElementById('patient-email').value,
        notes: document.getElementById('appointment-notes').value
    };
    
    console.log("Datos a enviar:", formData); // Depuración
    
    // Enviar datos al backend
    fetch(`${BACKEND_URL}/api/appointments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log("Estado de la respuesta:", response.status); // Depuración
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        console.log("Respuesta exitosa:", data); // Depuración
        alert(data.message || 'Cita reservada con éxito. Se ha enviado una confirmación a tu correo.');
        document.getElementById('appointment-modal').classList.add('hidden');
        loadAvailability(); // Recargar disponibilidad
    })
    .catch(error => {
        console.error('Error completo:', error); // Depuración detallada
        alert(error.message || 'Hubo un error al reservar la cita. Por favor intenta nuevamente.');
    });
}

// Función de ejemplo para datos de disponibilidad
function getSampleAvailability() {
    const availability = [];
    const days = [1, 2, 3, 4, 5]; // Lunes a Viernes
    
    days.forEach(day => {
        // Disponibilidad en horas pares
        for (let hour = 8; hour <= 18; hour += 2) {
            availability.push({ day, hour });
        }
    });
    
    return availability;
}