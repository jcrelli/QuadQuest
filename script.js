// ======================================================
// Quad Quest
//
// © 2026 Jonathan Crellin
//
// Quad Quest is an independent educational simulation
// and is not affiliated with or endorsed by Waters Corporation.
// ======================================================



// ======================================================
// 0. IDEAL ENGINEER SETTINGS
// ======================================================

function randomInteger(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}


const idealEngineerSettings = {

    lmPosition: randomInteger(500, 550),
    hmPosition: randomInteger(500, 550),

    lmResolution: randomInteger(510, 590),
    hmResolution: randomInteger(2000, 2150),

    linearity: randomInteger(505, 525)

};


// ======================================================
// 1. ENGINEER SETTINGS
// ======================================================
//
// Connects each engineer setting number box to its slider.
//
// Slider:
//      Moving it immediately updates the number.
//
// Number box:
//      Type a value and press Enter to commit it.
//      Engineer settings are always whole numbers.
//
// ======================================================

function connect(sliderId, numberId) {

    const slider = document.getElementById(sliderId);
    const number = document.getElementById(numberId);


    slider.addEventListener("input", function () {

        number.value =
            slider.value;

    });

    number.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        const value =
            parseFloat(number.value);

        const minimum =
            parseFloat(slider.min);

        const maximum =
            parseFloat(slider.max);

        if (
            isNaN(value) ||
            value < minimum ||
            value > maximum
        ) {

            number.value =
                slider.value;

            number.blur();

            return;
        }

        const roundedValue =
            Math.round(value);

        number.value =
            roundedValue;

        slider.value =
            roundedValue;

        number.blur();

    }

});


    // If the user leaves the number box without
    // pressing Enter, restore the committed value

    number.addEventListener("blur", function () {

        number.value =
            slider.value;

    });

}


// ------------------------------------------------------
// LM / HM POSITION
// ------------------------------------------------------

function updateLMPosition(graphIndex) {

    const lmPosition =
        parseInt(
            document.getElementById("lm-position").value
        );

    const hmPosition =
        parseInt(
            document.getElementById("hm-position").value
        );


    // Distance from ideal settings

    const lmPositionOffset =
        (lmPosition -
        idealEngineerSettings.lmPosition) * 0.2;

    const hmPositionOffset =
        (hmPosition -
        idealEngineerSettings.hmPosition) * 0.1;


    const plotArea =
        document.querySelectorAll(".plot-area")[
            graphIndex
        ];

    const windowMass =
        committedMasses[graphIndex];

    const span =
        committedSpans[graphIndex];

    const peaks =
        plotArea.querySelectorAll(".test-peak");


    peaks.forEach(function (peak) {

        const spectrumPeakIndex =
            parseInt(peak.dataset.spectrumPeak);

        const spectrumPeak =
            getActiveSpectrum()[spectrumPeakIndex];

        const massDifference =
            spectrumPeak.mass - windowMass;


        // LM Position affects low masses more

        const lmMassWeight =
            500 /
            (spectrumPeak.mass + 500);


        // HM Position affects high masses more

        const hmMassWeight =
            spectrumPeak.mass /
            (spectrumPeak.mass + 500);


        // Combine LM and HM effects

        const position =
            50 +
            (
                massDifference +
                lmPositionOffset * lmMassWeight +
                hmPositionOffset * hmMassWeight
            ) / span *100;

        peak.style.left =
            position + "%";

    });
}


// ------------------------------------------------------
// RESOLUTION / LINEARITY
// ------------------------------------------------------

function updateResolution(graphIndex) {

    const lmResolution =
        parseInt(
            document.getElementById("lm-resolution").value
        );

    const hmResolution =
        parseInt(
            document.getElementById("hm-resolution").value
        );

    const linearity =
        parseInt(
            document.getElementById("linearity").value
        );

    const linearityOffset =
        linearity -
        idealEngineerSettings.linearity;


    // Distance from ideal settings

    const lmResolutionOffset =
        (lmResolution -
        idealEngineerSettings.lmResolution) * 1.0;

    const hmResolutionOffset =
        (hmResolution -
        idealEngineerSettings.hmResolution) * 1.0;

    const plotArea =
        document.querySelectorAll(".plot-area")[
            graphIndex
        ];

    const span =
        committedSpans[graphIndex];

    const peaks =
        plotArea.querySelectorAll(".test-peak");


    peaks.forEach(function (peak) {

        const spectrumPeakIndex =
            parseInt(peak.dataset.spectrumPeak);

        const spectrumPeak =
            getActiveSpectrum()[spectrumPeakIndex];


        // LM Resolution affects low masses more

        const lmMassWeight =
            500 /
            (spectrumPeak.mass + 500);


        // HM Resolution affects high masses more

        const hmMassWeight =
            spectrumPeak.mass /
            (spectrumPeak.mass + 500);


        // Linearity affects the middle mass range most

        const massFraction =
            spectrumPeak.mass / 2048;

        const linearityWeight =
            4 *
            massFraction *
            (1 - massFraction);


        // Linearity modifies Resolution away from
        // the low-mass and high-mass endpoints

        const linearityEffect =
            linearityOffset *
            linearityWeight;

        
        // Base peak width in mass units

        const basePeakMassWidth =
            0.75;


        // Combine All Resolution effects

        const resolutionEffect =
            lmResolutionOffset * lmMassWeight +
            hmResolutionOffset * hmMassWeight +
            linearityEffect;


        // Resolution also shifts peak position

        const resolutionMassShift =
            resolutionEffect * 0.1;


        // Resolution also affects peak height

        const resolutionHeight =
            Math.max(
                0.1,
                1 - resolutionEffect * 0.02
            );

        peak.dataset.resolutionHeight =
            resolutionHeight;
        

        // Convert Resolution error into peak width change

        const peakMassWidth =
            basePeakMassWidth *
            (1 - resolutionEffect * 0.1);


        // Prevent impossible negative / zero width

        const safePeakMassWidth =
            Math.max(
                0.05,
                peakMassWidth
            );


        // Convert mass width into graph percentage

        const peakWidthPercent =
            (safePeakMassWidth / span) * 100;


        peak.style.width =
            peakWidthPercent + "%";

        const currentLeft =
            parseFloat(peak.style.left);

        peak.style.left =
            (
                currentLeft +
                (resolutionMassShift / span) * 100
            ) + "%";


    });

}


// Connect all five engineer settings

connect("lm-position", "lm-position-value");
connect("hm-position", "hm-position-value");
connect("lm-resolution", "lm-resolution-value");
connect("hm-resolution", "hm-resolution-value");
connect("linearity", "linearity-value");



// ======================================================
// 2. OPERATE / STANDBY
// ======================================================
//
// Controls whether the mass spectrometer is in:
//
//      Standby = red
//      Operate = green
//
// Peaks can only appear while the instrument is in Operate.
//
// ======================================================

const operateButton =
    document.getElementById("operate-button");

const operateIndicator =
    document.getElementById("operate-indicator");

const statusText =
    document.getElementById("status-text");


// Instrument begins in Standby

let operating = false;



// ======================================================
// 3. MASS GRAPH FUNCTIONS
// ======================================================
//
// Each graph has:
//
//      Mass
//      Span
//      Gain
//
// Mass:
//      Center of the X axis.
//
// Span:
//      Total width of the X axis.
//
// Gain:
//      Vertical amplification.
//      For now this only updates the xGain display.
//
// ======================================================

function updateGraph(number) {

    const massInput =
        document.getElementById("mass-" + number);

    const spanInput =
        document.getElementById("span-" + number);

    const title =
        document.getElementById("graph-title-" + number);

    const axis =
        document.getElementById("x-axis-" + number);

    const mass =
        committedMasses[number - 1];

let span =
    committedSpans[number - 1];


// Minimum allowed Span

if (span < 0.1) {
    span = 0.1;
}



    if (isNaN(mass) || isNaN(span)) {
        return;
    }


    // ------------------------------------------
    // GRAPH TITLE
    // ------------------------------------------

    title.textContent =
        mass.toFixed(1);


    // ------------------------------------------
    // X AXIS
    // ------------------------------------------
    //
    // Span is centered around the selected mass.
    //
    // Example:
    //
    // Mass = 59.1
    // Span = 5
    //
    // Minimum = 56.6
    // Maximum = 61.6
    //
    // ------------------------------------------

    const minimum =
        mass - span / 2;


    // Clear old axis labels

    axis.innerHTML = "";


    // Create five evenly spaced axis values

    for (let i = 0; i <= 4; i++) {

        const value =
            minimum + (span * i / 4);

        const tick =
            document.createElement("span");

        tick.textContent =
            value.toFixed(1);

        axis.appendChild(tick);
    }

}


