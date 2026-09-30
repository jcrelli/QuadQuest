/* Quad Quest © 2026 Jonathan Crellin
Independent educational simulation; not affiliated with or endorsed by Waters Corporation. */

// Fluidics

function calculateTimeRemaining() {

    const flowRate =
        committedFlowRate;

    if (isNaN(flowRate) || flowRate <= 0) {

        timeRemaining = 0;

        return;
    }

    const volumeRemaining =
        reservoirVolume *
        (reservoirLevel / 100);

    timeRemaining =
        (volumeRemaining / flowRate) * 60;

}

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

// Engineer Settings

function randomInteger(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}

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

    // Leaving without Enter restores the slider value.
    number.addEventListener("blur", function () {

        number.value =
            slider.value;

    });

}

function updateLMPosition(graphIndex) {

    const lmPosition =
        parseInt(
            document.getElementById("lm-position").value
        );

    const hmPosition =
        parseInt(
            document.getElementById("hm-position").value
        );

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

        const lmMassWeight =
            500 /
            (spectrumPeak.mass + 500);

        const hmMassWeight =
            spectrumPeak.mass /
            (spectrumPeak.mass + 500);

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

        const lmMassWeight =
            500 /
            (spectrumPeak.mass + 500);

        const hmMassWeight =
            spectrumPeak.mass /
            (spectrumPeak.mass + 500);

        // Linearity has its greatest effect near the middle of the mass range.
        const massFraction =
            spectrumPeak.mass / 2048;

        const linearityWeight =
            4 *
            massFraction *
            (1 - massFraction);

        const linearityEffect =
            linearityOffset *
            linearityWeight;

        const basePeakMassWidth =
            0.75;

        const resolutionEffect =
            lmResolutionOffset * lmMassWeight +
            hmResolutionOffset * hmMassWeight +
            linearityEffect;

        const resolutionMassShift =
            resolutionEffect * 0.1;

        const resolutionHeight =
            Math.max(
                0.1,
                1 - resolutionEffect * 0.02
            );

        peak.dataset.resolutionHeight =
            resolutionHeight;

        const peakMassWidth =
            basePeakMassWidth *
            (1 - resolutionEffect * 0.1);

        const safePeakMassWidth =
            Math.max(
                0.05,
                peakMassWidth
            );

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

// Mass / Span / Gain

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

if (span < 0.1) {
    span = 0.1;
}

    if (isNaN(mass) || isNaN(span)) {
        return;
    }

    title.textContent =
        mass.toFixed(1);

    const minimum =
        mass - span / 2;

    axis.innerHTML = "";

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

function updateGraphVisibility() {

    let enabledCount = 0;

    for (let i = 0; i < 4; i++) {

        if (graphCheckboxes[i].checked) {
            enabledCount++;
        }
    }

    for (let i = 0; i < 4; i++) {

        if (graphCheckboxes[i].checked) {

            graphWindows[i].style.display =
                "flex";

        } else {

            graphWindows[i].style.display =
                "none";
        }

        graphCheckboxes[i].disabled =
            enabledCount === 1 &&
            graphCheckboxes[i].checked;
    }
}

// Spectrum Graphs

function getActiveSpectrum() {

    return simulatedSpectra[reservoirSelect.value] || [];

}

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

        const variation =
            1 +
            ((Math.random() - 0.5) * 0.04);

        const currentScale =
            parseFloat(
                peak.dataset.scale
            ) || 0;

        const idealSignal =
            activeSpectrum[
                spectrumPeakIndex
            ].signal;

        const measuredSignal =
            idealSignal *
            currentScale *
            variation;

        if (
            measuredSignal >
            strongestMeasuredSignal
        ) {

            strongestMeasuredSignal =
                measuredSignal;
        }

        const relativeSignal =
            measuredSignal /
            strongestSpectrumSignal;

        const graphHeight =
            plotArea.clientHeight;

        const peakHeight =
            graphHeight *
            0.80 *
            relativeSignal *
            gain;

        peak.style.setProperty(
            "--peak-height",
            peakHeight + "px"
        );

    });

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

function updatePeakPositions() {

    for (let i = 0; i < 4; i++) {

        updateOnePeakPosition(i);

    }
}

