require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Настраиваем заголовки, чтобы API всегда отвечало JSON
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// 🔹 Подключаем Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔹 Регистрация пользователя
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // 🔹 Проверяем корректность email и пароля
    if (!email || !password || password.length < 6 || !email.includes("@")) {
        return res.status(400).json({ error: "Некорректный email или слабый пароль (минимум 6 символов)" });
    }

    try {
        // 🔹 Регистрируем пользователя в Supabase Auth
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            return res.status(400).json({ error: `Ошибка регистрации: ${error.message}` });
        }

        // 🔹 Добавляем пользователя в таблицу `users` с балансом 0
        const { error: insertError } = await supabase
            .from('users')
            .insert([{ email, balance: 0 }]);

        if (insertError) {
            return res.status(500).json({ error: "Ошибка при создании пользователя в базе данных." });
        }

        res.json({ message: "✅ Успешная регистрация!", user: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка сервера при регистрации." });
    }
});

// 🔹 Авторизация пользователя
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Введите email и пароль" });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return res.status(400).json({ error: `Ошибка входа: ${error.message}` });
        }

        res.json({ message: "✅ Вход выполнен!", user: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка сервера при входе." });
    }
});

// 🔹 Экспортируем сервер для Vercel
module.exports = app;
