import { useState, type FormEvent } from 'react';
import type { NewPartData, PartType, PartStatus } from '../../types/PartTypes';
import styles from './AddPartModal.module.css'; // Usaremos um CSS de modal genérico

interface AddPartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (partData: NewPartData) => void;
}

export const AddPartModal: React.FC<AddPartModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formState, setFormState] = useState<NewPartData>({
        name: '',
        supplier: '',
        type: 'Nacional',
        status: 'Em Produção',
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                <h3>Adicionar Nova Peça</h3>
                <input name="name" required placeholder="Nome da Peça" onChange={handleChange} />
                <input name="supplier" required placeholder="Fornecedor" onChange={handleChange} />
                <select name="type" value={formState.type} onChange={handleChange}>
                    <option value="Nacional">Nacional</option>
                    <option value="Importada">Importada</option>
                </select>
                <select name="status" value={formState.status} onChange={handleChange}>
                    <option value="Em Produção">Em Produção</option>
                    <option value="Em Transporte">Em Transporte</option>
                    <option value="Pronta para Uso">Pronta para Uso</option>
                </select>
                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose}>Cancelar</button>
                    <button type="submit">Adicionar Peça</button>
                </div>
            </form>
        </div>
    );
};