function updateOnePeakPosition(graphIndex) {

    const plotArea =
        document.querySelectorAll(".plot-area")[
            graphIndex
        ];

    const windowMass =
        committedMasses[graphIndex];

    const span =
        committedSpans[graphIndex];

    const minimumMass =
        windowMass - span / 2;

    const maximumMass =
        windowMass + span / 2;

    const oldPeaks =
        plotArea.querySelectorAll(".test-peak");

    oldPeaks.forEach(function (peak) {
        peak.remove();
    });

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

            const massDifference =
                spectrumPeak.mass - windowMass;

            const lmPosition =
                parseInt(
                    document.getElementById("lm-position").value
                );

            const lmPositionOffset =
                lmPosition - 512;

            const position =
                50 +
                (massDifference / span) * 100 +
                lmPositionOffset;

            peak.style.left =
                position + "%";

            const peakMassWidth =
                0.75;

            const peakWidthPercent =
                (peakMassWidth / span) * 100;

            peak.style.width =
                peakWidthPercent + "%";

            plotArea.appendChild(peak);
        }
    });
}

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

    // Close the filled noise trace along the baseline.
    points.push("1000,100");

    points.push("0,100");

    line.setAttribute(
        "points",
        points.join(" ")
    );
}

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

    document.getElementById(
        "graph-gain-" + (currentScanGraph + 1)
    ).textContent =
        "x" + gain;

    const plotArea =
        document.querySelectorAll(".plot-area")[
            currentScanGraph
        ];

    const peaks =
        plotArea.querySelectorAll(".test-peak");

    const peaksActive =
        operating === true &&
        isActuallyInfusing === true &&
        (
            flowStateSelect.value === "Infusion" ||
            flowStateSelect.value === "Combined"
        );

    // Growth and decay advance only when this graph is scanned.
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

    updateOnePeakSignal(
        currentScanGraph
    );

    let nextGraph =
        currentScanGraph;

    for (let i = 0; i < 4; i++) {

        nextGraph++;

        if (nextGraph >= 4) {
            nextGraph = 0;
        }

        if (graphCheckboxes[nextGraph].checked) {

            currentScanGraph =
                nextGraph;

            break;
        }
    }
}

// Initialization
// Keep setup, listener registration, and timer startup in their original execution order.

// Engineer Settings / Initial Values

const idealEngineerSettings = {

    lmPosition: randomInteger(500, 550),
    hmPosition: randomInteger(500, 550),

    lmResolution: randomInteger(510, 590),
    hmResolution: randomInteger(2000, 2150),

    linearity: randomInteger(505, 525)

};

// Engineer Settings / Input Events

connect("lm-position", "lm-position-value");

connect("hm-position", "hm-position-value");

connect("lm-resolution", "lm-resolution-value");

connect("hm-resolution", "hm-resolution-value");

connect("linearity", "linearity-value");

// Operate / Standby / State

const operateButton =
    document.getElementById("operate-button");

const operateIndicator =
    document.getElementById("operate-indicator");

const statusText =
    document.getElementById("status-text");

let operating = false;

// Mass / Span / Gain / State and Input Events

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

for (let i = 0; i < 4; i++) {

document.getElementById(
    "graph-gain-" + (i + 1)
).textContent =
    "x" + committedGains[i];
}

// Keep this loop-scoped function and the input handlers in their original scope.
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

        const massDifference =
            spectrumPeak.mass - windowMass;

        const position =
            50 +
            (massDifference / span) * 100;

        peak.style.left =
            position + "%";

        const peakMassWidth =
            0.75;

        const peakWidthPercent =
            (peakMassWidth / span) * 100;

        peak.style.width =
            peakWidthPercent + "%";
    });
}

massInput.addEventListener("blur", function () {

    let value =
        parseFloat(massInput.value);

    if (isNaN(value)) {

        massInput.value =
            committedMasses[i - 1].toFixed(1);

        return;
    }

    if (
        value < 10 ||
        value > 2038
    ) {

        massInput.value =
            committedMasses[i - 1].toFixed(1);

        return;
    }

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

const previousMass =
    committedMasses[i - 1];

committedMasses[i - 1] =
    value;

massInput.value =
    value.toFixed(1);

});

