document.getElementById('deposit').addEventListener('click', async () => {
    const response = await fetch('/deposit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test@mail.com', amount: 10 })});
    const data = await response.json();
    alert(`Ссылка на оплату: ${data.clientSecret}`);
});

document.getElementById('withdraw').addEventListener('click', async () => {
    const response = await fetch('/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test@mail.com', amount: 10 })});
    const data = await response.json();
    alert(data.message);
});
