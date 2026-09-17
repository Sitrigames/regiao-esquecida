 async function cadastrar() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const mensagem = document.getElementById("mensagem");

    if (!email || !senha) {
        mensagem.textContent = "Preencha o e-mail e a senha.";
        return;
    }

    if (senha.length < 6) {
        mensagem.textContent = "A senha precisa ter pelo menos 6 caracteres.";
        return;
    }

    mensagem.textContent = "Criando conta...";

    console.log("Iniciando cadastro...");
console.log("supabase existe?", typeof supabase);
console.log("supabaseClient existe?", typeof supabaseClient);

    try {
        const resultado = await supabaseClient.auth.signUp({
            email: email,
            password: senha
        });

        console.log("Resultado:", resultado);

        const { data, error } = resultado;

        if (error) {
            console.error("ERRO SUPABASE:", error);
            mensagem.textContent = "Erro: " + error.message;
            return;
        }

        mensagem.textContent =
            "Conta criada! Verifique seu e-mail para confirmar.";

        console.log("Conta criada:", data);

    } catch (erro) {
        console.error("ERRO COMPLETO:", erro);

        mensagem.textContent =
            "Erro ao conectar com o Supabase. Veja o Console (F12).";
    }
}