spanInput.addEventListener("blur", function () {

    let value =
        parseFloat(spanInput.value);

    if (isNaN(value)) {

        spanInput.value =
            committedSpans[i - 1];

        return;
    }

    const mass =
        committedMasses[i - 1];

    const minimumMass =
        mass - value / 2;

    const maximumMass =
        mass + value / 2;

    if (
        value < 0.1 ||
        minimumMass < 0 ||
        maximumMass > 2048
    ) {

        spanInput.value =
            committedSpans[i - 1];

        return;
    }

const previousSpan =
    committedSpans[i - 1];

committedSpans[i - 1] =
    value;

spanInput.value =
    value;

});

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

        value =
            Math.round(value * 100) / 100;

        committedGains[i - 1] =
            value;

        gainInput.value =
            value;

        updateOnePeakSignal(i - 1);

    });

    updateGraph(i);

}

// Enter commits through the existing blur handlers.
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

// Shared Controls / Number Selection

const numberInputs =
    document.querySelectorAll('input[type="number"]');

numberInputs.forEach(function (input) {

    input.addEventListener("dblclick", function () {

        input.select();

    });

});

// Mass / Span / Gain / Double-Click Events

for (let i = 1; i <= 4; i++) {

    const axis =
        document.getElementById("x-axis-" + i);

    const gainInput =
        document.getElementById("gain-" + i);

    axis.addEventListener("dblclick", function () {

        let gain =
            committedGains[i - 1];

        gain =
            gain / 2;

        gain =
            Math.round(gain * 100) / 100;

        if (gain < 0.1) {
            gain = 0.1;
        }

        committedGains[i - 1] =
            gain;

        gainInput.value =
            gain;

        updateOnePeakSignal(i - 1);

        document.getElementById(
            "graph-gain-" + i
        ).textContent =
            "x" + gain;

    });

}

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

        gain =
            gain * 2;

        gain =
            Math.round(gain * 100) / 100;

        if (gain > 10000) {
            gain = 10000;
        }

        committedGains[i] =
            gain;

        gainInput.value =
            gain;

        updateOnePeakSignal(i);

        document.getElementById(
            "graph-gain-" + (i + 1)
        ).textContent =
            "x" + gain;

    });

}

// Fluidics / State

const startButton =
    document.getElementById("infuse-button");

const refillButton =
    document.getElementById("refill-button");

const purgeButton =
    document.getElementById("purge-button");

const reservoirBar =
    document.getElementById("reservoir-bar");

const fluidicsStatus =
    document.getElementById("fluidics-status-text");

const flowRateInput =
    document.getElementById("flow-rate");

const reservoirSelect =
    document.getElementById("reservoir");

const flowStateSelect =
    document.getElementById("flow-state");

const fillVolumeSelect =
    document.getElementById("fill-volume");

let reservoirLevel = 100;

const reservoirVolume = 250;

let timeRemaining = 0;

let reservoirTimer = null;

let isActuallyInfusing = false;

let previousFlowState = null;

let committedFlowRate =
    parseFloat(flowRateInput.value);

// Operate / Standby / Events

const standbyButton =
    document.getElementById("standby-button");

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

standbyButton.addEventListener("click", function () {

    operating = false;

    document.querySelectorAll(".test-peak").forEach(function (peak) {

        peak.dataset.scale = "0";

        peak.style.transform =
            "translateX(-50%) scaleY(0)";

        peak.style.display = "none";

    });

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

// Fluidics / Initial Display and Events

calculateTimeRemaining();

if (reservoirTimer === null) {

    fluidicsStatus.textContent =
        "Idle - " +
        (timeRemaining / 60).toFixed(2) +
        " mins";
}

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

        committedFlowRate =
            flowRate;

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

// Leaving without Enter restores the committed flow rate.
flowRateInput.addEventListener("blur", function () {

    flowRateInput.value =
        committedFlowRate.toFixed(1);

});

startButton.addEventListener("click", function () {

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

        updatePeakVisibility();

        return;
    }

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

    const flowRate =
        committedFlowRate;

    if (isNaN(flowRate) || flowRate <= 0) {
        return;
    }

    isActuallyInfusing = true;

    startButton.textContent =
        "Stop";

    setFluidicsControlsDisabled(true);

    calculateTimeRemaining();

    fluidicsStatus.textContent =
        "Infusing - " +
        (timeRemaining / 60).toFixed(2) +
        " mins";

    reservoirTimer = setInterval(function () {

        const currentFlowRate =
            committedFlowRate;

        const volumeUsedPerSecond =
            currentFlowRate / 60;

        const percentUsedPerSecond =
            (volumeUsedPerSecond / reservoirVolume) *
            100;

        reservoirLevel -=
            percentUsedPerSecond;

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

            updatePeakVisibility();

            return;
        }

        calculateTimeRemaining();
        updateReservoir();

    }, 1000);

    updatePeakVisibility();
});

