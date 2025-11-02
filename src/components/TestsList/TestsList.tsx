import type { Test } from '../../types/TestTypes';
import styles from './TestsList.module.css';

interface TestsListProps {
    tests: Test[];
}

export const TestsList: React.FC<TestsListProps> = ({ tests }) => {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tipo de Teste</th>
                    <th>Data</th>
                    <th>Resultado</th>
                    <th>Notas</th>
                </tr>
            </thead>
            <tbody>
                {tests.map(test => (
                    <tr key={test.id}>
                        <td>{test.id}</td>
                        <td>{test.type}</td>
                        <td>{test.datePerformed}</td>
                        <td className={styles[test.result]}>{test.result}</td>
                        <td>{test.notes || 'N/A'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};