async function entrar() {

    const email =
        document.getElementById("email").value;

    const senha =
        document.getElementById("senha").value;

    const mensagem =
        document.getElementById("mensagem");


    if (!email || !senha) {

        mensagem.textContent =
            "Preencha o e-mail e a senha.";

        return;
    }


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });


    if (error) {

        mensagem.textContent =
            "Erro: " + error.message;

        return;
    }


    mensagem.textContent =
        "Login realizado!";


    window.location.href =
        "ficha.html";
}