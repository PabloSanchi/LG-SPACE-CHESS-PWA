import React, {useState} from "react";
import { createGlobalState } from 'react-hooks-global-state';

const { setGlobalState, useGlobalState } = createGlobalState({
    playing: false,
    socket: null,
});

export { useGlobalState, setGlobalState };