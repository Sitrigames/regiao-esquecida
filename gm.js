async function carregarFichasGM() {
    const mensagem = document.getElementById("mensagem");
    const lista = document.getElementById("listaFichas");

    // Verifica se o usuário está logado
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Verifica se é GM
    const { data: perfil, error: erroPerfil } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (erroPerfil || !perfil || perfil.role !== "gm") {
        mensagem.textContent = "Acesso negado.";
        return;
    }

    // Busca todas as fichas
    const { data: fichas, error } = await supabaseClient
        .from("fichas")
        .select("*")
        .order("nome");

    if (error) {
        console.error(error);
        mensagem.textContent = "Erro ao carregar as fichas.";
        return;
    }

    lista.innerHTML = "";

    if (!fichas || fichas.length === 0) {
        mensagem.textContent = "0 ficha(s) encontrada(s).";
        return;
    }

    mensagem.textContent = `${fichas.length} ficha(s) encontrada(s).`;

    fichas.forEach(ficha => {

        const card = document.createElement("div");
        card.className = "ficha-gm";

        // =========================
        // GOLPES
        // =========================

        let golpesHTML = "";

        if (ficha.golpes && Array.isArray(ficha.golpes)) {

            ficha.golpes.forEach((golpe, index) => {

                if (!golpe.nome) return;

                golpesHTML += `
                    <div class="golpe-gm">
                        <h4>Golpe ${index + 1}: ${golpe.nome}</h4>

                        <p><strong>Tipo:</strong> ${golpe.tipo || "-"}</p>
                        <p><strong>Categoria:</strong> ${golpe.categoria || "-"}</p>
                        <p><strong>Dano:</strong> ${golpe.dano || "-"}</p>
                        <p><strong>Precisão:</strong> ${golpe.precisao || "-"}</p>
                    </div>
                `;
            });
        }

        if (!golpesHTML) {
            golpesHTML = `<p>Nenhum golpe cadastrado.</p>`;
        }

        // =========================
        // CARD DA FICHA
        // =========================

        card.innerHTML = `
            <h2>${ficha.nome || "Sem nome"}</h2>

            <p>
                <strong>Espécie:</strong>
                ${ficha.especie || "-"}
            </p>

            <p>
                <strong>Tipo:</strong>
                ${ficha.tipo1 || "-"}
                ${ficha.tipo2 ? " / " + ficha.tipo2 : ""}
            </p>

            <p>
                <strong>Habilidade:</strong>
                ${ficha.habilidade || "Nenhuma"}
            </p>

            <hr>

            <h3>Progressão</h3>

            <p>
                <strong>Nível:</strong>
                ${ficha.nivel}
            </p>

            <p>
                <strong>XP:</strong>
                ${ficha.xp}
            </p>

            <h3>HP</h3>

            <p>
                <strong>HP:</strong>
                ${ficha.hp_atual} / ${ficha.hp_maximo}
            </p>

            <h3>PP dos Golpes</h3>

            <p>
                <strong>PP:</strong>
                ${ficha.pp ?? 30} / 30
            </p>

            <h3>Condição</h3>

            <p>
                <strong>Estado:</strong>
                ${ficha.condicao || "Normal"}
            </p>

            <h3>Item Equipado</h3>

            <p>
                <strong>Item:</strong>
                ${ficha.item_equipado || "Nenhum"}
            </p>

            <h3>Inventário</h3>

            <div class="inventario-gm">
                ${
                    ficha.inventario && ficha.inventario.length > 0
                    ? ficha.inventario.map(item => `
                        <div class="item-gm">
                            <strong>${item.nome}</strong>
                            <span>× ${item.quantidade}</span>
                        </div>
                    `).join("")
                    : "<p>Nenhum item no inventário.</p>"
                }
            </div>

            <h3>Atributos</h3>

            <div class="atributos-gm">

                <div>
                    <strong>AT</strong>
                    <span>${ficha.at}</span>
                </div>

                <div>
                    <strong>DF</strong>
                    <span>${ficha.df}</span>
                </div>

                <div>
                    <strong>SA</strong>
                    <span>${ficha.sa}</span>
                </div>

                <div>
                    <strong>SD</strong>
                    <span>${ficha.sd}</span>
                </div>

                <div>
                    <strong>SP</strong>
                    <span>${ficha.sp}</span>
                </div>

            </div>

            <h3>Golpes</h3>

            <div class="golpes-gm">
                ${golpesHTML}
            </div>
        `;

        lista.appendChild(card);
    });
}

carregarFichasGM();
