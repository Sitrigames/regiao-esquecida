let fichaId = null;

let nivel = 5;
let xp = 0;

let hpMaximo = 20;
let hpAtual = 20;

let at = 10;
let df = 10;
let sa = 10;
let sd = 10;
let sp = 10;

// Pontos disponíveis para distribuir
let pontos = 10;


// ==========================================
// INICIAR FICHA
// ==========================================

async function iniciarFicha() {

    const { data: { user } } =
        await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    await carregarFicha(user.id);
}


// ==========================================
// CARREGAR FICHA
// ==========================================

async function carregarFicha(userId) {

    const { data, error } = await supabaseClient
        .from("fichas")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {

        console.error(error);

        const mensagem =
            document.getElementById("mensagem");

        if (mensagem) {
            mensagem.textContent =
                "Erro ao carregar a ficha.";
        }

        return;
    }


    // ======================================
    // FICHA NOVA
    // ======================================

    if (!data) {

        const { data: novaFicha, error: erroCriacao } =
            await supabaseClient
                .from("fichas")
                .insert({
                    user_id: userId,
                    pontos: 10
                })
                .select()
                .single();

        if (erroCriacao) {

            console.error(erroCriacao);
            return;
        }

        fichaId = novaFicha.id;

        pontos = 10;

    }


    // ======================================
    // FICHA EXISTENTE
    // ======================================

    else {

        fichaId = data.id;

        nivel = data.nivel ?? 5;
        xp = data.xp ?? 0;

        hpMaximo = data.hp_maximo ?? 20;
        hpAtual = data.hp_atual ?? 20;

        at = data.at ?? 10;
        df = data.df ?? 10;
        sa = data.sa ?? 10;
        sd = data.sd ?? 10;
        sp = data.sp ?? 10;


        // Fichas antigas que ainda não receberam
        // os 10 pontos recebem agora.
        if (
            data.pontos === null ||
            data.pontos === undefined
        ) {

            pontos = 10;

            await supabaseClient
                .from("fichas")
                .update({
                    pontos: 10
                })
                .eq("id", fichaId);

        } else {

            pontos = data.pontos;
        }


        // ==================================
        // INFORMAÇÕES
        // ==================================

        const nome =
            document.getElementById("nome");

        const especie =
            document.getElementById("especie");

        const tipo1 =
            document.getElementById("tipo1");

        const tipo2 =
            document.getElementById("tipo2");

        const habilidade =
            document.getElementById("habilidade");


        if (nome)
            nome.value = data.nome ?? "";

        if (especie)
            especie.value = data.especie ?? "";

        if (tipo1)
            tipo1.value = data.tipo1 ?? "";

        if (tipo2)
            tipo2.value = data.tipo2 ?? "";

        if (habilidade)
            habilidade.value = data.habilidade ?? "";


        // ==================================
        // GOLPES
        // ==================================

        carregarGolpes(data.golpes ?? []);


        // ==================================
        // INVENTÁRIO
        // ==================================

        carregarInventario(data.inventario ?? []);


        const itemEquipado =
            document.getElementById("itemEquipado");

        if (itemEquipado) {
            itemEquipado.value =
                data.item_equipado ?? "";
        }


        const condicao =
            document.getElementById("condicao");

        if (condicao) {
            condicao.value =
                data.condicao ?? "Normal";
        }
    }


    atualizarTela();
    atualizarSlotsGolpes();


    // ======================================
    // VERIFICAR MORTE
    // ======================================

    if (hpAtual <= 0) {

        hpAtual = 0;

        atualizarTela();

        mostrarTelaMorte();
    }
}


// ==========================================
// CARREGAR GOLPES
// ==========================================

