/** Synthetic placeholders for demonstrating the drawing UI, not a research instrument. */
interface Point { x: number; y: number; }
type Draw = (context: CanvasRenderingContext2D, width: number, height: number) => void;
export const embeddedFigures: { sec: number; lbl: string; ans: Point[]; sf: Draw; cf: Draw }[] = Array.from({ length: 25 }, (_, i) => {
 const left = .22 + (i % 3) * .03, top = .22 + (i % 2) * .04, right = left + .42, bottom = top + .42;
 const ans = [{ x: left, y: top }, { x: right, y: top }, { x: right, y: bottom }, { x: left, y: bottom }];
 const draw: Draw = (ctx, w, h) => { ctx.strokeStyle = '#145da0'; ctx.lineWidth = 2.5; ctx.strokeRect(left*w, top*h, (right-left)*w, (bottom-top)*h); };
 return { sec: i < 7 ? 1 : i < 16 ? 2 : 3, lbl: `هنا يظهر الشكل التوضيحي ${i + 1} — ارسم حدود المستطيل`, ans, sf: draw,
 cf: (ctx,w,h) => { ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(.08*w,.08*h); ctx.lineTo(.92*w,.92*h); ctx.moveTo(.92*w,.08*h); ctx.lineTo(.08*w,.92*h); ctx.stroke(); draw(ctx,w,h); } };
});