refillButton.addEventListener("click", function () {

    if (reservoirTimer !== null) {
        return;
    }

    const startingLevel =
        reservoirLevel;

    const targetLevel =
        (parseFloat(fillVolumeSelect.value) / 250) * 100;

    const amountToFill =
        targetLevel - startingLevel;

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

    setFluidicsControlsDisabled(true);

    startButton.textContent = "Stop";

    // Refill proceeds at 10% of reservoir capacity per second.
    const refillDuration =
        amountToFill / 10;

    let refillElapsed = 0;

    fluidicsStatus.textContent =
        "Refilling";

    reservoirTimer = setInterval(function () {

        refillElapsed += 0.1;

        reservoirLevel =
            startingLevel +
            amountToFill *
            (refillElapsed / refillDuration);

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

        reservoirBar.style.width =
            reservoirLevel + "%";

    }, 100);

});

purgeButton.addEventListener("click", function () {

    if (reservoirTimer !== null) {
        return;
    }

    previousFlowState =
        flowStateSelect.value;

    flowStateSelect.value =
        "Waste";

    updatePeakVisibility();

    setFluidicsControlsDisabled(true);

    startButton.textContent =
        "Stop";

    fluidicsStatus.textContent =
        "Purging";

    reservoirTimer = setInterval(function () {

        reservoirLevel -= 1;

        if (reservoirLevel <= 0) {

            reservoirLevel = 0;

            reservoirBar.style.width =
                "0%";

            clearInterval(reservoirTimer);

            reservoirTimer = null;

            setFluidicsControlsDisabled(false);

            refillButton.click();

            return;
        }

        reservoirBar.style.width =
            reservoirLevel + "%";

    }, 100);

});

fillVolumeSelect.addEventListener("change", function () {

    purgeButton.click();

});

flowStateSelect.addEventListener("change", function () {

    if (operating === false) {
        flowStateSelect.value = "Waste";
    }

    updatePeakVisibility();

});

reservoirSelect.addEventListener("change", function () {

    updatePeakPositions();

    purgeButton.click();

});

// Spectrum Graphs / Initial Visibility and Spectrum Data

updatePeakVisibility();

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

// Spectrum Graphs / Initial Viewports and Window Events

updatePeakPositions();

const graphCheckboxes = [
    document.getElementById("graph-enabled-1"),
    document.getElementById("graph-enabled-2"),
    document.getElementById("graph-enabled-3"),
    document.getElementById("graph-enabled-4")
];

const graphWindows =
    document.querySelectorAll(".graph");

for (let i = 0; i < 4; i++) {

    graphCheckboxes[i].addEventListener(
        "change",
        updateGraphVisibility
    );
}

updateGraphVisibility();

// Spectrum Graphs / Scan Timing

const scanTime = 500;

let currentScanGraph = 0;

for (let i = 0; i < 4; i++) {

    updateNoiseTrace(i);

}

setInterval(
    scanNextGraph,
    scanTime
);

// Mass / Span / Gain / Drag Events

const gainPlotAreas =
    document.querySelectorAll(".plot-area");