function carregarGolpes(golpes) {

    golpes.forEach((golpe, index) => {

        const numero = index + 1;

        const nome =
            document.getElementById(
                `golpe${numero}Nome`
            );

        const tipo =
            document.getElementById(
                `golpe${numero}Tipo`
            );

        const categoria =
            document.getElementById(
                `golpe${numero}Categoria`
            );

        const dano =
            document.getElementById(
                `golpe${numero}Dano`
            );

        const precisao =
            document.getElementById(
                `golpe${numero}Precisao`
            );


        if (nome)
            nome.value = golpe.nome ?? "";

        if (tipo)
            tipo.value = golpe.tipo ?? "";

        if (categoria)
            categoria.value = golpe.categoria ?? "";

        if (dano)
            dano.value = golpe.dano ?? "";

        if (precisao)
            precisao.value = golpe.precisao ?? "";
    });
}


// ==========================================
// CARREGAR INVENTÁRIO
// ==========================================

function carregarInventario(inventario) {

    inventario.forEach((item, index) => {

        const numero = index + 1;

        const nome =
            document.getElementById(
                `item${numero}Nome`
            );

        const quantidade =
            document.getElementById(
                `item${numero}Quantidade`
            );


        if (nome) {
            nome.value = item.nome ?? "";
        }

        if (quantidade) {
            quantidade.value =
                item.quantidade ?? 0;
        }
    });
}


// ==========================================
// SALVAR FICHA
// ==========================================

async function salvarFicha() {

    if (!fichaId) {
        return;
    }


    // ======================================
    // GOLPES
    // ======================================

    const golpes = [];

    for (let i = 1; i <= 4; i++) {

        const nome =
            document.getElementById(
                `golpe${i}Nome`
            );

        const tipo =
            document.getElementById(
                `golpe${i}Tipo`
            );

        const categoria =
            document.getElementById(
                `golpe${i}Categoria`
            );

        const dano =
            document.getElementById(
                `golpe${i}Dano`
            );

        const precisao =
            document.getElementById(
                `golpe${i}Precisao`
            );


        if (
            nome &&
            nome.value.trim() !== ""
        ) {

            golpes.push({

                nome: nome.value,

                tipo: tipo
                    ? tipo.value
                    : "",

                categoria: categoria
                    ? categoria.value
                    : "",

                dano: dano
                    ? dano.value
                    : "",

                precisao: precisao
                    ? precisao.value
                    : ""
            });
        }
    }


    // ======================================
    // INVENTÁRIO
    // ======================================

    const inventario = [];

    for (let i = 1; i <= 5; i++) {

        const nome =
            document.getElementById(
                `item${i}Nome`
            );

        const quantidade =
            document.getElementById(
                `item${i}Quantidade`
            );


        if (
            nome &&
            nome.value.trim() !== ""
        ) {

            inventario.push({

                nome: nome.value,

                quantidade:
                    Number(
                        quantidade?.value
                    ) || 0
            });
        }
    }


    // ======================================
    // ITEM EQUIPADO
    // ======================================

    const itemEquipado =
        document.getElementById(
            "itemEquipado"
        );


    // ======================================
    // CONDIÇÃO
    // ======================================

    const condicao =
        document.getElementById(
            "condicao"
        );


    // ======================================
    // DADOS
    // ======================================

    const dados = {

        nome:
            document.getElementById("nome")?.value
            ?? "",

        especie:
            document.getElementById("especie")?.value
            ?? "",

        tipo1:
            document.getElementById("tipo1")?.value
            ?? "",

        tipo2:
            document.getElementById("tipo2")?.value
            ?? "",

        habilidade:
            document.getElementById("habilidade")?.value
            ?? "",


        nivel: nivel,
        xp: xp,


        hp_maximo: hpMaximo,
        hp_atual: hpAtual,


        at: at,
        df: df,
        sa: sa,
        sd: sd,
        sp: sp,


        pontos: pontos,


        golpes: golpes,


        inventario: inventario,


        item_equipado:
            itemEquipado
                ? itemEquipado.value
                : "",


        condicao:
            condicao
                ? condicao.value
                : "Normal",


        updated_at:
            new Date().toISOString()
    };


    const { error } =
        await supabaseClient
            .from("fichas")
            .update(dados)
            .eq("id", fichaId);


    if (error) {

        console.error(error);

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        if (mensagem) {
            mensagem.textContent =
                "❌ Erro ao salvar a ficha.";
        }

        return;
    }


    const mensagem =
        document.getElementById(
            "mensagem"
        );

    if (mensagem) {
        mensagem.textContent =
            "✅ Ficha salva!";
    }
}


