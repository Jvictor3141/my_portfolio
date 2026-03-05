// Menu Mobile
const mobileMenu = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll("[data-tab-button]");

mobileMenu.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// fechar o menu mobile ao clicar em um item de navegação
for (let i = 0; i < navItems.length; i++) {
    navItems[i].addEventListener("click", () => {
        if (navLinks.classList.contains("active")) {
            navLinks.classList.remove("active");
            navLinks.style.display = "";
        }
    });
}

// Animação de Revelação ao Rolar (Scroll Reveal)
function reveal() {
    var reveals = document.querySelectorAll(".reveal");

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        } else {
            // remover a classe para que a animação repita
            reveals[i].classList.remove("active");
        }
    }
}

// adicionar o evento de scroll para chamar a função reveal, que verifica a posição dos elementos com a classe "reveal" em relação à janela de visualização e adiciona ou remove a classe "active" para ativar a animação de revelação quando os elementos entram ou saem da área visível.
window.addEventListener("scroll", reveal);

// Executar uma vez no carregamento para mostrar elementos iniciais
window.addEventListener("load", reveal);

// Efeito Parallax suave nos blobs de fundo
window.addEventListener("mousemove", (e) => {
    const blobs = document.querySelectorAll(".blob");
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    blobs.forEach((blob, index) => {
        const speed = (index + 1) * 20;
        blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
});

// Simulação de envio de formulário
/*const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;
        
        btn.innerText = 'Enviando...';
        btn.disabled = true;

        // Simulando um delay de rede
        setTimeout(() => {
            alert('por enquanto, esta funcionalidade é apenas uma simulação. Você pode entrar em contato pelo email ou redes sociais!');
            contactForm.reset();
            btn.innerText = originalText;
            btn.disabled = false;
        }, 1500);
    });
}*/

// formulario de contato
const FORM_ENDPOINT = "https://formspree.io/f/xdawnbyl";

const form = document.getElementById("contact-form");
const statusEl = document.getElementById("formStatus");
const sendBtn = document.getElementById("sendBtn");

// essa função controla o estado de loading do botão de envio, desabilitando-o e mostrando um estilo diferente quando isLoading é true
function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    sendBtn.classList.toggle("is-loading", isLoading);
}

// essa função atualiza o elemento de status com uma mensagem e um tipo (success, error, info) para indicar o resultado da ação de envio do formulário
function setStatus(type, message) {
    statusEl.className = ""; // limpa classes antigas
    statusEl.classList.add(type); // success | error | info
    statusEl.textContent = message;
}

// essa função exibe uma mensagem de erro específica para um campo do formulário, buscando o elemento correspondente usando um atributo data-error-for e atualizando seu texto com a mensagem de erro fornecida
function showFieldError(fieldName, msg) {
    const el = document.querySelector(`[data-error-for="${fieldName}"]`); // fieldName é o nome do campo (ex: "email") e a função busca um elemento com data-error-for="email" para mostrar a mensagem de erro relacionada a esse campo
    if (el) el.textContent = msg || ""; // se msg for vazio ou undefined, limpa a mensagem de erro do campo, caso contrário, exibe a mensagem de erro fornecida
}

// essa função limpa as mensagens de erro de todos os campos do formulário, chamando showFieldError para cada campo relevante (name, email, message) e passando uma string vazia para remover qualquer mensagem de erro exibida anteriormente
function clearErrors() {
    ["name", "email", "message"].forEach((f) => showFieldError(f, ""));
}

// essa função valida os campos do formulário, verificando se o nome tem pelo menos 2 caracteres, se o email é válido usando uma expressão regular simples e se a mensagem tem pelo menos 10 caracteres. Se algum campo não passar na validação, a função exibe uma mensagem de erro específica para esse campo usando showFieldError e retorna false. Se todos os campos forem válidos, retorna true.
function validate() {
    clearErrors();

    // trim() remove espaços em branco no início e no final do valor do campo, garantindo que a validação seja feita apenas com o conteúdo real inserido pelo usuário
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    let ok = true;

    // validação simples do nome, verificando se tem pelo menos 2 caracteres
    if (name.length < 2) {
        showFieldError("name", "Informe seu nome (mín. 2 caracteres).");
        ok = false;
    }

    // validação simples de email
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
        showFieldError("email", "Digite um e-mail válido.");
        ok = false;
    }

    // validação da mensagem, verificando se tem pelo menos 10 caracteres
    if (message.length < 10) {
        showFieldError("message", "Mensagem muito curta (mín. 10 caracteres).");
        ok = false;
    }

    return ok;
}


