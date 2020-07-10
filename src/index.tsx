import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer, setConfig } from 'react-hot-loader';
import App from './components/App';

setConfig({
	errorReporter: () => null,
	ErrorOverlay: () => null
});

const rootEl = document.getElementById('root');

render(
	<AppContainer>
		<App />
	</AppContainer>,
	rootEl
);
