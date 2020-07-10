import * as React from 'react';
import cx from 'classnames';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-glsl';
import 'ace-builds/src-noconflict/theme-textmate';
import styles from './ShaderText.module.scss';

interface Props {
	fragmentShader: string;
	setFragmentShader: (fragmentShader: string) => void;
	fragmentError: Error | null;
	vertexShader: string;
	setVertexShader: (vertexShader: string) => void;
	vertexError: Error | null;
	fullScreen?: boolean;
}

const ShaderText = ({ fragmentShader, setFragmentShader, fragmentError, vertexShader, setVertexShader, vertexError, fullScreen }: Props) => {
	const [fragVisible, setFragVisible] = React.useState<boolean>(true);
	const [vertVisible, setVertVisible] = React.useState<boolean>(false);

	const onFragmentChange = (newFragmentShader: string) => {
		setFragmentShader(newFragmentShader);
	};

	const onVertexChange = (newVertexShader: string) => {
		setVertexShader(newVertexShader);
	};

	return (
		<div className={cx(styles.root, fullScreen && styles.fullScreen)}>
			<div className={styles.tabs}>
				<button
					className={cx(styles.tab, fragVisible && styles.active, Boolean(fragmentError) && styles.error)}
					onClick={() => {
						if (!fragVisible) {
							setFragVisible(true);
							setVertVisible(false);
						}
					}}>
					Fragment Shader
				</button>
				<button
					className={cx(styles.tab, vertVisible && styles.active, Boolean(vertexError) && styles.error)}
					onClick={() => {
						if (!vertVisible) {
							setVertVisible(true);
							setFragVisible(false);
						}
					}}>
					Vertex Shader
				</button>
			</div>
			<div className={styles.textContainer}>
				<style>
					{`
						.ace-tm .ace_constant.ace_language {
							color: rgb(255, 117, 0);
						}

						.ace-tm .ace_constant.ace_numeric {
							color: rgb(255, 0, 0);
						}

						.ace-tm .ace_constant.ace_other {
							color: rgb(0, 0, 0);
						}
					`}
				</style>
				<div className={cx(styles.textBlock, fragVisible && styles.active, Boolean(fragmentError) && styles.error)}>
					<div>
						<AceEditor
							mode='glsl'
							theme='textmate'
							onChange={onFragmentChange}
							name='fragmentShader'
							editorProps={{ $blockScrolling: true }}
							value={fragmentShader}
							enableBasicAutocompletion={true}
							enableLiveAutocompletion={true}
							enableSnippets={true}
							scrollMargin={[14, 0, 0, 0]}
							width='100%'
						/>
					</div>
					<div className={cx(styles.errorMessage, Boolean(fragmentError) && styles.visible)}>{fragmentError && fragmentError.message}</div>
				</div>
				<div className={cx(styles.textBlock, vertVisible && styles.active, Boolean(vertexError) && styles.error)}>
					<div>
						<AceEditor
							mode='glsl'
							theme='textmate'
							onChange={onVertexChange}
							name='vertexShader'
							editorProps={{ $blockScrolling: true }}
							value={vertexShader}
							enableBasicAutocompletion={true}
							enableLiveAutocompletion={true}
							enableSnippets={true}
							scrollMargin={[14, 0, 0, 0]}
						/>
					</div>
					<div className={cx(styles.errorMessage, Boolean(vertexError) && styles.visible)}>{vertexError && vertexError.message}</div>
				</div>
			</div>
		</div>
	);
};

export default ShaderText;
