import type { Part, PartStatus } from '../../types/PartTypes';
import styles from './PartsList.module.css';

interface PartsListProps {
    parts: Part[];
    canManage: boolean;
    onUpdateStatus: (partId: number, newStatus: PartStatus) => void;
}

const PartStatusOptions: PartStatus[] = ['Em Produção', 'Em Transporte', 'Pronta para Uso'];

export const PartsList: React.FC<PartsListProps> = ({ parts, canManage, onUpdateStatus }) => {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome da Peça</th>
                    <th>Fornecedor</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    {canManage && <th>Ação</th>}
                </tr>
            </thead>
            <tbody>
                {parts.map(part => (
                    <tr key={part.id}>
                        <td>{part.id}</td>
                        <td>{part.name}</td>
                        <td>{part.supplier}</td>
                        <td>{part.type}</td>
                        <td className={styles[part.status.replace(/ /g, '')]}>{part.status}</td>
                        {canManage && (
                            <td>
                                <select
                                    value={part.status}
                                    onChange={(e) => onUpdateStatus(part.id, e.target.value as PartStatus)}
                                    className={styles.selectStatus}
                                >
                                    {PartStatusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};