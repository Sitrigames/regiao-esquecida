async function entrar() {

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const mensagem = document.getElementById("mensagem");

    if (!email || !senha) {
        mensagem.textContent = "Preencha o e-mail e a senha.";
        return;
    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

    if (error) {
        mensagem.textContent = "Erro: " + error.message;
        return;
    }

    const user = data.user;

    const { data: perfil, error: erroPerfil } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

    if (erroPerfil || !perfil) {
        console.error("Erro ao buscar perfil:", erroPerfil);
        mensagem.textContent = "Não foi possível verificar o perfil.";
        return;
    }

    console.log("Usuário:", user.id);
    console.log("Perfil:", perfil);

    mensagem.textContent = "Login realizado!";

    if (perfil.role === "gm") {
        window.location.href = "gm.html";
    } else {
        window.location.href = "ficha.html";
    }
}
