import React, {useState} from "react";
import { createGlobalState } from 'react-hooks-global-state';
import { Chess } from "chess.js";

const { setGlobalState, useGlobalState } = createGlobalState({
    playing: false,
    offlineGame: new Chess(),
    socket: null,
});

export { useGlobalState, setGlobalState };