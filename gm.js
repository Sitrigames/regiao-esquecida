
function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

async function carregarFichasGM() {
    const mensagem = document.getElementById("mensagem");
    const lista = document.getElementById("listaFichas");

    const { data: { user }, error: erroLogin } =
        await supabaseClient.auth.getUser();

    if (erroLogin || !user) {
        window.location.href = "login.html";
        return;
    }

    const { data: perfil, error: erroPerfil } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (erroPerfil || !perfil || perfil.role !== "gm") {
        mensagem.textContent = "Acesso negado.";
        lista.innerHTML = "";
        return;
    }

    await mostrarFichas();
}

async function mostrarFichas() {
    const mensagem = document.getElementById("mensagem");
    const lista = document.getElementById("listaFichas");

    mensagem.textContent = "Carregando fichas...";

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
        mensagem.textContent = "Nenhuma ficha encontrada.";
        return;
    }

    mensagem.textContent = `${fichas.length} ficha(s) encontrada(s).`;

    fichas.forEach(ficha => {
        const card = document.createElement("article");
        card.className = "ficha-gm";

        const nome = escaparHTML(ficha.nome || "Sem nome");
        const especie = escaparHTML(ficha.especie || "Espécie não definida");
        const tipo = [
            ficha.tipo1,
            ficha.tipo2
        ].filter(Boolean).map(escaparHTML).join(" / ") || "-";

        const nivel = Number(ficha.nivel ?? 5);
        const hpAtual = Number(ficha.hp_atual ?? 20);
        const hpMaximo = Number(ficha.hp_maximo ?? 20);
        const pp = Number(ficha.pp ?? 30);
        const condicao = escaparHTML(ficha.condicao || "Normal");

        const inventario = Array.isArray(ficha.inventario)
            ? ficha.inventario
            : [];

        const golpes = Array.isArray(ficha.golpes)
            ? ficha.golpes
            : [];

        const inventarioHTML = inventario.length
            ? inventario.map(item => `
                <div class="item-gm">
                    <span>${escaparHTML(item.nome || "Item")}</span>
                    <span>× ${escaparHTML(item.quantidade ?? 0)}</span>
                </div>
            `).join("")
            : "<p>Nenhum item no inventário.</p>";

        const golpesHTML = golpes.filter(golpe => golpe.nome).length
            ? golpes.map((golpe, index) => {
                if (!golpe.nome) return "";

                return `
                    <div class="golpe-gm">
                        <strong>${index + 1}. ${escaparHTML(golpe.nome)}</strong>
                        <p>Tipo: ${escaparHTML(golpe.tipo || "-")}</p>
                        <p>Categoria: ${escaparHTML(golpe.categoria || "-")}</p>
                        <p>Dano: ${escaparHTML(golpe.dano || "-")}</p>
                        <p>Precisão: ${escaparHTML(golpe.precisao || "-")}</p>
                    </div>
                `;
            }).join("")
            : "<p>Nenhum golpe cadastrado.</p>";

        card.innerHTML = `
            <div class="resumo-ficha-gm">
                <div class="identidade-gm">
                    <h3>${nome}</h3>
                    <p>${especie} · ${tipo}</p>
                </div>

                <div class="status-resumo-gm">
                    <span>Nv. ${nivel}</span>
                    <span>HP ${hpAtual}/${hpMaximo}</span>
                    <span>PP ${pp}/30</span>
                </div>
            </div>

            <div class="acoes-ficha-gm">
                <button type="button" class="botao-detalhes-gm">
                    Ver detalhes
                </button>

                <button type="button" class="botao-excluir-gm">
                    Excluir ficha
                </button>
            </div>

            <details class="detalhes-ficha-gm">
                <summary>Informações completas</summary>

                <div class="conteudo-detalhes-gm">
                    <p><strong>Habilidade:</strong>
                        ${escaparHTML(ficha.habilidade || "Nenhuma")}</p>

                    <h4>Progressão</h4>
                    <p><strong>Nível:</strong> ${nivel}</p>
                    <p><strong>XP:</strong> ${Number(ficha.xp ?? 0)}</p>
                    <p><strong>Pontos disponíveis:</strong>
                        ${Number(ficha.pontos ?? 0)}</p>

                    <h4>Combate</h4>
                    <p><strong>HP:</strong> ${hpAtual}/${hpMaximo}</p>
                    <p><strong>PP:</strong> ${pp}/30</p>
                    <p><strong>Condição:</strong> ${condicao}</p>
                    <p><strong>Item equipado:</strong>
                        ${escaparHTML(ficha.item_equipado || "Nenhum")}</p>

                    <h4>Atributos</h4>
                    <div class="atributos-gm">
                        <div><strong>AT</strong><span>${Number(ficha.at ?? 10)}</span></div>
                        <div><strong>DF</strong><span>${Number(ficha.df ?? 10)}</span></div>
                        <div><strong>SA</strong><span>${Number(ficha.sa ?? 10)}</span></div>
                        <div><strong>SD</strong><span>${Number(ficha.sd ?? 10)}</span></div>
                        <div><strong>SP</strong><span>${Number(ficha.sp ?? 10)}</span></div>
                    </div>

                    <h4>Inventário</h4>
                    <div class="inventario-gm">${inventarioHTML}</div>

                    <h4>Golpes</h4>
                    <div class="golpes-gm">${golpesHTML}</div>
                </div>
            </details>
        `;

        const detalhes = card.querySelector(".detalhes-ficha-gm");
        const botaoDetalhes = card.querySelector(".botao-detalhes-gm");
        const botaoExcluir = card.querySelector(".botao-excluir-gm");

        botaoDetalhes.addEventListener("click", () => {
            detalhes.open = !detalhes.open;
            botaoDetalhes.textContent = detalhes.open
                ? "Ocultar detalhes"
                : "Ver detalhes";
        });

        botaoExcluir.addEventListener("click", async () => {
            const nomeConfirmacao = ficha.nome || "Sem nome";

            const confirmar = window.confirm(
                `Tem certeza que deseja excluir a ficha de ${nomeConfirmacao}?\n\n` +
                "Essa ação apagará a ficha do banco de dados e não poderá ser desfeita."
            );

            if (!confirmar) return;

            botaoExcluir.disabled = true;
            botaoExcluir.textContent = "Excluindo...";

            const { data: removidos, error } = await supabaseClient
                .from("fichas")
                .delete()
                .eq("id", ficha.id)
                .select("id");

            if (error) {
                console.error(error);
                alert("Não foi possível excluir a ficha. Verifique as permissões de exclusão no Supabase.");
                botaoExcluir.disabled = false;
                botaoExcluir.textContent = "Excluir ficha";
                return;
            }

            if (!removidos || removidos.length === 0) {
                alert("Nenhuma ficha foi excluída. O Supabase pode estar bloqueando essa ação pelas políticas de segurança.");
                botaoExcluir.disabled = false;
                botaoExcluir.textContent = "Excluir ficha";
                return;
            }

            card.remove();

            const quantidade = lista.querySelectorAll(".ficha-gm").length;
            mensagem.textContent = `${quantidade} ficha(s) encontrada(s).`;

            if (quantidade === 0) {
                mensagem.textContent = "Nenhuma ficha encontrada.";
            }
        });

        lista.appendChild(card);
    });
}

carregarFichasGM();
