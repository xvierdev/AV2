// Tipos
import type { Part, PartStatus } from '../../types/PartTypes';

// Estilos
import styles from './PartsList.module.css';


/**
 * Define as propriedades que o componente PartsList recebe.
 */
interface PartsListProps {
    parts: Part[];
    canManage: boolean;
    onUpdateStatus: (partId: number, newStatus: PartStatus) => void;
}

/**
 * Define as opções de status disponíveis para uma peça.
 */
const PartStatusOptions: PartStatus[] = ['Em Produção', 'Em Transporte', 'Pronta para Uso'];

/**
 * Renderiza uma tabela que exibe a lista de peças de uma aeronave.
 */
export const PartsList: React.FC<PartsListProps> = ({ parts, canManage, onUpdateStatus }) => {
    // ========================================================================
    // Renderização
    // ========================================================================

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome da Peça</th>
                    <th>Fornecedor</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    {canManage && <th>Alterar Status</th>}
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