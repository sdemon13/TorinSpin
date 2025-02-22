require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔹 Авторизация через email
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const { user, error } = await supabase.auth.signUp({ email, password });

    if (error) return res.status(400).json(error);
    res.json(user);
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { user, session, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(400).json(error);
    res.json({ user, session });
});

// 🔹 Пополнение баланса
app.post('/deposit', async (req, res) => {
    const { email, amount } = req.body;
    if (amount < 1 || amount > 100) return res.status(400).json({ error: "Сумма от $1 до $100" });

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        payment_method_types: ['card'],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
});

// 🔹 Вывод средств (с комиссией 20%)
app.post('/withdraw', async (req, res) => {
    const { email, amount } = req.body;
    const finalAmount = amount * 0.8; // Учитываем комиссию 20%

    const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('email', email)
        .single();

    if (error || data.balance < amount) return res.status(400).json({ error: "Недостаточно средств" });

    await supabase.from('users').update({ balance: data.balance - amount }).eq('email', email);
    res.json({ message: "Вывод средств успешно отправлен!" });
});

app.listen(3000, () => console.log('✅ Сервер запущен на порту 3000'));