// ==========================================
// XP
// ==========================================

function xpNecessario() {

    return 100 + ((nivel - 5) * 50);
}


async function adicionarXP() {

    const campo =
        document.getElementById(
            "xpGanho"
        );

    if (!campo) {
        return;
    }


    const ganho =
        Number(campo.value);


    if (!ganho || ganho <= 0) {
        return;
    }


    xp += ganho;

    campo.value = "";


    verificarLevelUp();


    atualizarTela();

    atualizarSlotsGolpes();


    await salvarFicha();
}


// ==========================================
// REMOVER XP
// ==========================================

async function removerXP() {

    const campo =
        document.getElementById(
            "xpGanho"
        );

    if (!campo) {
        return;
    }


    const valor =
        Number(campo.value);


    if (!valor || valor <= 0) {
        return;
    }


    xp -= valor;


    if (xp < 0) {
        xp = 0;
    }


    campo.value = "";


    atualizarTela();

    await salvarFicha();
}


// ==========================================
// LEVEL UP
// ==========================================

function verificarLevelUp() {

    while (
        xp >= xpNecessario()
    ) {

        xp -= xpNecessario();

        nivel++;


        // ==================================
        // AUMENTOS AUTOMÁTICOS
        // ==================================

        hpMaximo += 3;
        hpAtual += 3;

        at += 2;
        df += 2;
        sa += 2;
        sd += 2;
        sp += 2;


        // ==================================
        // 5 PONTOS A CADA 2 NÍVEIS
        // ==================================

        if (
            nivel >= 7 &&
            (nivel - 5) % 2 === 0
        ) {

            pontos += 5;
        }


        alert(
            `Você subiu para o nível ${nivel}!`
        );


        // ==================================
        // GOLPE 3
        // ==================================

        if (nivel === 18) {

            alert(
                "O 3º espaço de golpe foi desbloqueado!"
            );
        }


        // ==================================
        // GOLPE 4
        // ==================================

        if (nivel === 38) {

            alert(
                "O 4º espaço de golpe foi desbloqueado!"
            );
        }
    }
}


// ==========================================
// ESPAÇOS DE GOLPES
// ==========================================

function atualizarSlotsGolpes() {

    const bloqueio3 =
        document.getElementById(
            "bloqueioGolpe3"
        );

    const bloqueio4 =
        document.getElementById(
            "bloqueioGolpe4"
        );

    const campos3 =
        document.getElementById(
            "camposGolpe3"
        );

    const campos4 =
        document.getElementById(
            "camposGolpe4"
        );


    // ======================================
    // GOLPE 3
    // ======================================

    if (nivel >= 18) {

        if (bloqueio3)
            bloqueio3.style.display = "none";

        if (campos3)
            campos3.style.display = "block";

    } else {

        if (bloqueio3)
            bloqueio3.style.display = "block";

        if (campos3)
            campos3.style.display = "none";
    }


    // ======================================
    // GOLPE 4
    // ======================================

    if (nivel >= 38) {

        if (bloqueio4)
            bloqueio4.style.display = "none";

        if (campos4)
            campos4.style.display = "block";

    } else {

        if (bloqueio4)
            bloqueio4.style.display = "block";

        if (campos4)
            campos4.style.display = "none";
    }
}


// ==========================================
// RECEBER DANO
// ==========================================

function receberDano() {

    const campo =
        document.getElementById(
            "valorHP"
        );

    if (!campo) {
        return;
    }


    const valor =
        Number(campo.value);


    if (!valor || valor <= 0) {
        return;
    }


    hpAtual -= valor;

    campo.value = "";


    if (hpAtual <= 0) {

        hpAtual = 0;

        atualizarTela();

        salvarFicha();

        mostrarTelaMorte();

        return;
    }


    atualizarTela();

    salvarFicha();
}


