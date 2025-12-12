import React, { useEffect, useRef } from 'react';

interface NotificationSoundProps {
    playTrigger: number; // Increment this to play sound
}

const NotificationSound: React.FC<NotificationSoundProps> = ({ playTrigger }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (playTrigger > 0 && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        }
    }, [playTrigger]);

    return (
        <audio ref={audioRef} className="hidden">
            <source src="/notification.mp3" type="audio/mpeg" />
        </audio>
    );
};

export default NotificationSound;
