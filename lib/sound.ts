// Simple sound utility using Web Audio API
// This avoids the need for external audio files

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioContext) {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContext = new AudioContextClass();
            }
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }
    return audioContext;
};

const playTone = (freq: number, type: OscillatorType, duration: number, delay = 0) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        ctx.resume().catch(() => { });
    }

    try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + delay + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime + delay);
        oscillator.stop(ctx.currentTime + delay + duration);
    } catch (e) {
        console.error('Error playing sound', e);
    }
};

export const playNotificationSound = () => {
    // Simple "ding"
    playTone(800, 'sine', 0.1);
    playTone(1200, 'sine', 0.3, 0.05);
};

export const playSuccessSound = () => {
    // Ascending happy chime
    playTone(600, 'sine', 0.1);
    playTone(800, 'sine', 0.1, 0.1);
    playTone(1200, 'sine', 0.3, 0.2);
};

export const playErrorSound = () => {
    // Descending buzz
    playTone(400, 'sawtooth', 0.1);
    playTone(200, 'sawtooth', 0.3, 0.1);
};

export const playPopSound = () => {
    // Short pop
    playTone(600, 'sine', 0.05);
};

export const playClickSound = () => {
    // Very short click
    playTone(800, 'square', 0.03);
};
