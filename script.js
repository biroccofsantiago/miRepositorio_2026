const palos = ["♠", "♥", "♦", "♣"];
const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

let mazo = [];
let manoJugador = [];
let manoDealer = [];
let juegoTerminado = false;
let turnoDealer = false;

const cartasDealer = document.getElementById("cartas-dealer");
const cartasJugador = document.getElementById("cartas-jugador");
const puntajeDealer = document.getElementById("puntaje-dealer");
const puntajeJugador = document.getElementById("puntaje-jugador");
const mensaje = document.getElementById("mensaje");
const btnPedir = document.getElementById("btn-pedir");
const btnPlantarse = document.getElementById("btn-plantarse");
const btnReiniciar = document.getElementById("btn-reiniciar");

function crearMazo() {
  const nuevoMazo = [];

  for (const palo of palos) {
    for (const valor of valores) {
      nuevoMazo.push({ valor, palo });
    }
  }

  return nuevoMazo;
}

function mezclarMazo(cartas) {
  const cartasMezcladas = [...cartas];

  for (let i = cartasMezcladas.length - 1; i > 0; i--) {
    const posicionAleatoria = Math.floor(Math.random() * (i + 1));
    [cartasMezcladas[i], cartasMezcladas[posicionAleatoria]] = [
      cartasMezcladas[posicionAleatoria],
      cartasMezcladas[i]
    ];
  }

  return cartasMezcladas;
}

function tomarCarta() {
  return mazo.pop();
}

function calcularPuntaje(mano) {
  let total = 0;
  let ases = 0;

  for (const carta of mano) {
    if (carta.valor === "A") {
      total += 11;
      ases++;
    } else if (["J", "Q", "K"].includes(carta.valor)) {
      total += 10;
    } else {
      total += Number(carta.valor);
    }
  }

  // Si el As como 11 hace que la mano se pase, se convierte en 1.
  while (total > 21 && ases > 0) {
    total -= 10;
    ases--;
  }

  return total;
}

function tieneBlackjack(mano) {
  return mano.length === 2 && calcularPuntaje(mano) === 21;
}

function mostrarCartas(contenedor, mano, ocultarPrimeraCarta = false) {
  contenedor.innerHTML = "";

  mano.forEach((carta, indice) => {
    const elementoCarta = document.createElement("div");
    const estaOculta = ocultarPrimeraCarta && indice === 0;

    elementoCarta.className = "carta";

    if (carta.palo === "♥" || carta.palo === "♦") {
      elementoCarta.classList.add("roja");
    }

    if (estaOculta) {
      elementoCarta.classList.add("oculta");
      elementoCarta.textContent = "?";
    } else {
      elementoCarta.textContent = `${carta.valor}${carta.palo}`;
    }

    contenedor.appendChild(elementoCarta);
  });
}

function actualizarPantalla() {
  const ocultarCartaDealer = !turnoDealer && !juegoTerminado;

  mostrarCartas(cartasDealer, manoDealer, ocultarCartaDealer);
  mostrarCartas(cartasJugador, manoJugador);

  puntajeDealer.textContent = ocultarCartaDealer ? "?" : calcularPuntaje(manoDealer);
  puntajeJugador.textContent = calcularPuntaje(manoJugador);

  btnPedir.disabled = juegoTerminado || turnoDealer;
  btnPlantarse.disabled = juegoTerminado || turnoDealer;
}

function terminarJuego(texto) {
  juegoTerminado = true;
  turnoDealer = true;
  mensaje.textContent = texto;
  actualizarPantalla();
}

function iniciarJuego() {
  mazo = mezclarMazo(crearMazo());
  manoJugador = [tomarCarta(), tomarCarta()];
  manoDealer = [tomarCarta(), tomarCarta()];
  juegoTerminado = false;
  turnoDealer = false;

  if (tieneBlackjack(manoJugador) && tieneBlackjack(manoDealer)) {
    terminarJuego("Ambos tienen Blackjack. Empate.");
    return;
  }

  if (tieneBlackjack(manoJugador)) {
    terminarJuego("Ganaste un positivo intercambiable! Valen mas.");
    return;
  }

  if (tieneBlackjack(manoDealer)) {
    terminarJuego("Perdiste! Eras el 67! Intentalo de nuevo aunque no vale la pena");
    return;
  }

  mensaje.textContent = "Tu turno. Puedes pedir carta o plantarte.";
  actualizarPantalla();
}

function pedirCarta() {
  if (juegoTerminado || turnoDealer) {
    return;
  }

  manoJugador.push(tomarCarta());

  const totalJugador = calcularPuntaje(manoJugador);

  if (totalJugador > 21) {
    terminarJuego("Perdiste! Eras el 67! Intentalo de nuevo aunque no vale la pena");
    return;
  }

  if (totalJugador === 21) {
    mensaje.textContent = "Tienes 21. Puedes plantarte.";
  } else {
    mensaje.textContent = "Carta recibida. Decide si pides otra o te plantas.";
  }

  actualizarPantalla();
}

function plantarse() {
  if (juegoTerminado || turnoDealer) {
    return;
  }

  turnoDealer = true;

  while (calcularPuntaje(manoDealer) < 17) {
    manoDealer.push(tomarCarta());
  }

  const totalJugador = calcularPuntaje(manoJugador);
  const totalDealer = calcularPuntaje(manoDealer);

  if (totalDealer > 21) {
    terminarJuego("Ganaste un positivo intercambiable! Valen mas.");
  } else if (totalJugador > totalDealer) {
    terminarJuego("Ganaste un positivo intercambiable! Valen mas.");
  } else if (totalJugador < totalDealer) {
    terminarJuego("Perdiste! Eras el 67! Intentalo de nuevo aunque no vale la pena");
  } else {
    terminarJuego("Empate.");
  }
}

btnPedir.addEventListener("click", pedirCarta);
btnPlantarse.addEventListener("click", plantarse);
btnReiniciar.addEventListener("click", iniciarJuego);

iniciarJuego();
