document.documentElement.classList.add("js");

// Mobile navigation
const menuButton = document.getElementById("mobile-menu");
const siteNavigation = document.getElementById("site-navigation");

function setMenuOpen(isOpen) {
    if (!menuButton || !siteNavigation) return;
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    siteNavigation.classList.toggle("is-open", isOpen);
}

menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
});

siteNavigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
});

// Reveal sections once as they enter the viewport.
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
}

// Contact form
const FORM_ENDPOINT = "https://formspree.io/f/xdawnbyl";
const form = document.getElementById("contact-form");
const statusElement = document.getElementById("formStatus");
const sendButton = document.getElementById("sendBtn");

function setStatus(type, message) {
    if (!statusElement) return;
    statusElement.className = message ? `status-${type}` : "";
    statusElement.textContent = message;
}

function showFieldError(fieldName, message) {
    const field = form?.elements.namedItem(fieldName);
    const errorElement = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (field instanceof HTMLElement) {
        field.setAttribute("aria-invalid", String(Boolean(message)));
    }
    if (errorElement) errorElement.textContent = message;
}

function validateForm() {
    if (!form) return false;

    const name = form.elements.namedItem("name").value.trim();
    const email = form.elements.namedItem("email").value.trim();
    const message = form.elements.namedItem("message").value.trim();
    let isValid = true;

    showFieldError("name", "");
    showFieldError("email", "");
    showFieldError("message", "");

    if (name.length < 2) {
        showFieldError("name", "Informe seu nome (mínimo de 2 caracteres).");
        isValid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError("email", "Digite um endereço de e-mail válido.");
        isValid = false;
    }

    if (message.length < 10) {
        showFieldError("message", "Escreva uma mensagem com pelo menos 10 caracteres.");
        isValid = false;
    }

    return isValid;
}

form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = form.elements.namedItem("_gotcha");
    if (honeypot?.value) return;

    if (!validateForm()) {
        setStatus("error", "Confira os campos destacados e tente novamente.");
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
    }

    if (sendButton) {
        sendButton.disabled = true;
        sendButton.classList.add("is-loading");
    }
    setStatus("info", "Enviando sua mensagem…");

    try {
        const response = await fetch(FORM_ENDPOINT, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            setStatus("error", data?.error || "Não foi possível enviar agora. Tente novamente.");
            return;
        }

        form.reset();
        ["name", "email", "message"].forEach((field) => showFieldError(field, ""));
        setStatus("success", "Mensagem enviada! Vou te responder em breve.");
    } catch {
        setStatus("error", "Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
        if (sendButton) {
            sendButton.disabled = false;
            sendButton.classList.remove("is-loading");
        }
    }
});
