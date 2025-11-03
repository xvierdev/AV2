import { useState, type FormEvent, type ChangeEvent } from 'react';

// Tipos
import type { NewAircraftData } from '../../types/AircraftTypes';
import type { User } from '../../types/UserTypes';

// Estilos
import styles from './AddAircraftModal.module.css';
import modalStyles from '../../styles/commonModal.module.css'; // Usando estilos comuns


/**
 * Define as propriedades que o componente AddAircraftModal recebe.
 */
interface AddAircraftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: NewAircraftData) => void;
    engineers: User[];
}

/**
 * Define a estrutura para armazenar os erros de validação do formulário.
 */
type FormErrors = {
    [key in keyof NewAircraftData]?: string;
};

/**
 * Componente de modal para adicionar uma nova aeronave.
 */
export const AddAircraftModal: React.FC<AddAircraftModalProps> = ({ isOpen, onClose, onSubmit, engineers }) => {
    // ========================================================================
    // Hooks e Estados
    // ========================================================================

    const [formData, setFormData] = useState<NewAircraftData>({
        model: '', type: 'Comercial', capacity: 0, range: 0, clientName: '', deliveryDeadline: '', associatedEngineers: []
    });
    const [errors, setErrors] = useState<FormErrors>({});

    // ========================================================================
    // Handlers (Funções de Ação)
    // ========================================================================

    // Valida os campos obrigatórios do formulário antes do envio.
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.model.trim()) newErrors.model = 'O modelo é obrigatório.';
        if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = 'A capacidade deve ser um número positivo.';
        if (!formData.range || formData.range <= 0) newErrors.range = 'O alcance deve ser um número positivo.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submete o formulário após validação.
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
            onClose();
        }
    };

    // Atualiza o estado do formulário para inputs de texto, número e select simples.
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'capacity' || name === 'range') ? Number(value) : value
        }));
    };

    // Atualiza o estado do formulário para o select múltiplo de engenheiros.
    const handleMultiSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => Number(option.value));
        setFormData(prev => ({ ...prev, associatedEngineers: selectedIds }));
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
                <h3>Adicionar Nova Aeronave</h3>

                <label className={modalStyles.label}>Modelo:</label>
                <input name="model" placeholder="Ex: Airbus A320" onChange={handleChange} className={modalStyles.input} />
                {errors.model && <span className={styles.error}>{errors.model}</span>}

                <label className={modalStyles.label}>Tipo:</label>
                <select name="type" value={formData.type} onChange={handleChange} className={modalStyles.input}>
                    <option value="Comercial">Comercial</option>
                    <option value="Militar">Militar</option>
                </select>

                {/* Contêiner para a linha com dois campos */}
                <div className={styles.formRow}>
                    {/* Campo Capacidade */}
                    <div className={styles.formGroup}>
                        <label className={modalStyles.label}>Capacidade:</label>
                        <input name="capacity" type="number" placeholder="Nº de passageiros" onChange={handleChange} min="1" className={modalStyles.input} />
                        {errors.capacity && <span className={styles.error}>{errors.capacity}</span>}
                    </div>

                    {/* Campo Alcance */}
                    <div className={styles.formGroup}>
                        <label className={modalStyles.label}>Alcance (km):</label>
                        <input name="range" type="number" placeholder="Distância máxima" onChange={handleChange} min="1" className={modalStyles.input} />
                        {errors.range && <span className={styles.error}>{errors.range}</span>}
                    </div>
                </div>

                <label className={modalStyles.label}>Cliente (Opcional):</label>
                <input name="clientName" placeholder="Nome da empresa cliente" onChange={handleChange} className={modalStyles.input} />

                <label className={modalStyles.label}>Prazo de Entrega (Opcional):</label>
                <input name="deliveryDeadline" type="date" onChange={handleChange} className={modalStyles.input} />

                <label className={modalStyles.label}>Associar Engenheiros:</label>
                <p className={styles.multiSelectHint}>Segure Ctrl/Cmd para selecionar vários</p>
                <select multiple name="associatedEngineers" onChange={handleMultiSelectChange} className={styles.multiSelect}>
                    {engineers.map(eng => (
                        <option key={eng.id} value={eng.id}>{eng.name}</option>
                    ))}
                </select>

                <div className={modalStyles.modalActions}>
                    <button type="button" onClick={onClose} style={{ backgroundColor: '#6c757d', color: 'white' }}>Cancelar</button>
                    <button type="submit">Salvar Aeronave</button>
                </div>
            </form>
        </div>
    );
};