for (let i = 0; i < 4; i++) {

    const plotArea =
        gainPlotAreas[i];

    const gainCursor =
        document.createElement("div");

    gainCursor.className =
        "gain-drag-cursor";

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

    let isDragging =
        false;

    let startX =
        0;

    let startY =
        0;

    let dragHeight =
        0;

    plotArea.addEventListener(
        "mousedown",
        function (event) {

            if (event.button !== 0) {
                return;
            }

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

            const rect =
                plotArea.getBoundingClientRect();

            startX =
                event.clientX - rect.left;

            startY =
                event.clientY - rect.top;

            gainCursor.dataset.startGain =
                committedGains[i];

            // Preserve the existing scale factor when capturing the starting peak height.
            const currentPeakHeight =
                peak.getBoundingClientRect().height *
                currentScale;

            gainCursor.dataset.startPeakHeight =
                currentPeakHeight;

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

    function moveGainCursor(event) {

        if (!isDragging) {
            return;
        }

        const rect =
            plotArea.getBoundingClientRect();

        let currentY =
            event.clientY - rect.top;

        if (currentY < 0) {
            currentY = 0;
        }

        if (currentY > rect.height) {
            currentY = rect.height;
        }

        dragHeight =
            currentY - startY;

        if (dragHeight <= 2) {

            gainCursor.style.display =
                "none";

            return;
        }

        gainCursor.style.display =
            "block";

        gainCursor.style.top =
            startY + "px";

        gainCursor.style.height =
            dragHeight + "px";

    }

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

        gainCursor.style.display =
            "none";

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

        if (
            isNaN(currentPeakHeight) ||
            currentPeakHeight <= 0
        ) {
            return;
        }

        // The downward drag length determines the gain relative to the plot height.
        const targetPeakHeight =
            dragHeight;

        let newGain =
            currentGain *
            (plotArea.clientHeight / targetPeakHeight);

        if (newGain < 0.1) {
            newGain = 0.1;
        }

        if (newGain > 10000) {
            newGain = 10000;
        }

        newGain =
            Math.round(newGain * 100) / 100;

        committedGains[i] =
            newGain;

        document.getElementById(
            "gain-" + (i + 1)
        ).value =
            newGain;

        document.getElementById(
            "graph-gain-" + (i + 1)
        ).textContent =
            "x" + newGain;

        updateOnePeakSignal(i);

    }

}

// Resolution Check / State and Events

const resolutionCheckStart =
    document.getElementById("resolution-check-start");

const resolutionCheckOutput =
    document.getElementById("resolution-check-output");

const resolutionPlayAgain =
    document.getElementById("resolution-play-again");

let resolutionTimer = null;

resolutionPlayAgain.addEventListener("click", function () {

    window.location.reload();

});

resolutionCheckStart.addEventListener("click", function () {

    if (resolutionCheckStart.textContent === "Stop") {

        clearInterval(resolutionTimer);

        resolutionTimer = null;

        resolutionCheckOutput.textContent = "";
        resolutionCheckStart.textContent = "Start";

        return;
    }

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

    resolutionCheckStart.textContent = "Stop";

    resolutionCheckOutput.textContent = "";

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

    const steps = [];

    let allPassed = true;

    const fillVolume =
        parseFloat(
            document.getElementById("fill-volume").value
        );

    committedMasses.forEach(function (mass) {

        const displayedMass =
            mass.toFixed(1).padEnd(7, " ");

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

        const positionMassShift =
            positionEffect;

        const resolutionMassShift =
            resolutionEffect * 0.1;

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

        // Convert the simulated peak width to FWHH.
        const fwhh =
            safePeakMassWidth *
            (0.50 / 0.75);

        let resultText;

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

        if (!massInRange) {

            resultText =
                "Not Detected (\u00B10.5 Da)";

            allPassed = false;

        }

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

        steps.push(
            displayedMass,
            displayedMass + ".",
            displayedMass + ". .",
            displayedMass + ". . .",
            displayedMass + ". . .  " + resultText
        );

    });

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

            // Each mass contributes five animation steps; retain only its final line.
            if ((step + 1) % 5 === 0) {

                completedLines.push(
                    currentStep
                );

            }

            step++;

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

// Resolution Check / Reset

const resolutionCheckReset =
    document.getElementById("resolution-check-reset");

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

    if (resolutionTimer !== null) {

        clearInterval(resolutionTimer);

        resolutionTimer = null;

    }

    resolutionCheckStart.textContent =
        "Start";

    resolutionCheckOutput.textContent =
        "";

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

    for (let i = 0; i < 4; i++) {

        updateLMPosition(i);

        updateResolution(i);

    }

});

document
    .getElementById("fill-volume")
    .addEventListener("change", function () {

        resolutionCheckReset.click();

    });

// Resolution Check / Info

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

// Dark Mode

const darkModeButton =
    document.getElementById("dark-mode-button");

darkModeButton.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

});
