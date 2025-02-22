app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // 🔹 Проверяем корректность email и пароля
    if (!email || !password || password.length < 6 || !email.includes("@")) {
        return res.status(400).json({ error: "Некорректный email или слабый пароль (минимум 6 символов)" });
    }

    try {
        // 🔹 Проверяем, существует ли уже пользователь
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: "Этот email уже зарегистрирован!" });
        }

        // 🔹 Регистрируем пользователя в Supabase Auth
        const { user, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            return res.status(400).json({ error: `Ошибка регистрации: ${error.message}` });
        }

        // 🔹 Добавляем пользователя в таблицу `users` с начальным балансом 0
        const { data, error: insertError } = await supabase
            .from('users')
            .insert([{ email, balance: 0 }]);

        if (insertError) {
            return res.status(500).json({ error: "Ошибка при создании пользователя в базе данных." });
        }

        res.json({ message: "✅ Успешная регистрация!", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка сервера при регистрации." });
    }
});
