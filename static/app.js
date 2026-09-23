const analyzeButton =
    document.getElementById("analyzeBtn");

const investigateButton =
    document.getElementById("investigateBtn");


let currentExperiment = null;


analyzeButton.addEventListener(
    "click",
    analyzeExperiment
);


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