 const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        document.getElementById("webcam-container").innerHTML = "";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = false; // whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup({ facingMode: "environment" }); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }
    }

    async function loop() {
        webcam.update(); // update the webcam frame

        if (isRunning) {
            await model.predict(webcam.canvas);
        }

        window.requestAnimationFrame(loop);
    }

    let isRunning = true; // webcam starts running

    function toggleScan() {
        const btn = document.getElementById("scan-btn");

        if (isRunning) {
            // Pause webcam
            webcam.pause();
            isRunning = false;
            predict();
            btn.textContent = "Reset";
        } else {
            // Resume webcam
            webcam.play();
            isRunning = true;
            labelContainer.innerHTML = "";
            btn.textContent = "Scan";
        }
    }


    // run the webcam image through the image model
    async function predict() {
        // predict can take in an image, video or canvas html element
        const prediction = await model.predict(webcam.canvas);

        let best = prediction[0];
        for (let i = 0; i < prediction.length; i++) {
            if (prediction[i].probability > best.probability) {
                best = prediction[i];
            }
        }

        labelContainer.innerHTML = best.className;
    }

    document.addEventListener("DOMContentLoaded", () => {
        init();
    });
