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


    // ==========================================
    // VERIFICAR SE É GM OU JOGADOR
    // ==========================================

    const user = data.user;

    console.log("USUÁRIO LOGADO:", user.id);

const { data: perfil, error: erroPerfil } =
    await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

console.log("PERFIL:", perfil);
console.log("ERRO PERFIL:", erroPerfil);
    
    if (erroPerfil || !perfil) {

        mensagem.textContent =
            "Não foi possível verificar o perfil.";

        return;
    }


    mensagem.textContent =
        "Login realizado!";


    // ==========================================
    // REDIRECIONAMENTO
    // ==========================================

    if (perfil.role === "gm") {

        window.location.href =
            "gm.html";

    } else {

        window.location.href =
            "ficha.html";

    }
}

    window.location.href =
        "ficha.html";
}
