document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const depositBtn = document.getElementById('deposit');
    const withdrawBtn = document.getElementById('withdraw');
    const balanceSpan = document.getElementById('balance');

    async function fetchAPI(url, method, body) {
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error(`Ошибка API: ${error.message}`);
            alert(`Ошибка: ${error.message}`);
            return null;
        }
    }

    async function updateBalance(email) {
        const data = await fetchAPI('/getBalance', 'POST', { email });
        if (data && data.balance !== undefined) {
            balanceSpan.innerText = data.balance.toFixed(2);
        }
    }

    // 🔹 Регистрация
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                alert("Введите email и пароль!");
                return;
            }

            const data = await fetchAPI('/register', 'POST', { email, password });
            if (data) {
                alert("✅ Регистрация успешна! Теперь войдите в аккаунт.");
            }
        });
    }

    // 🔹 Вход
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                alert("Введите email и пароль!");
                return;
            }

            const data = await fetchAPI('/login', 'POST', { email, password });
            if (data) {
                localStorage.setItem('userEmail', email);
                alert("✅ Вход выполнен!");
                updateBalance(email);
            }
        });
    }

    // 🔹 Пополнение баланса
    if (depositBtn) {
        depositBtn.addEventListener('click', async () => {
            const email = localStorage.getItem('userEmail');
            if (!email) {
                alert("Сначала войдите в аккаунт!");
                return;
            }

            const amount = parseFloat(prompt("Введите сумму пополнения ($1 - $100):"));
            if (isNaN(amount) || amount < 1 || amount > 100) {
                alert("Ошибка! Введите сумму от $1 до $100.");
                return;
            }

            const data = await fetchAPI('/deposit', 'POST', { email, amount });
            if (data) {
                alert(`Перейдите по ссылке для оплаты: ${data.clientSecret}`);
                updateBalance(email);
            }
        });
    }

    // 🔹 Вывод средств
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', async () => {
            const email = localStorage.getItem('userEmail');
            if (!email) {
                alert("Сначала войдите в аккаунт!");
                return;
            }

            const amount = parseFloat(prompt("Введите сумму для вывода:"));
            if (isNaN(amount) || amount <= 0) {
                alert("Ошибка! Введите корректную сумму.");
                return;
            }

            const data = await fetchAPI('/withdraw', 'POST', { email, amount });
            if (data) {
                alert(data.message);
                updateBalance(email);
            }
        });
    }

    // 🔹 Автообновление баланса после входа
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        updateBalance(savedEmail);
    }

    // 🔹 Обработчик выбора игры
    const buttons = document.querySelectorAll(".game-card button");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            alert(`Вы выбрали игру: ${button.parentElement.querySelector("h3").innerText}`);
        });
    });
});