// ======================================================
// 4. MASS / SPAN / GAIN INPUTS
// ======================================================
//
// Connects the four mass graph setting rows.
//
// Text boxes:
//
//      Typing does not change the active setting.
//
//      The new value is committed only when the user
//      leaves the textbox.
//
// Mass:
//      Range: 10.0 to 2038.0
//      Displays one decimal place.
//
// Span:
//      Minimum: 0.1
//
// Gain:
//      Range: 0.1 to 10000
//
// ======================================================


// ------------------------------------------------------
// COMMITTED VALUES
// ------------------------------------------------------
//
// These values are the settings currently being used
// by the simulated instrument.
//
// Textbox contents are ignored until the textbox
// loses focus.
//
// ------------------------------------------------------

const committedMasses = [
    59.1,
    455.3,
    1080.8,
    2034.6
];

const committedSpans = [
    5,
    5,
    5,
    5
];

const committedGains = [
    parseFloat(document.getElementById("gain-1").value),
    parseFloat(document.getElementById("gain-2").value),
    parseFloat(document.getElementById("gain-3").value),
    parseFloat(document.getElementById("gain-4").value)
];


// Initialize Gain displays

for (let i = 0; i < 4; i++) {

document.getElementById(
    "graph-gain-" + (i + 1)
).textContent =
    "x" + committedGains[i];
}


function syncPeaksForMassWindow(graphIndex) {

    const plotArea =
        document.querySelectorAll(".plot-area")[graphIndex];

    const windowMass =
        committedMasses[graphIndex];

    const span =
        committedSpans[graphIndex];

    const minimumMass =
        windowMass - span / 2;

    const maximumMass =
        windowMass + span / 2;

    const activeSpectrum =
        getActiveSpectrum();

activeSpectrum.forEach(function (spectrumPeak, spectrumPeakIndex) {

    if (
        spectrumPeak.mass >= minimumMass &&
        spectrumPeak.mass <= maximumMass
    ) {

        const existingPeak =
            plotArea.querySelector(
                '.test-peak[data-spectrum-peak="' +
                spectrumPeakIndex +
                '"]'
            );

        if (!existingPeak) {

            updateOnePeakPosition(
                graphIndex
            );

            return;
        }
    }
});

}


// ------------------------------------------------------
// CONNECT MASS / SPAN / GAIN INPUTS
// ------------------------------------------------------

for (let i = 1; i <= 4; i++) {

    const massInput =
        document.getElementById("mass-" + i);

    const spanInput =
        document.getElementById("span-" + i);

    const gainInput =
        document.getElementById("gain-" + i);


function updateExistingPeaksForMassAndSpan(graphIndex) {

    const plotArea =
        document.querySelectorAll(".plot-area")[graphIndex];

    const windowMass =
        committedMasses[graphIndex];

    const span =
        committedSpans[graphIndex];

    const peaks =
        plotArea.querySelectorAll(".test-peak");

    peaks.forEach(function (peak) {

        const spectrumPeakIndex =
            parseInt(peak.dataset.spectrumPeak);

        const spectrumPeak =
            getActiveSpectrum()[spectrumPeakIndex];

        // Update horizontal position

        const massDifference =
            spectrumPeak.mass - windowMass;

        const position =
            50 +
            (massDifference / span) * 100;

        peak.style.left =
            position + "%";


        // Update peak width

        const peakMassWidth =
            0.75;

        const peakWidthPercent =
            (peakMassWidth / span) * 100;

        peak.style.width =
            peakWidthPercent + "%";
    });
}


// --------------------------------------------------
// MASS
// --------------------------------------------------

massInput.addEventListener("blur", function () {

    let value =
        parseFloat(massInput.value);


    // If Mass is not a valid number,
    // restore the previous committed value

    if (isNaN(value)) {

        massInput.value =
            committedMasses[i - 1].toFixed(1);

        return;
    }


    // Reject Mass values outside the
    // allowed instrument range

    if (
        value < 10 ||
        value > 2038
    ) {

        massInput.value =
            committedMasses[i - 1].toFixed(1);

        return;
    }


    // Reject Mass if the current Span would
    // extend outside the instrument range

    const currentSpan =
        committedSpans[i - 1];

    const minimumMass =
        value - currentSpan / 2;

    const maximumMass =
        value + currentSpan / 2;

    if (
        minimumMass < 1 ||
        maximumMass > 2048
    ) {

        massInput.value =
            committedMasses[i - 1].toFixed(1);

        return;
    }


// Remember previous committed Mass

const previousMass =
    committedMasses[i - 1];


// Commit valid Mass

committedMasses[i - 1] =
    value;


// Mass always displays one decimal place

massInput.value =
    value.toFixed(1);

});



// --------------------------------------------------
// SPAN
// --------------------------------------------------

spanInput.addEventListener("blur", function () {

    let value =
        parseFloat(spanInput.value);


    // If Span is not a valid number,
    // restore the previous committed value

    if (isNaN(value)) {

        spanInput.value =
            committedSpans[i - 1];

        return;
    }


    // Calculate the displayed mass range

    const mass =
        committedMasses[i - 1];

    const minimumMass =
        mass - value / 2;

    const maximumMass =
        mass + value / 2;


    // Span is invalid if the displayed range
    // would extend outside the instrument
    // mass range of 0 to 2048

    if (
        value < 0.1 ||
        minimumMass < 0 ||
        maximumMass > 2048
    ) {

        spanInput.value =
            committedSpans[i - 1];

        return;
    }


// Remember previous committed Span

const previousSpan =
    committedSpans[i - 1];


// Commit valid Span

committedSpans[i - 1] =
    value;


// Update textbox

spanInput.value =
    value;

});


    // --------------------------------------------------
    // GAIN
    // --------------------------------------------------

    gainInput.addEventListener("blur", function () {

        let value =
            parseFloat(gainInput.value);

        if (isNaN(value)) {
            value = committedGains[i - 1];
        }

        if (value < 0.1) {
            value = 0.1;
        }

        if (value > 10000) {
            value = 10000;
        }


        // Round to maximum of 2 decimal places

        value =
            Math.round(value * 100) / 100;


        // Commit Gain

        committedGains[i - 1] =
            value;


        // Update textbox

        gainInput.value =
            value;

        // Apply committed Gain immediately

        updateOnePeakSignal(i - 1);

    });


    // --------------------------------------------------
    // INITIALIZE GRAPH
    // --------------------------------------------------

    updateGraph(i);

}


// ======================================================
// ENTER KEY
// ======================================================
//
// Pressing Enter leaves the active textbox,
// which triggers its existing blur event and
// commits the new value.
//
// ======================================================

for (let i = 1; i <= 4; i++) {

    const inputs = [
        document.getElementById("mass-" + i),
        document.getElementById("span-" + i),
        document.getElementById("gain-" + i)
    ];

    inputs.forEach(function (input) {

        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                input.blur();
            }

        });

    });

}


// ======================================================
// NUMBER BOX SELECTION
// ======================================================
//
// Double-clicking any number input selects the
// entire value for easy replacement.
//
// ======================================================

const numberInputs =
    document.querySelectorAll('input[type="number"]');

numberInputs.forEach(function (input) {

    input.addEventListener("dblclick", function () {

        input.select();

    });

});


// ======================================================
// GAIN CONTROL FROM GRAPH
// ======================================================
//
// Double-click bottom axis:
//      Divide Gain by 2.
//
// Double-click graph header:
//      Multiply Gain by 2.
//
// These controls commit Gain immediately.
//
// Gain range:
//      0.1 to 10000
//
// ======================================================


// ------------------------------------------------------
// DIVIDE GAIN BY 2
// ------------------------------------------------------

for (let i = 1; i <= 4; i++) {

    const axis =
        document.getElementById("x-axis-" + i);

    const gainInput =
        document.getElementById("gain-" + i);


    axis.addEventListener("dblclick", function () {

        let gain =
            committedGains[i - 1];


        // Divide Gain by 2

        gain =
            gain / 2;


        // Round to maximum of 2 decimal places

        gain =
            Math.round(gain * 100) / 100;


        // Minimum Gain

        if (gain < 0.1) {
            gain = 0.1;
        }


        // Commit Gain

        committedGains[i - 1] =
            gain;


        // Update textbox

        gainInput.value =
            gain;


        // Apply Gain immediately

        updateOnePeakSignal(i - 1);

        document.getElementById(
            "graph-gain-" + i
        ).textContent =
            "x" + gain;

    });

}


