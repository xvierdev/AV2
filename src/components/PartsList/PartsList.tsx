// ------------------- Tipos -------------------
import type { Part, PartStatus } from '../../types/PartTypes';

// ------------------- Estilos -------------------
import styles from './PartsList.module.css';
// Importa os estilos da página para reutilizar as classes de botões de ação
import pageStyles from '../../pages/AircraftDetailPage.module.css';

/**
 * Define as propriedades que o componente PartsList recebe.
 */
interface PartsListProps {
    parts: Part[];
    canManage: boolean; // Flag que indica se o usuário pode gerenciar (editar/excluir) peças
    onUpdateStatus: (partId: number, newStatus: PartStatus) => void;
    onDeletePart: (partId: number, partName: string) => void;
    onOpenEditModal: (part: Part) => void;
}

/**
 * Define as opções de status disponíveis para uma peça, usadas no dropdown.
 */
const PartStatusOptions: PartStatus[] = ['Em Produção', 'Em Transporte', 'Pronta para Uso'];

/**
 * Renderiza uma tabela que exibe a lista de peças de uma aeronave,
 * com opções de gerenciamento para usuários autorizados.
 */
export const PartsList: React.FC<PartsListProps> = ({ parts, canManage, onUpdateStatus, onDeletePart, onOpenEditModal }) => {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome da Peça</th>
                    <th>Fornecedor</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    {canManage && <th>Ações</th>}
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

                        {/* A coluna de Ações só é renderizada se o usuário tiver permissão */}
                        {canManage && (
                            <td>
                                <div className={pageStyles.actionsCell}>
                                    {/* Dropdown para alterar o status */}
                                    <select
                                        value={part.status}
                                        onChange={(e) => onUpdateStatus(part.id, e.target.value as PartStatus)}
                                        className={styles.selectStatus}
                                    >
                                        {PartStatusOptions.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => onOpenEditModal(part)}
                                        className={`${pageStyles.editButton} ${pageStyles.yellow}`}
                                    >
                                        Editar
                                    </button>

                                    {/* Botão para excluir a peça */}
                                    <button
                                        onClick={() => onDeletePart(part.id, part.name)}
                                        className={`${pageStyles.deleteButton} ${pageStyles.red}`}
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};