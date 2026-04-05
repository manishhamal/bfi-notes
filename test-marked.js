import { marked } from 'marked';

console.log(marked.parse('# Title\n\n**Bold**'));
console.log(marked.parse('<pre><code># Title\n\n**Bold**</code></pre>'));
console.log(marked.parse('<p># Title\n\n**Bold**</p>'));
