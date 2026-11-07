document.addEventListener("DOMContentLoaded", () => {
            const container = document.querySelector("#contingutResum");
            const text = localStorage.getItem("dwc.ut3.resum");

            if (text === null) {
                container.textContent = "No hi ha dades de resum disponibles.";
                return;
            }

            try {
                const dades = JSON.parse(text);

                const inici = new Date(dades.sortida + "T00:00:00Z");
                const final = new Date(dades.tornada + "T00:00:00Z");
                const dies = Math.round((final.getTime() - inici.getTime()) / 86400000) + 1;
                const costTotal = (dades.costTotalCents / 100).toFixed(2);
                const pressupost = (dades.pressupostCents / 100).toFixed(2);
                const saldo = (dades.saldoCents / 100).toFixed(2);

                container.innerHTML = `
                    <p><strong>Nom del viatge:</strong> ${dades.nom}</p>
                    <p><strong>Dates:</strong> ${dades.sortida} fins a ${dades.tornada} (${dades.dies} dies, ${dades.nits} nits)</p>
                    <p><strong>Pressupost:</strong> ${(dades.pressupost / 100).toFixed(2)} €</p>
                    <p><strong>Cost Total:</strong> ${(dades.costTotal / 100).toFixed(2)} €</p>
                    <p><strong>Saldo Disponible:</strong> ${(dades.saldo / 100).toFixed(2)} €</p>
                    <p><strong>Estat del pressupost:</strong> ${dades.estat}</p>
                `;
            } catch (error) {
                container.textContent = "Error en llegir o analitzar les dades del resum desat.";
            }
        });