// ------------------------------------------------------
// MULTIPLY GAIN BY 2
// ------------------------------------------------------

const graphHeaders =
    document.querySelectorAll(".graph-header");

for (let i = 0; i < 4; i++) {

    const header =
        graphHeaders[i];

    const gainInput =
        document.getElementById(
            "gain-" + (i + 1)
        );


    header.addEventListener("dblclick", function () {

        let gain =
            committedGains[i];


        // Multiply Gain by 2

        gain =
            gain * 2;


        // Round to maximum of 2 decimal places

        gain =
            Math.round(gain * 100) / 100;


        // Maximum Gain

        if (gain > 10000) {
            gain = 10000;
        }


        // Commit Gain

        committedGains[i] =
            gain;


        // Update textbox

        gainInput.value =
            gain;


        // Apply Gain immediately

        updateOnePeakSignal(i);

        document.getElementById(
            "graph-gain-" + (i + 1)
        ).textContent =
            "x" + gain;

    });

}


// ======================================================
// 5. FLUIDICS ELEMENTS
// ======================================================
//
// Get all HTML elements used by the fluidics system.
//
// ======================================================


// Buttons

const startButton =
    document.getElementById("infuse-button");

const refillButton =
    document.getElementById("refill-button");

const purgeButton =
    document.getElementById("purge-button");


// Status display

const reservoirBar =
    document.getElementById("reservoir-bar");

const fluidicsStatus =
    document.getElementById("fluidics-status-text");


// Fluidics controls

const flowRateInput =
    document.getElementById("flow-rate");

const reservoirSelect =
    document.getElementById("reservoir");

const flowStateSelect =
    document.getElementById("flow-state");

const fillVolumeSelect =
    document.getElementById("fill-volume");



// ======================================================
// 6. FLUIDICS STATE
// ======================================================
//
// Stores the current simulated condition of the fluidics.
//
// ======================================================


let reservoirLevel = 100;

const reservoirVolume = 250;

let timeRemaining = 0;

let reservoirTimer = null;

let isActuallyInfusing = false;

let previousFlowState = null;

let committedFlowRate =
    parseFloat(flowRateInput.value);



// ======================================================
// 7. PEAK VISIBILITY
// ======================================================
//
// Test peaks only appear when ALL THREE are true:
//
//      1. Instrument is in Operate
//      2. Fluidics are actively infusing
//      3. Flow State is Infusion of Combined
//
// If any condition becomes false, the peaks disappear.
//
// ======================================================

function updatePeakVisibility() {

    const isInfusing =
        isActuallyInfusing;

    const isInfusionMode =
        flowStateSelect.value === "Infusion" ||
        flowStateSelect.value === "Combined";

    const isOperate =
        operating === true;

    const showPeaks =
        isInfusing &&
        isInfusionMode &&
        isOperate;

    const peaks =
        document.querySelectorAll(".test-peak");

    const noiseTraces =
        document.querySelectorAll(".noise-trace");


    peaks.forEach(function (peak) {

        if (showPeaks) {

        peak.style.display = "block";

        }

    });


    noiseTraces.forEach(function (noiseTrace) {

        if (isOperate) {
            noiseTrace.style.display = "block";
        } else {
            noiseTrace.style.display = "none";
        }

    });


}


// ======================================================
// 8. OPERATE / STANDBY BUTTONS
// ======================================================
//
// Operate:
//      Instrument enters Operate mode.
//      Operate button becomes disabled.
//      Standby button becomes enabled.
//      Status light turns green.
//
// Standby:
//      Instrument enters Standby mode.
//      Standby button becomes disabled.
//      Operate button becomes enabled.
//      Status light turns red.
//
// Changing mode also updates peak visibility.
//
// ======================================================

const standbyButton =
    document.getElementById("standby-button");


// ------------------------------------------------------
// OPERATE
// ------------------------------------------------------

operateButton.addEventListener("click", function () {

    operating = true;

    operateButton.disabled = true;
    standbyButton.disabled = false;

    operateIndicator.style.background =
        "#00ee22";

    operateIndicator.style.borderColor =
        "#008800";

    statusText.querySelector("#status-value").textContent =
        "Status: Operate";

    updatePeakVisibility();

});


// ------------------------------------------------------
// STANDBY
// ------------------------------------------------------

standbyButton.addEventListener("click", function () {

    operating = false;

    // Immediately hide all peaks
    document.querySelectorAll(".test-peak").forEach(function (peak) {

        peak.dataset.scale = "0";

        peak.style.transform =
            "translateX(-50%) scaleY(0)";

        peak.style.display = "none";

    });

    // Standby always sends flow to Waste
    flowStateSelect.value = "Waste";

    operateButton.disabled = false;
    standbyButton.disabled = true;

    operateIndicator.style.background =
        "#ff0000";

    operateIndicator.style.borderColor =
        "#880000";

    statusText.querySelector("#status-value").textContent =
        "Status: Standby";

    updatePeakVisibility();

});



// ======================================================
// 9. FLUIDICS FUNCTIONS
// ======================================================



// ------------------------------------------------------
// CALCULATE TIME REMAINING
// ------------------------------------------------------


function calculateTimeRemaining() {

    const flowRate =
        committedFlowRate;


    if (isNaN(flowRate) || flowRate <= 0) {

        timeRemaining = 0;

        return;
    }


    // Actual liquid remaining in µL

    const volumeRemaining =
        reservoirVolume *
        (reservoirLevel / 100);


    // Convert infusion time from minutes to seconds

    timeRemaining =
        (volumeRemaining / flowRate) * 60;

}



// ------------------------------------------------------
// ENABLE / DISABLE FLUIDICS CONTROLS
// ------------------------------------------------------

function setFluidicsControlsDisabled(disabled) {

    reservoirSelect.disabled =
        disabled;

    flowStateSelect.disabled =
        disabled;

    fillVolumeSelect.disabled =
        disabled;

    refillButton.disabled =
        disabled;

    purgeButton.disabled =
        disabled;

}



// ------------------------------------------------------
// UPDATE RESERVOIR DISPLAY
// ------------------------------------------------------

function updateReservoir() {

    reservoirBar.style.width =
        reservoirLevel + "%";


    const minutesRemaining =
        timeRemaining / 60;


    fluidicsStatus.textContent =
        "Infusing - " +
        minutesRemaining.toFixed(2) +
        " mins";

}



// ======================================================
// 10. INITIAL FLUIDICS DISPLAY
// ======================================================

calculateTimeRemaining();

// Only update the status when fluidics are idle
if (reservoirTimer === null) {

    fluidicsStatus.textContent =
        "Idle - " +
        (timeRemaining / 60).toFixed(2) +
        " mins";
}



// ======================================================
// 11. FLOW RATE
// ======================================================
//
// Flow Rate only commits when Enter is pressed.
//
// It always displays one decimal place.
//
// ======================================================

flowRateInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        const flowRate =
            parseFloat(flowRateInput.value);

    if (
        isNaN(flowRate) ||
        flowRate < 0.1 ||
        flowRate > 1000
    ) {

        flowRateInput.value =
            committedFlowRate.toFixed(1);

        return;
    }


        // Commit new Flow Rate

        committedFlowRate =
            flowRate;


        // Always display one decimal place

        flowRateInput.value =
            flowRate.toFixed(1);


        calculateTimeRemaining();

        if (reservoirTimer === null) {

        fluidicsStatus.textContent =
            "Idle - " +
            (timeRemaining / 60).toFixed(2) +
            " mins";
        }

        flowRateInput.blur();
    }

});

// If the user leaves the Flow Rate box without
// pressing Enter, restore the committed value

flowRateInput.addEventListener("blur", function () {

    flowRateInput.value =
        committedFlowRate.toFixed(1);

});


// ======================================================
// 12. START / STOP INFUSION
// ======================================================
//
// The same button performs both functions.
//
// START:
//
//      Begins consuming reservoir volume.
//      Button changes to Stop.
//
// STOP:
//
//      Stops consuming reservoir volume.
//      Button changes back to Start.
//
// ======================================================

