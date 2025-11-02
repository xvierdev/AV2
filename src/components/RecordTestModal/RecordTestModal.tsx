import { useState, type FormEvent } from 'react';
import type { NewTestData } from '../../types/TestTypes';
import styles from './RecordTestModal.module.css'; // Reutilize o CSS de modal
interface RecordTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (testData: NewTestData) => void;
}
export const RecordTestModal: React.FC<RecordTestModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formState, setFormState] = useState<NewTestData>({
        type: 'Elétrico',
        result: 'Aprovado',
        notes: '',
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formState);
    };

    return (
        <div className={styles.modalOverlay}>
            <form onSubmit={handleSubmit} className={styles.modalContent}>
                <h3>Registrar Novo Teste</h3>
                <label>Tipo de Teste:</label>
                <select name="type" value={formState.type} onChange={handleChange}>
                    <option value="Elétrico">Elétrico</option>
                    <option value="Hidráulico">Hidráulico</option>
                    <option value="Aerodinâmico">Aerodinâmico</option>
                </select>

                <label>Resultado:</label>
                <select name="result" value={formState.result} onChange={handleChange}>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                </select>

                <label>Notas (Opcional):</label>
                <input name="notes" placeholder="Detalhes do teste..." onChange={handleChange} />

                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose}>Cancelar</button>
                    <button type="submit">Registrar Teste</button>
                </div>
            </form>
        </div>
    );
}