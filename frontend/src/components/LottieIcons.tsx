"use client";

import Lottie from "lottie-react";

// Placeholder Lottie animations (mock data structure)
// In a real app, these would be imported JSON files or URLs
const defaultOptions = {
    loop: true,
    autoplay: true,
};

// Activity Pulse (Simple circles)
const activityAnimation = {
    "v": "5.6.10",
    "fr": 30,
    "ip": 0,
    "op": 60,
    "w": 100,
    "h": 100,
    "nm": "Activity",
    "ddd": 0,
    "assets": [],
    "layers": [
        {
            "ddd": 0,
            "ind": 1,
            "ty": 4,
            "nm": "Circle",
            "sr": 1,
            "ks": {
                "o": { "a": 1, "k": [{ "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 0, "s": [100] }, { "t": 40, "s": [0] }] },
                "s": { "a": 1, "k": [{ "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 0, "s": [10, 10, 100] }, { "t": 40, "s": [100, 100, 100] }] },
                "p": { "a": 0, "k": [50, 50, 0] }
            },
            "shapes": [{ "ty": "el", "s": { "a": 0, "k": [90, 90] }, "p": { "a": 0, "k": [0, 0] } }, { "ty": "fl", "c": { "a": 0, "k": [0.54, 0.36, 0.96, 1] } }]
        }
    ]
};

// Success Check (Simple checkmark)
const successAnimation = {
    "v": "5.5.7",
    "fr": 29.9700012207031,
    "ip": 0,
    "op": 50,
    "w": 200,
    "h": 200,
    "nm": "Check",
    "layers": [{
        "ddd": 0,
        "ind": 1,
        "ty": 4,
        "nm": "Check",
        "ks": { "o": { "a": 0, "k": 100 }, "r": { "a": 0, "k": 0 }, "p": { "a": 0, "k": [100, 100, 0] }, "a": { "a": 0, "k": [0, 0, 0] }, "s": { "a": 0, "k": [100, 100, 100] } },
        "shapes": [{
            "ty": "gr",
            "it": [{
                "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [0, 0]], "o": [[0, 0], [0, 0], [0, 0]], "v": [[-25, 5], [-5, 25], [35, -25]], "c": false } }
            }, {
                "ty": "st", "c": { "a": 0, "k": [0.1, 0.8, 0.4, 1] }, "o": { "a": 0, "k": 100 }, "w": { "a": 0, "k": 10 }, "lc": 2, "lj": 2
            }, {
                "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 }, "sk": { "a": 0, "k": 0 }, "sa": { "a": 0, "k": 0 }
            }]
        }]
    }]
}


export function ActivityLottie() {
    return <Lottie animationData={activityAnimation} loop={true} className="w-8 h-8 opacity-70" />;
}

export function SuccessCheckLottie() {
    return <Lottie animationData={successAnimation} loop={false} className="w-12 h-12" />;
}