startButton.addEventListener("click", function () {


    // --------------------------------------------------
    // STOP
    // --------------------------------------------------

    if (reservoirTimer !== null) {

        clearInterval(reservoirTimer);

        reservoirTimer = null;

        isActuallyInfusing = false;

        startButton.textContent =
            "Start";

        setFluidicsControlsDisabled(false);

        calculateTimeRemaining();

        fluidicsStatus.textContent =
            "Idle - " +
            (timeRemaining / 60).toFixed(2) +
            " mins";

        // Stopping infusion hides peaks
        updatePeakVisibility();

        return;
    }


    // --------------------------------------------------
    // DON'T START IF RESERVOIR IS EMPTY
    // --------------------------------------------------

    if (reservoirLevel <= 0) {

        reservoirLevel = 0;

        timeRemaining = 0;

        reservoirBar.style.width =
            "0%";

        fluidicsStatus.textContent =
            "Empty - 0.00 mins";

        isActuallyInfusing = false;

        updatePeakVisibility();

        return;
    }


    // --------------------------------------------------
    // VALIDATE FLOW RATE
    // --------------------------------------------------

    const flowRate =
        committedFlowRate;

    if (isNaN(flowRate) || flowRate <= 0) {
        return;
    }


    // --------------------------------------------------
    // START INFUSION
    // --------------------------------------------------

    isActuallyInfusing = true;

    startButton.textContent =
        "Stop";

    setFluidicsControlsDisabled(true);

    calculateTimeRemaining();

    fluidicsStatus.textContent =
        "Infusing - " +
        (timeRemaining / 60).toFixed(2) +
        " mins";

    // Start reservoir consumption timer

    reservoirTimer = setInterval(function () {

        const currentFlowRate =
            committedFlowRate;

        // Amount consumed every second in µL
        const volumeUsedPerSecond =
            currentFlowRate / 60;

        // Convert consumed volume into reservoir %
        const percentUsedPerSecond =
            (volumeUsedPerSecond / reservoirVolume) *
            100;

        reservoirLevel -=
            percentUsedPerSecond;


        // ----------------------------------------------
        // RESERVOIR EMPTY
        // ----------------------------------------------

        if (reservoirLevel <= 0) {

            reservoirLevel = 0;

            timeRemaining = 0;

            clearInterval(reservoirTimer);

            reservoirTimer = null;

            isActuallyInfusing = false;

            reservoirBar.style.width =
                "0%";

            fluidicsStatus.textContent =
                "Empty - 0.00 mins";

            startButton.textContent =
                "Start";

            setFluidicsControlsDisabled(false);

            // Empty reservoir = no peaks
            updatePeakVisibility();

            return;
        }

        // Update countdown and reservoir bar
        calculateTimeRemaining();
        updateReservoir();

    }, 1000);

    // Starting infusion may make peaks appear
    updatePeakVisibility();
});


// ======================================================
// 13. REFILL / PURGE
// ======================================================
//
// Reservoir refills at a constant:
//
//      10% per second
//
// Examples:
//
//      0%  -> 100% = 10 seconds
//      50% -> 100% = 5 seconds
//      90% -> 100% = 1 second
//
// ======================================================

refillButton.addEventListener("click", function () {


    // Don't refill while another timer is running

    if (reservoirTimer !== null) {
        return;
    }

    const startingLevel =
        reservoirLevel;


    // Selected fill volume converted to reservoir percentage

    const targetLevel =
        (parseFloat(fillVolumeSelect.value) / 250) * 100;


    const amountToFill =
        targetLevel - startingLevel;


    // --------------------------------------------------
    // ALREADY FULL
    // --------------------------------------------------

    if (amountToFill <= 0) {

        reservoirLevel = targetLevel;


        calculateTimeRemaining();


        reservoirBar.style.width =
            targetLevel + "%";


        fluidicsStatus.textContent =
            "Idle - " +
            (timeRemaining / 60).toFixed(2) +
            " mins";


        return;
    }



    // --------------------------------------------------
    // BEGIN REFILL
    // --------------------------------------------------

    setFluidicsControlsDisabled(true);

    startButton.textContent = "Stop";


    // At 10% per second:
    //
    // amountToFill / 10 = seconds required

    const refillDuration =
        amountToFill / 10;


    let refillElapsed = 0;


    fluidicsStatus.textContent =
        "Refilling";



    reservoirTimer = setInterval(function () {


        // Timer runs every 0.1 seconds

        refillElapsed += 0.1;


        reservoirLevel =
            startingLevel +
            amountToFill *
            (refillElapsed / refillDuration);



        // ----------------------------------------------
        // REFILL COMPLETE
        // ----------------------------------------------

        if (refillElapsed >= refillDuration) {

            reservoirLevel = targetLevel;


            calculateTimeRemaining();


            clearInterval(reservoirTimer);

            reservoirTimer = null;


            reservoirBar.style.width =
                targetLevel + "%";


            fluidicsStatus.textContent =
                "Idle - " +
                (timeRemaining / 60).toFixed(2) +
                " mins";

            if (previousFlowState !== null) {

                flowStateSelect.value =
                    previousFlowState;

                previousFlowState = null;
            }

            updatePeakVisibility();

            startButton.textContent =
                "Start";


            setFluidicsControlsDisabled(false);


            updatePeakVisibility();


            return;
        }



        // Animate reservoir filling

        reservoirBar.style.width =
            reservoirLevel + "%";


    }, 100);

});


// ======================================================
// PURGE
// ======================================================

purgeButton.addEventListener("click", function () {

    // Do nothing if another reservoir animation is running
    if (reservoirTimer !== null) {
        return;
    }


    // Remember current Flow State
    previousFlowState =
        flowStateSelect.value;


    // Purge always sends flow to Waste
    flowStateSelect.value =
        "Waste";

    updatePeakVisibility();


    // Disable fluidics controls during purge
    setFluidicsControlsDisabled(true);

    startButton.textContent =
        "Stop";

    fluidicsStatus.textContent =
        "Purging";


    // Start purge timer
    reservoirTimer = setInterval(function () {

        // Empty syringe at 10% per second
        reservoirLevel -= 1;


        // ----------------------------------------------
        // PURGE COMPLETE
        // ----------------------------------------------

        if (reservoirLevel <= 0) {

            reservoirLevel = 0;

            reservoirBar.style.width =
                "0%";

            clearInterval(reservoirTimer);

            reservoirTimer = null;


            // Allow Refill logic to take over
            setFluidicsControlsDisabled(false);

            refillButton.click();

            return;
        }


        // Animate syringe emptying
        reservoirBar.style.width =
            reservoirLevel + "%";

    }, 100);

});

// ======================================================
// FILL VOLUME CHANGE
// ======================================================

fillVolumeSelect.addEventListener("change", function () {

    purgeButton.click();

});


// ======================================================
// 14. FLOW STATE
// ======================================================
//
// Changing the Flow State can immediately show or hide
// peaks.
//
// Only:
//
//      Flow State = Infusion
//
// allows peaks to appear.
//
// ======================================================

flowStateSelect.addEventListener("change", function () {

    // Standby only allows Waste
    if (operating === false) {
        flowStateSelect.value = "Waste";
    }

    updatePeakVisibility();

});


// Changing reservoirs changes which simulated
// mass spectrum is present.


reservoirSelect.addEventListener("change", function () {

    // Update to the newly selected spectrum
    updatePeakPositions();

    // Refill syringe using the normal refill behavior
    purgeButton.click();

});



// ======================================================
// 15. INITIAL PEAK STATE
// ======================================================
//
// Page begins with peaks hidden.
//
// ======================================================

updatePeakVisibility();



// ======================================================
// 16. SIMULATED MASS SPECTRUM
// ======================================================
//
// This is the single underlying mass spectrum for the
// simulated instrument.
//
// Every graph window looks at this same spectrum.
// Mass and Span only determine which part of the
// spectrum is visible in each graph.
//
// ======================================================

