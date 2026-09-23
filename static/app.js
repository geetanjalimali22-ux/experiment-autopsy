const analyzeButton =
    document.getElementById("analyzeBtn");

const investigateButton =
    document.getElementById("investigateBtn");

const resistanceButton =
    document.getElementById("resistanceBtn");

let currentExperiment = null;


analyzeButton.addEventListener(
    "click",
    analyzeExperiment
);

if (resistanceButton) {

    resistanceButton.addEventListener(
        "click",
        investigateResistance
    );

}


investigateButton.addEventListener(
    "click",
    investigateExperiment
);


async function analyzeExperiment() {

    const vin =
        document.getElementById("vin").value;

    const r1 =
        document.getElementById("r1").value;

    const r2 =
        document.getElementById("r2").value;

    const measured =
        document.getElementById("measured").value;


    try {

        const response = await fetch(
            "/api/voltage-divider",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    vin: vin,

                    r1: r1,

                    r2: r2,

                    measured: measured

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.error);

            return;
        }


        document.getElementById(
            "theoretical"
        ).textContent =
            data.theoretical + " V";


        document.getElementById(
            "measuredResult"
        ).textContent =
            data.measured + " V";


        document.getElementById(
            "difference"
        ).textContent =
            data.difference + " V";


        document.getElementById(
            "error"
        ).textContent =
            data.error_percent + "%";


        document.getElementById(
            "diagnosisText"
        ).textContent =
            data.diagnosis;


        document.getElementById(
            "results"
        ).classList.remove("hidden");


        currentExperiment = {

            vin: parseFloat(vin),

            r1: parseFloat(r1),

            r2: parseFloat(r2),

            measured: parseFloat(measured)

        };

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );

    }
}


async function investigateExperiment() {

    if (!currentExperiment) {

        alert(
            "Analyze the experiment first."
        );

        return;
    }


    const actualVin =
        document.getElementById(
            "actualVin"
        ).value;


    if (!actualVin) {

        alert(
            "Enter the voltage measured by your multimeter."
        );

        return;
    }


    try {

        const response = await fetch(
            "/api/investigate-voltage",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    expected_vin:
                        currentExperiment.vin,

                    actual_vin:
                        actualVin

                })

            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.error);

            return;
        }


        document.getElementById(
            "finding"
        ).textContent =
            data.finding;


        document.getElementById(
            "cause"
        ).textContent =
            data.cause;


        document.getElementById(
            "nextStep"
        ).textContent =
            data.next_step;


        document.getElementById(
            "investigationResult"
        ).classList.remove("hidden");

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );

    }

}

function updateCircuitDiagram() {

    const r1 =
        document.getElementById("r1").value;

    const r2 =
        document.getElementById("r2").value;


    const r1Display =
        document.querySelector("#circuitR1");


    const r2Display =
        document.querySelector("#circuitR2");


    if (r1Display && r1) {
        r1Display.textContent =
            formatResistance(r1);
    }


    if (r2Display && r2) {
        r2Display.textContent =
            formatResistance(r2);
    }
}


function formatResistance(value) {

    const resistance =
        parseFloat(value);


    if (resistance >= 1000000) {

        return (
            (resistance / 1000000)
                .toFixed(2)
                .replace(/\.00$/, "") +
            " MΩ"
        );

    }


    if (resistance >= 1000) {

        return (
            (resistance / 1000)
                .toFixed(2)
                .replace(/\.00$/, "") +
            " kΩ"
        );

    }


    return resistance + " Ω";
}


document
    .getElementById("r1")
    .addEventListener(
        "input",
        updateCircuitDiagram
    );


document
    .getElementById("r2")
    .addEventListener(
        "input",
        updateCircuitDiagram
    );


updateCircuitDiagram();

async function investigateResistance() {

    if (!currentExperiment) {

        alert(
            "Analyze the experiment first."
        );

        return;
    }


    const actualR1 =
        document.getElementById("actualR1").value;

    const actualR2 =
        document.getElementById("actualR2").value;


    if (!actualR1 || !actualR2) {

        alert(
            "Enter both measured resistance values."
        );

        return;
    }


    try {

        const response = await fetch(
            "/api/investigate-resistance",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    expected_r1:
                        currentExperiment.r1,

                    expected_r2:
                        currentExperiment.r2,

                    actual_r1:
                        actualR1,

                    actual_r2:
                        actualR2

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.error);

            return;
        }


        document.getElementById(
            "resistanceFinding"
        ).textContent =
            data.finding;


        document.getElementById(
            "resistanceCause"
        ).textContent =
            data.cause;


        document.getElementById(
            "resistanceNextStep"
        ).textContent =
            data.next_step;


        document.getElementById(
            "resistanceResult"
        ).classList.remove("hidden");

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );

    }
}
