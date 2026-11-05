
function textACentims(text, nomCamp, permetZero) {
  const net = text.trim().replace(",", ".");

  if (net === "") {
    throw new Error("El camp " + nomCamp + " no pot estar buit.");
  }

  const valor = Number(net);
  if (isNaN(valor)) {
    throw new Error("El camp " + nomCamp + " ha de ser un número.");
  }

  if (!Number.isFinite(valor)) {
    throw new Error("El camp " + nomCamp + " no és un import vàlid.");
  }

  if (valor < 0) {
    throw new Error("El camp " + nomCamp + " no pot ser negatiu.");
  }
  if (net.startsWith("-") && Number(net) !== 0) {
    throw new Error("El camp " + nomCamp + " no pot ser negatiu.");
  }

  const parts = net.split(".");
  if (parts.length === 2 && parts[1].length > 2) {
    throw new Error("El camp " + nomCamp + " pot tenir com a màxim dos decimals.");
  }

  if (!Number.isFinite(valor)) {
    throw new Error("El camp " + nomCamp + " no és un import vàlid.");
  }

  const centims = Math.round(valor * 100);

  if (centims === 0 && !permetZero) {
    throw new Error("El camp " + nomCamp + " ha de ser més gran que zero.");
  }

  return centims;
}


function textADataUTC(text, nomCamp) {
  if (text === "") {
    throw new Error("La " + nomCamp + " no pot estar buida.");
  }
  const parts = text.split("-");          
  const any = Number(parts[0]);
  const mes = Number(parts[1]);
  const dia = Number(parts[2]);
  const data = new Date(Date.UTC(any, mes - 1, dia));
  if (isNaN(data.getTime())) {
    throw new Error("La " + nomCamp + " no és una data vàlida.");
  }
  return data;
}

function llistaDies(sortida, tornada) {
  if (tornada < sortida) {
    throw new Error("La data de tornada no pot ser anterior a la de sortida.");
  }
  const MS_PER_DIA = 24 * 60 * 60 * 1000;
  
  const totalDies = (tornada.getTime() - sortida.getTime()) / MS_PER_DIA + 1;
  if (totalDies > 30) {
    throw new Error("El viatge no pot durar més de 30 dies (ara en té " + totalDies + ").");
  }
  const dies = [];
  for (let i = 0; i < totalDies; i++) {
    dies.push(new Date(sortida.getTime() + i * MS_PER_DIA));
  }
  return dies;
}

function esCapDeSetmana(data) {
  const diaSetmana = data.getUTCDay();   
  return diaSetmana === 0 || diaSetmana === 6;
}

  function calcularPlanificacio(dades) {
  const nom = dades.nom.trim();
  if (nom === "") {
    throw new Error("El nom del viatge no pot estar buit.");
  }

}


function formatEuros(centims) {
  return (centims / 100).toFixed(2).replace(".", ",") + " €";
}

function llegirFormulari() {
  return {
    nom: document.getElementById("nom").value,
    sortida: document.getElementById("sortida").value,
    tornada: document.getElementById("tornada").value,
    pressupost: document.getElementById("pressupost").value,
    transport: document.getElementById("transport").value,
    preuNit: document.getElementById("preuNit").value,
    despesaLaborable: document.getElementById("despesaLaborable").value,
    despesaCapSetmana: document.getElementById("despesaCapSetmana").value
  };
}
function mostrarMissatge(text, tipus) {
  const missatge = document.getElementById("missatge");
  missatge.textContent = text;
  missatge.className = tipus;
}
function mostrarResultat(resultat) {
  document.getElementById("titolResum").textContent =
    resultat.nom + " (" + resultat.sortida + " - " + resultat.tornada + ")";

  const estat = document.getElementById("estat");
  estat.textContent = "Estat: " + resultat.estat;
  estat.className = "estat " + resultat.estat.toLowerCase();

  const llista = document.getElementById("llistaResum");
  llista.textContent = "";
  const linies = [
    "Dies: " + resultat.dies + " (" + resultat.diesLaborables + " laborables i " +
      resultat.diesCapSetmana + " de cap de setmana)",
    "Nits: " + resultat.nits,
    "Pressupost: " + formatEuros(resultat.pressupost),
    "Transport: " + formatEuros(resultat.transport),
    "Allotjament: " + formatEuros(resultat.totalAllotjament),
    "Despesa diària: " + formatEuros(resultat.totalDespesa),
    "Cost total: " + formatEuros(resultat.costTotal),
    "Saldo disponible: " + formatEuros(resultat.saldo),
    "Mitjana per dia: " + formatEuros(resultat.mitjana)
  ];
  for (let i = 0; i < linies.length; i++) {
    const li = document.createElement("li");
    li.textContent = linies[i];
    llista.appendChild(li);
  }
  const cos = document.getElementById("cosTaula");
  cos.textContent = "";
  for (let i = 0; i < resultat.files.length; i++) {
    const f = resultat.files[i];
    const tr = document.createElement("tr");
    tr.textContent =
      "<td>" + f.numero + "</td>" +
      "<td>" + f.data + "</td>" +
      "<td>" + f.tipus + "</td>" +
      "<td>" + formatEuros(f.transport) + "</td>" +
      "<td>" + formatEuros(f.allotjament) + "</td>" +
      "<td>" + formatEuros(f.despesa) + "</td>" +
      "<td>" + formatEuros(f.costDia) + "</td>" +
      "<td>" + formatEuros(f.acumulat) + "</td>";
    cos.appendChild(tr);
  }
  document.getElementById("resum").hidden = false;
  document.getElementById("detall").hidden = false;
}


  const CLAU_DESAT = "planificadorViatge.planificacio";
function guardar() { }
function recuperar() { }
function esborrar() { }
function obrirResum() {  }

document.getElementById("btnCalcular").addEventListener("click", function () {
  try {
    const dades = llegirFormulari();
    const resultat = calcularPlanificacio(dades);
    ultimResultat = resultat;
    mostrarResultat(resultat);
    mostrarMissatge("Càlcul fet correctament.", "ok");
  } catch (error) {
    ultimResultat = null;
    document.getElementById("resum").hidden = true;
    document.getElementById("detall").hidden = true;
    document.getElementById("cosTaula").innerHTML = "";
    mostrarMissatge(error.message, "error");
  }
});
document.getElementById("btnGuardar").addEventListener("click", guardar);
document.getElementById("btnRecuperar").addEventListener("click", recuperar);
document.getElementById("btnEsborrar").addEventListener("click", esborrar);
document.getElementById("btnResum").addEventListener("click", obrirResum);