const simulatedSpectra = {

    A: [

        { mass: 57.1,   signal: 1.00e7 },
        { mass: 58.1,   signal: 2.00e7 },
        { mass: 59.1,   signal: 1.00e8 },
        { mass: 60.1,   signal: 8.00e7 },
        { mass: 61.1,   signal: 1.00e7 },

        { mass: 174.1,  signal: 4.00e7 },
        { mass: 175.1,  signal: 1.00e8 },
        { mass: 176.1,  signal: 5.00e7 },

        { mass: 454.3,  signal: 4.00e7 },
        { mass: 455.3,  signal: 5.00e7 },
        { mass: 456.3,  signal: 1.00e7 },

        { mass: 1080.8, signal: 1.00e7 },
        { mass: 1081.8, signal: 6.00e6 },
        { mass: 1082.8, signal: 2.00e6 },

        { mass: 2034.6, signal: 5.00e6 },
        { mass: 2035.6, signal: 4.00e6 },
        { mass: 2036.6, signal: 2.50e6 }

    ],

    B: [

        { mass: 72.1,   signal: 6.00e7 },
        { mass: 73.1,   signal: 2.00e7 },
        { mass: 74.1,   signal: 1.00e8 },
        { mass: 75.1,   signal: 1.00e7 },
        { mass: 76.1,   signal: 5.00e7 },

        { mass: 93.0,   signal: 1.00e7 },
        { mass: 94.0,   signal: 6.00e7 },
        { mass: 95.0,   signal: 1.00e8 },
        { mass: 96.0,   signal: 5.00e7 },
        { mass: 97.0,   signal: 1.00e7 },

        { mass: 453.3,  signal: 4.00e6 },
        { mass: 455.3,  signal: 4.00e7 },
        { mass: 456.3,  signal: 1.20e7 },
        { mass: 457.3,  signal: 2.50e7 },

        { mass: 556.3,  signal: 4.00e7 },
        { mass: 557.3,  signal: 2.00e7 },
        { mass: 558.3,  signal: 4.00e6 },

        { mass: 1122.0, signal: 1.00e7 },
        { mass: 1123.0, signal: 4.00e6 },
        { mass: 1124.0, signal: 1.00e6 },

        { mass: 1135.5, signal: 5.00e7 },
        { mass: 1222.0, signal: 7.00e7 },
        { mass: 1322.0, signal: 9.00e7 },
        { mass: 1422.0, signal: 8.00e7 },
        { mass: 1522.0, signal: 6.00e7 },
        { mass: 1622.0, signal: 4.00e7 },

        { mass: 1722.0, signal: 2.00e7 },
        { mass: 1723.0, signal: 8.00e6 },
        { mass: 1724.0, signal: 3.00e6 },

        { mass: 1971.6, signal: 1.80e7 },
        { mass: 1972.6, signal: 7.00e6 },
        { mass: 1973.6, signal: 5.00e6 },

        { mass: 2017.6, signal: 2.20e7 },
        { mass: 2018.6, signal: 2.00e7 },
        { mass: 2019.6, signal: 1.50e7 }

    ],

    Wash: []

};

function getActiveSpectrum() {

    return simulatedSpectra[reservoirSelect.value] || [];

}



// ------------------------------------------------------
// UPDATE PEAK SIGNAL DISPLAY
// ------------------------------------------------------

function updatePeakSignals(peaksActive) {

    for (let i = 0; i < 4; i++) {

        const peakDisplay =
            document.getElementById(
                "graph-peak-" + (i + 1)
            );

        if (peaksActive) {

            peakDisplay.textContent =
                idealPeakSignals[i]
                    .toExponential(2)
                    .replace("e+", "e");

        } else {

            peakDisplay.textContent =
                "0.00e0";
        }
    }
}


// ------------------------------------------------------
// UPDATE ONE GRAPH'S PEAK SIGNALS
// ------------------------------------------------------
//
// Updates every spectrum peak currently visible
// inside one graph.
//
// Each visible peak gets its height from:
//
//      spectrum signal
//      × growth/shrink scale
//      × Gain
//
// The graph signal readout displays the strongest
// measured peak currently visible.
//
// ------------------------------------------------------

function updateOnePeakSignal(graphIndex) {

    const peakDisplay =
        document.getElementById(
            "graph-peak-" + (graphIndex + 1)
        );

    const plotArea =
        document.querySelectorAll(".plot-area")[
            graphIndex
        ];

    const peaks =
        plotArea.querySelectorAll(".test-peak");

    const gain =
        committedGains[graphIndex];

    const activeSpectrum =
        getActiveSpectrum();

    const strongestSpectrumSignal =
        1.00e8;

        let strongestMeasuredSignal = 0;


    // --------------------------------------------------
    // UPDATE EVERY VISIBLE PEAK
    // --------------------------------------------------

    peaks.forEach(function (peak) {

        const spectrumPeakIndex =
            parseInt(
                peak.dataset.spectrumPeak
            );

        if (
            isNaN(spectrumPeakIndex) ||
            !activeSpectrum[spectrumPeakIndex]
        ) {
            return;
        }


        // Random signal fluctuation of +/- 2%

        const variation =
            1 +
            ((Math.random() - 0.5) * 0.04);


        // Current growth / shrink animation scale

        const currentScale =
            parseFloat(
                peak.dataset.scale
            ) || 0;


        // Signal belonging to this spectrum peak

        const idealSignal =
            activeSpectrum[
                spectrumPeakIndex
            ].signal;


        // Current measured signal

        const measuredSignal =
            idealSignal *
            currentScale *
            variation;


        // Remember strongest visible signal

        if (
            measuredSignal >
            strongestMeasuredSignal
        ) {

            strongestMeasuredSignal =
                measuredSignal;
        }


        // Relative intensity compared with
        // strongest peak in entire spectrum

        const relativeSignal =
            measuredSignal /
            strongestSpectrumSignal;


        // Calculate displayed peak height

        const graphHeight =
            plotArea.clientHeight;

        const peakHeight =
            graphHeight *
            0.80 *
            relativeSignal *
            gain;


        // Apply peak height

        peak.style.setProperty(
            "--peak-height",
            peakHeight + "px"
        );

    });


    // --------------------------------------------------
    // UPDATE GRAPH SIGNAL READOUT
    // --------------------------------------------------

    if (strongestMeasuredSignal > 0) {

        peakDisplay.textContent =
            strongestMeasuredSignal
                .toExponential(2)
                .replace("e+", "e");

    } else if (operating === true) {

        const noiseSignal =
            1000 +
            Math.random() * 100;

        peakDisplay.textContent =
            noiseSignal
                .toExponential(2)
                .replace("e+", "e");

    } else {

        peakDisplay.textContent =
            "0.00e0";
    }
}




// ------------------------------------------------------
// UPDATE ALL PEAK POSITIONS
// ------------------------------------------------------

function updatePeakPositions() {

    for (let i = 0; i < 4; i++) {

        updateOnePeakPosition(i);

    }
}


// ------------------------------------------------------
// UPDATE ONE PEAK POSITION
// ------------------------------------------------------
//
// Each graph is only a viewport into the shared
// simulated mass spectrum.
//
// Every spectrum peak that falls inside the graph's
// committed Mass / Span range is displayed.
//
// ------------------------------------------------------

function updateOnePeakPosition(graphIndex) {

    const plotArea =
        document.querySelectorAll(".plot-area")[
            graphIndex
        ];


    // Read COMMITTED mass-window settings

    const windowMass =
        committedMasses[graphIndex];

    const span =
        committedSpans[graphIndex];


    // Calculate visible mass range

    const minimumMass =
        windowMass - span / 2;

    const maximumMass =
        windowMass + span / 2;


    // --------------------------------------------------
    // REMOVE OLD PEAKS FROM THIS VIEWPORT
    // --------------------------------------------------

    const oldPeaks =
        plotArea.querySelectorAll(".test-peak");

    oldPeaks.forEach(function (peak) {
        peak.remove();
    });


    // --------------------------------------------------
    // FIND ALL SPECTRUM PEAKS INSIDE THIS VIEWPORT
    // --------------------------------------------------

    const activeSpectrum =
        getActiveSpectrum();

    activeSpectrum.forEach(function (spectrumPeak, spectrumPeakIndex) {

        if (
            spectrumPeak.mass >= minimumMass &&
            spectrumPeak.mass <= maximumMass
        ) {


            // ------------------------------------------
            // CREATE PEAK
            // ------------------------------------------

            const existingPeak =
                plotArea.querySelector(
                    '.test-peak[data-spectrum-peak="' +
                    spectrumPeakIndex +
                    '"]'
                );

                if (existingPeak) {
                    return;
                }

            const peak =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "svg"
                );

            peak.setAttribute(
                "class",
                "test-peak"
            );

            peak.setAttribute(
                "viewBox",
                "40 0 20 100"
            );

            peak.setAttribute(
                "preserveAspectRatio",
                "none"
            );

            peak.dataset.spectrumPeak =
                spectrumPeakIndex;

            const peaksActive =
                operating === true &&
                reservoirTimer !== null &&
                startButton.textContent === "Stop" &&
                (
                    flowStateSelect.value === "Infusion" ||
                    flowStateSelect.value === "Combined"
                );

            peak.dataset.scale =
                peaksActive ? "1" : "0";

            peak.style.transform =
                "translateX(-50%) scaleY(" +
                (peaksActive ? 1 : 0) +
                ")";


            // Create peak shape

            const peakShape =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path"
                );

            peakShape.setAttribute(
                "class",
                "peak-shape"
            );

            peakShape.setAttribute(
                "d",
                "M 0 100 " +
                "L 30 100 " +
                "C 38 99, 41 94, 42 82 " +
                "L 46 12 " +
                "C 46.5 4, 48 0, 50 0 " +
                "C 52 0, 53.5 4, 54 12 " +
                "L 58 82 " +
                "C 59 94, 62 99, 70 100 " +
                "L 100 100 Z"
            );

            peak.appendChild(
                peakShape
            );


            // ------------------------------------------
            // POSITION PEAK
            // ------------------------------------------

            const massDifference =
                spectrumPeak.mass - windowMass;


            // Read current LM Position
            const lmPosition =
                parseInt(
                    document.getElementById("lm-position").value
                );

            // 512 = no shift
            const lmPositionOffset =
                lmPosition - 512;

            const position =
                50 +
                (massDifference / span) * 100 +
                lmPositionOffset;

            peak.style.left =
                position + "%";


            // ------------------------------------------
            // SET PEAK WIDTH
            // ------------------------------------------

            const peakMassWidth =
                0.75;

            const peakWidthPercent =
                (peakMassWidth / span) * 100;

            peak.style.width =
                peakWidthPercent + "%";


            // ------------------------------------------
            // ADD PEAK TO GRAPH
            // ------------------------------------------

            plotArea.appendChild(peak);
        }
    });
}

