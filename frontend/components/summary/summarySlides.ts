interface SummarySlide {
    idx: number
    heading: string
    points: string[]
}

export const slides = <SummarySlide[]>[
    {
        idx: 0,
        heading: "🚀 Diving into Digital Signal Processing & Discrete-Time Systems! 🎶",
        points: [
            "Ever wonder how your phone makes calls clearer or how your music player enhances sound? It's all thanks to **Digital Signal Processing (DSP)**! 🎧",
            "DSP is like giving a computer superpowers to understand and manipulate signals – think of your voice, images, or even health readings! We take these real-world signals, turn them into numbers (digital form 🔢), and then let the computer work its magic to improve, change, or analyze them"
        ]
    },
    {
        idx: 1,
        heading: "✨ The Building Blocks of a DSP System:",
        points: [
            "1.Input Signal 🎤: The raw data you want to process (your voice, a song, an ECG).",
            "2.ADC (Analog-to-Digital Converter)** ➡️🔢: The translator that turns analog signals into digital numbers.",
            "3.DSP Processor 🧠: The brain of the operation, crunching numbers to filter, compress, or analyze",
            "4.Memory 💾: Where data and instructions are stored.",
            "5.DAC (Digital-to-Analog Converter)** 🔢➡️: The translator that converts processed digital numbers back into an analog signal if needed.",
            "6.Output Device 🔊: Where you see or hear the results (a speaker, a monitor)."
        ]
    },
    {
        idx: 2,
        heading: "👍 Why is Digital Better than Analog?",
        points: [
            "Super Accurate ✅: Less bothered by pesky noise",
            "Easy Peasy Storage & Sending** ✈️: Digital data is a breeze to save and transmit.",
            "Super Flexible ✨: Just update the software to change how it works!",
            "Tiny & Tough 💪: Can fit on a small chip, making devices smaller and more reliable.",
            "Handles Complex Tasks 🤯: Can do things that are super tricky for analog circuits."
        ]
    }

] as SummarySlide[]