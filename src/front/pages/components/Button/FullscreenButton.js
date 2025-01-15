import React, {useEffect, useRef, useState} from 'react';
import Button from "./Button";

const FullscreenButton = () => {
    const [targetRef, setTargetRef] = useState(null)
    const buttonRef = useRef(null)

    useEffect(() => {
        // Function to find the target element
        const updateTargetRef = () => {
            const targetElement = document.querySelector('.fullscreenDiv');
            setTargetRef(targetElement);
        };

        // Initial check for the target element
        updateTargetRef();

        // Create a MutationObserver to watch for changes in the DOM
        const observer = new MutationObserver(updateTargetRef);
        observer.observe(document.body, {childList: true, subtree: true});

        // Cleanup observer on component unmount
        return () => {
            observer.disconnect();
        };
    }, [])

    //exit fullscreen on mousedown
    useEffect(() => {
        const handleClick = () => {
            if (targetRef && document.fullscreenElement) {
                document.exitFullscreen()
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => {
            document.removeEventListener('mousedown', handleClick)
        }
    }, [targetRef]);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            if (targetRef) {
                targetRef.requestFullscreen().catch(err => {
                    console.log("Error attempting to enable fullscreen: ", err)
                })
            }
        } else {
            document.exitFullscreen()
        }
    }

    if (!targetRef) {
        return null
    }

    return (
        <div ref={buttonRef}>
            <Button onClick={toggleFullScreen} variant="primary">
                Fullscreen
            </Button>
        </div>
    )
}

export default FullscreenButton