// Create initial spectrum viewports

updatePeakPositions();


// ======================================================
// 17. MASS WINDOW ENABLE / DISABLE
// ======================================================
//
// Each checkbox controls whether its corresponding
// mass spectrum window is displayed.
//
// Remaining enabled windows automatically expand
// to divide the available graph area equally.
//
// ======================================================


const graphCheckboxes = [
    document.getElementById("graph-enabled-1"),
    document.getElementById("graph-enabled-2"),
    document.getElementById("graph-enabled-3"),
    document.getElementById("graph-enabled-4")
];

const graphWindows =
    document.querySelectorAll(".graph");


// ------------------------------------------------------
// UPDATE GRAPH VISIBILITY
// ------------------------------------------------------

function updateGraphVisibility() {

    let enabledCount = 0;


    // Count enabled graphs

    for (let i = 0; i < 4; i++) {

        if (graphCheckboxes[i].checked) {
            enabledCount++;
        }
    }


    // Show or hide each graph

    for (let i = 0; i < 4; i++) {

        if (graphCheckboxes[i].checked) {

            graphWindows[i].style.display =
                "flex";

        } else {

            graphWindows[i].style.display =
                "none";
        }


        // Prevent disabling the final graph

        graphCheckboxes[i].disabled =
            enabledCount === 1 &&
            graphCheckboxes[i].checked;
    }
}


// ------------------------------------------------------
// CHECKBOX EVENTS
// ------------------------------------------------------

for (let i = 0; i < 4; i++) {

    graphCheckboxes[i].addEventListener(
        "change",
        updateGraphVisibility
    );
}


// Apply initial checkbox state

updateGraphVisibility();


// ======================================================
// 18. SCAN / NOISE TRACES
// ======================================================
//
// Simulates sequential scanning of the enabled
// mass windows.
//
// One enabled graph is scanned every 0.5 seconds.
//
// Peak growth and decay also occur during each
// graph's individual scan.
//
// ======================================================


const scanTime = 500;

let currentScanGraph = 0;


// ------------------------------------------------------
// UPDATE ONE NOISE TRACE
// ------------------------------------------------------

function updateNoiseTrace(graphIndex) {

    const noiseLines =
        document.querySelectorAll(".noise-line");

    const line =
        noiseLines[graphIndex];

    const points = [];

    const numberOfPoints = 200;

    const baseline = 98;

    const noiseAmount = 2;


    for (let i = 0; i <= numberOfPoints; i++) {

        const x =
            (i / numberOfPoints) * 1000;

        const noise =
            (Math.random() - 0.5) *
            noiseAmount;

        const y =
            baseline + noise;

        points.push(
            x + "," + y
        );
    }


    // Close shape along bottom of graph

    points.push("1000,100");

    points.push("0,100");


    line.setAttribute(
        "points",
        points.join(" ")
    );
}


// ------------------------------------------------------
// SCAN NEXT GRAPH
// ------------------------------------------------------

function scanNextGraph() {


    updateNoiseTrace(
        currentScanGraph
    );

    updateGraph(
        currentScanGraph + 1
    );

    syncPeaksForMassWindow(
        currentScanGraph
    );

    updateExistingPeaksForMassAndSpan(
        currentScanGraph
    );

    updateLMPosition(
        currentScanGraph
    );

    updateResolution(
        currentScanGraph
    );
    
    const gain =
        committedGains[currentScanGraph];


    // Update xGain display

    document.getElementById(
        "graph-gain-" + (currentScanGraph + 1)
    ).textContent =
        "x" + gain;


    // --------------------------------------------------
    // GET ALL PEAKS IN CURRENT GRAPH
    // --------------------------------------------------

    const plotArea =
        document.querySelectorAll(".plot-area")[
            currentScanGraph
        ];

    const peaks =
        plotArea.querySelectorAll(".test-peak");


    // --------------------------------------------------
    // CHECK WHETHER PEAKS SHOULD BE ACTIVE
    // --------------------------------------------------

    const peaksActive =
        operating === true &&
        isActuallyInfusing === true &&
        (
            flowStateSelect.value === "Infusion" ||
            flowStateSelect.value === "Combined"
        );


    // --------------------------------------------------
    // GROW OR SHRINK ALL VISIBLE PEAKS
    // --------------------------------------------------

    peaks.forEach(function (peak) {

        let currentScale =
            parseFloat(
                peak.dataset.scale
            ) || 0;


        if (peaksActive) {

            peak.style.display =
                "block";

            currentScale +=
                0.4;

            if (currentScale > 1) {
                currentScale = 1;
            }

        } else {

            currentScale -=
                0.4;

            if (currentScale < 0) {
                currentScale = 0;
            }
        }


        // ----------------------------------------------
        // APPLY NEW PEAK SIZE
        // ----------------------------------------------

        peak.dataset.scale =
            currentScale;

        const resolutionHeight =
            parseFloat(
                peak.dataset.resolutionHeight || 1
            );

        peak.style.transform =
            "translateX(-50%) scaleY(" +
            (currentScale * resolutionHeight) +
            ")";
        
        if (currentScale === 0) {

            peak.style.display =
                "none";
        }

    });


    // --------------------------------------------------
    // UPDATE SIGNAL READBACK
    // --------------------------------------------------

    updateOnePeakSignal(
        currentScanGraph
    );


    // --------------------------------------------------
    // MOVE TO NEXT ENABLED GRAPH
    // --------------------------------------------------

    let nextGraph =
        currentScanGraph;


    // Check at most four graphs

    for (let i = 0; i < 4; i++) {

        nextGraph++;

        if (nextGraph >= 4) {
            nextGraph = 0;
        }


        // Stop when an enabled graph is found

        if (graphCheckboxes[nextGraph].checked) {

            currentScanGraph =
                nextGraph;

            break;
        }
    }
}


// ------------------------------------------------------
// START SCANNING
// ------------------------------------------------------


// Create initial noise traces

for (let i = 0; i < 4; i++) {

    updateNoiseTrace(i);

}


// Update one graph every 0.5 seconds

setInterval(
    scanNextGraph,
    scanTime
);


// ======================================================
// 19. DRAG-TO-SET GAIN
// ======================================================
//
// Click and drag DOWNWARD inside a graph to draw
// a vertical measurement cursor.
//
// Mouse down:
//      Nothing appears yet.
//
// Drag downward:
//      Cursor grows downward from the original
//      click position.
//
// Mouse release:
//      The LENGTH of the cursor becomes the desired
//      peak height.
//
// Gain is then adjusted so the current peak reaches
// that measured height.
//
// Gain range:
//      0.1 to 10000
//
// ======================================================


const gainPlotAreas =
    document.querySelectorAll(".plot-area");


