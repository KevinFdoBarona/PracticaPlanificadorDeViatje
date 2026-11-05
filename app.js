
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
  const diaSetmana = data.getUTCDay();   // 0 = diumenge, 6 = dissabte
  return diaSetmana === 0 || diaSetmana === 6;
}

function formatData(data) {
  const dia = String(data.getUTCDate()).padStart(2, "0");
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  return dia + "/" + mes + "/" + data.getUTCFullYear();
}
function calcularPlanificacio(dades) {
  // Validació del nom (sense espais als extrems)
  const nom = dades.nom.trim();
  if (nom === "") {
    throw new Error("El nom del viatge no pot estar buit.");
  }

  // Dates i llista de dies
  const sortida = textADataUTC(dades.sortida, "data de sortida");
  const tornada = textADataUTC(dades.tornada, "data de tornada");
  const dies = llistaDies(sortida, tornada);

  // Imports en cèntims (només el pressupost no pot ser zero)
  const pressupost = textACentims(dades.pressupost, "pressupost", false);
  const transport = textACentims(dades.transport, "transport", true);
  const preuNit = textACentims(dades.preuNit, "preu per nit", true);
  const despesaLaborable = textACentims(dades.despesaLaborable, "despesa laborable", true);
  const despesaCapSetmana = textACentims(dades.despesaCapSetmana, "despesa de cap de setmana", true);

  const nombreDies = dies.length;
  const nits = nombreDies - 1;

  let costTotal = 0;
  let totalAllotjament = 0;
  let totalDespesa = 0;
  let diesLaborables = 0;
  let diesCapSetmana = 0;
  const files = [];

  // Un recorregut per cada dia del viatge
  for (let i = 0; i < nombreDies; i++) {
    const data = dies[i];
    const capSetmana = esCapDeSetmana(data);

    // El transport es cobra només una vegada: el primer dia
    const transportDia = (i === 0) ? transport : 0;
    // L'allotjament es cobra cada dia menys l'últim (no hi ha nit l'últim dia)
    const allotjamentDia = (i < nombreDies - 1) ? preuNit : 0;
    // La despesa diària depèn de si és cap de setmana
    const despesaDia = capSetmana ? despesaCapSetmana : despesaLaborable;

    if (capSetmana) {
      diesCapSetmana++;
    } else {
      diesLaborables++;
    }

    const costDia = transportDia + allotjamentDia + despesaDia;
    costTotal += costDia;
    totalAllotjament += allotjamentDia;
    totalDespesa += despesaDia;

    files.push({
      numero: i + 1,
      data: formatData(data),
      tipus: capSetmana ? "Cap de setmana" : "Laborable",
      transport: transportDia,
      allotjament: allotjamentDia,
      despesa: despesaDia,
      costDia: costDia,
      acumulat: costTotal
    });
  }

  const saldo = pressupost - costTotal;
  const mitjana = Math.round(costTotal / nombreDies);

  // Classificació (comparam en cèntims, sense decimals)
  let estat;
  if (costTotal > pressupost) {
    estat = "Insuficient";
  } else if (costTotal * 10 >= pressupost * 9) {   // cost >= 90 % del pressupost
    estat = "Ajustat";
  } else {
    estat = "Suficient";
  }

  return {
    nom: nom,
    sortida: formatData(sortida),
    tornada: formatData(tornada),
    dies: nombreDies,
    nits: nits,
    diesLaborables: diesLaborables,
    diesCapSetmana: diesCapSetmana,
    pressupost: pressupost,
    transport: transport,
    totalAllotjament: totalAllotjament,
    totalDespesa: totalDespesa,
    costTotal: costTotal,
    saldo: saldo,
    mitjana: mitjana,
    estat: estat,
    files: files
  };
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
// Crea una cel·la <td> amb el text indicat i l'afegeix a la fila
function afegirCela(fila, text) {
  const td = document.createElement("td");
  td.textContent = text;
  fila.appendChild(td);
}

function mostrarResultat(resultat) {
  document.getElementById("titolResum").textContent =
    resultat.nom + " (" + resultat.sortida + " - " + resultat.tornada + ")";

  // Estat amb text i color (suficient, ajustat o insuficient)
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

  // Taula del detall: es buida abans per no duplicar files
  const cos = document.getElementById("cosTaula");
  cos.textContent = "";
  for (let i = 0; i < resultat.files.length; i++) {
    const f = resultat.files[i];
    const tr = document.createElement("tr");
    afegirCela(tr, f.numero);
    afegirCela(tr, f.data);
    afegirCela(tr, f.tipus);
    afegirCela(tr, formatEuros(f.transport));
    afegirCela(tr, formatEuros(f.allotjament));
    afegirCela(tr, formatEuros(f.despesa));
    afegirCela(tr, formatEuros(f.costDia));
    afegirCela(tr, formatEuros(f.acumulat));
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
    document.getElementById("cosTaula").textContent = "";
    mostrarMissatge(error.message, "error");
  }
});
document.getElementById("btnGuardar").addEventListener("click", guardar);
document.getElementById("btnRecuperar").addEventListener("click", recuperar);
document.getElementById("btnEsborrar").addEventListener("click", esborrar);
document.getElementById("btnResum").addEventListener("click", obrirResum);