// lógica de envio do formulário
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // honeypot: se preencher, provavelmente é bot
    if (form._gotcha.value) return;

    // antes de enviar, valida os campos do formulário. Se a validação falhar, exibe uma mensagem de erro geral e impede o envio do formulário, solicitando ao usuário que corrija os campos destacados.
    if (!validate()) {
        setStatus("error", "Corrija os campos destacados e tente novamente.");
        return;
    }

    // se a validação passar, inicia o processo de envio do formulário, mostrando uma mensagem de status informando que a mensagem está sendo enviada e desabilitando o botão de envio para evitar múltiplos envios enquanto aguarda a resposta do servidor.
    setLoading(true);
    setStatus("info", "Enviando sua mensagem...");

    // tenta enviar os dados do formulário para o endpoint especificado usando fetch. Se a resposta do servidor indicar sucesso, reseta o formulário e exibe uma mensagem de sucesso. Se houver um erro na resposta ou uma falha de rede, exibe uma mensagem de erro apropriada para o usuário. try catch é usado para lidar com erros de rede ou outras exceções que possam ocorrer durante o processo de envio, garantindo que o usuário receba feedback adequado mesmo em caso de falhas inesperadas.
    try {
        const formData = new FormData(form); // cria um objeto FormData a partir do elemento form, que contém os dados do formulário organizados em pares de chave-valor correspondentes aos campos do formulário e seus valores. Esse objeto é usado para enviar os dados do formulário no corpo da requisição HTTP para o servidor processar.

        // envia os dados do formulário para o endpoint usando fetch, configurando o método como POST, incluindo os dados do formulário no corpo da requisição e definindo o cabeçalho Accept para indicar que espera uma resposta em formato JSON do servidor
        const res = await fetch(FORM_ENDPOINT, { // FORM_ENDPOINT é a URL para onde os dados do formulário serão enviados, e a função fetch é usada para fazer a requisição HTTP com as opções especificadas (método POST, corpo com os dados do formulário e cabeçalho indicando que aceita JSON como resposta).
            method: "POST",
            body: formData, // formData é um objeto que representa os dados do formulário, criado a partir do elemento form usando new FormData(form). Ele contém os pares de chave-valor correspondentes aos campos do formulário e seus valores, e é enviado no corpo da requisição para o servidor processar.
            headers: { Accept: "application/json" }, // o cabeçalho Accept: "application/json" indica que o cliente (navegador) espera receber uma resposta em formato JSON do servidor. Isso é útil para que o servidor saiba qual formato de resposta enviar de volta, permitindo que o cliente processe a resposta corretamente, especialmente em casos de sucesso ou erro no envio do formulário.
        });

        // verifica se a resposta do servidor indica sucesso (res.ok). Se não for bem-sucedida, tenta extrair uma mensagem de erro específica da resposta JSON e exibe essa mensagem para o usuário. Se não houver uma mensagem de erro específica, exibe uma mensagem genérica informando que não foi possível enviar a mensagem no momento e sugere tentar novamente mais tarde.
        if (!res.ok) {
            let msg = "Não foi possível enviar agora. Tente novamente.";
            const data = await res.json().catch(() => null); // tenta extrair a resposta JSON da resposta do servidor. Se a resposta não for um JSON válido, o catch captura o erro e retorna null, evitando que o código que depende da resposta JSON quebre. Isso é útil para lidar com casos em que o servidor pode retornar uma resposta de erro sem um corpo JSON ou com um formato inesperado.
            if (data?.error) msg = data.error;
            setStatus("error", msg);
            setLoading(false);
            return;
        }

        // se a resposta for bem-sucedida, reseta o formulário para limpar os campos e exibe uma mensagem de sucesso informando que a mensagem foi enviada e que o remetente receberá uma resposta em breve.
        form.reset();
        setStatus("success", "Mensagem enviada! Vou te responder em breve.");
    } catch (err) {
        setStatus(
            "error",
            "Falha de rede. Verifique sua internet e tente novamente.",
        );
    } finally {
        setLoading(false);
    }
});