// ------------------------------------------------------
// CREATE GAIN CURSOR FOR EACH GRAPH
// ------------------------------------------------------

for (let i = 0; i < 4; i++) {

    const plotArea =
        gainPlotAreas[i];


    // Create vertical measurement cursor

    const gainCursor =
        document.createElement("div");

    gainCursor.className =
        "gain-drag-cursor";


    // Create top and bottom caps

    const topCap =
        document.createElement("div");

    topCap.className =
        "gain-cursor-top";


    const bottomCap =
        document.createElement("div");

    bottomCap.className =
        "gain-cursor-bottom";


    gainCursor.appendChild(topCap);

    gainCursor.appendChild(bottomCap);

    plotArea.appendChild(gainCursor);


    // Drag state

    let isDragging =
        false;

    let startX =
        0;

    let startY =
        0;

    let dragHeight =
        0;


    // --------------------------------------------------
    // START DRAG
    // --------------------------------------------------

    plotArea.addEventListener(
        "mousedown",
        function (event) {

            // Left mouse button only

            if (event.button !== 0) {
                return;
            }


            // ------------------------------------------
            // FIND PEAK NEAREST TO CLICK
            // ------------------------------------------

            const currentPeaks =
                plotArea.querySelectorAll(".test-peak");

            if (currentPeaks.length === 0) {
                return;
            }

            const plotRect =
                plotArea.getBoundingClientRect();

            const clickX =
                event.clientX - plotRect.left;

            let peak = null;

            let closestDistance =
                Infinity;


            currentPeaks.forEach(function (candidatePeak) {

                const peakRect =
                    candidatePeak.getBoundingClientRect();

                const peakCenterX =
                    (
                        peakRect.left +
                        peakRect.width / 2
                    ) -
                    plotRect.left;

                const distance =
                    Math.abs(
                        clickX - peakCenterX
                    );

                if (distance < closestDistance) {

                    closestDistance =
                        distance;

                    peak =
                        candidatePeak;
                }
            });


            // Peak must currently be active

            if (peak === null) {
                return;
            }

            const currentScale =
                parseFloat(
                    peak.dataset.scale
                ) || 0;

            if (currentScale <= 0) {
                return;
            }


            // Remember starting mouse position

            const rect =
                plotArea.getBoundingClientRect();

            startX =
                event.clientX - rect.left;

            startY =
                event.clientY - rect.top;


            // Remember current Gain

            gainCursor.dataset.startGain =
                committedGains[i];


            // Remember current displayed peak height

            const currentPeakHeight =
                peak.getBoundingClientRect().height *
                currentScale;

            gainCursor.dataset.startPeakHeight =
                currentPeakHeight;


            // Prepare cursor, but DO NOT show it yet

            gainCursor.style.display =
                "none";

            gainCursor.style.left =
                startX + "px";

            gainCursor.style.top =
                startY + "px";

            gainCursor.style.bottom =
                "auto";

            gainCursor.style.height =
                "0px";


            dragHeight =
                0;

            isDragging =
                true;


            document.addEventListener(
                "mousemove",
                moveGainCursor
            );

            document.addEventListener(
                "mouseup",
                finishGainDrag
            );

        }
    );


    // --------------------------------------------------
    // MOVE GAIN CURSOR
    // --------------------------------------------------

    function moveGainCursor(event) {

        if (!isDragging) {
            return;
        }


        const rect =
            plotArea.getBoundingClientRect();


        // Current mouse position inside graph

        let currentY =
            event.clientY - rect.top;


        // Keep mouse position inside graph

        if (currentY < 0) {
            currentY = 0;
        }

        if (currentY > rect.height) {
            currentY = rect.height;
        }


        // Only downward movement counts

        dragHeight =
            currentY - startY;


        // Do not show anything until the
        // mouse has actually moved downward

        if (dragHeight <= 2) {

            gainCursor.style.display =
                "none";

            return;
        }


        // Show cursor once dragging begins

        gainCursor.style.display =
            "block";


        // Cursor starts where mouse was pressed
        // and grows downward

        gainCursor.style.top =
            startY + "px";

        gainCursor.style.height =
            dragHeight + "px";

    }


    // --------------------------------------------------
    // FINISH DRAG
    // --------------------------------------------------

    function finishGainDrag() {

        if (!isDragging) {
            return;
        }


        isDragging =
            false;


        document.removeEventListener(
            "mousemove",
            moveGainCursor
        );

        document.removeEventListener(
            "mouseup",
            finishGainDrag
        );


        // Hide cursor

        gainCursor.style.display =
            "none";


        // Ignore normal clicks or upward drags

        if (dragHeight <= 2) {
            return;
        }


        const currentPeakHeight =
            parseFloat(
                gainCursor.dataset.startPeakHeight
            );

        const currentGain =
            parseFloat(
                gainCursor.dataset.startGain
            );


        // Cannot calculate Gain from a zero-height peak

        if (
            isNaN(currentPeakHeight) ||
            currentPeakHeight <= 0
        ) {
            return;
        }


        // The LENGTH of the line drawn by the user
        // is the desired final peak height

        const targetPeakHeight =
            dragHeight;


        // Calculate Gain required to make the
        // current peak match the measured height

        let newGain =
            currentGain *
            (plotArea.clientHeight / targetPeakHeight);


        // Gain limits

        if (newGain < 0.1) {
            newGain = 0.1;
        }

        if (newGain > 10000) {
            newGain = 10000;
        }


        // Round to maximum of 2 decimal places

        newGain =
            Math.round(newGain * 100) / 100;


        // Commit Gain

        committedGains[i] =
            newGain;


        // Update Gain textbox

        document.getElementById(
            "gain-" + (i + 1)
        ).value =
            newGain;


        // Update Gain display

        document.getElementById(
            "graph-gain-" + (i + 1)
        ).textContent =
            "x" + newGain;


        // Apply Gain immediately

        updateOnePeakSignal(i);

    }

}


// ======================================================
// 20. RESOLUTION CHECK
// ======================================================

const resolutionCheckStart =
    document.getElementById("resolution-check-start");

const resolutionCheckOutput =
    document.getElementById("resolution-check-output");

const resolutionPlayAgain =
    document.getElementById("resolution-play-again");


// Stores the active Resolution Check timer

let resolutionTimer = null;


// ------------------------------------------------------
// PLAY AGAIN
// ------------------------------------------------------

resolutionPlayAgain.addEventListener("click", function () {

    window.location.reload();

});


