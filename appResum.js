document.addEventListener("DOMContentLoaded", () => {
            const container = document.querySelector("#contingutResum");
            const text = localStorage.getItem("dwc.ut3.resum");

            if (text === null) {
                container.textContent = "No hi ha dades de resum disponibles.";
                return;
            }

            function afegirLinia(etiqueta, valor) {
        const p = document.createElement("p");
        const negreta = document.createElement("strong");
        negreta.textContent = etiqueta + ":";
        p.appendChild(negreta);
        p.appendChild(document.createTextNode(" " + valor));
        container.appendChild(p);
                }
             
                try {
                    const dades = JSON.parse(text);
             
                    const inici = new Date(dades.sortida + "T00:00:00Z");
                    const final = new Date(dades.tornada + "T00:00:00Z");
                    const dies = Math.round((final.getTime() - inici.getTime()) / 86400000) + 1;
                    const nits = dies - 1;
                    const costTotal = (dades.costTotalCents / 100).toFixed(2);
                    const pressupost = (dades.pressupostCents / 100).toFixed(2);
        const saldo = (dades.saldoCents / 100).toFixed(2);
 
        container.textContent = "";
        afegirLinia("Nom del viatge", dades.nom);
        afegirLinia("Dates", dades.sortida + " fins a " + dades.tornada + " (" + dies + " dies, " + nits + " nits)");
        afegirLinia("Pressupost", pressupost + " €");
        afegirLinia("Cost Total", costTotal + " €");
        afegirLinia("Saldo Disponible", saldo + " €");
        afegirLinia("Estat del pressupost", dades.estat);
            } catch (error) {
                container.textContent = "Error en llegir o analitzar les dades del resum desat.";
            }
        });
