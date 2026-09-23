from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


def calculate_voltage_divider(vin, r1, r2):
    if r1 + r2 == 0:
        raise ValueError("Resistance values cannot both be zero.")

    return vin * (r2 / (r1 + r2))


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/voltage-divider", methods=["POST"])
def voltage_divider():

    data = request.get_json()

    try:
        vin = float(data["vin"])
        r1 = float(data["r1"])
        r2 = float(data["r2"])
        measured = float(data["measured"])

        if vin <= 0 or r1 < 0 or r2 < 0:
            return jsonify({
                "error": "Enter positive values."
            }), 400

        theoretical = calculate_voltage_divider(
            vin,
            r1,
            r2
        )

        difference = measured - theoretical

        if theoretical != 0:
            error_percent = (
                difference / theoretical
            ) * 100
        else:
            error_percent = 0

        absolute_error = abs(error_percent)

        if absolute_error < 2:

            diagnosis = (
                "Your measurement is very close "
                "to the theoretical value."
            )

        elif absolute_error < 5:

            diagnosis = (
                "Your result is reasonably close. "
                "Let's investigate the small difference."
            )

        elif absolute_error < 10:

            diagnosis = (
                "There is a noticeable difference "
                "between theory and reality."
            )

        else:

            diagnosis = (
                "There is a large difference. "
                "The experiment needs investigation."
            )

        return jsonify({

            "theoretical": round(theoretical, 3),

            "measured": round(measured, 3),

            "difference": round(difference, 3),

            "error_percent": round(error_percent, 2),

            "diagnosis": diagnosis,

            "needs_investigation": absolute_error >= 2

        })

    except (KeyError, TypeError, ValueError):

        return jsonify({
            "error": "Please enter valid numerical values."
        }), 400


@app.route("/api/investigate-voltage", methods=["POST"])
def investigate_voltage():

    data = request.get_json()

    try:

        expected_vin = float(data["expected_vin"])
        actual_vin = float(data["actual_vin"])

        vin_difference = actual_vin - expected_vin

        vin_error = (
            vin_difference / expected_vin
        ) * 100

        if abs(vin_error) < 1:

            finding = (
                "Your actual supply voltage is very "
                "close to the expected value."
            )

            next_step = (
                "Next, measure R1 and R2 with the "
                "multimeter to check their actual resistance."
            )

            cause = "Supply voltage is probably not the main cause."

        elif abs(vin_error) < 5:

            finding = (
                "Your actual supply voltage is slightly "
                "different from the assumed value."
            )

            next_step = (
                "Now measure the actual resistance of "
                "R1 and R2."
            )

            cause = (
                "Supply variation may explain part "
                "of the measurement difference."
            )

        else:

            finding = (
                "Your actual supply voltage is significantly "
                "different from the value used in the calculation."
            )

            next_step = (
                "Correct the supply assumption and "
                "recalculate the expected output."
            )

            cause = (
                "Supply voltage variation is likely "
                "a major contributor to the difference."
            )

        return jsonify({

            "expected_vin": round(expected_vin, 3),

            "actual_vin": round(actual_vin, 3),

            "difference": round(vin_difference, 3),

            "error_percent": round(vin_error, 2),

            "finding": finding,

            "cause": cause,

            "next_step": next_step

        })

    except (KeyError, TypeError, ValueError):

        return jsonify({
            "error": "Please enter a valid input voltage."
        }), 400

@app.route("/api/investigate-resistance", methods=["POST"])
def investigate_resistance():

    data = request.get_json()

    try:
        expected_r1 = float(data["expected_r1"])
        expected_r2 = float(data["expected_r2"])
        actual_r1 = float(data["actual_r1"])
        actual_r2 = float(data["actual_r2"])

        if expected_r1 <= 0 or expected_r2 <= 0:
            return jsonify({
                "error": "Expected resistance values must be positive."
            }), 400

        r1_error = (
            (actual_r1 - expected_r1)
            / expected_r1
        ) * 100

        r2_error = (
            (actual_r2 - expected_r2)
            / expected_r2
        ) * 100

        max_error = max(
            abs(r1_error),
            abs(r2_error)
        )

        if max_error < 1:

            finding = (
                "Both measured resistances are very close "
                "to their expected values."
            )

            cause = (
                "The supply and resistor values do not "
                "strongly explain the original difference."
            )

            next_step = (
                "Check the circuit wiring and multimeter "
                "measurement setup."
            )

        elif max_error < 5:

            finding = (
                "The resistor values show a small "
                "difference from their labelled values."
            )

            cause = (
                "Component tolerance may explain part "
                "of the difference."
            )

            next_step = (
                "Use the measured resistor values to "
                "recalculate the expected Vout."
            )

        else:

            finding = (
                "At least one resistor differs noticeably "
                "from its expected value."
            )

            cause = (
                "Resistor variation is a plausible "
                "contributor to the original difference."
            )

            next_step = (
                "Recalculate Vout using the actual Vin, "
                "R1 and R2 values."
            )

        return jsonify({

            "actual_r1": round(actual_r1, 3),
            "actual_r2": round(actual_r2, 3),

            "r1_error_percent": round(r1_error, 2),
            "r2_error_percent": round(r2_error, 2),

            "finding": finding,
            "cause": cause,
            "next_step": next_step

        })

    except (KeyError, TypeError, ValueError):

        return jsonify({
            "error": "Please enter valid resistance values."
        }), 400

if __name__ == "__main__":
    app.run(debug=True)
