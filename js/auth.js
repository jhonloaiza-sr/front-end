// auth.js - Manejo de autenticación y registro

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de login o registro
    if (window.location.pathname.includes('login.html')) {
        initLoginPage();
    } else if (window.location.pathname.includes('register.html')) {
        initRegisterPage();
    }
});

function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Enlace para ir a registro
    const registerLink = document.getElementById('go-to-register');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    }
}

function initRegisterPage() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Enlace para ir a login
    const loginLink = document.getElementById('go-to-login');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Guardar token y datos de usuario
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userName', data.user.name);
            
            // Redirigir al dashboard o página principal
            if (data.user.role === 'staff') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = '../index.html';
            }
        } else {
            showAlert(data.message || 'Error en el login', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const role = 'patient'; // Por defecto todos los registros son pacientes
    
    // Validación básica
    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'error');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Registro exitoso. Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showAlert(data.message || 'Error en el registro', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor', 'error');
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.auth-container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Función para verificar autenticación en otras páginas
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token && (window.location.pathname.includes('dashboard.html') || 
                   window.location.pathname.includes('admin.html'))) {
        window.location.href = 'login.html';
    }
}

// Llamar a checkAuth en páginas que requieran autenticación
if (window.location.pathname.includes('dashboard.html') || 
    window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', checkAuth);
}
