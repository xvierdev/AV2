import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import type { Part } from '../../types/PartTypes';
import modalStyles from '../../styles/commonModal.module.css';

interface EditPartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (partId: number, data: Partial<Part>) => void;
    part: Part | null; // A peça que está sendo editada
}

export const EditPartModal: React.FC<EditPartModalProps> = ({ isOpen, onClose, onSubmit, part }) => {
    const [formData, setFormData] = useState<Partial<Part>>({});

    // Quando o modal abre, preenche o formulário com os dados da peça selecionada.
    useEffect(() => {
        if (part) {
            setFormData(part);
        }
    }, [part]);

    if (!isOpen || !part) return null;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(part.id, formData);
    };

    return (
        <div className={modalStyles.modalOverlay}>
            <form onSubmit={handleSubmit} className={modalStyles.modalContent}>
                <h3>Editando Peça #{part.id}</h3>

                <label className={modalStyles.label}>Nome da Peça:</label>
                <input name="name" value={formData.name || ''} onChange={handleChange} required className={modalStyles.input} />

                <label className={modalStyles.label}>Fornecedor:</label>
                <input name="supplier" value={formData.supplier || ''} onChange={handleChange} required className={modalStyles.input} />

                <label className={modalStyles.label}>Tipo:</label>
                <select name="type" value={formData.type || 'Nacional'} onChange={handleChange} className={modalStyles.input}>
                    <option value="Nacional">Nacional</option>
                    <option value="Importada">Importada</option>
                </select>

                <div className={modalStyles.modalActions}>
                    <button type="button" onClick={onClose}>Cancelar</button>
                    <button type="submit">Salvar Alterações</button>
                </div>
            </form>
        </div>
    );
};