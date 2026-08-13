"use client";

import { useEffect, useRef } from "react";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

export function useTour(steps: DriveStep[]) {
    const driverRef = useRef<ReturnType<typeof driver> | null>(null);

    // Guardamos os steps mais recentes em uma ref para sempre termos a versão atualizada
    // sem precisar recriar a instância do driver no meio do tour.
    const stepsRef = useRef(steps);
    useEffect(() => {
        stepsRef.current = steps;
    }, [steps]);

    const startTour = () => {
        if (driverRef.current) {
            driverRef.current.destroy();
        }

        driverRef.current = driver({
            showProgress: true,
            animate: true,
            nextBtnText: "Próximo",
            prevBtnText: "Anterior",
            doneBtnText: "Finalizar",
            steps: stepsRef.current,
        });

        driverRef.current.drive();
    };

    const moveNext = () => {
        if (driverRef.current) {
            driverRef.current.moveNext();
        }
    };

    const movePrevious = () => {
        if (driverRef.current) {
            driverRef.current.movePrevious();
        }
    };

    const destroy = () => {
        if (driverRef.current) {
            driverRef.current.destroy();
        }
    };

    return { startTour, moveNext, movePrevious, destroy };
}