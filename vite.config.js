import { unitEditorPlugin } from './scripts/unit-editor-server.js';
export default { plugins:[unitEditorPlugin()], build: { rollupOptions: { input: ['index.html', 'unit-review.html', 'character-studio.html', 'animation-editor.html', 'unit-editor.html'] } } };