// ==========================================
// RECEBER CURA
// ==========================================

function receberCura() {

    const campo =
        document.getElementById(
            "valorHP"
        );

    if (!campo) {
        return;
    }


    const valor =
        Number(campo.value);


    if (!valor || valor <= 0) {
        return;
    }


    hpAtual += valor;


    if (hpAtual > hpMaximo) {
        hpAtual = hpMaximo;
    }


    campo.value = "";


    atualizarTela();

    salvarFicha();
}


// ==========================================
// AUMENTAR ATRIBUTO
// ==========================================

function aumentarAtributo(atributo) {

    if (pontos <= 0) {
        return;
    }


    switch (atributo) {

        case "hp":

            hpMaximo += 1;
            hpAtual += 1;

            break;


        case "at":

            at += 1;

            break;


        case "df":

            df += 1;

            break;


        case "sa":

            sa += 1;

            break;


        case "sd":

            sd += 1;

            break;


        case "sp":

            sp += 1;

            break;


        default:

            return;
    }


    pontos--;


    atualizarTela();

    salvarFicha();
}


// ==========================================
// DIMINUIR ATRIBUTO
// ==========================================

function diminuirAtributo(atributo) {

    switch (atributo) {

        case "hp":

            if (hpMaximo <= 20) {
                return;
            }

            hpMaximo--;

            if (hpAtual > hpMaximo) {
                hpAtual = hpMaximo;
            }

            break;


        case "at":

            if (at <= 10) {
                return;
            }

            at--;

            break;


        case "df":

            if (df <= 10) {
                return;
            }

            df--;

            break;


        case "sa":

            if (sa <= 10) {
                return;
            }

            sa--;

            break;


        case "sd":

            if (sd <= 10) {
                return;
            }

            sd--;

            break;


        case "sp":

            if (sp <= 10) {
                return;
            }

            sp--;

            break;


        default:

            return;
    }


    pontos++;


    atualizarTela();

    salvarFicha();
}


// ==========================================
// ATUALIZAR TELA
// ==========================================

function atualizarTela() {

    // ======================================
    // NÍVEL
    // ======================================

    const nivelElemento =
        document.getElementById(
            "nivel"
        );

    if (nivelElemento) {

        nivelElemento.value = nivel;
        nivelElemento.textContent = nivel;
    }


    // ======================================
    // XP
    // ======================================

    const xpElemento =
        document.getElementById(
            "xp"
        );

    if (xpElemento) {

        xpElemento.value = xp;
        xpElemento.textContent = xp;
    }


    const necessarioElemento =
        document.getElementById(
            "xpNecessario"
        );

    if (necessarioElemento) {

        necessarioElemento.value =
            xpNecessario();

        necessarioElemento.textContent =
            xpNecessario();
    }


    // ======================================
    // HP
    // ======================================

    const hpAtualElemento =
        document.getElementById(
            "hpAtual"
        );

    if (hpAtualElemento) {

        hpAtualElemento.textContent =
            hpAtual;
    }


    const hpMaximoElemento =
        document.getElementById(
            "hpMaximo"
        );

    if (hpMaximoElemento) {

        hpMaximoElemento.textContent =
            hpMaximo;
    }


    const hpMaximoAtributo =
        document.getElementById(
            "hpMaximoAtributo"
        );

    if (hpMaximoAtributo) {

        hpMaximoAtributo.textContent =
            hpMaximo;
    }


    // ======================================
    // BARRA DE HP
    // ======================================

    const barra =
        document.getElementById(
            "barraHP"
        );

    if (barra) {

        let porcentagem =
            (hpAtual / hpMaximo) * 100;


        if (porcentagem < 0) {
            porcentagem = 0;
        }


        if (porcentagem > 100) {
            porcentagem = 100;
        }


        barra.style.width =
            `${porcentagem}%`;
    }


    // ======================================
    // ATRIBUTOS
    // ======================================

    const atElemento =
        document.getElementById("at");

    const dfElemento =
        document.getElementById("df");

    const saElemento =
        document.getElementById("sa");

    const sdElemento =
        document.getElementById("sd");

    const spElemento =
        document.getElementById("sp");


    if (atElemento)
        atElemento.textContent = at;

    if (dfElemento)
        dfElemento.textContent = df;

    if (saElemento)
        saElemento.textContent = sa;

    if (sdElemento)
        sdElemento.textContent = sd;

    if (spElemento)
        spElemento.textContent = sp;


    // ======================================
    // PONTOS
    // ======================================

    const pontosElemento =
        document.getElementById(
            "pontos"
        );

    if (pontosElemento) {

        pontosElemento.textContent =
            pontos;
    }
}


