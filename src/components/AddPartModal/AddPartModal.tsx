import { useState, type FormEvent, type ChangeEvent } from 'react';

// Tipos
import type { NewPartData } from '../../types/PartTypes';

// Estilos
import modalStyles from '../../styles/commonModal.module.css';


/**
 * Define as propriedades que o componente AddPartModal recebe.
 */
interface AddPartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (partData: NewPartData) => void;
}

/**
 * Componente de modal para adicionar uma nova peça a uma aeronave.
 */
export const AddPartModal: React.FC<AddPartModalProps> = ({ isOpen, onClose, onSubmit }) => {
    // ========================================================================
    // Hooks e Estados
    // ========================================================================

    const [formState, setFormState] = useState<NewPartData>({
        name: '',
        supplier: '',
        type: 'Nacional',
        status: 'Em Produção',
    });

    // ========================================================================
    // Handlers (Funções de Ação)
    // ========================================================================

    // Submete o formulário com os dados da nova peça.
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Adiciona uma validação simples para garantir que os campos não estão vazios
        if (!formState.name.trim() || !formState.supplier.trim()) {
            alert("O nome da peça e o fornecedor são obrigatórios.");
            return;
        }
        onSubmit(formState);
    };

    // Atualiza o estado do formulário conforme o usuário digita.
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
                <h3>Adicionar Nova Peça</h3>

                <label className={modalStyles.label}>Nome da Peça:</label>
                <input name="name" required placeholder="Ex: Motor Esquerdo PW1100G" onChange={handleChange} className={modalStyles.input} />

                <label className={modalStyles.label}>Fornecedor:</label>
                <input name="supplier" required placeholder="Ex: Pratt & Whitney" onChange={handleChange} className={modalStyles.input} />

                <label className={modalStyles.label}>Tipo:</label>
                <select name="type" value={formState.type} onChange={handleChange} className={modalStyles.input}>
                    <option value="Nacional">Nacional</option>
                    <option value="Importada">Importada</option>
                </select>

                <label className={modalStyles.label}>Status Inicial:</label>
                <select name="status" value={formState.status} onChange={handleChange} className={modalStyles.input}>
                    <option value="Em Produção">Em Produção</option>
                    <option value="Em Transporte">Em Transporte</option>
                    <option value="Pronta para Uso">Pronta para Uso</option>
                </select>

                <div className={modalStyles.modalActions}>
                    <button type="button" onClick={onClose} style={{ backgroundColor: '#6c757d', color: 'white' }}>Cancelar</button>
                    <button type="submit">Adicionar Peça</button>
                </div>
            </form>
        </div>
    );
};