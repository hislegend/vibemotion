import {PlayerRef} from '@remotion/player';
import React, {createContext, useContext} from 'react';

export const PlayerRefContext = createContext<React.RefObject<PlayerRef | null> | null>(null);

export const usePlayerRef = () => {
	const context = useContext(PlayerRefContext);
	if (!context) {
		throw new Error('PlayerRefContext is not set');
	}
	return context;
};
