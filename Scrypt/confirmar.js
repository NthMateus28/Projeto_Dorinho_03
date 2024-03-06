document.addEventListener("DOMContentLoaded", () => {
    const telefoneInput = document.getElementById("telefone");

    // Função para aplicar a máscara de telefone e limitar o número de caracteres
    telefoneInput.addEventListener("input", function (event) {
        const input = event.target;
        const inputLength = input.value.length;

        if (isNaN(input.value[inputLength - 1])) {
            input.value = input.value.substring(0, inputLength - 1);
            return;
        }

        if (inputLength === 1) {
            input.value = `(${input.value}`;
        } else if (inputLength === 3) {
            input.value = `${input.value}) `;
        } else if (inputLength === 10) {
            input.value = `${input.value}-`;
        } else if (inputLength > 15) {
            input.value = input.value.substring(0, 15);
        }
    });

    const table = document.querySelector("table");
    let finalPrice = document.getElementById("finalPrice");
    let finalFrete = document.getElementById("finalFrete");
    let finalTotal = document.getElementById("finalTotal");
    const teleEntregaRadio = document.getElementById("teleEntrega");
    const tirarBalcaoRadio = document.getElementById("tirarBalcao");
    const bairrosLabel = document.querySelector('label[for="bairros"]');
    const bairrosSelect = document.getElementById("bairros");
    const enderecoLabel = document.querySelector('label[for="endereco"]');
    const enderecoInput = document.getElementById("endereco");
    const formaPagamentoLabel = document.querySelector(
        'label[for="formaPagamento"]'
    );
    const formaPagamentoSelect = document.getElementById("formaPagamento");

    function mostrarOcultarCamposTeleEntrega() {
        if (teleEntregaRadio.checked) {
            // Se Tele-Entrega estiver selecionado, mostra os elementos
            bairrosLabel.style.display = "block";
            bairrosSelect.style.display = "block";
            enderecoLabel.style.display = "block";
            enderecoInput.style.display = "block";
            formaPagamentoLabel.style.display = "block";
            formaPagamentoSelect.style.display = "block";
        } else {
            // Caso contrário, esconde os elementos
            bairrosLabel.style.display = "none";
            bairrosSelect.style.display = "none";
            enderecoLabel.style.display = "none";
            enderecoInput.style.display = "none";
            formaPagamentoLabel.style.display = "none";
            formaPagamentoSelect.style.display = "none";
        }
    }

    function calcularFrete() {
        const valorBairro =
            bairrosSelect.options[bairrosSelect.selectedIndex].getAttribute(
                "data-frete"
            );
        finalFrete.textContent = `R$${valorBairro}`;
        calcularTotal();
    }

    function calcularTotal() {
        const valorProdutos = parseFloat(
            finalPrice.textContent.replace("R$", "")
        );
        const valorFrete = parseFloat(finalFrete.textContent.replace("R$", ""));
        const total = valorProdutos + valorFrete;
        finalTotal.textContent = `R$${total.toFixed(2)}`;
    }

    function salvarPedidoLocal() {
        const nome = document.getElementById("nome").value;
        const telefone = document.getElementById("telefone").value;
        const tipoRetirada = document.querySelector(
            'input[name="retirada"]:checked'
        ).value;
        const bairro = document.getElementById("bairros").value;
        const endereco = document.getElementById("endereco").value;
        const formaPagamento = document.getElementById("formaPagamento").value;
        const somaProdutos = document.getElementById("finalPrice").textContent;
        const frete = document.getElementById("finalFrete").textContent;
        const total = document.getElementById("finalTotal").textContent;

        const pedido = {
            nome,
            telefone,
            tipoRetirada,
            bairro,
            endereco,
            formaPagamento,
            somaProdutos,
            frete,
            total,
        };

        localStorage.setItem("pedido", JSON.stringify(pedido));
    }

    function enviarPedidoWhatsApp() {
        const pedido = JSON.parse(localStorage.getItem("pedido"));

        let mensagem = `Quero realizar meu pedido! Segue os dados do meu Pedido:\n\n\n`;
        mensagem += `*Nome:* ${pedido.nome}\n\n`;
        mensagem += `*Telefone:* ${pedido.telefone}\n\n`;
        mensagem += `*Tipo de retirada:* ${pedido.tipoRetirada}\n\n`;

        if (pedido.tipoRetirada === "Tele Entrega") {
            mensagem += `*Bairro:* ${pedido.bairro}\n\n`;
            mensagem += `*Endereço:* ${pedido.endereco}\n\n`;
        }

        if (pedido.formaPagamento === "PIX") {
            mensagem += `*Forma de pagamento:* ${pedido.formaPagamento}\n\n`;
            mensagem += `*Chave PIX:* Adicione aqui a chave PIX para pagamento\n\n\n`;
        } else {
            mensagem += `*Forma de pagamento:* ${pedido.formaPagamento}\n\n`;
        }

        mensagem += `*Produtos Selecionados:*\n`;

        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key.startsWith("produto_")) {
                let produto = JSON.parse(localStorage.getItem(key));
                mensagem += `-${produto.nome}: ${produto.quantidade}x - R$${(
                    produto.valor * produto.quantidade
                ).toFixed(2)}\n\n`;
            }
        }

        mensagem += `\n*Soma dos produtos:* ${pedido.somaProdutos}\n\n`;
        mensagem += `*Frete:* ${pedido.frete}\n\n`;
        mensagem += `*Total:* ${pedido.total}\n\n\n`;
        mensagem += `*CASO QUEIRA ACOMPANHAR SEU PEDIDO É SÓ CLICAL NO SEGUINTE LINK:*\n\n`;
        mensagem += `https://bit.ly/Acompanhar_Pedido`;

        const linkWhatsApp = `https://api.whatsapp.com/send?phone=5554991965403&text=${encodeURIComponent(
            mensagem
        )}`;

        window.open(linkWhatsApp, "_blank");
    }

    const salvarPedidoButton = document.getElementById("enviarPedidoButton");
    salvarPedidoButton.addEventListener("click", () => {
        salvarPedidoLocal();
        enviarDadosParaSheetmonkey(); // Adicionando chamada para enviar dados para o Sheetmonkey
        enviarPedidoWhatsApp();
    });

    teleEntregaRadio.addEventListener("change", () => {
        mostrarOcultarCamposTeleEntrega();
        calcularFrete();
    });

    tirarBalcaoRadio.addEventListener("change", () => {
        mostrarOcultarCamposTeleEntrega();
        calcularFrete();
    });

    bairrosSelect.addEventListener("change", calcularFrete);

    mostrarOcultarCamposTeleEntrega();

    window.onload = () => {
        // Carregando sabores selecionados do localStorage
        const saboresSelecionados =
            JSON.parse(localStorage.getItem("saboresSelecionados")) || [];
        saboresSelecionados.forEach((sabor) => {
            let newRow = document.createElement("tr");
            let nameCell = document.createElement("td");

            nameCell.textContent = sabor.sabor;

            newRow.appendChild(nameCell);

            table.appendChild(newRow);
        });

        // Carregando bordas selecionadas do localStorage
        const bordasSelecionadas =
            JSON.parse(localStorage.getItem("bordasSelecionadas")) || {};
        for (const borda in bordasSelecionadas) {
            let newRow = document.createElement("tr");
            let nameCell = document.createElement("td");

            nameCell.textContent = borda;

            newRow.appendChild(nameCell);

            table.appendChild(newRow);
        }

        // Atualizando o valor total dos produtos no span finalPrice com o valor do localStorage
        const valorProdutos =
            parseFloat(localStorage.getItem("valorTotal")) || 0.0;
        document.getElementById(
            "finalPrice"
        ).textContent = `R$${valorProdutos.toFixed(2)}`;

        // Atualizar o valor total quando o valor do frete mudar
        const atualizarTotal = () => {
            const valorFrete =
                parseFloat(
                    document
                        .getElementById("finalFrete")
                        .textContent.replace("R$", "")
                ) || 0.0;
            const valorTotal = valorProdutos + valorFrete;
            document.getElementById(
                "finalTotal"
            ).textContent = `R$${valorTotal.toFixed(2)}`;
        };

        // Atualizar o valor total inicialmente e sempre que o frete mudar
        atualizarTotal();
        bairrosSelect.addEventListener("change", atualizarTotal);
    };

    const enviarPedidoButton = document.getElementById("enviarPedidoButton");
    enviarPedidoButton.addEventListener("click", enviarPedidoWhatsApp);

    // function enviarDadosParaSheetmonkey() {
    //     const url = "https://api.sheetmonkey.io/form/fabosBaewTP8XPKB4EV8Xh";

    //     const nome = document.getElementById("nome").value;
    //     const telefone = document.getElementById("telefone").value;
    //     const tipoRetirada = document.querySelector(
    //         'input[name="retirada"]:checked'
    //     ).value;
    //     const bairro = document.getElementById("bairros").value;
    //     const endereco = document.getElementById("endereco").value;
    //     const formaPagamento = document.getElementById("formaPagamento").value;
    //     const somaProdutos = document.getElementById("finalPrice").textContent;
    //     const frete = document.getElementById("finalFrete").textContent;
    //     const total = document.getElementById("finalTotal").textContent;

    //     const produtos = [];
    //     let produtosString = ""; // Cabeçalhos das colunas

    //     for (let i = 0; i < localStorage.length; i++) {
    //         let key = localStorage.key(i);
    //         if (key.startsWith("produto_")) {
    //             let produto = JSON.parse(localStorage.getItem(key));
    //             produtosString += `Nome: ${produto.nome}\nQuantidade: ${produto.quantidade}\nValor: ${produto.valor}\n\n`;
    //         }
    //     }

    //     const data = {
    //         Nome: nome,
    //         Telefone: telefone,
    //         "Tipo de retirada": tipoRetirada,
    //         Bairro: bairro,
    //         Endereco: endereco,
    //         "Forma de pagamento": formaPagamento,
    //         "Soma dos produtos": somaProdutos,
    //         Frete: frete,
    //         Total: total,
    //         Produtos: produtosString, // Agora é uma string formatada com quebras de linha para cada produto
    //         // Adicione mais campos conforme necessário
    //     };

    //     fetch(url, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(data),
    //     })
    //         .then((response) => {
    //             if (response.ok) {
    //                 console.log(
    //                     "Dados enviados com sucesso para o Sheetmonkey!"
    //                 );
    //                 localStorage.removeItem("pedido");
    //             } else {
    //                 console.error(
    //                     "Erro ao enviar dados para o Sheetmonkey:",
    //                     response.status
    //                 );
    //             }
    //         })
    //         .catch((error) => {
    //             console.error(
    //                 "Erro ao enviar dados para o Sheetmonkey:",
    //                 error
    //             );
    //         });
    // }
});