// ==========================================
// MOSTRAR TELA DE MORTE
// ==========================================

function mostrarTelaMorte() {

    const tela =
        document.getElementById(
            "telaMorte"
        );

    if (!tela) {

        console.error(
            "A tela de morte não foi encontrada."
        );

        return;
    }


    tela.style.display = "flex";
}


// ==========================================
// RESETAR FICHA
// ==========================================

async function resetarFicha() {

    const confirmar =
        confirm(
            "Tem certeza que deseja resetar a ficha inteira?"
        );


    if (!confirmar) {
        return;
    }


    // ======================================
    // INFORMAÇÕES
    // ======================================

    const nome =
        document.getElementById("nome");

    const especie =
        document.getElementById("especie");

    const tipo1 =
        document.getElementById("tipo1");

    const tipo2 =
        document.getElementById("tipo2");

    const habilidade =
        document.getElementById("habilidade");


    if (nome)
        nome.value = "";

    if (especie)
        especie.value = "";

    if (tipo1)
        tipo1.value = "";

    if (tipo2)
        tipo2.value = "";

    if (habilidade)
        habilidade.value = "";


    // ======================================
    // NÍVEL E XP
    // ======================================

    nivel = 5;
    xp = 0;


    // ======================================
    // HP
    // ======================================

    hpMaximo = 20;
    hpAtual = 20;


    // ======================================
    // ATRIBUTOS
    // ======================================

    at = 10;
    df = 10;
    sa = 10;
    sd = 10;
    sp = 10;


    // ======================================
    // PONTOS
    // ======================================

    // IMPORTANTE:
    // Uma ficha resetada volta a ter 10 pontos.
    pontos = 10;


    // ======================================
    // GOLPES
    // ======================================

    for (let i = 1; i <= 4; i++) {

        const campos = [

            `golpe${i}Nome`,
            `golpe${i}Tipo`,
            `golpe${i}Categoria`,
            `golpe${i}Dano`,
            `golpe${i}Precisao`
        ];


        campos.forEach(id => {

            const campo =
                document.getElementById(id);

            if (campo) {
                campo.value = "";
            }
        });
    }


    // ======================================
    // INVENTÁRIO
    // ======================================

    for (let i = 1; i <= 5; i++) {

        const nomeItem =
            document.getElementById(
                `item${i}Nome`
            );

        const quantidade =
            document.getElementById(
                `item${i}Quantidade`
            );


        if (nomeItem) {
            nomeItem.value = "";
        }

        if (quantidade) {
            quantidade.value = "";
        }
    }


    // ======================================
    // ITEM EQUIPADO
    // ======================================

    const itemEquipado =
        document.getElementById(
            "itemEquipado"
        );

    if (itemEquipado) {
        itemEquipado.value = "";
    }


    // ======================================
    // CONDIÇÃO
    // ======================================

    const condicao =
        document.getElementById(
            "condicao"
        );

    if (condicao) {
        condicao.value = "Normal";
    }


    // ======================================
    // ATUALIZAR
    // ======================================

    atualizarTela();

    atualizarSlotsGolpes();


    // ======================================
    // FECHAR TELA DE MORTE
    // ======================================

    const tela =
        document.getElementById(
            "telaMorte"
        );

    if (tela) {
        tela.style.display = "none";
    }


    // ======================================
    // SALVAR
    // ======================================

    await salvarFicha();
}


// ==========================================
// COMEÇAR
// ==========================================

iniciarFicha();
