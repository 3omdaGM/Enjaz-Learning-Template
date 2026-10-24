import { useTraining } from '../state/training-context';
import { Button, Card } from './ui';
export function StorageProblem() { const { snapshot, adapter } = useTraining(); return <Card className="preparation" role="alert"><h1>تعذر استعادة تجربة الدخول</h1><p>{snapshot.error}</p><Button onClick={adapter.reload}>إعادة المحاولة</Button></Card>; }
