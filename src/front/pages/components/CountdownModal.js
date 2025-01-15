import React, {useEffect, useState} from "react";

const CountdownModal = ({startCount, onCountdownFinish}) => {
    const [countdownValue, setCountdownValue] = useState(startCount);

    useEffect(() => {
        let count = startCount;
        const interval = setInterval(() => {
            count -= 1;
            if (count > 0) {
                setCountdownValue(count);
            } else {
                clearInterval(interval);
                setCountdownValue("GO!");
                setTimeout(() => {
                    setCountdownValue(null); // Сбрасываем значение
                    onCountdownFinish(); // Уведомляем родительский компонент о завершении
                }, 1000);
            }
        }, 1000);

        return () => clearInterval(interval); // Очищаем таймер при размонтировании
    }, [startCount, onCountdownFinish]);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "80vh",//80% of height
                backgroundColor: "#000",
                color: "#fff",
                zIndex: 9999,
            }}
        >
            {countdownValue}
        </div>
    );
};

export default CountdownModal;
