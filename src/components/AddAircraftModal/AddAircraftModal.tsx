// src/components/AddAircraftModal/AddAircraftModal.tsx
import { useState, type FormEvent, type ChangeEvent } from 'react';
import type { NewAircraftData } from '../../types/AircraftTypes';
import type { User } from '../../types/UserTypes';
import styles from './AddAircraftModal.module.css';

interface AddAircraftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: NewAircraftData) => void;
    engineers: User[]; // Lista de engenheiros para o select
}

// Tipo para o estado de erros do formulário
type FormErrors = {
    [key in keyof NewAircraftData]?: string;
};

export const AddAircraftModal: React.FC<AddAircraftModalProps> = ({ isOpen, onClose, onSubmit, engineers }) => {
    const [formData, setFormData] = useState<NewAircraftData>({
        model: '', type: 'Comercial', capacity: 0, range: 0, clientName: '', deliveryDeadline: '', associatedEngineers: []
    });
    const [errors, setErrors] = useState<FormErrors>({});

    if (!isOpen) return null;

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.model.trim()) newErrors.model = 'O modelo é obrigatório.';
        if (!formData.type) newErrors.type = 'O tipo é obrigatório.';
        if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = 'A capacidade deve ser um número positivo.';
        if (!formData.range || formData.range <= 0) newErrors.range = 'O alcance deve ser um número positivo.';

        setErrors(newErrors);
        // Retorna true se o objeto de erros estiver vazio
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'capacity' || name === 'range') ? Number(value) : value
        }));
    };

    const handleMultiSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => Number(option.value));
        setFormData(prev => ({ ...prev, associatedEngineers: selectedIds }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
            onClose(); // Fecha o modal após o envio
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <form onSubmit={handleSubmit} className={styles.modalContent}>
                <h3>Adicionar Nova Aeronave</h3>

                <input name="model" placeholder="Modelo (ex: A320 Neo)" onChange={handleChange} />
                {errors.model && <span className={styles.error}>{errors.model}</span>}

                <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="Comercial">Comercial</option>
                    <option value="Militar">Militar</option>
                </select>

                <input name="capacity" type="number" placeholder="Capacidade de Passageiros" onChange={handleChange} min="1" />
                {errors.capacity && <span className={styles.error}>{errors.capacity}</span>}

                <input name="range" type="number" placeholder="Alcance (km)" onChange={handleChange} min="1" />
                {errors.range && <span className={styles.error}>{errors.range}</span>}

                <input name="clientName" placeholder="Nome do Cliente (Opcional)" onChange={handleChange} />
                <input name="deliveryDeadline" type="date" onChange={handleChange} />

                <label>Associar Engenheiros (segure Ctrl/Cmd para selecionar vários):</label>
                <select multiple name="associatedEngineers" onChange={handleMultiSelectChange} className={styles.multiSelect}>
                    {engineers.map(eng => (
                        <option key={eng.id} value={eng.id}>{eng.name}</option>
                    ))}
                </select>

                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose}>Cancelar</button>
                    <button type="submit">Salvar Aeronave</button>
                </div>
            </form>
        </div>
    );
};