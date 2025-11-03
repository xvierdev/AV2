import { useState, type FormEvent, type ChangeEvent } from 'react';

// Tipos
import type { NewTestData } from '../../types/TestTypes';

// Estilos
import modalStyles from '../../styles/commonModal.module.css';


/**
 * Define as propriedades que o componente RecordTestModal recebe.
 */
interface RecordTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (testData: NewTestData) => void;
}

/**
 * Componente de modal para registrar o resultado de um novo teste.
 */
export const RecordTestModal: React.FC<RecordTestModalProps> = ({ isOpen, onClose, onSubmit }) => {
    // ========================================================================
    // Hooks e Estados
    // ========================================================================

    const [formState, setFormState] = useState<NewTestData>({
        type: 'Elétrico',
        result: 'Aprovado',
        notes: '',
    });

    // ========================================================================
    // Handlers (Funções de Ação)
    // ========================================================================

    // Submete o formulário com os dados do novo teste.
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formState);
    };

    // Atualiza o estado do formulário conforme o usuário interage.
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    // ========================================================================
    // Renderização
    // ========================================================================

    if (!isOpen) {
        return null;
    }

    return (
        <div className={modalStyles.modalOverlay}>
            <form onSubmit={handleSubmit} className={modalStyles.modalContent}>
                <h3>Registrar Novo Teste</h3>

                <label className={modalStyles.label}>Tipo de Teste:</label>
                <select name="type" value={formState.type} onChange={handleChange} className={modalStyles.input}>
                    <option value="Elétrico">Elétrico</option>
                    <option value="Hidráulico">Hidráulico</option>
                    <option value="Aerodinâmico">Aerodinâmico</option>
                </select>

                <label className={modalStyles.label}>Resultado:</label>
                <select name="result" value={formState.result} onChange={handleChange} className={modalStyles.input}>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                </select>

                <label className={modalStyles.label}>Notas (Opcional):</label>
                <input name="notes" placeholder="Detalhes ou observações do teste..." onChange={handleChange} className={modalStyles.input} />

                <div className={modalStyles.modalActions}>
                    <button type="button" onClick={onClose} style={{ backgroundColor: '#6c757d', color: 'white' }}>Cancelar</button>
                    <button type="submit">Registrar Teste</button>
                </div>
            </form>
        </div>
    );
};