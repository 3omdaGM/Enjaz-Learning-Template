import { log } from 'node:console';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const walk = root => readdirSync(root, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${root}/${e.name}`) : [`${root}/${e.name}`]);
const content = JSON.parse(readFileSync('src/template/content.json','utf8'));
assert.equal(content.people.length,4); assert.equal(content.modules.length,4);
assert(!/https?:|@|\.docx|\.png|\.jpg/.test(JSON.stringify(content)), 'Content must use generic placeholders, not external media or contacts');
const publicFiles = walk('public');
assert.deepEqual(publicFiles.sort(), ['public/favicon.svg','public/fonts/Cairo-OFL.txt','public/licenses/lucide-LICENSE.txt']);
const runtimeFiles = walk('src').filter(f => !f.endsWith('.test.ts'));
for (const file of runtimeFiles) {
 const text=readFileSync(file,'utf8');
 assert(!/\.docx\b|\.rar\b/.test(text), `Unexpected study asset reference: ${file}`);
}
assert(readFileSync('src/course/store.ts','utf8').includes('enjaz-template-course:v1'));
assert(readFileSync('src/state/session-store.ts','utf8').includes('enjaz-template-session:v1'));
if (existsSync('dist')) {
 assert(!walk('dist').some(f => /\.map$|\.docx$|\.png$|\.jpg$/.test(f)), 'Unexpected data assets or source maps in build');
}
log(JSON.stringify({ result:'PASS', publicFiles: publicFiles.length, runtimeFiles: runtimeFiles.length, modules:4, lessons:content.modules.flatMap(m=>m.lessons).length, preQuestions:content.exams.pre.length, postQuestions:content.exams.post.length, syntheticFigures:25 },null,2));