resolutionCheckStart.addEventListener("click", function () {

    // ------------------------------------------------------
    // STOP RUNNING RESOLUTION CHECK
    // ------------------------------------------------------

    if (resolutionCheckStart.textContent === "Stop") {

        clearInterval(resolutionTimer);

        resolutionTimer = null;

        resolutionCheckOutput.textContent = "";
        resolutionCheckStart.textContent = "Start";

        return;
    }


    // ------------------------------------------------------
    // CHECK FOR ACTIVE PEAKS
    // ------------------------------------------------------

    const peaksAvailable =
        operating === true &&
        isActuallyInfusing === true &&
        (
            flowStateSelect.value === "Infusion" ||
            flowStateSelect.value === "Combined"
        );


    if (!peaksAvailable) {

        resolutionCheckOutput.textContent =
            "No peaks detected.";

        resolutionCheckStart.textContent =
            "Start";

        return;
    }


    // ------------------------------------------------------
    // START RESOLUTION CHECK
    // ------------------------------------------------------

    resolutionCheckStart.textContent = "Stop";

    resolutionCheckOutput.textContent = "";


    // ------------------------------------------------------
    // GET CURRENT ENGINEER SETTINGS
    // ------------------------------------------------------

    const lmPosition =
        parseFloat(
            document.getElementById("lm-position-value").value
        );

    const hmPosition =
        parseFloat(
            document.getElementById("hm-position-value").value
        );

    const lmResolution =
        parseFloat(
            document.getElementById("lm-resolution-value").value
        );

    const hmResolution =
        parseFloat(
            document.getElementById("hm-resolution-value").value
        );

    const linearity =
        parseFloat(
            document.getElementById("linearity-value").value
        );


    // ------------------------------------------------------
    // BUILD RESOLUTION CHECK SEQUENCE
    // ------------------------------------------------------

    const steps = [];

    let allPassed = true;

    // Get selected difficulty / fill volume

    const fillVolume =
        parseFloat(
            document.getElementById("fill-volume").value
        );

    committedMasses.forEach(function (mass) {

        const displayedMass =
            mass.toFixed(1).padEnd(7, " ");


        // ------------------------------------------------------
        // MASS RANGE WEIGHTING
        // ------------------------------------------------------

        const lmMassWeight =
            500 /
            (mass + 500);

        const hmMassWeight =
            mass /
            (mass + 500);

        const massFraction =
            mass / 2048;

        const linearityWeight =
            4 *
            massFraction *
            (1 - massFraction);


        // ------------------------------------------------------
        // CALCULATE MASS POSITION
        // ------------------------------------------------------

        const lmPositionOffset =
            (lmPosition -
            idealEngineerSettings.lmPosition) * 0.2;

        const hmPositionOffset =
            (hmPosition -
            idealEngineerSettings.hmPosition) * 0.1;


        const positionEffect =
            lmPositionOffset * lmMassWeight +
            hmPositionOffset * hmMassWeight;


        const lmResolutionOffset =
            lmResolution -
            idealEngineerSettings.lmResolution;

        const hmResolutionOffset =
            hmResolution -
            idealEngineerSettings.hmResolution;

        const linearityOffset =
            linearity -
            idealEngineerSettings.linearity;


        const resolutionEffect =
            lmResolutionOffset * lmMassWeight +
            hmResolutionOffset * hmMassWeight +
            linearityOffset * linearityWeight;


        // Convert Position error into mass shift

        const positionMassShift =
            positionEffect;


        // Resolution settings also shift peak position

        const resolutionMassShift =
            resolutionEffect * 0.1;


        // Total simulated peak position

        const measuredMass =
            mass +
            positionMassShift +
            resolutionMassShift;

        const massError =
            Math.abs(
                measuredMass - mass
            );

        const massInRange =
            massError <= 0.50;


        // ------------------------------------------------------
        // CALCULATE FWHH
        // ------------------------------------------------------

        const basePeakMassWidth =
            0.75;

        const peakMassWidth =
            basePeakMassWidth *
            (1 - resolutionEffect * 0.1);

        const safePeakMassWidth =
            Math.max(
                0.05,
                peakMassWidth
            );


        // Ideal:
        // 0.75 peak width = 0.50 FWHH

        const fwhh =
            safePeakMassWidth *
            (0.50 / 0.75);


        // ------------------------------------------------------
        // DETERMINE RESULT
        // ------------------------------------------------------

        let resultText;


        // Set acceptable FWHH range

        let minFWHH;
        let maxFWHH;

        if (fillVolume === 250) {

            minFWHH = 0.40;
            maxFWHH = 0.60;

        }

        else if (fillVolume === 100) {

            minFWHH = 0.45;
            maxFWHH = 0.55;

        }

        else if (fillVolume === 50) {

            minFWHH = 0.49;
            maxFWHH = 0.51;

        }


        // Peak must first be within ±0.50 Da

        if (!massInRange) {

            resultText =
                "Not Detected (\u00B10.5 Da)";

            allPassed = false;

        }


        // If position is acceptable,
        // check FWHH

        else if (
            fwhh >= minFWHH &&
            fwhh <= maxFWHH
        ) {

            resultText =
                "FWHH = " +
                fwhh.toFixed(2) +
                " PASS";

        }


        else {

            resultText =
                "FWHH = " +
                fwhh.toFixed(2) +
                " FAIL";

            allPassed = false;

        }


        // ------------------------------------------------------
        // BUILD ANIMATION FOR THIS MASS
        // ------------------------------------------------------

        steps.push(
            displayedMass,
            displayedMass + ".",
            displayedMass + ". .",
            displayedMass + ". . .",
            displayedMass + ". . .  " + resultText
        );

    });


    // ------------------------------------------------------
    // SCORE CALCULATION
    // ------------------------------------------------------

    const lmPositionError =
        Math.abs(
            idealEngineerSettings.lmPosition -
            lmPosition
        );

    const hmPositionError =
        Math.abs(
            idealEngineerSettings.hmPosition -
            hmPosition
        );

    const lmResolutionError =
        Math.abs(
            idealEngineerSettings.lmResolution -
            lmResolution
        );

    const hmResolutionError =
        Math.abs(
            idealEngineerSettings.hmResolution -
            hmResolution
        );

    const linearityError =
        Math.abs(
            idealEngineerSettings.linearity -
            linearity
        );


    const totalError =
        lmPositionError +
        hmPositionError +
        lmResolutionError +
        hmResolutionError +
        linearityError;


    const score =
        Math.max(
            0,
            100 - totalError
        );


    const displayedScore =
        Math.round(score);


    // ------------------------------------------------------
    // FINAL RESULT
    // ------------------------------------------------------

    if (allPassed) {

        if (displayedScore === 100) {

            steps.push(
                "\nPASS (CONGRATULATIONS!)" +
                "\n\nScore = " +
                displayedScore
            );

        } else {

            steps.push(
                "\nPASS" +
                "\n\nScore = " +
                displayedScore
            );

        }

    } else {

        resolutionPlayAgain.style.display =
            "none";

        steps.push(
            "\nFAIL (TRY AGAIN)" +
            "\n\nScore = " +
            displayedScore
        );

    }


    // ------------------------------------------------------
    // RUN RESOLUTION CHECK ANIMATION
    // ------------------------------------------------------

    let step = 0;

    let completedLines = [];


    resolutionTimer =
        setInterval(function () {

            const currentStep =
                steps[step];


            resolutionCheckOutput.textContent =
                completedLines
                    .concat(currentStep)
                    .join("\n");


            // Every fifth step completes one mass

            if ((step + 1) % 5 === 0) {

                completedLines.push(
                    currentStep
                );

            }


            step++;


            // Resolution Check complete

            if (step >= steps.length) {

                clearInterval(
                    resolutionTimer
                );

                resolutionTimer = null;

                resolutionCheckStart.textContent =
                    "Start";

                if (allPassed) {

                    resolutionPlayAgain.style.display =
                        "inline-block";

                }

            }

        }, 500);

});


// RESET RESOLUTION CHECK

const resolutionCheckReset =
    document.getElementById("resolution-check-reset");


// Store the original engineer settings

const resolutionResetValues = {

    lmPosition:
        document.getElementById("lm-position").value,

    hmPosition:
        document.getElementById("hm-position").value,

    lmResolution:
        document.getElementById("lm-resolution").value,

    hmResolution:
        document.getElementById("hm-resolution").value,

    linearity:
        document.getElementById("linearity").value

};


resolutionCheckReset.addEventListener("click", function () {

    // Stop Resolution Check if currently running

    if (resolutionTimer !== null) {

        clearInterval(resolutionTimer);

        resolutionTimer = null;

    }


    // Return Start button to normal

    resolutionCheckStart.textContent =
        "Start";


    // Clear Resolution Check output

    resolutionCheckOutput.textContent =
        "";


    // Restore original engineer settings

    const settings = [

        [
            "lm-position",
            "lm-position-value",
            resolutionResetValues.lmPosition
        ],

        [
            "hm-position",
            "hm-position-value",
            resolutionResetValues.hmPosition
        ],

        [
            "lm-resolution",
            "lm-resolution-value",
            resolutionResetValues.lmResolution
        ],

        [
            "hm-resolution",
            "hm-resolution-value",
            resolutionResetValues.hmResolution
        ],

        [
            "linearity",
            "linearity-value",
            resolutionResetValues.linearity
        ]

    ];


    settings.forEach(function (setting) {

        document.getElementById(setting[0]).value =
            setting[2];

        document.getElementById(setting[1]).value =
            setting[2];

    });


    // Update peaks to match restored settings

    for (let i = 0; i < 4; i++) {

        updateLMPosition(i);

        updateResolution(i);

    }

});


// RESET WHEN FILL VOLUME CHANGES

document
    .getElementById("fill-volume")
    .addEventListener("change", function () {

        resolutionCheckReset.click();

    });


// RESOLUTION CHECK INFO

const resolutionCheckInfo =
    document.getElementById("resolution-check-info");

const resolutionCheckInfoBox =
    document.getElementById("resolution-check-info-box");


resolutionCheckInfo.addEventListener("click", function () {

    if (resolutionCheckInfoBox.style.display === "block") {

        resolutionCheckInfoBox.style.display = "none";

    } else {

        resolutionCheckInfoBox.style.display = "block";

    }

});


// ======================================================
// 21. DARK MODE
// ======================================================

const darkModeButton =
    document.getElementById("dark-mode-button");

darkModeButton.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

});